# EcoWise Audit Dashboard

Field-ready water conservation audit tool for [EcoWise Water Management](https://ecowisewater.com), built to run a 500–750 home audit project entirely on free-tier infrastructure. Built with Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Supabase, and Recharts.

## Status

This first pass scaffolds the foundation and a working vertical slice:

- **Auth**: email/password sign in and sign up via Supabase Auth, route protection via `proxy.ts`, admin/auditor roles
- **Dashboard**: progress ring, stat cards, and four charts (currently reading placeholder data — see `lib/mock-data.ts`)
- **Audit log**: searchable, filterable, sortable table with CSV export (placeholder data)
- **Analytics**: neighborhood/builder/upgrade-category charts (placeholder data)
- **Settings**: real, working form for water cost & rebate amounts, backed by Supabase (`settings` table)
- **Calculation engine**: `lib/calculations/` — gallons saved, dollar savings, energy savings, rebate total, ROI, payback period, and a 0–100 efficiency score, all from EPA WaterSense benchmarks

**Not yet built** (next phases): the Home Info → Exterior → Interior → Recommendations → Review → Report multi-step audit intake wizard with autosave, photo upload/compression pipeline wired to Supabase Storage, PDF report generation (`@react-pdf/renderer` is installed but unused), recommendation-template library, and admin user management.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on `/login` until Supabase is connected — see [`supabase/README.md`](./supabase/README.md).

## Project Structure

- `app/(auth)/` — login, signup
- `app/(dashboard)/` — dashboard, audits, analytics, settings (auth-gated by `app/(dashboard)/layout.tsx`)
- `components/ui/` — shadcn/ui primitives (Base UI–based, not Radix — see note below)
- `components/layout/` — AppShell, sidebar nav, user menu
- `components/dashboard/`, `components/audit/`, `components/settings/`, `components/forms/` — feature components
- `lib/supabase/` — browser/server Supabase clients + the proxy session helper
- `lib/calculations/` — the water-savings calculation engine
- `lib/validations/` — Zod schemas
- `types/` — `audit.ts` (domain types) and `database.ts` (hand-written Supabase types, see supabase/README.md to regenerate)
- `supabase/schema.sql` — full Postgres schema, RLS policies, and Storage bucket setup

## A note on tooling versions

This project's `next`, `react`, and `shadcn` versions are newer than what most training data reflects:

- Next.js 16 deprecated `middleware.ts` in favor of **`proxy.ts`** (see the file's `proxy()` export).
- shadcn/ui now generates components on top of **Base UI** (`@base-ui/react`), not Radix. There's no `asChild` prop — use `render={<Link href="..." />}` instead. The old `Form`/`FormField` components are gone in favor of `Field`/`FieldLabel`/`FieldError` from `components/ui/field.tsx`, used directly with `react-hook-form`'s `register`.

If something looks unfamiliar, check `node_modules/next/dist/docs/` or run `npx shadcn@latest search @shadcn` before assuming a pattern from memory is still correct.

## Staying on free tier / scaling up

See [`supabase/README.md`](./supabase/README.md#staying-on-the-free-tier-at-750-homes) for the sizing math. Short version: the database is nowhere near the free 500MB cap; photo storage is the constraint to watch as the project approaches 10,000+ photos, and the fix is either more aggressive client-side compression (`lib/image-compression.ts`) or upgrading to Supabase Pro ($25/mo) — no code changes required either way.
