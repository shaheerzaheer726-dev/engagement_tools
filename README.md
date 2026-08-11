# Engagement Tools

A TypeScript monorepo foundation for sales, engagement, and marketing tools.

## Repository layout

```text
apps/
  dashboard/   Next.js dashboard for users and administrators
  worker/      Durable background-job process powered by pg-boss
packages/
  database/    Prisma schema, migrations, and shared database client
```

The dashboard and worker are independently deployable. PostgreSQL stores product
data, audit history, and the pg-boss job queue. Prisma owns only the product tables;
pg-boss manages its own schema.

## Prerequisites

- Node.js 22 (see `.nvmrc`)
- Corepack-enabled pnpm
- Docker with Docker Compose

## Local development

```bash
corepack enable
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm db:migrate:deploy
pnpm dev
```

The dashboard runs on <http://localhost:3000>. The worker exposes a health endpoint
on <http://localhost:3001>. `pnpm dev` starts both processes; use
`pnpm dev:dashboard` or `pnpm dev:worker` to run one.

To build and run the entire stack in containers:

```bash
docker compose up --build
```

After the containers are running, make sure the database is migrated and seeded so an initial administrator account exists:

```bash
pnpm db:migrate:deploy
pnpm db:seed
```

The seed script will create the initial admin user. You can override the defaults with the `SEED_ADMIN_USERNAME` and `SEED_ADMIN_PASSWORD` environment variables when running the seed step.

## Common commands

| Command           | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `pnpm dev`        | Start all applications in watch mode                |
| `pnpm build`      | Build packages and applications in dependency order |
| `pnpm lint`       | Run repository-wide lint checks                     |
| `pnpm typecheck`  | Type-check every workspace                          |
| `pnpm format`     | Format repository files                             |
| `pnpm db:generate`       | Generate the Prisma client                      |
| `pnpm db:migrate`        | Create and apply a development migration        |
| `pnpm db:migrate:deploy` | Apply checked-in migrations                     |
| `pnpm db:studio`         | Open Prisma Studio                              |

## Architectural guardrails

- There is no public registration or password-reset flow. Accounts are created and
  credentials are reset by administrators.
- Store only strong password hashes; never store or log plaintext passwords.
- Record security-sensitive and user-visible operations in `AuditLog`.
- Put each worker job in its own module, validate its payload at the boundary, make
  it idempotent, and configure retries/timeouts appropriate to that job.
- The initial schema is a starting point. Extend it through Prisma migrations rather
  than editing a deployed database manually.

## Environment variables

Copy `.env.example` to `.env`. Production secrets must come from the deployment
platform; do not commit `.env` files. `DATABASE_URL` is required at runtime by both
applications.
