# fCC AI Marketplace

A public marketplace of AI-powered plugins, skills, and agents for freeCodeCamp.

## Introduction

The fCC AI Marketplace is a public collection of AI-powered tooling for freeCodeCamp staff and maintainers. It provides modular plugins, skills, and agents that work with Claude Code as the primary platform, and with other AI coding tools (Codex CLI, OpenCode, Gemini CLI) via the [Agent Skills](https://agentskills.io) standard.

## Installation

### Quick Install (All Tools)

Install portable skills to your preferred AI coding tool:

```sh
npx skills add freeCodeCamp/fCC-AI-Marketplace
```

### Claude Code Full Plugin

For the complete experience including hooks, MCP servers, and agents:

```sh
claude --plugin-dir ./plugins/<plugin-name>
```

## Catalog: Plugins

| Plugin                                            | Description                                                                               | Skills                     | Status |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------- | ------ |
| [spanish-curriculum](plugins/spanish-curriculum/) | Professional Spanish curriculum pipeline — Carmen, Marcos, Curriculum. CEFR levels A1-C2. | carmen, marcos, curriculum | Active |

## Catalog: Skills

| Skill                                                | Description                                                                                           | Status    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------- |
| [hello-world](skills/hello-world/)                   | Reference skill demonstrating every SKILL.md section and pattern. Use as a template and test fixture. | Reference |
| [command-line-chic](skills/command-line-chic/)       | freeCodeCamp's "Command-line Chic" UI design system and aesthetic guidelines.                         | Active    |
| [sync-issue-templates](skills/sync-issue-templates/) | Sync GitHub issue templates from an org's .github repo into the current repository.                   | Active    |

## Catalog: Agents

| Agent                                | Description                                                | Status    |
| ------------------------------------ | ---------------------------------------------------------- | --------- |
| [hello-world](agents/hello-world.md) | Reference agent demonstrating the agent definition format. | Reference |

## Supported Tools

| Tool        | Skills | Full Plugins |
| ----------- | ------ | ------------ |
| Claude Code | Yes    | Yes          |
| Codex CLI   | Yes    | No           |
| OpenCode    | Yes    | No           |
| Gemini CLI  | Yes    | No           |

## Development

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
| `pnpm run scaffold`     | Interactively create a new plugin or skill          |
| `pnpm turbo check`      | Full quality gate (validate + test + lint + format) |

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on creating plugins, skills, and agents, including naming rules, the SKILL.md format, plugin structure, and PR expectations. Run `pnpm turbo check` before submitting a pull request.

## License

Copyright (c) freeCodeCamp. This project is licensed under the [BSD 3-Clause License](https://opensource.org/licenses/BSD-3-Clause).
