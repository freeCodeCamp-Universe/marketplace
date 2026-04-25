# Marketplace

Public repository of modular plugins and skills for freeCodeCamp staff and maintainers.

## Repository Layout

- `plugins/` — Claude Code plugins (each with `.claude-plugin/plugin.json`, skills, hooks, agents, MCP config)
- `skills/` — Standalone portable skills (not plugin-bound)
- `agents/` — Shared portable agent definitions
- `templates/` — Scaffolding for new plugins and skills

## Plugin Conventions

Each plugin lives in `plugins/<name>/` and contains a `.claude-plugin/plugin.json` manifest. Skills inside plugins follow the Agent Skills standard: each skill is a `SKILL.md` file with `name` and `description` YAML frontmatter. Canonical agents are Markdown files with `name` and `description` YAML frontmatter; Claude hooks and MCP server configs are plugin-specific.

## Installation

- **Portable skills** (any compatible tool): `npx skills add freeCodeCamp/fCC-AI-Marketplace`
- **Full plugin** (Claude Code only): `claude --plugin-dir ./plugins/<name>`

## Cross-Tool Compatibility

SKILL.md files follow the Agent Skills standard (agentskills.io) and are portable across Claude Code, Codex CLI, OpenCode, and Gemini CLI. Shared agents use portable Markdown frontmatter and prompt bodies. Rich features — hooks, MCP servers, and Claude-specific agent permissions — are defined in plugin manifests or plugin docs.

## Toolchain

TypeScript-based toolchain using pnpm, vitest (tests), turbo (task orchestration), and oxlint (linting).

Key commands:

- `pnpm run validate` — check plugin and skill structural correctness
- `pnpm run scaffold` — interactively create new plugins or skills
- `pnpm run test` — run tests
- `pnpm run lint` — run linter
- `pnpm run format:check` — check formatting
- `pnpm turbo check` — full quality gate (validate + test + lint + format)

## Design Decisions

- Skills and agents are the units of portability; plugins are the unit of distribution for Claude Code
- Frontmatter (`name`, `description`) is the minimum contract for cross-tool discovery
- Plugin-level hooks run automatically (e.g., task validation on file write) and are not portable
- One plugin per workflow domain — avoid monolith plugins that bundle unrelated concerns
