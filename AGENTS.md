# fCC AI Marketplace Agent Instructions

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

## Discovery and Documentation Ownership

- Treat directory layout as marketplace index. Discover items from `plugins/`,
  `skills/`, `agents/`, and plugin-local `skills/` or `agents/` directories.
- Keep item metadata and documentation with its owner: plugin manifests and
  READMEs, skill `SKILL.md` files, and agent Markdown files.
- Scope registration-only changes to new item directory or file. Root `README.md`
  and this file contain stable navigation and conventions, not item inventories.
- Use plugin READMEs for plugin-level workflows, setup, and compatibility. Skill
  and agent directories provide complete plugin item inventories.
- Run `pnpm run validate` after marketplace structure or metadata changes.

## Self-Development Rules

- Reuse shared helpers in `scripts/lib/` for metadata parsing, naming rules,
  validation, and scaffolding; add shared helper coverage when frontmatter logic
  changes.
- When changing a format rule, update validator tests, scaffolding tests,
  templates, and contributor docs in the same change.
- Keep templates minimal and portable. Add tool-specific examples only in plugin
  templates or plugin docs.
- Prefer small, focused reference files over very large `SKILL.md` bodies.
- Keep canonical item docs aligned with actual frontmatter and manifests.

## Validation

- Run `pnpm run validate` for metadata, structure, and portability changes.
- Run focused tests for changed scripts, then `pnpm turbo check` before PRs when
  dependencies are installed.
- If validation cannot run because dependencies are missing, state that clearly.
