# HRIS Metrics Hub

A dashboard for tracking ~90 monthly HR-ops metrics (projects, Workday usage, reporting, tickets, training, etc.) across 11 categories, replacing the earlier Excel + slide-deck process. Two audiences:

- **Leadership summary** — curated KPI tiles grouped into 5 sections, with auto-generated highlights (risers/decliners/target misses).
- **Department detail** — a searchable, filterable table of every underlying metric row, exportable to CSV.
- **Enter Data** — the ~5 category owners type in each month's numbers, which are saved to a real Postgres database (not `localStorage`) so every viewer sees the same data.

This app is a rebuild of an earlier HTML/JS design prototype, with a real backend added: Postgres for storage, Microsoft Entra ID (Azure AD) SSO for auth, and per-category edit permissions.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript, one deployable app for both frontend and API routes
- [Prisma](https://www.prisma.io) + PostgreSQL
- [Auth.js / NextAuth v5](https://authjs.dev) with the Microsoft Entra ID provider, restricted to your company email domain
- No CSS framework — styles are ported inline from the original design spec for pixel fidelity

## Local development

### 1. Start Postgres

```bash
docker compose up -d
```

This starts a local Postgres on `localhost:5432` matching the default `DATABASE_URL` in `.env.example`. (If you'd rather use a Postgres already installed on your machine, just point `DATABASE_URL` at it instead.)

### 2. Configure environment variables

```bash
cp .env.example .env
```

At minimum for local development, set `AUTH_SECRET` (any random string — `openssl rand -base64 32`) and `ALLOW_DEV_LOGIN=true`. This adds a "Dev login" box to the sign-in page that accepts any typed email, so you can try the app without registering an Azure AD app first. See [Setting up Microsoft SSO](#setting-up-microsoft-sso) below for the real thing.

### 3. Install dependencies, migrate, and seed

```bash
npm install
npm run db:migrate   # creates the schema
npm run db:seed      # loads the ~2,300-row sample dataset + default category access
```

The seed script guesses each category's owner email as `firstname.lastname@<ALLOWED_EMAIL_DOMAIN>` from the sample data's owner names. **Check these on the Admin > Access page after your first sign-in** — the guesses won't be right for everyone, and that page is the source of truth for who can enter data into which category.

### 4. Run it

```bash
npm run dev
```

Open http://localhost:3000. With `ALLOW_DEV_LOGIN=true`, use the "Dev login" box and type any email at your configured domain (or add yourself to `ADMIN_EMAILS` in `.env` to get admin access, including the Admin > Access page).

## Setting up Microsoft SSO

1. In the [Azure Portal](https://portal.azure.com), go to **Microsoft Entra ID > App registrations > New registration**.
2. Add a redirect URI (type "Web"): `https://<your-domain>/api/auth/callback/microsoft-entra-id` (for local testing: `http://localhost:3000/api/auth/callback/microsoft-entra-id`).
3. Under **Certificates & secrets**, create a new client secret.
4. Copy these into your environment:
   - `AUTH_MICROSOFT_ENTRA_ID_ID` — the app's "Application (client) ID"
   - `AUTH_MICROSOFT_ENTRA_ID_SECRET` — the client secret value
   - `AUTH_MICROSOFT_ENTRA_ID_ISSUER` — `https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0` (restricts sign-in to your organization's tenant)
5. Set `ALLOWED_EMAIL_DOMAIN` as a second guard (e.g. `rakuten.com`) and `ADMIN_EMAILS` to a comma-separated list of admins.
6. Set `ALLOW_DEV_LOGIN=false` (or leave it unset) once this is configured — never enable it outside your own machine.

## Managing who can enter data

Sign in as an admin (an email listed in `ADMIN_EMAILS`) and go to **Admin** (top right) → **Manage category access**. Each of the 11 categories has a comma-separated list of emails allowed to submit that category's monthly numbers. Admins can always edit every category, in addition to whoever is listed there. Viewers (anyone who can sign in but isn't listed for any category) can see the full dashboard but not the Enter Data tab's forms.

## Deployment

The app is a standard Next.js server plus a Postgres database — deploy it however suits your infrastructure:

- **Vercel + a managed Postgres** (Neon, Supabase, Vercel Postgres): push this repo, set the environment variables from `.env.example` in the Vercel project settings, and point `DATABASE_URL` at your managed database. Run `npx prisma migrate deploy` once (e.g. via a one-off `vercel exec` or locally against the production `DATABASE_URL`) before first use.
- **Any container host** (Azure Container Apps/App Service, AWS, Fly.io, Render, a plain VM): `docker build -t hris-metrics-hub .` and run it with the environment variables set. Run `npx prisma migrate deploy` against the production database as a separate step before starting new containers — it's intentionally not baked into the container's start command, so scaling to multiple replicas doesn't race migrations.

Either way, `npm run db:seed` is meant for local dev/demo data only — for a real launch, skip it (or edit `prisma/seed.ts` first) and let the team start entering real numbers from an empty database.

## Project structure

- `src/lib/categoryDefs.ts` — the 11 categories, their metrics, units, targets, and aggregation rules (ported from the original design spec's `CATEGORY_DEFS`). This is fixed reference data, not user-editable.
- `src/lib/metricsEngine.ts` — all the aggregation/highlight/table business logic (YTD vs monthly views, MoM/YoY %, risers/decliners, CSV export rows), ported function-for-function from the original prototype.
- `src/auth.ts` / `src/auth.config.ts` — NextAuth configuration (split so the Edge-safe subset can run in `proxy.ts` without pulling in Prisma).
- `src/app/api/*` — metrics read endpoint, data-entry write endpoint (with per-category permission checks), and the admin access-management endpoint.
- `src/components/*` — the dashboard UI, styled inline to match the original design tokens.
- `prisma/schema.prisma` — `MetricEntry` (one row per category/metric/owner/region/year/month), `CategoryAccess` (which emails can edit which category), `AppMeta` (the "data last updated" label).
- `prisma/seed.ts` + `prisma/fixtures/hr-metrics-seed.json` — the sample historical dataset from the design handoff, for local dev/demo.

## Known limitation

A handful of the `prisma`/`@prisma/config` devDependency's own dependencies (`deepmerge-ts`) have an open advisory (stack exhaustion on deeply nested input). This only affects the `prisma` CLI tooling used during development/deploy, not the app's runtime `@prisma/client`, so it's a low-risk, dev-only issue — but worth re-checking (`npm audit`) next time you bump the `prisma` package.
