You are an expert in TypeScript, NestJS, and scalable server-side application development. You write modular, maintainable, testable, and secure code.

## Single source of truth

- **Shared defaults:** `docs/standards/` — engineering conventions and implementation rules for this stack.
- **Task capabilities:** `.agents/skills/` — triggered workflows (e.g. code review, Prisma data layer, OpenAPI) with references.
- **Local overrides:** `AGENTS.local.md` — project-specific exceptions (not managed by [nestjs-agent-workflow-kit](https://github.com/hamzaali/nestjs-agent-workflow-kit); create and maintain in your repo).

Follow the standards files for TypeScript, module layering, controllers, DTOs and validation, providers and services, configuration, the data layer (Prisma), error handling, and testing.

| Topic                                             | File                                                                                         |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Layers, folders, canonical examples**           | [docs/standards/architecture.md](docs/standards/architecture.md)                             |
| TypeScript, config, env validation                | [docs/standards/core-engineering.md](docs/standards/core-engineering.md)                     |
| Controllers, routing, request lifecycle           | [docs/standards/controllers.md](docs/standards/controllers.md)                               |
| DTOs, class-validator, ValidationPipe             | [docs/standards/dtos-and-validation.md](docs/standards/dtos-and-validation.md)               |
| Providers, services, dependency injection         | [docs/standards/providers-and-services.md](docs/standards/providers-and-services.md)         |
| Modules, feature boundaries, dynamic modules      | [docs/standards/modules.md](docs/standards/modules.md)                                        |
| ConfigModule, environment, secrets                | [docs/standards/configuration.md](docs/standards/configuration.md)                           |
| Prisma schema, repositories, transactions         | [docs/standards/database.md](docs/standards/database.md)                                      |
| Exception filters, interceptors, guards, pipes    | [docs/standards/error-handling.md](docs/standards/error-handling.md)                         |
| Unit + E2E testing                                | [docs/standards/testing.md](docs/standards/testing.md)                                        |

## Upstream NestJS guidance

For general NestJS patterns (modules, providers, lifecycle, decorators, testing depth, CLI usage), use **`.agents/skills/nestjs-developer`** (`SKILL.md` and `references/`). The `docs/standards` files state **this repo's** stricter or additional rules on top of that skill.

## Data layer

Prisma patterns (schema conventions, `PrismaService`, repository boundaries, transactions, testing) live in **`.agents/skills/prisma-data-layer`**. `docs/standards/database.md` states this repo's rules; the skill holds the deep reference.

## Code review

Convention audits are orchestrated by **`.agents/skills/code-review`** — not a separate `docs/standards/code-review.md`. Topic standards own audit rules; the skill handles scope, routing, checklist, and report format.
