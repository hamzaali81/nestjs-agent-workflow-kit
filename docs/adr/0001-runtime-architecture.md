# 1. Move from a documentation kit toward a runtime, deterministically and incrementally

- Status: Accepted
- Date: 2026-07-14
- Deciders: Hamza Ali

## Context

v0.1 ships Markdown standards and skills copied into a repo by a CLI. It solves a real
problem — keeping AI coding agents consistent across repositories — but its value is
capped at "a collection of AI instructions for NestJS."

The proposed evolution is runtime-centric: an engine that understands a NestJS project,
selects relevant standards, analyzes architecture, generates code, and exposes
capabilities via MCP and plugins. The ambitious version of that vision is a 16-package
monorepo (core, runtime, context, skills, knowledge, cli, plugins, telemetry, cache,
mcp, evaluation, …) plus a large plugin matrix.

The risk is not that the vision is wrong; it is that building it all up front — before
the analyzer has users — spends effort on plumbing (cache, telemetry, plugin lifecycle)
instead of value, and creates large maintenance surface with no validation.

## Decision

1. **Adopt the runtime-centric direction**, but introduce it **incrementally** per the
   [ROADMAP](../../ROADMAP.md). Add a package only when a phase needs it. Start with
   four: `core`, `analyzer`, `cli`, `mcp`. Standards and skills remain **data**, not
   code.
2. **Deterministic core, AI topping.** Structural checks are implemented with the
   TypeScript compiler API (via `ts-morph`) and graph analysis — not LLM calls. AI is
   layered on later for fuzzy judgment and suggestions, is cached, and never gates CI.
3. **The first runtime deliverable is `naw analyze`** (v0.2): deterministic checks with
   SARIF output, so it integrates with GitHub code scanning from day one.
4. **Define the plugin interface early, ship few plugins.** One or two first-party
   plugins (`prisma`, then `typeorm`) prove the API before inviting an ecosystem.

## Consequences

**Positive**

- Every release is shippable and useful on its own; no big-bang.
- Deterministic checks are fast, free, reproducible, and CI-safe — no per-run LLM cost
  or flakiness.
- SARIF gives immediate ecosystem integration without building a UI.
- The durable moat (curated NestJS knowledge + stable checks) is decoupled from
  fast-churning model/agent-protocol details, which are pushed to thin edges.

**Negative / costs**

- Slower to reach the full "platform" narrative than scaffolding everything at once.
- A heuristic architecture score must be kept transparent and stable, or it erodes
  trust — scores are a marketing surface, not a substitute for real checks.
- Deferring telemetry means less usage data early (accepted: OSS telemetry must be
  opt-in and anonymized or it costs trust).

## Alternatives considered

- **Full 16-package monorepo now.** Rejected: maintenance surface and plumbing cost with
  no user validation; classic over-engineering before product-market fit.
- **AI-first analyzer ("AI-powered ESLint").** Rejected as the *core*: nondeterministic,
  costly per run, and flaky in CI. AI is valuable as a layer on top of deterministic
  findings, not underneath them.
- **Knowledge graph as the knowledge store now.** Deferred: Markdown plus retrieval is
  sufficient for a long time; a graph DB is premature infrastructure.
