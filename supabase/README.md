# Supabase setup

This project uses [Supabase](https://supabase.com)'s free tier for Postgres, Auth, and Storage.

## 1. Create a project

Create a free project at [supabase.com/dashboard](https://supabase.com/dashboard). Free tier limits (500MB database, 1GB storage, 50k monthly active users) comfortably cover a 500–750 home audit project — see `../README.md` for the sizing math.

## 2. Run the schema

Open the SQL editor in your Supabase project and run [`schema.sql`](./schema.sql). It creates:

- `profiles` — one row per user, with an `admin` / `auditor` / `client` role
- `communities` — one row per audited development (e.g. "Promontory"); `community_access` scopes which communities a `client`-role user can see
- `audits` — one row per home audit (searchable columns + jsonb detail), tagged with a `community_id`
- `audit_photos` — Storage object references, grouped by category
- `recommendation_templates` — the admin-editable recommendation library
- `settings` — the singleton row of water cost / rebate values used in calculations
- `get_community_dashboard(community_id)` — the aggregate-only RPC the client portal reads from (no row-level access to individual audits)
- the `audit-photos` Storage bucket, with RLS policies on every table

It's safe to re-run — every statement is `if not exists` / `on conflict do nothing`. If you already ran an earlier version of this schema, you can instead run just [`migrations/002_communities.sql`](./migrations/002_communities.sql).

## 3. Create your first admin user

Sign up through `/login` (it creates an `auditor` by default via the `handle_new_user` trigger), then promote yourself in the SQL editor:

```sql
update profiles set role = 'admin' where id = '<your-user-id>';
```

## 4. Copy environment variables

From Project Settings → API, copy into `.env.local` (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # "Publishable key"
SUPABASE_SECRET_KEY=             # "Secret key" — needed to invite clients
```

## 5. Regenerate types (optional, once your schema stabilizes)

`types/database.ts` is hand-written to match `schema.sql`. Once you have the Supabase CLI linked, regenerate it from the live schema instead of hand-editing:

```bash
npx supabase gen types typescript --project-id <project-ref> > types/database.ts
```

## Staying on the free tier at 750 homes

- **Database**: ~750 audit rows + a few thousand photo reference rows is a few MB — nowhere near the 500MB cap.
- **Storage**: 10,000+ photos compressed client-side to ~150–300KB each (see `lib/image-compression.ts`) lands around 1.5–3GB. The free tier ships 1GB — budget for the $25/mo Pro tier once photo volume grows, or compress more aggressively (lower `maxSizeMB` in the compression config).
- **Auth**: a handful of auditor/admin accounts is far under the 50k MAU limit.
