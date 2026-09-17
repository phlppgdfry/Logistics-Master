# YardExx Platform

[![Deployed on Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=yardexx-platform&style=flat-square)](https://yardexx-platform.vercel.app)

**De Airbnb voor Terminalcapaciteit — Privé repository**

Volledig anoniem kopen en verkopen van surplus terminalcapaciteit: container, RoRo, droge bulk, tank, koeling. België-first, uitbreiding naar Europa.

---

## Tech stack

- **Next.js 15** — App Router, TypeScript
- **Tailwind CSS v4** — styling
- **PostgreSQL** — productie database (in-memory store voor MVP)
- **Prisma** — ORM (klaar voor productie, swap uit lib/db.ts)
- **JWT via jose** — authenticatie

## Lokaal starten

```bash
python3 scripts/setup_local_env.py
set -a
source .env
set +a
# .env bevat nu unieke lokale DATABASE_URL en JWT_SECRET

npm install
npm run dev
```

Open http://localhost:3000

## Routes

| Route | Beschrijving |
|-------|-------------|
| `/` | Homepage / hero |
| `/marketplace` | Alle actieve listings (filter op type, regio) |
| `/listings/new` | Nieuwe listing publiceren |
| `/listings/[id]` | Listing detail + aanvraag |
| `/auth` | Login / registratie |
| `/api/listings` | REST API — GET + POST |

## MVP → Productie

De app gebruikt nu een in-memory store (`lib/db.ts`). Voor productie:

1. Installeer Prisma: `npm install prisma @prisma/client`
2. Maak `prisma/schema.prisma` met de types uit `types/index.ts`
3. Vervang de functies in `lib/db.ts` door Prisma client calls
4. Zet `DATABASE_URL` in je .env.local

## Roadmap

- [ ] PostgreSQL + Prisma integratie
- [ ] Terminalverificatie flow
- [ ] Anoniem matching-algoritme
- [ ] Notificaties (e-mail bij match)
- [ ] Dashboard per terminal
- [ ] Betalingsintegratie (Stripe)
- [ ] Rotterdam uitbreiding (Q3 2026)

---

*Privé. Niet publiek delen.*

## Local database credentials

Run `python3 scripts/setup_local_env.py` before starting a new local database. It
creates a private `.env` with a random password and matching `DATABASE_URL`, and
refuses to overwrite existing configuration. Docker Compose reads `.env`; for
Python commands, dbt or Prisma CLI, export it first:

```bash
set -a
source .env
set +a
```

For an existing PostgreSQL volume, keep its current credentials until you change
the database role password and update `.env` together. Changing an environment
variable does not rotate the password stored in PostgreSQL. Never reuse the old
public demo credentials on a reachable or production database.

## Verified cloud database TLS

Supabase connections use the public Supabase Root 2021 CA bundled in
`lib/supabase-ca.ts`; Neon uses the system trust store. Certificate and hostname
verification remain enabled with TLS 1.2 or newer. `DATABASE_CA_CERT` accepts a
PEM CA override (including escaped newlines) for a private CA or CA rotation.
URL SSL parameters cannot override these checks for cloud connections.

Source: [Supabase SSL verification documentation](https://supabase.com/docs/guides/platform/ssl-enforcement).
The CA download URL is the one used by
[Supabase Studio](https://github.com/supabase/supabase/blob/master/apps/studio/hooks/custom-content/custom-content.json).
Run the configuration regressions with `npx tsx --test tests/database-config.test.ts`.
