# Contributing to Marketplace

## Overview

Key concepts:

- **Skill** — A portable `SKILL.md` file following the Agent Skills standard. Skills work across Claude Code, Codex CLI, OpenCode, Gemini CLI, and other compatible tools.
- **Plugin** — A Claude Code-specific bundle that wraps one or more portable skills or agents with hooks, MCP server configs, and Claude plugin metadata.
- **Agent** — A portable Markdown agent definition with YAML frontmatter (`name`, `description`) and a reusable system prompt body.

## Development Setup

### Prerequisites

- Node.js >= 22
- pnpm

### Setup

```sh
pnpm install
```

### Commands

| Command                 | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `pnpm run validate`     | Check plugin and skill structural correctness       |
| `pnpm run test`         | Run tests                                           |
| `pnpm run lint`         | Run linter                                          |
| `pnpm run format`       | Format code                                         |
| `pnpm run format:check` | Check formatting                                    |
| `pnpm run scaffold`     | Interactively create a new plugin, skill, or agent  |
| `pnpm turbo check`      | Full quality gate (validate + test + lint + format) |

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

3. Create skills in `skills/<skill-name>/` inside your plugin directory. Each skill needs `SKILL.md` with YAML frontmatter (`name`, `description`).

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

## Quick Start: Creating a Shared Agent

1. Create a new agent interactively:

```sh
pnpm run scaffold
```

Or copy the agent template manually:

```sh
cp templates/agent.md agents/<your-agent-name>.md
```

2. Edit `agents/<your-agent-name>.md` — update the frontmatter `name` (must match the filename without `.md`) and `description`, then write the Markdown body as the agent's system prompt.

3. Update the root `README.md` catalog and `AGENTS.md` Marketplace Index so the agent is discoverable.

4. Run validation:

```sh
pnpm run validate
```

5. Open a PR.

## Skill Naming Rules

- Lowercase letters, numbers, and hyphens only (e.g., `my-skill-name`)
- Must match the directory name: `skills/my-skill-name/SKILL.md` must have `name: my-skill-name`
- Be descriptive — the name is used as the slash command (e.g., `/my-skill-name`)
- Use lowercase letters, numbers, and single internal hyphens; start and end
  with a letter or number.

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

## Agent Format

Every shared agent is a Markdown file with YAML frontmatter and a Markdown body:

```yaml
---
name: my-agent
description: Reviews focused marketplace changes. Use when an agent definition is needed for reusable behavior.
---
```

Rules:

- `name` must match the filename without `.md`
- `description` explains when to delegate to the agent
- The Markdown body is the reusable system prompt
- Keep tool-specific fields out of canonical agents unless the portability impact is documented in plugin docs

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

Rich features — hooks, MCP servers, plugin manifests, and Claude-specific agent permissions — are defined at the plugin level. They are not portable.

When writing a skill, always write `SKILL.md` to the standard. When writing an agent, keep the canonical Markdown prompt tool-agnostic. Put adapter-specific behavior in plugin docs or Claude plugin metadata.

## Validation

Run `pnpm turbo check` before submitting a PR. This runs the full quality gate: validation, tests, linting, and formatting. CI runs the same check automatically on every pull request.

The validator (`pnpm run validate`) checks:

- `plugin.json` exists and has required fields (`name`, `description`, `version`)
- Every skill has a `SKILL.md` with valid `name` and `description` frontmatter
- Skill names match their parent directories and follow Agent Skills naming rules
- Every shared or plugin-local agent has valid `name` and `description` frontmatter
- Agent names match their filenames and follow the same portable naming rules
- Plugin directories contain a `README.md`

## PR Guidelines

- Keep one plugin, skill, or agent per PR; split unrelated changes into separate
  PRs.
- Use a descriptive PR title (e.g., "Add code-review plugin" or "Add lint-fix skill")
- Ensure `pnpm turbo check` passes before requesting review
- Update the root `README.md` catalog and `AGENTS.md` Marketplace Index when adding, moving, deprecating, or removing a plugin, skill, or agent
- Include a brief description of what the plugin, skill, or agent does and how to use it
