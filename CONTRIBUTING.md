# Contributing

Thanks for helping improve **nestjs-agent-workflow-kit**.

## What this repo is

A small CLI plus a body of Markdown: an `AGENTS.md` entrypoint, engineering
standards under `docs/standards/`, and agent skills under `.agents/skills/`.
The CLI (`bin/install.mjs`) copies those managed paths into a target project.
Most contributions are edits to the standards and skills.

## Local setup

```bash
git clone https://github.com/hamzaali81/nestjs-agent-workflow-kit.git
cd nestjs-agent-workflow-kit
node bin/install.mjs list          # inspect managed paths, standards, skills
node bin/install.mjs init /tmp/demo --force   # try an install
npm test                           # smoke test (installs into a temp dir, verifies)
```

No build step and no runtime dependencies — Node 18+ only.

## Making changes

- **Standards** (`docs/standards/*.md`): keep them concise and rule-oriented. Each
  standard owns its own audit guidance; cross-link rather than duplicating.
- **Skills** (`.agents/skills/*/SKILL.md`): keep the front-matter `name` and
  `description` accurate — the description is what triggers the skill. Put depth
  in `references/`.
- **New managed path**: add it to `manifest.json` `managedPaths` and to the
  `files` array in `package.json` so it ships on `npm publish`.
- **Relative links** between docs must resolve. Run the smoke test and, if you
  change images or links, verify them before opening a PR.

## Before opening a PR

```bash
node --check bin/install.mjs
npm test
```

CI runs the same checks on Node 18/20/22. Please keep PRs focused and describe
what standard or skill you changed and why.

## Versioning

Bump `version` in both `package.json` and `manifest.json` together (they are
kept in sync). Use semver.

## License

By contributing you agree your contributions are licensed under the MIT License.
