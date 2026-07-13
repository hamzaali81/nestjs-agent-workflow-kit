---
name: nestjs-developer
description: Generates NestJS code and provides architectural guidance. Trigger when creating projects, modules, controllers, services, providers, guards, interceptors, pipes, or filters, or for best practices on dependency injection, module design, validation (class-validator DTOs), configuration, the data layer (Prisma), OpenAPI, testing (Jest/Supertest), or the Nest CLI.
license: MIT
metadata:
  author: nestjs-agent-workflow-kit
  version: '1.0'
---

# NestJS Developer Guidelines

1. Always determine the project's NestJS major version and package manager before generating code; APIs and defaults vary between v9/v10/v11. Read `package.json`.
2. Follow the framework conventions and the project's `docs/standards/` rules. Use the **Nest CLI** (`nest generate`) to scaffold modules, controllers, services, guards, etc. so structure stays consistent.
3. After generating code, run `npm run build` (or `nest build`) and the linter. Fix type and lint errors before finishing—do not leave a broken build.

## Creating new projects

If the user has not specified otherwise:

1. Scaffold with the Nest CLI: `npx @nestjs/cli new <project-name>` (or a pinned version `@nestjs/cli@<v>`). Ask which package manager if it matters; default to the repo's existing one.
2. Enable strict TypeScript, the global `ValidationPipe`, `ConfigModule` with env validation, and a `PrismaModule` unless the user chose a different data layer.
3. See [`nestjs-new-app`](../nestjs-new-app/SKILL.md) for the full new-app checklist and bootstrap wiring.

## Core mental model

- **Modules** compose the app and define DI scope. **Controllers** are the transport layer. **Providers/services** hold business logic. **Repositories / `PrismaService`** own persistence.
- Cross-cutting behavior is expressed as **pipes** (validation/transform), **guards** (authz), **interceptors** (response/logging/caching), and **exception filters** (error shaping)—registered per-handler, per-controller, or globally via `APP_*` providers.
- Everything is wired through **dependency injection**; use constructor injection with `private readonly`.

## Generation rules

- Every request body/query/param object is a **class DTO** validated by class-validator. No plain interfaces for validated input. See `references/dtos-validation.md`.
- Controllers stay thin: extract input → call one service method → return. Push logic into services. See `references/controllers-routing.md`.
- Services do the work; inject repositories/other services. Keep transport concerns out. See `references/providers-di.md`.
- Read config through a typed `ConfigService`, never `process.env` in feature code. See `references/configuration.md`.
- Data access goes through `PrismaService`/repositories, never controllers. See [`prisma-data-layer`](../prisma-data-layer/SKILL.md).
- Errors are thrown as `HttpException` subclasses and shaped by a global filter. See `references/error-handling.md`.
- Document endpoints and DTOs for OpenAPI. See [`openapi-swagger`](../openapi-swagger/SKILL.md).
- Write Jest unit tests (mock collaborators) and Supertest E2E tests (real request path with global pipes/filters). See `references/testing.md`.

## References

| Topic                                   | File                                                   |
| --------------------------------------- | ------------------------------------------------------ |
| Modules, dynamic modules, boundaries    | [references/modules.md](references/modules.md)         |
| Providers, DI, provider scope           | [references/providers-di.md](references/providers-di.md) |
| Controllers, routing, versioning        | [references/controllers-routing.md](references/controllers-routing.md) |
| DTOs, class-validator, ValidationPipe   | [references/dtos-validation.md](references/dtos-validation.md) |
| Config, env validation, secrets         | [references/configuration.md](references/configuration.md) |
| Filters, guards, interceptors, pipes    | [references/error-handling.md](references/error-handling.md) |
| Jest + Supertest testing                | [references/testing.md](references/testing.md)         |
| Nest CLI commands                       | [references/cli.md](references/cli.md)                 |

## Checklist before finishing

- [ ] Build passes (`nest build`) and lint is clean.
- [ ] New input has DTOs + validation; sensitive fields excluded from responses.
- [ ] No data access or business logic in controllers.
- [ ] Config read via `ConfigService`; no stray `process.env`.
- [ ] Errors thrown as `HttpException`s; no raw Prisma/HTTP errors leaked.
- [ ] Unit tests for service logic; E2E for at least one success + one failure path.
