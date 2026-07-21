# Musanzi API

NestJS API for Wilfried Musanzi's personal website. It provides authentication and administration features for articles, projects, tags, users, roles, and dashboard statistics.

## Tech stack

- Node.js 24, TypeScript, and NestJS 11
- PostgreSQL 18 with TypeORM
- NestJS CQRS for commands and queries
- Passport with PostgreSQL-backed sessions
- Role-based access control
- Docker Compose for development and production
- Pino logging, request validation, rate limiting, email, CSV import/export, and file uploads

## Requirements

For local development:

- Node.js 24
- pnpm (Corepack is recommended)
- PostgreSQL

Alternatively, install Docker and Docker Compose to run the complete stack in containers.

## Configuration

Create the local environment file:

```bash
cp .env.example .env
```

Then configure these values:

| Variable                     | Purpose                                     | Example          |
| ---------------------------- | ------------------------------------------- | ---------------- |
| `PORT`                       | HTTP server port                            | `8000`           |
| `DB_HOST`                    | PostgreSQL host; use `db` with Compose      | `localhost`      |
| `DB_PORT`                    | PostgreSQL port                             | `5432`           |
| `DB_USERNAME`                | PostgreSQL user                             | `postgres`       |
| `DB_PASSWORD`                | PostgreSQL password                         | `postgres`       |
| `DB_NAME`                    | PostgreSQL database                         | `musanzi`        |
| `MAIL_HOST`                  | SMTP server                                 | `smtp.gmail.com` |
| `MAIL_PORT`                  | SMTP port                                   | `465`            |
| `MAIL_USERNAME`              | SMTP username and sender address            | —                |
| `MAIL_PASSWORD`              | SMTP password or app password               | —                |
| `SESSION_SECRET`             | Secret used to sign session cookies         | —                |
| `SESSION_MAX_AGE`            | Session lifetime in milliseconds            | `86400000`       |
| `JWT_SECRET`                 | Secret used for signed tokens               | —                |
| `JWT_AUTH_TOKEN_EXPIRERS_IN` | Authentication token lifetime configuration | —                |
| `ADMIN_PASSWORD`             | Password assigned to the seeded admin user  | —                |

Use long, randomly generated values for secrets. Do not commit `.env`.

## Run with Docker

Set `DB_HOST=db` in `.env`, then start the development stack:

```bash
docker compose -f compose.dev.yml -p musanzi-backend up --build
```

Development Compose starts:

- the API on the configured `PORT`;
- PostgreSQL on port `5432`;
- Adminer at `http://localhost:8080`.

Apply migrations and seed data from another terminal:

```bash
docker compose -f compose.dev.yml -p musanzi-backend exec api pnpm build
docker compose -f compose.dev.yml -p musanzi-backend exec api pnpm db:up
docker compose -f compose.dev.yml -p musanzi-backend exec api pnpm db:seed
```

To run the production image:

```bash
docker compose -f compose.prod.yml -p musanzi-backend up --build -d
```

## API overview

Public routes do not require a session. All other routes require authentication, and administration routes require the `ADMIN` role.

| Area           | Base path   | Access                     | Capabilities                                                           |
| -------------- | ----------- | -------------------------- | ---------------------------------------------------------------------- |
| Authentication | `/auth`     | Mixed                      | Sign in/out, current profile, profile/password updates, password reset |
| Articles       | `/articles` | Public reads; admin writes | List, read by slug, create, update, delete, upload cover               |
| Projects       | `/projects` | Public reads; admin writes | List, read, create, update, delete, upload image                       |
| Tags           | `/tags`     | Public reads; admin writes | List, read, create, update, delete                                     |
| Users          | `/users`    | Authenticated/admin        | Manage users, upload avatar, import/export CSV                         |
| Roles          | `/roles`    | Admin                      | List, read, create, update, delete                                     |
| Statistics     | `/stats`    | Admin                      | Retrieve dashboard statistics                                          |

Authentication uses an HTTP session cookie. Clients calling the API from a browser should include credentials with requests.

## Database commands

```bash
# Generate a migration (replace the name)
name=add_example pnpm db:migrate

# Apply pending migrations
pnpm db:up

# Revert the latest migration
pnpm db:down

# Seed the admin role and user (run after pnpm build)
pnpm db:seed
```

The seed creates or updates the administrator declared in `src/modules/database/seeds/index.ts` and uses `ADMIN_PASSWORD` from `.env`.

## Available scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `pnpm start:dev`   | Start in watch mode                          |
| `pnpm start:debug` | Start in debug/watch mode                    |
| `pnpm build`       | Compile the application to `dist/`           |
| `pnpm start:prod`  | Run the compiled application                 |
| `pnpm lint`        | Run ESLint and apply fixes                   |
| `pnpm format`      | Format TypeScript source files with Prettier |

## Architecture

Features live under `src/modules` and follow CQRS:

- `queries/impl` and `queries/handlers` contain read operations;
- `commands/impl` and `commands/handlers` contain write operations;
- `events` contain domain events and side effects when needed;
- `controllers`, `dto`, `entities`, `interfaces`, and `helpers` keep transport and domain concerns separated;
- `index.ts` barrel files expose each feature's public symbols.
