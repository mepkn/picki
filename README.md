# Picki

Random list selector: create a list, hit **Select** (or Space), and watch one of three
animated themes (Cyber HUD, Gold Stadium, Crimson Arena) land on a winner.

## Features

- Lists with shareable `/lists/:slug` URLs, inline rename, duplicate and delete.
- Three selection modes: no repetition (rounds), allow repetition, auto-restart.
- Skip a pick (e.g. someone is absent) and re-pick, full selection history.
- Per-list settings: theme, animation duration, reduced motion. Sound effects and confetti.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui (Base UI) · React Router · Framer Motion · Convex · Vitest.

## Development

Requires Node 22.18+ (`.nvmrc` pins 22).

```bash
npm install
npx convex deployment select local   # first time only: dev runs on a local backend
npm run convex:dev           # starts the local backend (127.0.0.1:3210) and pushes convex/
npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run build` | Typecheck and production build into `dist/` |
| `npm run convex:dev` / `convex:deploy` | Push backend functions to Convex |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest): selection/round rules |
| `npm run check` | Typecheck, lint and tests |
| `npm run deploy` | Checks, deploys Convex to production, builds and uploads to the VPS |
| `npm run deploy:dry` | Same, but only previews: nothing is deployed or uploaded |

## Deployment

`scripts/deploy.sh` deploys `convex/` to the production deployment, builds the site with
that deployment's URL, and syncs `dist/` to the VPS. Settings live in `.env.prod.local`
(git-ignored, see `.env.example`): `CONVEX_DEPLOY_KEY` (Convex dashboard → Production →
Settings → Deploy Keys) and `DEPLOY_HOST` / `DEPLOY_PORT` / `DEPLOY_DIR`. Because routes like `/lists/:slug` are client-side,
Caddy needs an SPA fallback:

```
try_files {path} /index.html
```

## How it works

- `convex/` holds the schema and functions (lists, items, selections). The random pick is
  done server-side in `selections:selectRandomItem`.
- `src/lib/store.tsx` wraps Convex in a `PickiProvider`; components use `usePicki()`.
- `src/pages/` has the two routes; `src/components/selector/` the three animated themes.
