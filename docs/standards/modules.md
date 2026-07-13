# Modules

How the app is composed. Modules are the unit of feature boundaries and DI scope.

## Feature modules

- Every feature lives in its own module under `modules/<feature>/` with a `<feature>.module.ts` ([architecture.md](architecture.md)).
- A module declares its `controllers`, `providers`, `imports` (modules it depends on), and `exports` (providers other modules may use).
- **Export the minimum.** Usually only the feature's service is exported; controllers, DTOs, and repositories stay private to the module.
- Import a module to use its exported providers—do **not** re-declare another module's provider in your own `providers` array (that creates a second instance and breaks singletons).

## Shared and common code

- Truly cross-cutting building blocks (guards, interceptors, filters, pipes, decorators, base DTOs) live in `common/` and are imported where needed, or applied globally in `main.ts`.
- For shared providers used across many modules, create a dedicated module (e.g. `PrismaModule`, `ConfigModule`) and mark it `@Global()` **only** when it is genuinely app-wide infrastructure. Overusing `@Global()` hides dependencies—prefer explicit imports.

## Circular dependencies

- Avoid module and provider cycles. If two modules need each other, that usually signals a missing third module or a misplaced responsibility—extract the shared piece.
- If a cycle is unavoidable, use `forwardRef(() => OtherModule)` and document why, but treat it as a smell to revisit.

## Dynamic / configurable modules

- For modules that need configuration (e.g. a `MailModule` with credentials), expose a static `forRoot`/`forRootAsync` (and `register`/`registerAsync` for per-import config) returning a `DynamicModule`. Use the `ConfigurableModuleBuilder` helper instead of hand-writing the async plumbing.
- Async configuration reads from `ConfigService` via `useFactory`, not from `process.env` directly. See [configuration.md](configuration.md).

## Barrel / bootstrap

- `AppModule` wires top-level imports (config, prisma, feature modules) and app-wide guards/interceptors/filters via `APP_GUARD`/`APP_INTERCEPTOR`/`APP_FILTER` providers so they participate in DI.
- Keep `AppModule` a composition root—no business logic.

**Audit:** Flag providers declared in more than one module, `@Global()` on non-infrastructure modules, and `forwardRef` without an explanatory comment.

See also: [architecture.md](architecture.md), [providers-and-services.md](providers-and-services.md), [configuration.md](configuration.md).
