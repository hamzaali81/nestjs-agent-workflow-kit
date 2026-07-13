---
name: prisma-data-layer
description: Patterns for the Prisma data layer in NestJS — PrismaService, PrismaModule, repositories, schema conventions, transactions, error mapping, and testing. Use when adding models, writing queries, designing repositories, handling migrations, or mapping Prisma errors.
license: MIT
metadata:
  author: nestjs-agent-workflow-kit
  version: '1.0'
---

# Prisma data layer

Persistence for this project uses Prisma. Rules summary lives in [database.md](../../../docs/standards/database.md); this skill is the deep reference.

## PrismaService

The **only** place a Prisma client is instantiated:

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

## PrismaModule (global infrastructure)

```typescript
@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```

Never `new PrismaClient()` elsewhere. Inject `PrismaService`.

## Where queries live

- Simple queries: directly in the feature service.
- Non-trivial aggregates: a **repository** per aggregate that wraps `PrismaService`. Repositories translate domain intent into queries and return models/DTOs; they hold **no business rules**.

```typescript
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }
}
```

## Schema conventions (`schema.prisma`)

- Models PascalCase singular (`User`, `OrderItem`); fields camelCase.
- Use `@map`/`@@map` when the DB uses snake_case.
- Prefer `cuid()`/`uuid()` ids; add `createdAt @default(now())` and `updatedAt @updatedAt`.
- Index foreign keys and frequent filters (`@@index`). Add `@unique` for natural keys.

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String   @map("password_hash")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  @@map("users")
}
```

## Query hygiene

- **Never** `$queryRawUnsafe`/`$executeRawUnsafe` with interpolated input. Use the typed API or parameterized `$queryRaw` tagged templates.
- Use `select`/`omit` so sensitive columns never leave the data layer.
- Avoid N+1: use `include`/`select` relations or `$transaction`/`findMany` batching instead of awaiting queries in a loop.
- Always paginate list queries (`take`/`skip` or cursor).

## Transactions

```typescript
// dependent writes → interactive
await this.prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data });
  await tx.stock.update({ where: { id }, data: { qty: { decrement } } });
  return order;
});

// independent writes → array form
await this.prisma.$transaction([a, b, c]);
```

Pass `tx` down; do not nest transactions; no external HTTP inside a transaction.

## Error mapping

Map Prisma errors to HTTP—do not leak raw errors:

```typescript
if (e instanceof Prisma.PrismaClientKnownRequestError) {
  if (e.code === 'P2002') throw new ConflictException('Duplicate value');
  if (e.code === 'P2025') throw new NotFoundException('Record not found');
}
```

Prefer a dedicated `PrismaExceptionFilter` for app-wide mapping.

## Migrations

- `npx prisma migrate dev --name <change>` locally; commit migration files.
- `npx prisma migrate deploy` in CI/prod. Never `db push` against shared environments.
- Regenerate the client after schema changes: `npx prisma generate`.

## Testing

- Unit: mock `PrismaService`/repository with `jest.fn()`; no real DB.
- E2E/integration: dedicated test database, reset (transaction rollback or truncate) between tests. See [testing.md](../../../docs/standards/testing.md).
