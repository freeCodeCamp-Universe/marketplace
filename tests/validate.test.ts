import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync, cpSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";

const VALIDATE_SCRIPT = join(import.meta.dirname, "..", "scripts", "validate.ts");
const VALIDATE_LIB = join(import.meta.dirname, "..", "scripts", "lib");

let tempDir: string;

function setupTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "validate-test-"));
  const scriptsDir = join(dir, "scripts");
  mkdirSync(scriptsDir, { recursive: true });
  copyFileSync(VALIDATE_SCRIPT, join(scriptsDir, "validate.ts"));
  cpSync(VALIDATE_LIB, join(scriptsDir, "lib"), { recursive: true });
  return dir;
}

function runValidator(root: string): { stdout: string; exitCode: number } {
  try {
    const stdout = execSync("npx tsx validate.ts", {
      cwd: join(root, "scripts"),
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout, exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; status?: number };
    return { stdout: e.stdout ?? "", exitCode: e.status ?? 1 };
  }
}

const VALID_SKILL = (name: string, description = "A test skill"): string =>
  ["---", `name: ${name}`, `description: ${description}`, "---", "# Skill", "Body"].join("\n");

const VALID_AGENT = (name: string, description = "Reviews focused marketplace tasks"): string =>
  ["---", `name: ${name}`, `description: ${description}`, "---", "# Agent", "Body"].join("\n");

interface PluginOpts {
  manifest?: Record<string, unknown> | string | false;
  skills?: Record<string, string | false>;
  readme?: boolean;
  withClaudeAdapter?: boolean | { manifest?: Record<string, unknown> | false };
}

function createPortablePlugin(base: string, name: string, opts: PluginOpts = {}): void {
  const pluginDir = join(base, "plugins", name);
  mkdirSync(pluginDir, { recursive: true });

  if (opts.manifest !== false) {
    const manifest = opts.manifest ?? {
      name,
      description: "Test plugin",
      version: "1.0.0",
      skills: ["my-skill"],
      adapters: [],
    };
    const file = join(pluginDir, "plugin.json");
    writeFileSync(file, typeof manifest === "string" ? manifest : JSON.stringify(manifest));
  }

  const skills = opts.skills ?? { "my-skill": VALID_SKILL("my-skill") };
  if (Object.keys(skills).length > 0) {
    const skillsDir = join(pluginDir, "skills");
    mkdirSync(skillsDir, { recursive: true });
    for (const [skillName, content] of Object.entries(skills)) {
      const skillDir = join(skillsDir, skillName);
      mkdirSync(skillDir, { recursive: true });
      if (content !== false && content !== undefined) {
        writeFileSync(join(skillDir, "SKILL.md"), content);
      }
    }
  }

  if (opts.withClaudeAdapter) {
    const cpDir = join(pluginDir, "adapters", "claude", ".claude-plugin");
    mkdirSync(cpDir, { recursive: true });
    const adapterManifest =
      typeof opts.withClaudeAdapter === "object" && opts.withClaudeAdapter.manifest !== undefined
        ? opts.withClaudeAdapter.manifest
        : { name, description: "Claude adapter", version: "1.0.0" };
    if (adapterManifest !== false) {
      writeFileSync(join(cpDir, "plugin.json"), JSON.stringify(adapterManifest));
    }
  }

  if (opts.readme !== false) {
    writeFileSync(join(pluginDir, "README.md"), `# ${name}`);
  }
}

function createClaudeNativePlugin(
  base: string,
  name: string,
  opts: { manifest?: Record<string, unknown> | string | false; readme?: boolean } = {},
): void {
  const pluginDir = join(base, "claude-native", name);
  const cpDir = join(pluginDir, ".claude-plugin");
  mkdirSync(cpDir, { recursive: true });

  if (opts.manifest !== false) {
    const data = opts.manifest ?? { name, description: "Claude-only plugin", version: "1.0.0" };
    const out = typeof data === "string" ? data : JSON.stringify(data);
    writeFileSync(join(cpDir, "plugin.json"), out);
  }

  if (opts.readme !== false) {
    writeFileSync(join(pluginDir, "README.md"), `# ${name}`);
  }
}

function createStandaloneSkill(base: string, name: string, content: string | false): void {
  const skillDir = join(base, "skills", name);
  mkdirSync(skillDir, { recursive: true });
  if (content !== false) {
    writeFileSync(join(skillDir, "SKILL.md"), content);
  }
}

function createAgent(base: string, name: string, content: string | false): void {
  const agentsDir = join(base, "agents");
  mkdirSync(agentsDir, { recursive: true });
  if (content !== false) {
    writeFileSync(join(agentsDir, `${name}.md`), content);
  }
}

beforeEach(() => {
  tempDir = setupTempDir();
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("validate.ts", () => {
  describe("happy path", () => {
    it("portable plugin with one skill and no adapters passes", () => {
      createPortablePlugin(tempDir, "good-plugin");
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("PASS");
      expect(stdout).not.toContain("FAIL");
    });

    it("portable plugin with claude adapter passes when adapter manifest is present", () => {
      createPortablePlugin(tempDir, "with-claude", {
        manifest: {
          name: "with-claude",
          description: "Plugin with claude adapter",
          version: "1.0.0",
          skills: ["my-skill"],
          adapters: ["claude"],
        },
        withClaudeAdapter: true,
      });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("adapter:claude manifest exists");
      expect(stdout).not.toContain("FAIL");
    });

    it("claude-native plugin with manifest and README passes", () => {
      createClaudeNativePlugin(tempDir, "native-only");
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("[claude-native/native-only]");
      expect(stdout).not.toContain("FAIL");
    });

    it("standalone skill with valid frontmatter passes", () => {
      createStandaloneSkill(tempDir, "test-skill", VALID_SKILL("test-skill"));
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).not.toContain("FAIL");
    });

    it("shared agent with valid frontmatter passes", () => {
      createAgent(tempDir, "test-agent", VALID_AGENT("test-agent"));
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).not.toContain("FAIL");
    });
  });

  describe("portable plugin failures", () => {
    it("missing plugin.json fails", () => {
      createPortablePlugin(tempDir, "missing-manifest", { manifest: false });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("portable plugin.json does not exist");
    });

    it("invalid JSON fails", () => {
      createPortablePlugin(tempDir, "bad-json", { manifest: "{ not json }" });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("not valid JSON");
    });

    it("plugin.json name mismatch fails", () => {
      createPortablePlugin(tempDir, "name-mismatch", {
        manifest: {
          name: "other-name",
          description: "Mismatch",
          version: "1.0.0",
          skills: ["my-skill"],
        },
      });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("'name' must match directory");
    });

    it("declared adapter without manifest fails", () => {
      createPortablePlugin(tempDir, "missing-adapter", {
        manifest: {
          name: "missing-adapter",
          description: "Missing claude adapter",
          version: "1.0.0",
          skills: ["my-skill"],
          adapters: ["claude"],
        },
      });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("adapter:claude manifest missing");
    });

    it("unknown adapter id fails", () => {
      createPortablePlugin(tempDir, "bad-adapter", {
        manifest: {
          name: "bad-adapter",
          description: "Test",
          version: "1.0.0",
          skills: ["my-skill"],
          adapters: ["wat"],
        },
      });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("not a known adapter");
    });

    it("no skills and no agents fails", () => {
      createPortablePlugin(tempDir, "empty-plugin", {
        manifest: {
          name: "empty-plugin",
          description: "Nothing inside",
          version: "1.0.0",
          skills: [],
        },
        skills: {},
      });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("must declare at least one skill or agent");
    });

    it("missing README fails", () => {
      createPortablePlugin(tempDir, "no-readme", { readme: false });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("README.md does not exist");
    });
  });

  describe("skill failures", () => {
    it("standalone SKILL.md missing fails", () => {
      createStandaloneSkill(tempDir, "no-file", false);
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("SKILL.md does not exist");
    });

    it("name format invalid fails", () => {
      createStandaloneSkill(
        tempDir,
        "bad-name",
        ["---", "name: BadName!", "description: Test", "---", "# Skill", "Body"].join("\n"),
      );
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("must use lowercase letters");
    });

    it("name must match directory", () => {
      createStandaloneSkill(
        tempDir,
        "directory-name",
        ["---", "name: other-name", "description: Test", "---", "# Skill", "Body"].join("\n"),
      );
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("'name' must match directory");
    });

    it("missing description fails", () => {
      createStandaloneSkill(
        tempDir,
        "no-description",
        ["---", "name: no-description", "---", "# Skill", "Body"].join("\n"),
      );
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("missing 'description'");
    });
  });

  describe("agent failures", () => {
    it("agent without frontmatter fails", () => {
      createAgent(tempDir, "plain-agent", "# Plain Agent\nNo metadata.");
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("frontmatter must start with ---");
    });

    it("agent name must match filename", () => {
      createAgent(
        tempDir,
        "file-name",
        ["---", "name: other-name", "description: Test", "---", "# Agent", "Body"].join("\n"),
      );
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("'name' must match filename");
    });
  });

  describe("claude-native failures", () => {
    it("missing manifest fails", () => {
      createClaudeNativePlugin(tempDir, "broken-native", { manifest: false });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain(".claude-plugin/plugin.json does not exist");
    });

    it("manifest name mismatch fails", () => {
      createClaudeNativePlugin(tempDir, "wrong-name", {
        manifest: { name: "different", description: "Test", version: "1.0.0" },
      });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("'name' must match directory");
    });
  });

  describe("edge cases", () => {
    it("no content at all exits with code 1", () => {
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("No content found to validate");
    });

    it("YAML quoted name is stripped", () => {
      createStandaloneSkill(
        tempDir,
        "quoted-name",
        ["---", 'name: "quoted-name"', "description: Test", "---", "# Skill", "Body"].join("\n"),
      );
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).not.toContain("FAIL");
    });

    it("plugin with multiple skills validates all of them", () => {
      createPortablePlugin(tempDir, "multi-skill", {
        manifest: {
          name: "multi-skill",
          description: "Multi-skill plugin",
          version: "1.0.0",
          skills: ["skill-one", "skill-two"],
        },
        skills: {
          "skill-one": VALID_SKILL("skill-one", "First skill"),
          "skill-two": VALID_SKILL("skill-two", "Second skill"),
        },
      });
      const { stdout, exitCode } = runValidator(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("skill-one");
      expect(stdout).toContain("skill-two");
      expect(stdout).not.toContain("FAIL");
    });
  });
});
