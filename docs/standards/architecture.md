# Application architecture

Thin hub for **how this app is structured**. Detailed rules live in the linked standards—avoid duplicating them here.

## Layers (request flow)

A request flows through clear layers. Each layer has one job and does not reach past the next one:

1. **Transport** — Controllers (and, where used, gateways/microservice handlers): parse the request, validate input via DTOs, delegate to a service, shape the response. Thin. See [controllers.md](controllers.md), [dtos-and-validation.md](dtos-and-validation.md).
2. **Domain / orchestration** — **Services** (providers): business rules, coordinate flows, call repositories and other services, own cross-cutting outcomes (events, notifications) when that is the established pattern. See [providers-and-services.md](providers-and-services.md).
3. **Data / I/O** — **Repositories / `PrismaService`**, HTTP clients, queue producers: persistence and external calls. Single responsibility; callers stay in services for business flows. See [database.md](database.md).

**Rule of thumb:** Controllers do **not** talk to Prisma, external HTTP, or queues directly for feature work—they call a **service** method that delegates ([providers-and-services.md](providers-and-services.md)).

**Cross-cutting concerns** (validation, serialization, auth, logging, error shaping) belong in **pipes, guards, interceptors, and exception filters**, not scattered through controllers and services. See [error-handling.md](error-handling.md).

## Source layout (`src`)

| Area          | Role                                                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `common/`     | App-wide cross-cutting building blocks: guards, interceptors, filters, pipes, decorators, base DTOs, shared types.           |
| `config/`     | `ConfigModule` setup, typed config namespaces, env validation schema. See [configuration.md](configuration.md).             |
| `modules/`    | Feature modules (e.g. `users/`, `auth/`, `billing/`): controller(s), service(s), DTOs, entities/models, colocated tests.    |
| `prisma/`     | `PrismaModule` + `PrismaService`, `schema.prisma`, migrations, seed. See [database.md](database.md).                        |
| `main.ts`     | Bootstrap: global pipes/filters/interceptors, versioning, Swagger, graceful shutdown.                                       |

New work should **colocate** the controller, service, DTOs, and tests inside the feature module that owns the behavior. A feature module owns its own folder; shared building blocks go in `common/`.

## Feature module shape

A typical feature module folder:

```
modules/users/
  users.module.ts
  users.controller.ts
  users.service.ts
  dto/
    create-user.dto.ts
    update-user.dto.ts
  users.repository.ts        # optional: wraps Prisma for this aggregate
  users.controller.spec.ts
  users.service.spec.ts
```

Keep the module's public surface small: export only the providers other modules need (usually the service), and import the modules you depend on. See [modules.md](modules.md).

## Canonical examples

- **Feature module (transport → service → repository):** `modules/users/` — thin controller, `UsersService` orchestration, `UsersRepository`/`PrismaService` for I/O.
- **Cross-cutting building block:** `common/interceptors/`, `common/filters/`, `common/guards/` — applied globally in `main.ts` or per-controller via decorators.

## See also

| Topic                                    | Doc                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| Providers, DI, service boundaries        | [providers-and-services.md](providers-and-services.md)                 |
| Module organization                      | [modules.md](modules.md)                                               |
| Data layer (Prisma)                      | [database.md](database.md)                                             |
| Cross-cutting (filters/guards/pipes)     | [error-handling.md](error-handling.md)                                 |
| Input validation                         | [dtos-and-validation.md](dtos-and-validation.md)                       |
