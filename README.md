# fCC AI Marketplace

Portable AI skills and agents for freeCodeCamp, plus Claude Code plugin bundles
for richer workflows.

## What This Repo Publishes

| Type    | Path                                                 | Portability                                                                       |
| ------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| Plugins | `plugins/<name>/`                                    | Claude Code-specific bundle with manifest, hooks, MCP config, and packaged skills |
| Skills  | `skills/<name>/` and `plugins/<name>/skills/<name>/` | Portable `SKILL.md` packages following the Agent Skills format                    |
| Agents  | `agents/*.md` and plugin-local `agents/*.md`         | Portable Markdown prompts with `name` and `description` frontmatter               |

Claude Code-specific behavior belongs in plugin manifests, hooks, MCP config, or
plugin docs. Canonical skills and agents stay tool-agnostic.

## Install

Install portable skills into any compatible tool:

```sh
npx skills add freeCodeCamp/fCC-AI-Marketplace
```

Install one skill:

```sh
npx skills add freeCodeCamp/fCC-AI-Marketplace --skill command-line-chic
```

Use a full Claude Code plugin:

```sh
claude --plugin-dir ./plugins/<plugin-name>
```

## Catalog

Marketplace directories are live indexes. Each item carries its own name and
description in canonical metadata, so adding an item does not require editing a
shared catalog.

| Type              | Browse                 | Canonical metadata                           |
| ----------------- | ---------------------- | -------------------------------------------- |
| Plugins           | [`plugins/`](plugins/) | `.claude-plugin/plugin.json` and `README.md` |
| Standalone skills | [`skills/`](skills/)   | `<skill>/SKILL.md`                           |
| Shared agents     | [`agents/`](agents/)   | `<agent>.md`                                 |

Plugin skills and agents live under their owning plugin in [`plugins/`](plugins/).

## Supported Tools

Skills follow the [Agent Skills](https://agentskills.io) standard. Agent files
are portable Markdown source; tool-specific loading may require an adapter.

| Tool                                | Skills | Shared Agent Source | Full Plugins |
| ----------------------------------- | ------ | ------------------- | ------------ |
| Claude Code                         | Yes    | Yes                 | Yes          |
| Codex CLI                           | Yes    | Markdown source     | No           |
| OpenCode                            | Yes    | Markdown source     | No           |
| VS Code / GitHub Copilot            | Yes    | Markdown source     | No           |
| Cursor                              | Yes    | Markdown source     | No           |
| Gemini CLI                          | Yes    | Markdown source     | No           |
| Other Agent Skills-compatible tools | Yes    | Markdown source     | No           |

## Develop

```sh
pnpm install
pnpm run validate
pnpm turbo check
```

Every plugin directory must include a README. Skills and agents self-document in
their canonical Markdown files.

See [CONTRIBUTING.md](CONTRIBUTING.md) for authoring rules and [AGENTS.md](AGENTS.md)
for agent-facing repository instructions.

## License

Copyright (c) freeCodeCamp. This project is licensed under the
[BSD 3-Clause License](https://opensource.org/licenses/BSD-3-Clause).
