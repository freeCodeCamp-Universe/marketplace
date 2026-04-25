# Claude Code Notes

This repo is **tool-agnostic**. See [`AGENTS.md`](AGENTS.md) for the canonical spec — architecture, conventions, validation rules, adapter model.

## Claude-specific bias

- Claude-only manifest, hooks, and MCP config live under `plugins/<name>/adapters/claude/` (or `claude-native/<name>/` if a plugin has no portable counterpart).
- Install a full plugin: `claude --plugin-dir ./plugins/<name>`.
- Portable skills install everywhere via `npx skills add freeCodeCamp/fCC-AI-Marketplace` — never break that contract.

Everything else (skills, agents, validation, scaffolding) is portable. Do not add Claude-specific assumptions outside `adapters/claude/` or `claude-native/`.
