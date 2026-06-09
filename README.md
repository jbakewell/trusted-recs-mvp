# Trusted Recs MVP

Trusted Recs is a mobile-first Next.js app for saving movie recommendations from trusted friends and family.

## Local commands

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Vercel deployment settings

The `package.json` for this app is at the repository root. In Vercel, configure the project with:

- Framework Preset: `Next.js`
- Root Directory: repository root / `.` / blank
- Install Command: `npm install`
- Build Command: `npm run build`

The committed `vercel.json` pins the framework and build commands so Vercel can detect the app from the repository root.

## GitHub and Vercel visibility checklist

If GitHub or Vercel does not show the Next.js files, first confirm the PR branch includes this repository root commit. This local workspace currently has the app files committed at the repo root, including `package.json`, `next.config.ts`, `vercel.json`, and `src/app/page.tsx`.

Use these checks when connecting the PR to Vercel:

1. In GitHub, open the PR branch rather than the default branch if the PR has not been merged yet.
2. Confirm `package.json` is visible at the repository root in that branch.
3. In Vercel, set Root Directory to the repository root (`.` or blank), not a subfolder.
4. Redeploy the latest commit after the branch/PR updates are visible in GitHub.

## Database setup

See `docs/database.md` for Neon, Prisma migration, and seed instructions.
