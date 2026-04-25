import { describe, it, expect, afterEach } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PLUGINS_DIR = resolve(ROOT, "plugins");
const SKILLS_DIR = resolve(ROOT, "skills");
const AGENTS_DIR = resolve(ROOT, "agents");

const createdPaths: string[] = [];

function scaffold(flags: string): string {
  return execSync(`npx tsx scripts/scaffold.ts ${flags}`, {
    cwd: ROOT,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function scaffoldExpectFail(flags: string): { status: number; stderr: string } {
  try {
    execSync(`npx tsx scripts/scaffold.ts ${flags}`, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { status: 0, stderr: "" };
  } catch (err: unknown) {
    const e = err as { status: number; stderr: string };
    return { status: e.status, stderr: e.stderr };
  }
}

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
  it("creates portable directory structure for a plugin (no claude adapter by default)", () => {
    const name = "test-plugin-struct";
    const dir = resolve(PLUGINS_DIR, name);
    trackCleanup(dir);

    scaffold(`--name ${name} --description "A test plugin" --type plugin`);

    expect(existsSync(dir)).toBe(true);
    expect(existsSync(resolve(dir, "plugin.json"))).toBe(true);
    expect(existsSync(resolve(dir, "skills", name, "SKILL.md"))).toBe(true);
    expect(existsSync(resolve(dir, "README.md"))).toBe(true);
    expect(existsSync(resolve(dir, "adapters"))).toBe(false);
  });

  it("writes portable plugin.json with name, description, version, skills[], adapters[]", () => {
    const name = "test-plugin-json";
    const desc = "Plugin JSON test description";
    const dir = resolve(PLUGINS_DIR, name);
    trackCleanup(dir);

    scaffold(`--name ${name} --description "${desc}" --type plugin`);

    const pluginJson = JSON.parse(readFileSync(resolve(dir, "plugin.json"), "utf-8"));
    expect(pluginJson.name).toBe(name);
    expect(pluginJson.description).toBe(desc);
    expect(pluginJson.version).toBe("1.0.0");
    expect(pluginJson.skills).toEqual([name]);
    expect(pluginJson.adapters).toEqual([]);
  });

  it("emits the claude adapter when --adapters claude is passed", () => {
    const name = "test-plugin-claude";
    const dir = resolve(PLUGINS_DIR, name);
    trackCleanup(dir);

    scaffold(`--name ${name} --description "Claude adapter" --type plugin --adapters claude`);

    const pluginJson = JSON.parse(readFileSync(resolve(dir, "plugin.json"), "utf-8"));
    expect(pluginJson.adapters).toEqual(["claude"]);
    const adapterManifest = resolve(dir, "adapters", "claude", ".claude-plugin", "plugin.json");
    expect(existsSync(adapterManifest)).toBe(true);
    const data = JSON.parse(readFileSync(adapterManifest, "utf-8"));
    expect(data.name).toBe(name);
    expect(data.version).toBe("1.0.0");
  });

  it("writes correct SKILL.md frontmatter with name and description", () => {
    const name = "test-plugin-skill";
    const desc = "Skill frontmatter test";
    const dir = resolve(PLUGINS_DIR, name);
    trackCleanup(dir);

    scaffold(`--name ${name} --description "${desc}" --type plugin`);

    const skillMd = readFileSync(resolve(dir, "skills", name, "SKILL.md"), "utf-8");
    expect(skillMd).toMatch(new RegExp(`^name: ${name}$`, "m"));
    expect(skillMd).toContain(desc);
  });

  it("updates README.md with plugin name and description", () => {
    const name = "test-plugin-readme";
    const desc = "README update test";
    const dir = resolve(PLUGINS_DIR, name);
    trackCleanup(dir);

    scaffold(`--name ${name} --description "${desc}" --type plugin`);

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

    scaffold(`--name ${name} --description "${desc}" --type skill`);

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

    scaffold(`--name ${name} --description "${desc}" --type agent`);

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

    scaffold(`--name ${name} --description "first" --type plugin`);
    const result = scaffoldExpectFail(`--name ${name} --description "second" --type plugin`);
    expect(result.status).not.toBe(0);
  });

  it("fails with non-zero exit code for duplicate skill name", () => {
    const name = "test-dup-skill";
    const dir = resolve(SKILLS_DIR, name);
    trackCleanup(dir);

    scaffold(`--name ${name} --description "first" --type skill`);
    const result = scaffoldExpectFail(`--name ${name} --description "second" --type skill`);
    expect(result.status).not.toBe(0);
  });

  it("fails with non-zero exit code for duplicate agent name", () => {
    const name = "test-dup-agent";
    const file = resolve(AGENTS_DIR, `${name}.md`);
    trackCleanup(file);

    scaffold(`--name ${name} --description "first" --type agent`);
    const result = scaffoldExpectFail(`--name ${name} --description "second" --type agent`);
    expect(result.status).not.toBe(0);
  });

  it("fails with non-zero exit code for uppercase name", () => {
    const result = scaffoldExpectFail(`--name MyPlugin --description "bad name" --type plugin`);
    expect(result.status).not.toBe(0);
  });

  it("fails with non-zero exit code for name with spaces", () => {
    const result = scaffoldExpectFail(`--name "my plugin" --description "bad name" --type plugin`);
    expect(result.status).not.toBe(0);
  });

  it("fails with non-zero exit code for path traversal in name", () => {
    const result = scaffoldExpectFail(
      `--name "../../../tmp/pwned" --description "path traversal" --type plugin`,
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Invalid name");
  });

  it("fails with non-zero exit code for path traversal in name (partial args)", () => {
    const result = scaffoldExpectFail(`--name "../test" --type plugin`);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Invalid name");
  });

  it("fails with non-zero exit code for description containing YAML separator", () => {
    const result = scaffoldExpectFail(`--name test-yaml-inj --description "---" --type plugin`);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("must not contain YAML");
  });

  it("fails for description with YAML separator on its own line", () => {
    const result = scaffoldExpectFail(
      `--name test-yaml-inj2 --description "line1\n---\nline2" --type plugin`,
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("must not contain YAML");
  });
});
