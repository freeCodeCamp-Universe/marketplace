# Claude Code adapter

This directory holds the Claude Code-specific bundle for the parent plugin:

- `.claude-plugin/plugin.json` — Claude plugin manifest
- `hooks/` — optional Claude Code hooks (PreToolUse, PostToolUse, etc.)
- `.mcp.json` — optional MCP server configuration

Install:

```sh
claude --plugin-dir ./adapters/claude
```

Add a hook by creating `hooks/hooks.json` and referencing it from `plugin.json`'s `"hooks"` field.
