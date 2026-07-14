# @nestjs-agent/analyzer (v0.2 spike)

Deterministic NestJS architecture analyzer built on the TypeScript AST
(`ts-morph`). **No LLM calls** — every finding is reproducible and CI-safe. This is
the working seed for the [`naw analyze`](../../ROADMAP.md) phase.

## Checks

| Rule                     | Level   | What it catches                                                        |
| ------------------------ | ------- | --------------------------------------------------------------------- |
| `controller-data-access` | error   | Prisma/HTTP/`fetch` calls inside a controller handler                 |
| `fat-controller-method`  | warning | Handlers with too many statements (should delegate to a service)      |
| `body-not-dto`           | error   | `@Body()` typed as a primitive/`any`                                  |
| `body-is-interface`      | error   | `@Body()` typed as an interface (not validatable at runtime)          |
| `dto-no-validation`      | warning | DTO class with no `class-validator` decorators                        |
| `circular-dependency`    | error   | Import cycles between source files                                     |

These map directly to the standards in
[`docs/standards`](../../docs/standards/) (controllers, dtos-and-validation, modules).

## Usage

```bash
npm install                          # installs ts-morph
node bin/analyze.mjs ./src           # analyze a project's src
node bin/analyze.mjs ./src --sarif report.sarif   # + SARIF for GitHub code scanning
node bin/analyze.mjs ./src --json    # machine-readable output
node bin/analyze.mjs ./src --max-warnings 0        # strict CI mode
```

Exit code is non-zero on any `error` (or warnings over `--max-warnings`), so it drops
straight into CI.

## Try it on the fixtures

```bash
npm test        # runs the analyzer against fixtures/ and asserts issues are found
node bin/analyze.mjs fixtures
```

The `fixtures/` project contains one deliberate violation per rule.

## Scope (honest limits)

This is a **spike**, not the finished analyzer. The score is a transparent, fixed-weight
heuristic (error −6, warning −3), not a benchmarked metric. The check set is intentionally
small; it grows from real-user findings per the roadmap. Deterministic structural checks
live here; AI-assisted suggestions are a later, separate layer that never gates CI.
