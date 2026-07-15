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
