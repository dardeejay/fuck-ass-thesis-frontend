# Project Handa (Web)

Next.js frontend for Project Handa — a class-suspension recommendation dashboard for Olongapo City. Talks to the [project-handa-backend](../project-handa-backend) FastAPI service for predictions and shares its Postgres database (different tables) for auth/user data.

## Prerequisites

- Node.js 20+ and npm
- Docker (for Postgres, and optionally for running everything via Compose)
- The [project-handa-backend](../project-handa-backend) API running on port 8000 (see that folder's README)

## Running the app

### Option A: Docker Compose (runs Postgres + backend API + this web app together)

```bash
docker compose up --build
```

This builds `project-handa-backend` from `../project-handa-backend` and starts:

- `postgres` on `localhost:5432`
- `handa-api` (FastAPI backend) on `localhost:8000`
- `web` (this Next.js app) on `localhost:3000`

Visit `http://localhost:3000`.

### Option B: Run locally (faster iteration, no rebuild on every change)

1. Copy the env file and fill in secrets:

   ```bash
   cp .env.example .env
   ```

   At minimum set `AUTH_SECRET` (any long random string works for local dev, e.g. `openssl rand -base64 32`).

2. Start just Postgres via Docker:

   ```bash
   docker compose up -d postgres
   ```

3. Start the backend API separately — see [project-handa-backend](../project-handa-backend)'s README — so `HANDA_API_URL` (default `http://localhost:8000`) has something to talk to.

4. Install dependencies and set up the database:

   ```bash
   npm install
   npm run db:generate
   npm run db:migrate
   npm run db:seed   # optional: seed initial data
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Other useful scripts

```bash
npm run build       # production build
npm run start       # run the production build (after `npm run build`)
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run format      # prettier --write
```

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
