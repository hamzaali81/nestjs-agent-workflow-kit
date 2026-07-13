# Nest CLI

Use the CLI to scaffold consistently.

```bash
npx @nestjs/cli new my-app          # new project
nest generate resource users        # module + controller + service + DTOs + tests (CRUD)
nest generate module users
nest generate controller users
nest generate service users
nest generate guard auth
nest generate interceptor logging
nest generate filter all-exceptions
nest generate pipe parse-object-id
nest generate decorator current-user
```

Short alias: `nest g <schematic> <name>`.

## Useful flags

- `--flat` — do not create a subfolder.
- `--no-spec` — skip test files (avoid; prefer generating tests).
- `--dry-run` — preview without writing.
- `-p <project>` — target a specific project in a monorepo.

## Build and run

```bash
nest build
nest start --watch      # dev
npm run start:prod
```

Prefer `nest generate resource` for new CRUD features—it produces the standard module/controller/service/DTO/test layout that matches `docs/standards/architecture.md`.
