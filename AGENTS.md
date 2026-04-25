# Marketplace Agent Instructions

Canonical spec for agents working in this repository. The user-facing `README.md` carries the install story and catalog; this file carries the rules an automated agent must follow.

## Purpose

Publish portable AI skills and agents for freeCodeCamp, plus per-tool plugin bundles (Claude Code today; Codex CLI, OpenCode, Gemini CLI, etc. as adapters land).

## Architecture Boundaries

- **`skills/<name>/SKILL.md`** and **`plugins/<name>/skills/<name>/SKILL.md`** — canonical Agent Skills packages. Tool-agnostic. Conform to [agentskills.io](https://agentskills.io).
- **`agents/*.md`** and plugin-local **`agents/*.md`** — canonical agent prompts: YAML frontmatter (`name`, `description`) + Markdown system prompt body. Tool-agnostic.
- **`plugins/<name>/plugin.yaml`** — portable plugin manifest. Lists bundled skills, agents, supported adapters.
- **`plugins/<name>/adapters/<tool>/`** — per-tool adapter (manifest, hooks, MCP config). Claude lives in `adapters/claude/`. Other tools land alongside.
- **`claude-native/<name>/`** — plugins that exist only as Claude bundles (hook-driven, no portable skills). Use this directory only when no portable counterpart is possible.
- Skill and agent files never depend on a specific tool runtime. If Claude-only behavior is required, document the impact in plugin docs and confine the wiring to `adapters/claude/` or `claude-native/`.

## Hard Contracts

- **`npx skills add freeCodeCamp/fCC-AI-Marketplace`** must keep working, including `--skill <name>`. Never move a `SKILL.md` out of `skills/<name>/` or `plugins/<name>/skills/<name>/` — those paths are part of the public discovery contract.
- **agentskills.io spec** is the authority on `SKILL.md` shape. Validators mirror that spec; do not invent extra required fields.
- **Frontmatter (`name`, `description`)** is the minimum cross-tool discovery contract. `name` matches the directory (skills) or filename (agents).

## Adapter Model

Each adapter is registered in `scripts/lib/adapters.ts` with:

- `id` — `claude`, `codex`, `opencode`, `gemini`, …
- `manifestPath` — relative to plugin dir (e.g. `.claude-plugin/plugin.json`)
- `manifestKind` — `json | yaml | toml`
- `requiredFields` — fields the manifest must carry
- Optional `hooksDir`, `mcpConfig`

Adding a new tool means adding one entry to `ADAPTERS`, a folder under `templates/adapter/<id>/`, and (optionally) per-tool fixtures in tests. No core code changes.

## Index Maintenance

- The catalog in `README.md` is generated from disk by `pnpm run catalog`. Never hand-edit the block between `<!-- catalog:start -->` and `<!-- catalog:end -->`.
- After adding, renaming, moving, deprecating, or removing a plugin, skill, or agent, run `pnpm run catalog`. CI runs `pnpm run catalog --check` and fails on drift.
- Status labels: `Active`, `Reference`, `Deprecated`, `Experimental`.
- Per-plugin `plugins/<name>/README.md` stays the human-authored reference for that plugin and must match its `plugin.yaml`.

## Self-Development

- Reuse helpers in `scripts/lib/` (metadata, adapters, schema, catalog). Extend them when frontmatter or adapter rules change; do not duplicate logic in scripts.
- When changing a format rule, update the schema, the validator, the scaffolder, the templates, and the contributor docs in the same change.
- Keep templates minimal and portable. Tool-specific examples belong only in `templates/adapter/<id>/` or in plugin docs.
- Prefer small focused reference files over very large `SKILL.md` bodies.

## Validation

- `pnpm run validate` — structural correctness (manifests, adapters, frontmatter, names).
- `pnpm run catalog --check` — README catalog matches disk.
- `pnpm test` — unit tests for validator, scaffolder, catalog, schema.
- `pnpm turbo check` — full gate (validate + test + lint + format).
- If dependencies are missing, state that clearly rather than skipping.

## Design Decisions

- Skills and agents are the units of portability; plugins are the unit of distribution per tool.
- One plugin per workflow domain. Avoid monolith plugins.
- Plugin-level hooks and MCP configs are not portable — they belong to a single adapter.
- Catalog is generated, not hand-maintained.
