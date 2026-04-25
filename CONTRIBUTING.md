# Contributing

Spec, conventions, and validation rules live in [`AGENTS.md`](AGENTS.md). This file is the author quickstart.

## Prerequisites

- Node.js >= 22
- pnpm

```sh
pnpm install
```

Common commands are documented in `AGENTS.md` and `package.json`. Run `pnpm turbo check` before opening a PR.

## Add a Skill

```sh
pnpm run scaffold
```

Pick **skill**. The scaffolder writes a portable `SKILL.md` to `skills/<name>/SKILL.md`. Edit the frontmatter (`name` must match the directory) and body. Run `pnpm run validate`, then `pnpm run catalog`, then open a PR.

Manual alternative:

```sh
cp -r templates/skill/ skills/<your-skill-name>/
```

## Add a Shared Agent

```sh
pnpm run scaffold
```

Pick **agent**. The scaffolder writes `agents/<name>.md` with `name` matching the filename. Edit, validate, regenerate the catalog, PR.

Manual alternative:

```sh
cp templates/agent.md agents/<your-agent-name>.md
```

## Add a Plugin

```sh
pnpm run scaffold
```

Pick **plugin**. The scaffolder asks which adapters to target (`claude`, `codex`, `opencode`, `gemini`, or none). It writes:

- `plugins/<name>/plugin.yaml` — portable manifest
- `plugins/<name>/skills/example/SKILL.md` — seed skill
- `plugins/<name>/README.md`
- `plugins/<name>/adapters/<tool>/…` for each chosen adapter

Claude-only plugins (no portable skills, hook-driven) scaffold under `claude-native/<name>/`.

Edit the manifest, document the plugin in its README, validate, regenerate the catalog, PR.

## Skill and Agent Format

`SKILL.md` follows the [agentskills.io](https://agentskills.io) standard. The minimum frontmatter is `name` and `description`; optional fields include `license`, `compatibility`, `metadata`, and `allowed-tools`. See `templates/skill/SKILL.md` for the canonical starting point and `skills/hello-world/SKILL.md` for a worked example.

Agent files use the same frontmatter contract: `name` (matching filename) + `description`. The Markdown body is the reusable system prompt. See `templates/agent.md` and `agents/hello-world.md`.

## PR Guidelines

- One plugin, skill, or agent per PR. Split unrelated changes.
- Descriptive title (e.g. "Add code-review plugin", "Add lint-fix skill").
- `pnpm turbo check` must pass.
- Run `pnpm run catalog` so the README catalog block matches disk. CI fails if it drifts.
- Include a brief description of the change and how to use it.
