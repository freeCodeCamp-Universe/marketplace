# Contributing to fCC AI Marketplace

## Overview

Key concepts:

- **Skill** — A portable `SKILL.md` file following the Agent Skills standard. Skills work across Claude Code, Codex CLI, OpenCode, and Gemini CLI.
- **Plugin** — A Claude Code-specific bundle that wraps one or more skills with hooks, MCP server configs, and static agents.
- **Agent** — A shared agent definition (in `agents/`) that can be referenced by plugins or used standalone.

## Quick Start: Creating a Plugin

1. Create a new plugin interactively:

```sh
pnpm run scaffold
```

Or copy the plugin template manually:

```sh
cp -r templates/plugin/ plugins/<your-plugin-name>/
```

2. Edit `.claude-plugin/plugin.json` — set `name`, `description`, and `version`:

```json
{
  "name": "your-plugin-name",
  "description": "What this plugin does",
  "version": "1.0.0",
  "author": { "name": "freeCodeCamp" }
}
```

3. Create skills in `skills/<skill-name>/SKILL.md` inside your plugin directory. Each skill needs YAML frontmatter with `name` and `description`.

4. Update your plugin's `README.md` with a description, skill table, installation instructions, and usage examples. See `plugins/spanish-curriculum/README.md` for a complete example.

5. Run validation:

```sh
pnpm run validate
```

6. Open a PR.

## Quick Start: Creating a Standalone Skill

1. Create a new skill interactively:

```sh
pnpm run scaffold
```

Or copy the skill template manually:

```sh
cp -r templates/skill/ skills/<your-skill-name>/
```

2. Edit `skills/<your-skill-name>/SKILL.md` — update the frontmatter `name` (must be lowercase-with-hyphens) and `description`, then write the skill body.

3. Run validation:

```sh
pnpm run validate
```

4. Open a PR.

## Skill Naming Rules

- Lowercase letters, numbers, and hyphens only (e.g., `my-skill-name`)
- Must match the directory name: `skills/my-skill-name/SKILL.md` must have `name: my-skill-name`
- Be descriptive — the name is used as the slash command (e.g., `/my-skill-name`)
- No underscores, spaces, or uppercase letters

## SKILL.md Format

Every `SKILL.md` follows the Agent Skills standard. The file has two parts: YAML frontmatter and a Markdown body.

**Required frontmatter fields:**

- `name` — lowercase-with-hyphens identifier (used as the slash command)
- `description` — a short paragraph explaining what the skill does and when to invoke it

**Optional frontmatter fields:**

- `license` — SPDX license identifier
- `compatibility` — list of compatible tools
- `metadata` — arbitrary key-value pairs
- `allowed-tools` — list of tools the skill is permitted to use

**Example:**

```yaml
---
name: my-skill
description: >
  Short description of what this skill does. Invoke with /my-skill.
---
```

The Markdown body contains the skill instructions: persona, steps, output format, and constraints. See `skills/hello-world/SKILL.md` for a complete reference demonstrating every recommended section, or `templates/skill/SKILL.md` for a minimal starting template.

## Plugin Structure Reference

A valid Claude Code plugin requires the following structure:

```text
plugins/<plugin-name>/
  .claude-plugin/
    plugin.json          # Manifest with name, description, version
  skills/
    <skill-name>/
      SKILL.md           # At least one skill
  README.md              # Plugin documentation
```

Optional files:

```text
  hooks/
    hooks.json           # Hook definitions (Claude Code-specific)
  .mcp.json              # MCP server configuration
  agents/                # Static agent definitions
  setup/                 # Setup guides or scripts
```

See `plugins/spanish-curriculum/` for a complete real-world example.

## Cross-Tool Compatibility

`SKILL.md` files follow the Agent Skills standard (agentskills.io) and are portable across:

- Claude Code
- Codex CLI
- OpenCode
- Gemini CLI

Rich features — hooks, MCP servers, static agents — are Claude Code-specific and defined at the plugin level. They are not portable.

When writing a skill, always write `SKILL.md` to the standard. Keep skill instructions tool-agnostic so they work in any compatible environment.

## Validation

Run validation before submitting a PR:

```sh
pnpm run validate
```

This checks:

- `plugin.json` exists and has required fields (`name`, `description`, `version`)
- Every skill has a `SKILL.md` with `name` and `description` in frontmatter
- Standalone skill names follow the lowercase-with-hyphens convention
- Plugin directories contain a `README.md`

Run the full quality gate to also check tests, linting, and formatting:

```sh
pnpm turbo check
```

CI runs `pnpm turbo check` automatically on every pull request.

## PR Guidelines

- One plugin or skill per PR — do not bundle unrelated changes
- Use a descriptive PR title (e.g., "Add code-review plugin" or "Add lint-fix skill")
- Ensure `pnpm turbo check` passes before requesting review
- Update the root `README.md` catalog if applicable
- Include a brief description of what the plugin/skill does and how to use it
