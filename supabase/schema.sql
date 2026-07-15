-- EcoWise Audit Dashboard — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists pg_trgm;

-- ─────────────────────────────────────────────────────────────────────────
-- profiles — one row per auth.users row, carries role for authorization
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'auditor' check (role in ('admin', 'auditor', 'client')),
  -- Only meaningful when role = 'client'. A homeowner only ever sees their
  -- own home (matched by email) plus the community aggregate; an HOA
  -- director/community manager sees every audit in their community.
  client_type text check (client_type in ('homeowner', 'hoa_director')),
  home_address text,
  -- Free-text community name a client typed in at self-signup — informational
  -- only. An admin reviews it and grants real access via community_access.
  requested_community text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- communities — one row per audited development (e.g. "Promontory").
-- Staff (admin/auditor) always see every community; a 'client' role user
-- only sees the ones they're linked to via community_access.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  goal_homes integer,
  created_at timestamptz not null default now()
);

create table if not exists community_access (
  user_id uuid not null references profiles (id) on delete cascade,
  community_id uuid not null references communities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, community_id)
);

create index if not exists idx_community_access_user on community_access (user_id);
create index if not exists idx_community_access_community on community_access (community_id);

-- ─────────────────────────────────────────────────────────────────────────
-- audits — one row per home audit. Fields that are searched, filtered,
-- sorted, or charted live as real columns; the long tail of exterior/
-- interior questionnaire fields lives in jsonb (see types/audit.ts).
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  home_id text unique,
  address text not null,
  homeowner_name text,
  homeowner_email text,
  homeowner_phone text,
  builder text,
  neighborhood text,
  lot_number text,
  community_id uuid references communities (id) on delete set null,
  auditor_id uuid references profiles (id) on delete set null,
  audit_date date not null default current_date,
  status text not null default 'draft'
    check (status in ('draft', 'in_progress', 'completed', 'reviewed')),

  exterior jsonb not null default '{}'::jsonb,
  interior jsonb not null default '{}'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  calculations jsonb not null default '{}'::jsonb,

  notes text,
  pdf_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists audits_set_updated_at on audits;
create trigger audits_set_updated_at
  before update on audits
  for each row execute function set_updated_at();

-- Search: address / homeowner / home_id (trigram, for fast partial-match ILIKE)
create index if not exists idx_audits_address_trgm on audits using gin (address gin_trgm_ops);
create index if not exists idx_audits_homeowner_trgm on audits using gin (homeowner_name gin_trgm_ops);
create index if not exists idx_audits_home_id_trgm on audits using gin (home_id gin_trgm_ops);

-- Filter / sort columns used by the audit log and analytics
create index if not exists idx_audits_builder on audits (builder);
create index if not exists idx_audits_neighborhood on audits (neighborhood);
create index if not exists idx_audits_auditor_id on audits (auditor_id);
create index if not exists idx_audits_community_id on audits (community_id);
create index if not exists idx_audits_status on audits (status);
create index if not exists idx_audits_audit_date on audits (audit_date desc);
create index if not exists idx_audits_created_at on audits (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- audit_photos — Supabase Storage object references, grouped by category
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists audit_photos (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits (id) on delete cascade,
  category text not null check (category in (
    'front_yard', 'backyard', 'irrigation_controller', 'sprinklers',
    'leaks', 'toilets', 'showerheads', 'faucets', 'misc'
  )),
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_photos_audit_id on audit_photos (audit_id);

-- ─────────────────────────────────────────────────────────────────────────
-- recommendation_templates — reusable library, editable from Settings
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists recommendation_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text,
  default_priority text not null default 'medium'
    check (default_priority in ('low', 'medium', 'high')),
  estimated_gallons_saved_per_year numeric,
  estimated_cost numeric,
  rebate_amount numeric,
  created_at timestamptz not null default now()
);

insert into recommendation_templates
  (title, category, description, default_priority, estimated_gallons_saved_per_year, estimated_cost, rebate_amount)
select * from (values
  ('Install WaterSense toilet(s)', 'Toilets', 'Replace pre-1994 or high-flow toilets with 1.28 GPF WaterSense-certified models.', 'high', 4000::numeric, 250::numeric, 100::numeric),
  ('Install low-flow showerhead(s)', 'Showerheads', 'Replace showerheads above 2.0 GPM with WaterSense-certified low-flow models.', 'high', 2300::numeric, 15::numeric, 20::numeric),
  ('Install smart irrigation controller', 'Irrigation', 'Replace a standard timer with a weather- or soil-sensor-based smart controller.', 'high', 9000::numeric, 200::numeric, 150::numeric),
  ('Install bathroom faucet aerators', 'Faucets', 'Add 1.5 GPM aerators to bathroom faucets above the WaterSense threshold.', 'medium', 900::numeric, 5::numeric, 10::numeric),
  ('Install kitchen faucet aerator', 'Faucets', 'Add a 1.8 GPM aerator to the kitchen faucet.', 'low', 500::numeric, 5::numeric, 0::numeric),
  ('Repair running toilet', 'Leak Repair', 'Fix a running toilet flapper or fill valve.', 'high', 7300::numeric, 20::numeric, 0::numeric),
  ('Repair leaking faucet', 'Leak Repair', 'Fix a dripping or leaking faucet.', 'medium', 2900::numeric, 15::numeric, 0::numeric),
  ('Repair irrigation leaks / broken heads', 'Irrigation', 'Fix broken sprinkler heads, line leaks, overspray, or runoff.', 'high', 3000::numeric, 30::numeric, 0::numeric),
  ('Add rain/soil moisture sensor', 'Irrigation', 'Add a shutoff sensor to an existing irrigation controller.', 'medium', 1500::numeric, 40::numeric, 0::numeric),
  ('Install hot water recirculation system', 'Water Heating', 'Reduce water wasted waiting for hot water at fixtures.', 'low', 1200::numeric, 350::numeric, 0::numeric)
) as t(title, category, description, default_priority, estimated_gallons_saved_per_year, estimated_cost, rebate_amount)
where not exists (select 1 from recommendation_templates);

-- ─────────────────────────────────────────────────────────────────────────
-- settings — singleton row of org-wide, admin-editable values
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists settings (
  id boolean primary key default true check (id),
  water_cost_per_gallon numeric not null default 0.008,
  energy_cost_per_kwh numeric not null default 0.14,
  rebate_toilet numeric not null default 100,
  rebate_showerhead numeric not null default 20,
  rebate_smart_controller numeric not null default 150,
  rebate_faucet_aerator numeric not null default 10,
  company_logo_url text,
  report_branding jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists settings_set_updated_at on settings;
create trigger settings_set_updated_at
  before update on settings
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table audits enable row level security;
alter table audit_photos enable row level security;
alter table recommendation_templates enable row level security;
alter table settings enable row level security;
alter table communities enable row level security;
alter table community_access enable row level security;

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

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

-- profiles: everyone can read all profiles (needed for "Auditor" display names);
-- users can update their own row; only admins can change roles.
create policy "profiles are readable by authenticated users"
  on profiles for select to authenticated using (true);

create policy "users can update their own profile"
  on profiles for update to authenticated using (auth.uid() = id);

create policy "admins manage all profiles"
  on profiles for all to authenticated using (is_admin());

-- communities: staff always see all; a client only sees the ones they're
-- linked to via community_access. Only admins create/edit communities.
create policy "communities readable by staff and linked clients"
  on communities for select to authenticated
  using (is_staff() or has_community_access(id));

create policy "admins manage communities"
  on communities for all to authenticated using (is_admin());

create policy "users can read their own community access"
  on community_access for select to authenticated
  using (user_id = auth.uid() or is_admin());

create policy "admins manage community access"
  on community_access for all to authenticated using (is_admin());

-- audits: only staff (admin/auditor) can read individual audit rows —
-- clients get no general row-level access, only the aggregate RPC below
-- plus the one exception directly below (their own home, matched by email).
-- Auditors can insert/update their own rows; only admins can delete or
-- reassign another auditor's row.
create policy "audits are readable by staff"
  on audits for select to authenticated using (is_staff());

create policy "clients can read their own home's audit"
  on audits for select to authenticated
  using (
    homeowner_email is not null
    and lower(homeowner_email) = lower((select email from profiles where id = auth.uid()))
  );

-- HOA directors / community managers see every audit in a community they
-- have access to — homeowners do not get this (they only match by email
-- above), so a homeowner never sees a neighbor's data.
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

create policy "auditors can create audits"
  on audits for insert to authenticated
  with check (auditor_id = auth.uid() or is_admin());

create policy "auditors can update their own audits"
  on audits for update to authenticated
  using (auditor_id = auth.uid() or is_admin());

create policy "only admins can delete audits"
  on audits for delete to authenticated using (is_admin());

-- audit_photos: follow the parent audit's access rules
create policy "audit photos are readable by authenticated users"
  on audit_photos for select to authenticated using (true);

create policy "auditors can manage photos on their own audits"
  on audit_photos for all to authenticated
  using (
    is_admin() or exists (
      select 1 from audits
      where audits.id = audit_photos.audit_id
      and audits.auditor_id = auth.uid()
    )
  );

-- recommendation_templates: readable by all, editable by admins only
create policy "templates are readable by authenticated users"
  on recommendation_templates for select to authenticated using (true);

create policy "admins manage templates"
  on recommendation_templates for all to authenticated using (is_admin());

-- settings: readable by all (needed for client-side calculations),
-- editable by admins only
create policy "settings are readable by authenticated users"
  on settings for select to authenticated using (true);

create policy "admins manage settings"
  on settings for all to authenticated using (is_admin());

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

-- ─────────────────────────────────────────────────────────────────────────
-- Storage — "audit-photos" bucket for compressed photo uploads
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('audit-photos', 'audit-photos', true, 5242880) -- 5MB cap post-compression
on conflict (id) do nothing;

create policy "audit photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'audit-photos');

create policy "authenticated users can upload audit photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'audit-photos');

create policy "authenticated users can update their audit photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'audit-photos');

create policy "admins can delete audit photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'audit-photos' and is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- Grants — RLS policies restrict which *rows* a role can see, but Postgres
-- separately requires baseline table-level privileges before RLS is even
-- consulted. Every policy above is scoped `to authenticated`, so granting
-- `anon` read access here is still safe: anon has no matching policy and
-- gets zero rows back either way.
-- ─────────────────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant all on tables to service_role;
