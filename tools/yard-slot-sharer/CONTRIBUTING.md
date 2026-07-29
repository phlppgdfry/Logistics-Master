# Contributing to YardEx

Thanks for your interest in contributing. This guide covers everything you need to get a change merged.

---

## Table of contents

1. [Project structure](#project-structure)
2. [Local development setup](#local-development-setup)
3. [Workflow](#workflow)
4. [Code conventions](#code-conventions)
5. [Database migrations](#database-migrations)
6. [Adding a new API route](#adding-a-new-api-route)
7. [Adding a new page](#adding-a-new-page)
8. [Commit messages](#commit-messages)
9. [Pull request checklist](#pull-request-checklist)

---

## Project structure

```
yard-slot-sharer/
├── client/               React 18 + Vite frontend
│   └── src/
│       ├── components/   Layout, shared components
│       ├── context/      AuthContext (JWT + localStorage)
│       ├── pages/        One file per route
│       └── utils/api.js  Typed fetch wrapper
├── server/               Express API
│   └── src/
│       ├── middleware/   auth.js (JWT verify)
│       ├── routes/       One file per resource
│       ├── db.js         pg Pool singleton
│       └── index.js      App entry point
├── database/
│   └── migrations/       Ordered SQL files (001_, 002_, …)
└── .github/
    ├── workflows/        CI
    └── ISSUE_TEMPLATE/
```

---

## Local development setup

**Prerequisites:** Node.js ≥ 20, Docker (or PostgreSQL 16 installed locally)

```bash
# 1. Clone
git clone https://github.com/phlppgdfry/YardEx.git
cd YardEx

# 2. Start database
docker-compose up -d

# 3. Run migrations
docker exec -i yard-slot-sharer-postgres-1 \
  psql -U postgres yardex < database/migrations/001_init.sql
docker exec -i yard-slot-sharer-postgres-1 \
  psql -U postgres yardex < database/migrations/002_contact_fields.sql

# 4. (Optional) Load demo seed data
docker exec -i yard-slot-sharer-postgres-1 \
  psql -U postgres yardex < database/seed.sql

# 5. Start server
cd server && cp .env.example .env && npm install && npm run dev

# 6. Start client (separate terminal)
cd client && npm install && npm run dev
# → http://localhost:5173
```

---

## Workflow

1. **Fork** the repo and create a feature branch from `main`:
   ```bash
   git checkout -b feat/date-range-filter
   ```
2. Make your changes (keep commits focused — one logical change per commit).
3. Verify everything works: server starts, client builds, affected flows pass manual testing.
4. **Push** and open a PR against `main`.
5. CI must pass before a merge.

---

## Code conventions

### General

- Dutch UI strings, English code identifiers and comments.
- No console.log left in production code paths (server errors use `console.error`).
- All new routes require the `requireAuth` middleware unless they are public by design.

### Server

- Route files live in `server/src/routes/`. One file per resource.
- Use parameterised queries (`$1`, `$2`, …) — never string-interpolate user input into SQL.
- Wrap multi-step DB operations in a `BEGIN / COMMIT / ROLLBACK` transaction.
- Return consistent error shapes: `{ error: 'Human-readable message' }`.

### Client

- Pages in `client/src/pages/`, one component per file.
- API calls go through `client/src/utils/api.js` — never raw `fetch` from a page component.
- Use CSS custom properties from `index.css` for colours, spacing, and radii. Avoid hard-coded hex values.
- Use `className` with the utility classes defined in `index.css` (`card`, `badge-*`, `btn-*`, `form-group`, etc.) before adding inline styles.

---

## Database migrations

- Create a new file in `database/migrations/` named `00N_short_description.sql` where `N` continues the sequence.
- Migrations are **additive** — never drop a column or table in a migration that ships alongside a code change (deprecate first, remove separately).
- Include `IF NOT EXISTS` / `IF EXISTS` guards where appropriate.
- Update `docker-compose.yml` if the migration must run automatically on first `docker-compose up`.

---

## Adding a new API route

1. Create or extend a file in `server/src/routes/`.
2. Register it in `server/src/index.js` with `app.use('/api/resource', require('./routes/resource'))`.
3. Add the endpoint to the API table in `README.md`.
4. Expose it through `client/src/utils/api.js`.

---

## Adding a new page

1. Create `client/src/pages/NewPage.js`.
2. Add a `<Route>` in `client/src/App.js` wrapped in `<PrivateRoute>` (or `<PublicRoute>` for unauthenticated pages).
3. Add a `<NavLink>` in `client/src/components/Layout.js` if it should appear in the sidebar.

---

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add date-range filter to marketplace
fix: prevent request on own listing returning 500
docs: update API table in README
chore: bump express to 4.19
migration: add index on listings.available_from
```

---

## Pull request checklist

- [ ] Server starts without errors
- [ ] Client builds (`npm run build`) without errors
- [ ] Manually tested the affected flow end-to-end
- [ ] No `.env` files or secrets included
- [ ] `database/migrations/` updated if schema changed
- [ ] `.env.example` updated if a new variable was added
- [ ] `README.md` updated if the API surface changed
