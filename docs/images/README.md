# Diagram images

The README embeds three diagrams, shipped as **SVG** (crisp, versionable, no
external tooling needed):

- `kit-workflow-whiteboard.svg` — kit → `npx init/update` → your repo → agent.
- `app-layers-whiteboard.svg` — request flow: Transport → Domain → Data → Database, with cross-cutting guards/pipes/interceptors/filters.
- `app-folders-whiteboard.svg` — the `src/` folder layout.

Edit the `.svg` files directly to tweak them. If you ever want hand-drawn PNG
versions instead, generate them with any image model using the prompts below
(1600×1000 PNG, white background), save with the matching `*.png` name, and
switch the README embeds from `.svg` to `.png`.

Style: hand-drawn marker / whiteboard, dark ink on white, one accent color
(NestJS red `#E0234E`), clean labels, generous spacing.

---

## kit-workflow

> Hand-drawn whiteboard diagram, dark marker on white, one red accent. Title
> "nestjs-agent-workflow-kit". Horizontal flow of three stages with arrows:
> (1) box "THE KIT" with three notes "AGENTS.md", "docs/standards/",
> ".agents/skills/"; arrow "npx init / update" to (2) folder "Your NestJS repo"
> containing the same items plus a dashed note "AGENTS.local.md (yours)"; arrow
> "reads" to (3) a small robot labeled "Coding agent" with a bubble "follows the
> rules".

## app-layers

> Hand-drawn whiteboard diagram. Title "Request flow — layers". Vertical stack of
> four bands, downward "request" arrow left, upward "response" arrow right:
> "Transport — Controllers + DTOs", "Domain — Services", "Data / I-O —
> Repositories + PrismaService", and a cylinder "Database (Prisma)". Right side: a
> vertical bracket labeled "Cross-cutting: Guards · Pipes · Interceptors ·
> Exception filters".

## app-folders

> Hand-drawn whiteboard diagram. Title "src/ layout". File-tree sketch: src/ with
> common/, config/, modules/ (expanded users/ → module, controller, service,
> repository, dto/, *.spec.ts), prisma/, app.module.ts, main.ts. Red accent on the
> modules/ branch.
