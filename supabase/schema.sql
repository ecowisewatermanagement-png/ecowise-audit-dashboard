-- EcoWise Audit Dashboard — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists pg_trgm;

-- ─────────────────────────────────────────────────────────────────────────
-- profiles — one row per auth.users row, carries role for authorization
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'auditor' check (role in ('admin', 'auditor')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

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

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
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

-- audits: all authenticated users can read (shared team project);
-- auditors can insert/update their own rows; only admins can delete or
-- reassign another auditor's row.
create policy "audits are readable by authenticated users"
  on audits for select to authenticated using (true);

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
