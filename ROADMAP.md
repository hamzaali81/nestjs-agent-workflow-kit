# Roadmap

The kit starts **documentation-centric** (Markdown standards + skills copied into a
repo). The long-term direction is **runtime-centric**: an engine that understands a
NestJS project, selects the relevant standards automatically, analyzes architecture,
generates code, reviews changes, and exposes capabilities to any agent via MCP.

The guiding principle is **scope discipline**: ship the smallest thing that delivers
10x value, get real users, then expand. We deliberately do **not** scaffold a large
multi-package monorepo before the analyzer has users.

## Principles

- **Deterministic core, AI topping.** Structural checks (fat controllers, circular
  deps, missing validation, boundary violations) are AST-based — fast, free,
  reproducible, CI-safe. AI is reserved for fuzzy judgment (naming, "is this doing too
  much", refactor suggestions).
- **The moat is curated NestJS knowledge + stable checks**, not runtime plumbing.
  Models and agent protocols churn; a thin, well-curated layer survives that.
- **Lean packages.** Start with `core`, `analyzer`, `cli`, `mcp`. Standards and skills
  are *data*, not code. Define the plugin interface early; ship only 1–2 first-party
  plugins until it is proven.
- **Integrate, don't reinvent.** Emit **SARIF** so findings render in GitHub code
  scanning; reuse the TypeScript compiler API rather than parsing by hand.

## Phases

### v0.1 — Documentation kit (shipped)

`AGENTS.md` + `docs/standards/` + `.agents/skills/`, installed by the `naw` CLI.
Goal: get 20 real users and collect the actual pain on real repositories. The
analyzer cannot be designed well without their codebases.

### v0.2 — The wedge: `naw analyze` (deterministic)

Static AST analysis, **no AI**. Initial checks:

- Leaky / fat controllers (data access or heavy logic in `*.controller.ts`).
- Missing DTO validation (`@Body()` not a validated class-validator DTO).
- Circular dependencies (import cycles in `src/`).

Output: human-readable report **and** SARIF (`--sarif`) for CI / GitHub code scanning.
A transparent, defensible architecture score. A working spike lives in
[`packages/analyzer`](packages/analyzer). Expand the check set from real-user findings.

### v0.3 — Runtime wedge: context builder + MCP

- **Context builder:** detect framework, ORM, test runner, and versions; assemble the
  *minimal* relevant standards instead of dumping every Markdown file. Directly cuts
  token cost.
- **MCP server:** expose the project (modules, controllers, architecture, standards)
  so any agent can *query* ("list all modules", "show architecture") instead of
  ingesting Markdown.

### v0.4 — AI layer on the analyzer

AI *suggestions* and fuzzy review on top of deterministic findings — with response
caching and a small **eval harness** so skill quality is measured, not assumed. AI
never gates CI; it advises.

### v0.5 — Generators + plugin API

- `naw generate crud <Name>` → module, service, repository, DTOs, Swagger, tests,
  Prisma, validation, pagination — all following the standards.
- Stable **plugin interface**; each plugin contributes standards, skills, templates,
  checks, generators without touching core. First-party: `prisma`, then `typeorm`.

### Later / maybe (needs a demonstrated reason)

Knowledge graph (Markdown + retrieval carries a long way first), telemetry (opt-in and
anonymized only, or it costs trust), and the broader plugin ecosystem
(drizzle, bullmq, kafka, redis, graphql, grpc, cloud) — **community-contributed after
the plugin API is battle-tested**, not first-party day one.

## Target package layout (introduce incrementally)

```
packages/
  core/       # AgentRuntime, context builder, standard/skill discovery
  analyzer/   # deterministic AST checks + SARIF   ← spike exists today
  cli/        # naw: init/update/list/doctor/analyze/generate
  mcp/        # MCP server exposing the project + knowledge
plugins/
  prisma/     # first-party reference plugin
```

Add a package only when a phase needs it. Four to start, not sixteen.

## If this becomes a product

The realistic model is **open-core**: analyzer and standards fully OSS; team dashboard
and hosted/CI features paid. Decide early — it shapes the package boundaries.
