# Full-stack assignment

Live: https://assignment-ten-rose.vercel.app

A small user-management app using Next.js App Router, TypeScript, Prisma, PostgreSQL, zod and Tailwind CSS.

## Run with Docker

```sh
docker compose up
```

Open http://localhost:3000. Docker builds the app, waits for PostgreSQL, applies migrations and seeds 12 example users and 12 projects. You only need Docker with Compose installed. The first build takes a few minutes.

Stop with `docker compose down`. Data survives in a Docker volume. Seeds use upserts, so restarting does not duplicate records or overwrite edits. The Compose password is a local-only development default, not a production secret.

## How it works

1. Opening `/users?page=2&size=10&role=admin&q=Alex` sends the URL to the server.
2. `app/users/page.tsx` reads the URL and calls `services/users.ts`.
3. The service validates input and asks PostgreSQL to count matching users and return just one page using `skip` / `take`.
4. PostgreSQL also aggregates salaries and seniority for **all matching users**, not just the visible page. `lib/stats.ts` formats the results with Decimal and half-up rounding.
5. The server renders the list. Browser components handle typing, buttons and forms.
6. Saving a form calls the API, which validates again and writes through Prisma. `router.refresh()` reloads the server list and statistics without losing the current filters.

### Server versus client

| Code | Where | Why |
| --- | --- | --- |
| `app/users/page.tsx`, `app/projects/page.tsx` | Server | Load and render database results without exposing database credentials. |
| `app/api/users/*` | Server | Thin HTTP wrappers that map results and errors to responses. |
| `services/users.ts` | Server | User queries and writes live in one place. |
| `lib/pagination.ts` | Server | Generic count/findMany callbacks work for both users and projects. |
| `lib/stats.ts` | Pure functions | Decimal calculations are independent of Prisma and easy to test. |
| `components/pagination.tsx` | Client | Page links and size selection preserve URL filters. |
| `components/filters.tsx` | Client | Debounce search by 300 ms and update the URL. |
| `components/user-form.tsx` | Client | Live validation, saving state, feedback, edit and delete interactions. |
| `lib/validation.ts` | Both | The same zod user schema validates browser forms and API input. |

### Decisions

- Salary enters the API as a string, is stored as PostgreSQL `DECIMAL(14,2)`, and leaves JSON as a string. No money arithmetic uses JavaScript floating-point numbers. No currency was specified, so the UI does not invent one.
- Seniority means completed calendar months as of today's UTC date. Average months are rounded down, then split into years and months. For example, 25 months becomes 2 years and 1 month. SQL calculates the aggregate; the pure `completedMonths()` function defines the same rule for unit tests.
- Invalid page/size values fall back to page 1 / size 10; pages beyond the end use the last page. A malformed page URL recovers safely; invalid API filters produce 400.
- Name search is case-insensitive and treats `%`, `_` and backslashes literally. Search and role filters also apply to statistics.
- Count, rows and statistics use one repeatable-read transaction so the users page is internally consistent.
- Emails are stored lowercase and are unique. Salary accepts nonnegative amounts with up to two decimal places. Start dates must be real dates and cannot be in the future.
- `/projects` only lists seeded projects; it demonstrates reuse of both pagination pieces without adding another CRUD feature.

## API

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/users?page=1&size=10&role=admin&q=Alex` | Items, pagination metadata and filtered statistics |
| GET | `/api/users/:id` | One user |
| POST | `/api/users` | Created user (201) |
| PATCH | `/api/users/:id` | Updated user |
| DELETE | `/api/users/:id` | Empty response (204) |

POST example; PATCH accepts any nonempty subset of these fields:

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "role": "member",
  "salary": "4200.50",
  "startDate": "2024-01-15"
}
```

Errors use `{ "error": "Clear message" }`: 400 for invalid input, 404 for an unknown UUID, 409 for duplicate email. Unknown body fields are rejected. Page sizes are 10, 20 and 50.

## Tests

With the Docker app running:

```sh
npm ci
npm test
npm run test:api
npm run typecheck
npm run build
```

`npm test` covers pagination boundaries, invalid input, sizes, empty results, half-up salary rounding and seniority. `npm run test:api` creates a temporary user, reads and updates it, checks filtering and errors, then deletes it. Set `TEST_BASE_URL` to test the deployed app instead of localhost. Only that temporary test user is modified.

## Local development without the app container

```sh
npm ci
cp .env.example .env
docker compose up db -d
npm run db:migrate
npm run db:seed
npm run dev
```

If the full Compose app is already running, stop it first with `docker compose stop app` to free port 3000.

## Deployment

The app is deployed to Vercel with a Neon Free PostgreSQL database. `DATABASE_URL` is stored in Vercel environment variables; real credentials and local environment files are ignored by Git.

For a fresh deployment, link the Vercel project, connect Neon, and pull its environment variables. Apply migrations and seed before publishing:

```sh
vercel env pull .env.production.local --environment=production
node --env-file=.env.production.local node_modules/prisma/build/index.js migrate deploy
node --env-file=.env.production.local --import tsx prisma/seed.ts
vercel deploy --prod
```

The build runs `prisma generate && next build`. Migrations are explicit deployment commands, so ordinary page requests never change the schema. Local Docker startup runs them automatically.

## Scope

Implemented: user CRUD, shared zod validation, URL pagination and filters, debounced name search, reusable project pagination, filtered statistics, required tests, Docker migrations/seeding and Vercel/Neon deployment.

Skipped: no requested feature intentionally skipped. Authentication, project editing, extra dashboards and other unrelated features are intentionally absent. The hosted assignment is an editable demo using fictional seed data.
