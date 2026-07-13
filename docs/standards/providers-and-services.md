# Providers and services

Where business logic lives, and how dependency injection is used. For DI depth, see [`.agents/skills/nestjs-developer/SKILL.md`](../../.agents/skills/nestjs-developer/SKILL.md).

## Services

- One service = one domain responsibility. `UsersService` owns user rules; it does not also send emails—it calls `MailService`.
- Services hold the business logic that controllers delegate to: rules, orchestration across repositories/services, transactions, domain events.
- Return domain results or throw `HttpException` subclasses for expected failures. Do not return HTTP-shaped ad hoc objects.
- Keep services free of transport concerns: no `@Res`, no status codes, no request/response objects.

## Dependency injection

- Use **constructor injection** with `private readonly`:

  ```typescript
  constructor(
    private readonly users: UsersRepository,
    private readonly mail: MailService,
  ) {}
  ```

- Prefer class-based providers. Use custom provider tokens (`useFactory`, `useValue`, `useClass`) only when you need configuration-time wiring or to inject non-class values; give them a `Symbol`/string token and an `InjectionToken` type.
- Depend on **abstractions you own** at module boundaries when it aids testing (e.g. an abstract `PaymentGateway` with a Stripe implementation bound in the module), but do not over-abstract single-implementation services.
- Do **not** instantiate providers with `new` for DI-managed classes; let the container inject them. `new` is fine for plain value objects.

## Provider scope

- Default to the **singleton** (`DEFAULT`) scope. Only use `REQUEST` scope when you truly need per-request state, and know it forces the whole dependency chain request-scoped (performance cost).
- Do not store request/user state on singleton service fields—pass it through method arguments.

## Boundaries: controller vs service vs repository

- **Controllers** call **one service method** and shape the response ([controllers.md](controllers.md)).
- **Services** own business flows and call repositories/other services.
- **Repositories / `PrismaService`** own persistence; no business rules there ([database.md](database.md)).

**Audit:** Flag controllers that contain business branching or data access; flag services that build HTTP responses or read `req`; flag repositories that enforce business rules.

## Lifecycle and side effects

- Use lifecycle hooks (`OnModuleInit`, `OnApplicationShutdown`) for setup/teardown (warm caches, close connections), not module-level top-level code.
- Long-running or fire-and-forget work belongs in a queue/worker (e.g. `@nestjs/bull`) or a scheduled task (`@nestjs/schedule`), invoked from a service—not blocking the request.

## Cross-cutting

- Logging, retries, caching, and error mapping that apply broadly belong in **interceptors** or dedicated infra providers, not copy-pasted into each service. See [error-handling.md](error-handling.md).

See also: [architecture.md](architecture.md), [modules.md](modules.md), [database.md](database.md).
