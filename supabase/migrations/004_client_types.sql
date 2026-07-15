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
