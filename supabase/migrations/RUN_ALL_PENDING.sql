-- Adds multi-community support: communities, per-client access scoping,
-- and a new 'client' role. Safe to re-run (idempotent).
-- Run this in the SQL Editor on top of schema.sql.

-- ─────────────────────────────────────────────────────────────────────────
-- communities — one row per audited development (e.g. "Promontory")
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  goal_homes integer,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- community_access — which client user can see which community's dashboard
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists community_access (
  user_id uuid not null references profiles (id) on delete cascade,
  community_id uuid not null references communities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, community_id)
);

create index if not exists idx_community_access_user on community_access (user_id);
create index if not exists idx_community_access_community on community_access (community_id);

-- ─────────────────────────────────────────────────────────────────────────
-- audits gains a community
-- ─────────────────────────────────────────────────────────────────────────
alter table audits add column if not exists community_id uuid references communities (id) on delete set null;
create index if not exists idx_audits_community_id on audits (community_id);

-- ─────────────────────────────────────────────────────────────────────────
-- profiles.role gains 'client'; profiles gains email (needed so admins can
-- list client emails without calling the Auth admin API on every page load)
-- ─────────────────────────────────────────────────────────────────────────
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('admin', 'auditor', 'client'));

alter table profiles add column if not exists email text;

update profiles
set email = auth.users.email
from auth.users
where profiles.id = auth.users.id and profiles.email is null;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Helper functions
-- ─────────────────────────────────────────────────────────────────────────
create or replace function is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin', 'auditor')
  );
$$;

create or replace function has_community_access(p_community_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from community_access
    where user_id = auth.uid() and community_id = p_community_id
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────
alter table communities enable row level security;
alter table community_access enable row level security;

drop policy if exists "communities readable by staff and linked clients" on communities;
create policy "communities readable by staff and linked clients"
  on communities for select to authenticated
  using (is_staff() or has_community_access(id));

drop policy if exists "admins manage communities" on communities;
create policy "admins manage communities"
  on communities for all to authenticated using (is_admin());

drop policy if exists "users can read their own community access" on community_access;
create policy "users can read their own community access"
  on community_access for select to authenticated
  using (user_id = auth.uid() or is_admin());

drop policy if exists "admins manage community access" on community_access;
create policy "admins manage community access"
  on community_access for all to authenticated using (is_admin());

-- audits: clients get no direct row access (aggregate-only, via the RPC
-- below) — replaces the previous "readable by all authenticated" policy.
drop policy if exists "audits are readable by authenticated users" on audits;
drop policy if exists "audits are readable by staff" on audits;
create policy "audits are readable by staff"
  on audits for select to authenticated using (is_staff());

-- ─────────────────────────────────────────────────────────────────────────
-- Aggregate-only stats for the client dashboard. SECURITY DEFINER so it can
-- read across all of a community's audits internally, but the WHERE clause
-- enforces the same access check RLS would — a client with no access to
-- p_community_id gets zero rows back, and never sees individual audit rows.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function get_community_dashboard(p_community_id uuid)
returns table (
  homes_audited bigint,
  total_gallons_saved_per_year numeric,
  total_dollar_savings_per_year numeric,
  avg_dollar_savings_per_home numeric,
  avg_efficiency_score numeric,
  homes_with_smart_controllers bigint,
  efficient_toilets_installed bigint,
  efficient_showerheads_installed bigint,
  leak_repairs bigint,
  total_rebate_opportunities numeric
)
language sql stable security definer set search_path = public as $$
  select
    count(*) filter (where status in ('completed', 'reviewed')) as homes_audited,
    coalesce(sum((calculations->>'gallonsSavedPerYear')::numeric), 0) as total_gallons_saved_per_year,
    coalesce(sum((calculations->>'dollarSavingsPerYear')::numeric), 0) as total_dollar_savings_per_year,
    coalesce(avg((calculations->>'dollarSavingsPerYear')::numeric), 0) as avg_dollar_savings_per_home,
    coalesce(avg((calculations->>'efficiencyScore')::numeric), 0) as avg_efficiency_score,
    count(*) filter (where (exterior->>'isSmartController')::boolean is true) as homes_with_smart_controllers,
    count(*) filter (where (interior->>'toiletCount') is not null) as efficient_toilets_installed,
    count(*) filter (where (interior->>'showerheadCount') is not null) as efficient_showerheads_installed,
    count(*) filter (
      where (interior->>'hasToiletLeaks')::boolean is true
         or (interior->>'hasFaucetLeaks')::boolean is true
         or (interior->>'hasShowerLeaks')::boolean is true
    ) as leak_repairs,
    coalesce(sum((calculations->>'rebateAmount')::numeric), 0) as total_rebate_opportunities
  from audits
  where community_id = p_community_id
    and (is_staff() or has_community_access(p_community_id));
$$;

grant execute on function get_community_dashboard(uuid) to authenticated;

-- Extend baseline grants to the two new tables.
grant select, insert, update, delete on communities, community_access to authenticated;
-- Adds: (1) a "requested community" field captured at client self-signup,
-- reviewed and approved by an admin, and (2) lets a client see their own
-- home's specific audit (matched by email), not just the community
-- aggregate. Safe to re-run.

alter table profiles add column if not exists requested_community text;

drop policy if exists "clients can read their own home's audit" on audits;
create policy "clients can read their own home's audit"
  on audits for select to authenticated
  using (
    homeowner_email is not null
    and lower(homeowner_email) = lower((select email from profiles where id = auth.uid()))
  );
-- Splits the 'client' role into two behaviors:
--   homeowner    — sees only their own home (by email match) + community aggregate
--   hoa_director — sees every audit in their community (full drill-down)
-- Safe to re-run.

alter table profiles add column if not exists client_type text
  check (client_type in ('homeowner', 'hoa_director'));
alter table profiles add column if not exists home_address text;

drop policy if exists "hoa directors can read every audit in their community" on audits;
create policy "hoa directors can read every audit in their community"
  on audits for select to authenticated
  using (
    community_id is not null
    and has_community_access(community_id)
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'client' and client_type = 'hoa_director'
    )
  );
