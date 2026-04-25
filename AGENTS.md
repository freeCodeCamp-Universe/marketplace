# Marketplace Agent Instructions

## Purpose

This repository publishes portable AI skills and agents for freeCodeCamp, plus
Claude Code-specific plugin bundles.

## Architecture Boundaries

- Treat `skills/` and every `SKILL.md` under `plugins/*/skills/` as canonical
  Agent Skills packages.
- Treat `agents/*.md` and plugin-local `agents/*.md` files as canonical agent
  prompts: YAML frontmatter with `name` and `description`, followed by Markdown
  instructions.
- Keep Claude Code-only behavior in `plugins/*/.claude-plugin/`, `hooks/`,
  `.mcp.json`, or plugin adapter docs.
- Keep portable skills and canonical agents tool-agnostic; if a Claude-only
  assumption is necessary, document the portability impact in plugin docs.

## Marketplace Index

### Plugins

| Name               | Path                          | Status |
| ------------------ | ----------------------------- | ------ |
| spanish-curriculum | `plugins/spanish-curriculum/` | Active |

### Standalone Skills

| Name                 | Path                           | Status    |
| -------------------- | ------------------------------ | --------- |
| command-line-chic    | `skills/command-line-chic/`    | Active    |
| hello-world          | `skills/hello-world/`          | Reference |
| sync-issue-templates | `skills/sync-issue-templates/` | Active    |

### Plugin Skills

| Name       | Plugin             | Path                                            | Status |
| ---------- | ------------------ | ----------------------------------------------- | ------ |
| carmen     | spanish-curriculum | `plugins/spanish-curriculum/skills/carmen/`     | Active |
| curriculum | spanish-curriculum | `plugins/spanish-curriculum/skills/curriculum/` | Active |
| marcos     | spanish-curriculum | `plugins/spanish-curriculum/skills/marcos/`     | Active |

### Shared Agents

| Name        | Path                    | Status    |
| ----------- | ----------------------- | --------- |
| hello-world | `agents/hello-world.md` | Reference |

### Plugin-Local Agents

| Name              | Owner  | Path                                                                   |
| ----------------- | ------ | ---------------------------------------------------------------------- |
| coherence-checker | carmen | `plugins/spanish-curriculum/skills/carmen/agents/coherence-checker.md` |
| learn-planner     | carmen | `plugins/spanish-curriculum/skills/carmen/agents/learn-planner.md`     |
| pcic-researcher   | carmen | `plugins/spanish-curriculum/skills/carmen/agents/pcic-researcher.md`   |
| practice-planner  | carmen | `plugins/spanish-curriculum/skills/carmen/agents/practice-planner.md`  |
| sheet-writer      | carmen | `plugins/spanish-curriculum/skills/carmen/agents/sheet-writer.md`      |
| warmup-planner    | carmen | `plugins/spanish-curriculum/skills/carmen/agents/warmup-planner.md`    |

## Index Maintenance Rules

- Update the Marketplace Index in this file whenever adding, renaming, moving,
  deprecating, or removing a plugin, skill, or agent.
- Keep the root `README.md` catalog aligned with this index. The root README is
  user-facing; this file is agent-facing.
- Keep each plugin README aligned with its manifest and bundled skills:
  `plugins/<name>/README.md`.
- Use `SKILL.md` and agent Markdown files as canonical item docs; reserve README
  files for the root catalog and plugin-level documentation.
- Status labels should be one of: `Active`, `Reference`, `Deprecated`, or
  `Experimental`.
- Run `pnpm run validate` after index or README changes.

## Self-Development Rules

- Reuse shared helpers in `scripts/lib/` for metadata parsing, naming rules,
  validation, and scaffolding; add shared helper coverage when frontmatter logic
  changes.
- When changing a format rule, update validator tests, scaffolding tests,
  templates, and contributor docs in the same change.
- Keep templates minimal and portable. Add tool-specific examples only in plugin
  templates or plugin docs.
- Prefer small, focused reference files over very large `SKILL.md` bodies.
- Keep root catalogs and docs aligned with actual frontmatter and manifests.

## Validation

- Run `pnpm run validate` for metadata, structure, and portability changes.
- Run focused tests for changed scripts, then `pnpm turbo check` before PRs when
  dependencies are installed.
- If validation cannot run because dependencies are missing, state that clearly.
