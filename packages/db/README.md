# @homemade/db

Prisma schema, migrations, and database scripts for Homemade.

## Environment variables

Two connection strings are required when running migrations:

| Variable | Purpose | Neon host format |
|---|---|---|
| `DATABASE_URL` | Runtime app (Prisma Client). Uses the pooled endpoint via pgbouncer. | `ep-xxx-pooler.eu-west-2.aws.neon.tech` |
| `DIRECT_URL` | Prisma migrations only. Bypasses pgbouncer so the session-level advisory lock used by `prisma migrate` is released when the process exits. Without this, a cancelled CI run can leave the lock held and the next migration times out with P1002. | `ep-xxx.eu-west-2.aws.neon.tech` (no `-pooler`) |

Both variables must be set in `.env` (local) and as GitHub Actions secrets (CI).

`DIRECT_URL` falls back to `DATABASE_URL` if unset, which preserves behaviour in environments (e.g. Docker build) where neither migration nor advisory-lock concerns apply.
