# Diagram images

The README embeds three whiteboard-style diagrams. Generate them with any
image model (attach the prompt below, ask for a **1600×1000 PNG, transparent or
white background**), then save each with the exact filename shown.

Keep a consistent look across all three: hand-drawn marker / whiteboard style,
dark ink on white, a single accent color (NestJS red `#E0234E`), clean sans-serif
labels, generous spacing, no photorealism, no logos you don't have rights to.

---

## 1. `kit-workflow-whiteboard.png`

> Hand-drawn whiteboard diagram, dark marker on white, one red accent color.
> Title at top: "nestjs-agent-workflow-kit". Show a horizontal flow of three
> stages connected by arrows: (1) a box labeled "KIT" containing three stacked
> sticky notes "AGENTS.md", "docs/standards/", ".agents/skills/"; arrow labeled
> "npx init / update" pointing to (2) a folder icon labeled "Your NestJS repo"
> that now contains the same three items plus a separate note "AGENTS.local.md
> (yours)"; arrow labeled "reads" pointing to (3) a small robot / agent icon
> labeled "Coding agent" with a speech bubble "follows the rules". Loose,
> sketchy, evenly spaced, clean handwritten labels.

## 2. `app-layers-whiteboard.png`

> Hand-drawn whiteboard diagram, dark marker on white, one red accent color.
> Title: "Request flow — layers". Show a vertical stack of four labeled bands
> with a downward "request" arrow on the left and an upward "response" arrow on
> the right: top band "Transport — Controllers + DTOs (validate, delegate,
> shape response)"; next "Domain — Services (business rules, orchestration)";
> next "Data / I-O — Repositories + PrismaService, HTTP clients"; bottom band a
> cylinder labeled "Database (Prisma)". To the right, a vertical bracket
> spanning all bands labeled "Cross-cutting: Guards · Pipes · Interceptors ·
> Exception filters". Sketchy, tidy, readable handwriting.

## 3. `app-folders-whiteboard.png`

> Hand-drawn whiteboard diagram, dark marker on white, one red accent color.
> Title: "src/ layout". Draw a file-tree sketch of a NestJS project:
> "src/" with children "common/ (guards, interceptors, filters, pipes,
> decorators)", "config/ (ConfigModule, env schema)", "modules/" expanded to
> show "users/ → users.module.ts, users.controller.ts, users.service.ts, dto/,
> users.repository.ts, *.spec.ts", "prisma/ (PrismaModule, PrismaService,
> schema.prisma)", "main.ts", "app.module.ts". Indentation shown with hand-drawn
> tree lines. Neat handwritten monospace-ish labels, one red accent on the
> "modules/" branch.
