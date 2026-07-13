---
name: code-review
description: Review recently changed NestJS code against project architecture conventions. Use when the user asks to review code, check conventions, audit recent changes, or says "review", "check my code", "does this follow conventions", or after finishing a multi-file implementation.
---

# Code Review

Review changed files against `docs/standards` and relevant `.agents/skills` references. Do not duplicate full convention text in the report; cite the relevant standard or skill section instead.

## Review Steps

1. **Scope:** Identify changed files with the relevant diff scope (`git diff --name-only`, `--cached`, or `HEAD~N`).
2. **Classify:** Group changed files by type: controller (`*.controller.ts`), service (`*.service.ts`), module (`*.module.ts`), DTO (`dto/*.ts`), repository (`*.repository.ts`), Prisma schema/migration, cross-cutting (`common/**` filters/guards/interceptors/pipes), config (`config/**`), and test (`*.spec.ts`, `*.e2e-spec.ts`).
3. **Read the real code:** For each changed controller, read the full handler bodies (not just the diff) to judge whether logic/data access leaked in. For services, read the methods touched. Do not rely only on `git diff --stat`.
4. **Conventions:** Apply every applicable standard in the checklist below, including each standard's audit/check guidance.
5. **Report:** List deviations in one flat list. If there are no deviations, say so explicitly.

## Routing Hints

Use this table to know where to look first. It does not replace the mandatory coverage checklist.

| Changed files                        | Read                                                                                                                                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross-cutting / unfamiliar area      | [architecture.md](../../../docs/standards/architecture.md) first, then topic files below                                                                                                             |
| Any TS                               | [core-engineering.md](../../../docs/standards/core-engineering.md)                                                                                                                                   |
| `*.controller.ts`                    | [controllers.md](../../../docs/standards/controllers.md), [dtos-and-validation.md](../../../docs/standards/dtos-and-validation.md), [error-handling.md](../../../docs/standards/error-handling.md)   |
| `dto/*.ts`                           | [dtos-and-validation.md](../../../docs/standards/dtos-and-validation.md), [openapi-swagger skill](../openapi-swagger/SKILL.md)                                                                        |
| `*.service.ts`                       | [providers-and-services.md](../../../docs/standards/providers-and-services.md)                                                                                                                       |
| `*.module.ts`                        | [modules.md](../../../docs/standards/modules.md)                                                                                                                                                     |
| `*.repository.ts`, `schema.prisma`   | [database.md](../../../docs/standards/database.md), [prisma-data-layer skill](../prisma-data-layer/SKILL.md)                                                                                          |
| `common/**` (filter/guard/etc.)      | [error-handling.md](../../../docs/standards/error-handling.md)                                                                                                                                       |
| `config/**`                          | [configuration.md](../../../docs/standards/configuration.md)                                                                                                                                         |
| `*.spec.ts`, `*.e2e-spec.ts`         | [testing.md](../../../docs/standards/testing.md)                                                                                                                                                     |

## Mandatory: all linked standards

You **must** work through **every** row below for each review. For each standard, either:

- **Reviewed** — You applied that document's rules to the change set (only the files/topics it governs; skip irrelevant passages inside the doc), or
- **N/A** — The change set touches nothing that standard covers; state that in one short phrase.

Do not skip a row without **Reviewed** or **N/A**.

### Standards index

| Topic                                          | File                                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Layers, folders, examples                      | [docs/standards/architecture.md](../../../docs/standards/architecture.md)                           |
| TypeScript, config, security baseline          | [docs/standards/core-engineering.md](../../../docs/standards/core-engineering.md)                   |
| Controllers, routing, versioning               | [docs/standards/controllers.md](../../../docs/standards/controllers.md)                             |
| DTOs, class-validator, ValidationPipe          | [docs/standards/dtos-and-validation.md](../../../docs/standards/dtos-and-validation.md)             |
| Providers, DI, service boundaries              | [docs/standards/providers-and-services.md](../../../docs/standards/providers-and-services.md)       |
| Modules, exports, dynamic modules              | [docs/standards/modules.md](../../../docs/standards/modules.md)                                     |
| ConfigModule, env validation, secrets          | [docs/standards/configuration.md](../../../docs/standards/configuration.md)                         |
| Prisma queries, transactions, error mapping    | [docs/standards/database.md](../../../docs/standards/database.md)                                   |
| Filters, guards, interceptors, pipes           | [docs/standards/error-handling.md](../../../docs/standards/error-handling.md)                       |
| Jest unit, Supertest E2E (when tests change)   | [docs/standards/testing.md](../../../docs/standards/testing.md)                                     |

## Findings

List every deviation in a **single flat list**. Do not group or label by severity. For each item: what's wrong, **file path** (and line or region if useful), cite the relevant `docs/standards/*.md` (or skill) section, and a concrete fix if obvious.

If there are no deviations, say so explicitly. Do not invent issues.

## Common NestJS deviations to watch for

- Data access (Prisma/HTTP/queue) or business branching inside a controller handler.
- Request bodies/queries typed as interfaces or `any` instead of validated class DTOs.
- Sensitive fields (password hash, tokens) returned in responses (no `@Exclude`/response DTO).
- `process.env` read outside `config/`.
- Provider declared in multiple modules; unnecessary `@Global()`; unexplained `forwardRef`.
- Raw Prisma/HTTP errors leaked to clients; error objects returned with `200`; try/catch in a controller that belongs in a filter.
- Inline auth checks that belong in a guard.
- `new PrismaClient()` outside `PrismaService`; `$queryRawUnsafe` with interpolated input; N+1 loops; unpaginated lists.
- Unit tests hitting a real DB; E2E apps not applying the global pipes/filters.

## End of review: standards coverage checklist

Close every review with a checklist mirroring the tables above:

```text
Standards coverage
- architecture.md — Reviewed | N/A: …
- core-engineering.md — Reviewed | N/A: …
- controllers.md — …
- dtos-and-validation.md — …
- providers-and-services.md — …
- modules.md — …
- configuration.md — …
- database.md — …
- error-handling.md — …
- testing.md — …
- prisma-data-layer skill — …
- openapi-swagger skill — …
- nestjs-developer skill — …
```

**Do not** run builds or tests as part of this review; static convention checks and the checklist above are sufficient.

When reporting findings, cite the relevant `docs/standards/*.md` section instead of pasting long excerpts.
