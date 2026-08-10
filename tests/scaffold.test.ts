import { describe, it, expect, afterEach } from "vitest";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { scaffold } from "../scripts/lib/scaffold.js";

const ROOT = resolve(import.meta.dirname, "..");
const PLUGINS_DIR = resolve(ROOT, "plugins");
const SKILLS_DIR = resolve(ROOT, "skills");
const AGENTS_DIR = resolve(ROOT, "agents");

const createdPaths: string[] = [];

function trackCleanup(p: string): void {
  createdPaths.push(p);
}

afterEach(() => {
  for (const p of createdPaths) {
    if (existsSync(p)) {
      rmSync(p, { recursive: true, force: true });
    }
  }
  createdPaths.length = 0;
});

describe("scaffold CLI — plugin creation", () => {
  it("creates correct directory structure for a plugin", () => {
    const name = "test-plugin-struct";
    const dir = resolve(PLUGINS_DIR, name);
    trackCleanup(dir);

    scaffold({ name, description: "A test plugin", type: "plugin" }, ROOT);

    expect(existsSync(dir)).toBe(true);
    expect(existsSync(resolve(dir, ".claude-plugin", "plugin.json"))).toBe(true);
    expect(existsSync(resolve(dir, "skills", name, "SKILL.md"))).toBe(true);
    expect(existsSync(resolve(dir, "README.md"))).toBe(true);
  });

  it("writes correct plugin.json with name, description, and version", () => {
    const name = "test-plugin-json";
    const desc = "Plugin JSON test description";
    const dir = resolve(PLUGINS_DIR, name);
    trackCleanup(dir);

    scaffold({ name, description: desc, type: "plugin" }, ROOT);

    const pluginJson = JSON.parse(
      readFileSync(resolve(dir, ".claude-plugin", "plugin.json"), "utf-8"),
    );
    expect(pluginJson.name).toBe(name);
    expect(pluginJson.description).toBe(desc);
    expect(pluginJson.version).toBe("1.0.0");
  });

  it("writes correct SKILL.md frontmatter with name and description", () => {
    const name = "test-plugin-skill";
    const desc = "Skill frontmatter test";
    const dir = resolve(PLUGINS_DIR, name);
    trackCleanup(dir);

    scaffold({ name, description: desc, type: "plugin" }, ROOT);

    const skillMd = readFileSync(resolve(dir, "skills", name, "SKILL.md"), "utf-8");
    expect(skillMd).toMatch(new RegExp(`^name: ${name}$`, "m"));
    expect(skillMd).toContain(desc);
  });

  it("updates README.md with plugin name and description", () => {
    const name = "test-plugin-readme";
    const desc = "README update test";
    const dir = resolve(PLUGINS_DIR, name);
    trackCleanup(dir);

    scaffold({ name, description: desc, type: "plugin" }, ROOT);

    const readme = readFileSync(resolve(dir, "README.md"), "utf-8");
    expect(readme).toMatch(new RegExp(`^# ${name}$`, "m"));
    expect(readme).toContain(desc);
    expect(readme).toContain(`plugins/${name}`);
    expect(readme).not.toContain("plugins/plugin-name");
  });
});

describe("scaffold CLI — skill creation", () => {
  it("creates SKILL.md with correct frontmatter name and description", () => {
    const name = "test-skill-basic";
    const desc = "A standalone test skill";
    const dir = resolve(SKILLS_DIR, name);
    trackCleanup(dir);

    scaffold({ name, description: desc, type: "skill" }, ROOT);

    expect(existsSync(dir)).toBe(true);
    const skillMd = readFileSync(resolve(dir, "SKILL.md"), "utf-8");
    expect(skillMd).toMatch(new RegExp(`^name: ${name}$`, "m"));
    expect(skillMd).toContain(desc);
    expect(skillMd).not.toContain("skill-name");
  });
});

describe("scaffold CLI — agent creation", () => {
  it("creates shared agent markdown with correct frontmatter", () => {
    const name = "test-agent-basic";
    const desc = "A shared test agent";
    const file = resolve(AGENTS_DIR, `${name}.md`);
    trackCleanup(file);

    scaffold({ name, description: desc, type: "agent" }, ROOT);

    expect(existsSync(file)).toBe(true);
    const agentMd = readFileSync(file, "utf-8");
    expect(agentMd).toMatch(new RegExp(`^name: ${name}$`, "m"));
    expect(agentMd).toContain(desc);
    expect(agentMd).not.toContain("agent-name");
  });
});

describe("scaffold CLI — error handling", () => {
  it("fails with non-zero exit code for duplicate plugin name", () => {
    const name = "test-dup-plugin";
    const dir = resolve(PLUGINS_DIR, name);
    trackCleanup(dir);

    scaffold({ name, description: "first", type: "plugin" }, ROOT);
    expect(() => scaffold({ name, description: "second", type: "plugin" }, ROOT)).toThrow();
  });

  it("fails with non-zero exit code for duplicate skill name", () => {
    const name = "test-dup-skill";
    const dir = resolve(SKILLS_DIR, name);
    trackCleanup(dir);

    scaffold({ name, description: "first", type: "skill" }, ROOT);
    expect(() => scaffold({ name, description: "second", type: "skill" }, ROOT)).toThrow();
  });

  it("fails with non-zero exit code for duplicate agent name", () => {
    const name = "test-dup-agent";
    const file = resolve(AGENTS_DIR, `${name}.md`);
    trackCleanup(file);

    scaffold({ name, description: "first", type: "agent" }, ROOT);
    expect(() => scaffold({ name, description: "second", type: "agent" }, ROOT)).toThrow();
  });

  it("fails with non-zero exit code for uppercase name", () => {
    expect(() =>
      scaffold({ name: "MyPlugin", description: "bad name", type: "plugin" }, ROOT),
    ).toThrow();
  });

  it("fails with non-zero exit code for name with spaces", () => {
    expect(() =>
      scaffold({ name: "my plugin", description: "bad name", type: "plugin" }, ROOT),
    ).toThrow();
  });

  it("fails with non-zero exit code for path traversal in name", () => {
    expect(() =>
      scaffold({ name: "../../../tmp/pwned", description: "path traversal", type: "plugin" }, ROOT),
    ).toThrow("Invalid name");
  });

  it("fails with non-zero exit code for path traversal in name (variant)", () => {
    expect(() =>
      scaffold({ name: "../test", description: "path traversal", type: "plugin" }, ROOT),
    ).toThrow("Invalid name");
  });

  it("fails with non-zero exit code for description containing YAML separator", () => {
    expect(() =>
      scaffold({ name: "test-yaml-inj", description: "---", type: "plugin" }, ROOT),
    ).toThrow("must not contain YAML");
  });

  it("fails for description with YAML separator on its own line", () => {
    expect(() =>
      scaffold({ name: "test-yaml-inj2", description: "line1\n---\nline2", type: "plugin" }, ROOT),
    ).toThrow("must not contain YAML");
  });
});
