# Database (Prisma)

Persistence uses **Prisma**. This file states the project's rules; full patterns (schema conventions, `PrismaService`, transactions, testing) live in [`.agents/skills/prisma-data-layer/SKILL.md`](../../.agents/skills/prisma-data-layer/SKILL.md).

## PrismaService and module

- Wrap the Prisma client in a `PrismaService extends PrismaClient` that connects in `onModuleInit` and disconnects in `onModuleDestroy`. Expose it via a `PrismaModule` (usually `@Global()` since it is app-wide infrastructure).
- Do **not** instantiate `new PrismaClient()` anywhere except `PrismaService`. Inject `PrismaService`; never create ad hoc clients.

## Where queries live

- Prisma calls belong in the **data layer**: a repository per aggregate (`UsersRepository`) or directly in the feature service when the query is simple. They do **not** belong in controllers.
- Keep business rules out of the repository; the repository translates domain intent into Prisma queries and returns models/DTOs. Rules live in the service ([providers-and-services.md](providers-and-services.md)).

## Query hygiene

- **Never** interpolate untrusted input into `$queryRawUnsafe`/`$executeRawUnsafe`. Prefer the typed query API; if raw SQL is required, use the tagged `$queryRaw` template (parameterized).
- Select explicitly for read paths that cross a trust boundary—use `select`/`omit` so sensitive columns (password hashes, tokens) never leave the data layer.
- Avoid N+1: use `include`/`select` relations or a batched query instead of looping queries. Flag `await` inside a `for...of` over Prisma calls when a single query would do.
- Paginate list queries (`take`/`skip` or cursor pagination); never return unbounded result sets to a controller.

## Transactions

- Multi-write operations that must be atomic use `prisma.$transaction` (array form for independent writes, interactive `$transaction(async (tx) => …)` when later writes depend on earlier reads). Pass the `tx` client down; do not open nested transactions.
- Keep transactions short—no external HTTP calls inside a transaction.

## Migrations and schema

- Schema changes go through `prisma migrate` (committed migration files), never manual DB edits or `db push` against shared environments.
- Follow the schema naming conventions in the skill (model names PascalCase singular, fields camelCase, explicit `@map`/`@@map` when the DB uses snake_case).

## Error handling

- Map known Prisma errors (`PrismaClientKnownRequestError`, e.g. `P2002` unique violation, `P2025` not found) to the right `HttpException` in a service or a dedicated exception filter—do not leak raw Prisma errors to clients. See [error-handling.md](error-handling.md).

**Audit:** Flag Prisma usage in controllers, `new PrismaClient()` outside `PrismaService`, `$queryRawUnsafe` with interpolated input, N+1 loops, and unpaginated list endpoints.

See also: [prisma-data-layer skill](../../.agents/skills/prisma-data-layer/SKILL.md), [providers-and-services.md](providers-and-services.md), [testing.md](testing.md).
