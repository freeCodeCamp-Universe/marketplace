# Marketplace

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

### Plugins

| Plugin                                            | Description                                                        | Skills                     | Status |
| ------------------------------------------------- | ------------------------------------------------------------------ | -------------------------- | ------ |
| [spanish-curriculum](plugins/spanish-curriculum/) | Professional Spanish curriculum pipeline across CEFR levels A1-C2. | carmen, curriculum, marcos | Active |

### Standalone Skills

| Skill                                                | Description                                                              | Status    |
| ---------------------------------------------------- | ------------------------------------------------------------------------ | --------- |
| [command-line-chic](skills/command-line-chic/)       | freeCodeCamp UI design system and aesthetic guidelines.                  | Active    |
| [hello-world](skills/hello-world/)                   | Reference skill demonstrating the marketplace skill format.              | Reference |
| [sync-issue-templates](skills/sync-issue-templates/) | Sync GitHub issue templates from an organization's `.github` repository. | Active    |

### Plugin Skills

| Skill                                                       | Plugin             | Description                                                          | Status |
| ----------------------------------------------------------- | ------------------ | -------------------------------------------------------------------- | ------ |
| [carmen](plugins/spanish-curriculum/skills/carmen/)         | spanish-curriculum | Research, plan, and refine Spanish curriculum modules.               | Active |
| [curriculum](plugins/spanish-curriculum/skills/curriculum/) | spanish-curriculum | Coordinate the Carmen to Marcos planning and task creation workflow. | Active |
| [marcos](plugins/spanish-curriculum/skills/marcos/)         | spanish-curriculum | Generate task files from planned Spanish curriculum modules.         | Active |

### Shared Agents

| Agent                                | Description                                                         | Status    |
| ------------------------------------ | ------------------------------------------------------------------- | --------- |
| [hello-world](agents/hello-world.md) | Reference agent demonstrating the portable agent definition format. | Reference |

Plugin-local agents are indexed in [AGENTS.md](AGENTS.md) and referenced from
their owning skill.

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
