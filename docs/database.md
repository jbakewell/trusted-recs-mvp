# Database setup

Trusted Recs uses Prisma with Neon Postgres.

## Environment variables

Copy `.env.example` to `.env` locally or add the same variables in Vercel, then replace the placeholder `DATABASE_URL` with the pooled or direct Neon connection string for the target environment.

Keep `sslmode=require` in Neon URLs and never commit real secrets.

Required for Vercel previews and production:

- `DATABASE_URL`
- `SESSION_SECRET`
- `APP_BASE_URL`

TMDB variables are included in `.env.example` for later movie-search milestones; do not expose `TMDB_API_KEY` to client-side code.

## Local setup

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Vercel database setup

With `DATABASE_URL` configured in Vercel, run the migration and seed commands once per target database before testing group creation:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed is idempotent and uses `skipDuplicates`, so it is safe to rerun after deployments.

The migration creates the MVP tables for accounts, private groups, lightweight participants, invite links, sessions, future-ready items, movie metadata, recommendation reason chips, recommendations, targets, and reactions. The seed script adds global fallback reason chips plus genre-prioritised movie reason chips.
