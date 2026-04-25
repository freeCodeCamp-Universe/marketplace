/**
 * Adapter registry — single source of truth for per-tool plugin layouts.
 *
 * Add a new tool by extending {@link ADAPTERS} and shipping a
 * `templates/adapter/<id>/` folder. Validators and scaffolding consume this map
 * directly so no other code needs to change.
 */

export type AdapterId = "claude" | "codex" | "opencode" | "gemini";

export interface AdapterSpec {
  /** Stable identifier used as the folder name under `adapters/`. */
  readonly id: AdapterId;
  /** Manifest path relative to the plugin directory. */
  readonly manifestPath: string;
  /** Manifest serialization format. */
  readonly manifestKind: "json" | "yaml" | "toml";
  /** Required top-level fields the manifest must declare. */
  readonly requiredFields: readonly string[];
  /** Optional path to the hooks directory (relative to the plugin dir). */
  readonly hooksDir?: string;
  /** Optional path to the MCP server config (relative to the plugin dir). */
  readonly mcpConfig?: string;
  /** Human label used in prompts and error messages. */
  readonly label: string;
}

export const ADAPTERS: Readonly<Record<AdapterId, AdapterSpec>> = {
  claude: {
    id: "claude",
    // Claude Code requires a `.claude-plugin/plugin.json` inside the plugin dir
    // it is given via `--plugin-dir`. Keep that nested layout so the runtime
    // can load `plugins/<name>/adapters/claude/` directly.
    manifestPath: "adapters/claude/.claude-plugin/plugin.json",
    manifestKind: "json",
    requiredFields: ["name", "description", "version"],
    hooksDir: "adapters/claude/hooks",
    mcpConfig: "adapters/claude/.mcp.json",
    label: "Claude Code",
  },
  codex: {
    id: "codex",
    manifestPath: "adapters/codex/manifest.json",
    manifestKind: "json",
    requiredFields: ["name", "description", "version"],
    label: "Codex CLI",
  },
  opencode: {
    id: "opencode",
    manifestPath: "adapters/opencode/manifest.json",
    manifestKind: "json",
    requiredFields: ["name", "description", "version"],
    label: "OpenCode",
  },
  gemini: {
    id: "gemini",
    manifestPath: "adapters/gemini/manifest.json",
    manifestKind: "json",
    requiredFields: ["name", "description", "version"],
    label: "Gemini CLI",
  },
};

export const ADAPTER_IDS: readonly AdapterId[] = Object.keys(ADAPTERS) as AdapterId[];

export function isAdapterId(value: string): value is AdapterId {
  return value in ADAPTERS;
}

/**
 * Layout for plugins that exist only as a single tool's bundle (no portable
 * counterpart). Currently only `claude-native/` is recognized.
 */
export interface NativeLayout {
  readonly dir: string;
  readonly adapterId: AdapterId;
  readonly manifestPath: string;
}

export const CLAUDE_NATIVE: NativeLayout = {
  dir: "claude-native",
  adapterId: "claude",
  // Claude-native plugins keep the historical `.claude-plugin/plugin.json` path
  // because that's what the Claude Code runtime expects when given a plugin dir.
  manifestPath: ".claude-plugin/plugin.json",
};
