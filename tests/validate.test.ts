import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validate } from "../scripts/lib/validate.js";

let tempDir: string;

function createPlugin(
  base: string,
  name: string,
  opts: {
    pluginJson?: Record<string, unknown> | string | false;
    skills?: Record<string, string | false>;
    readme?: boolean;
    noSkillsDir?: boolean;
  } = {},
): void {
  const pluginDir = join(base, "plugins", name);
  mkdirSync(pluginDir, { recursive: true });

  if (opts.pluginJson !== false) {
    const cpDir = join(pluginDir, ".claude-plugin");
    mkdirSync(cpDir, { recursive: true });
    if (typeof opts.pluginJson === "string") {
      writeFileSync(join(cpDir, "plugin.json"), opts.pluginJson);
    } else {
      const data = opts.pluginJson ?? {
        name,
        description: "Test plugin",
        version: "1.0.0",
      };
      writeFileSync(join(cpDir, "plugin.json"), JSON.stringify(data));
    }
  }

  if (!opts.noSkillsDir) {
    const skillsDir = join(pluginDir, "skills");
    mkdirSync(skillsDir, { recursive: true });

    const skills = opts.skills ?? {
      "my-skill": ["---", "name: my-skill", "description: A test skill", "---", "# My Skill"].join(
        "\n",
      ),
    };

    for (const [skillName, content] of Object.entries(skills)) {
      const skillDir = join(skillsDir, skillName);
      mkdirSync(skillDir, { recursive: true });
      if (content !== false && content !== undefined) {
        writeFileSync(join(skillDir, "SKILL.md"), content);
      }
    }
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
  tempDir = mkdtempSync(join(tmpdir(), "validate-test-"));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("validate.ts", () => {
  describe("happy path", () => {
    it("valid plugin with all required files and fields passes all checks", () => {
      createPlugin(tempDir, "good-plugin");
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("PASS");
      expect(stdout).not.toContain("FAIL");
    });

    it("valid standalone skill with correct frontmatter passes", () => {
      createStandaloneSkill(
        tempDir,
        "test-skill",
        ["---", "name: test-skill", "description: A test skill", "---", "# Test"].join("\n"),
      );
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("PASS");
      expect(stdout).not.toContain("FAIL");
    });

    it("valid shared agent with frontmatter passes", () => {
      createAgent(
        tempDir,
        "test-agent",
        [
          "---",
          "name: test-agent",
          "description: Reviews focused marketplace tasks",
          "---",
          "# Test Agent",
          "Follow the requested instructions.",
        ].join("\n"),
      );
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("PASS");
      expect(stdout).not.toContain("FAIL");
    });
  });

  describe("plugin validation failures", () => {
    it("missing .claude-plugin/plugin.json fails", () => {
      createPlugin(tempDir, "bad-plugin", {
        pluginJson: false,
      });
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("plugin.json does not exist");
    });

    it("invalid JSON in plugin.json fails", () => {
      createPlugin(tempDir, "bad-json", {
        pluginJson: "{ not valid json }}}",
      });
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("not valid JSON");
    });

    it("empty name field in plugin.json fails", () => {
      createPlugin(tempDir, "empty-name", {
        pluginJson: { name: "", description: "Test", version: "1.0.0" },
      });
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("missing 'name' field");
    });

    it("missing skills/ directory fails", () => {
      createPlugin(tempDir, "no-skills", {
        noSkillsDir: true,
      });
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("skills/ directory does not exist");
    });

    it("skill without SKILL.md fails", () => {
      const pluginDir = join(tempDir, "plugins", "missing-skillmd");
      mkdirSync(join(pluginDir, ".claude-plugin"), { recursive: true });
      writeFileSync(
        join(pluginDir, ".claude-plugin", "plugin.json"),
        JSON.stringify({ name: "missing-skillmd", description: "Test", version: "1.0.0" }),
      );
      mkdirSync(join(pluginDir, "skills", "broken-skill"), { recursive: true });
      writeFileSync(join(pluginDir, "README.md"), "# Test");

      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("SKILL.md does not exist");
    });

    it("SKILL.md without name frontmatter fails", () => {
      createPlugin(tempDir, "no-name-fm", {
        skills: {
          "my-skill": ["---", "description: A test skill", "---", "# Skill"].join("\n"),
        },
      });
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("missing 'name' in frontmatter");
    });

    it("SKILL.md with unclosed frontmatter (no closing ---) fails", () => {
      createPlugin(tempDir, "unclosed-fm", {
        skills: {
          "my-skill": ["---", "name: my-skill", "description: test", "# Body content"].join("\n"),
        },
      });
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
    });

    it("SKILL.md name with non-portable characters fails", () => {
      createPlugin(tempDir, "bad-name-fmt", {
        skills: {
          "my-skill": ["---", "name: My_Skill", "description: A test", "---", "# Skill"].join("\n"),
        },
      });
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("must use lowercase letters");
    });

    it("missing README.md fails", () => {
      createPlugin(tempDir, "no-readme", {
        readme: false,
      });
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("README.md does not exist");
    });
  });

  describe("standalone skill failures", () => {
    it("SKILL.md missing fails", () => {
      createStandaloneSkill(tempDir, "no-file", false);
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("SKILL.md does not exist");
    });

    it("name field empty fails", () => {
      createStandaloneSkill(
        tempDir,
        "empty-name",
        ["---", "name: ", "description: Test", "---", "# Skill"].join("\n"),
      );
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("name is required");
    });

    it("name format invalid fails", () => {
      createStandaloneSkill(
        tempDir,
        "bad-name",
        ["---", "name: BadName!", "description: Test", "---", "# Skill"].join("\n"),
      );
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("must use lowercase letters");
    });

    it("name must match standalone skill directory", () => {
      createStandaloneSkill(
        tempDir,
        "directory-name",
        ["---", "name: other-name", "description: Test", "---", "# Skill"].join("\n"),
      );
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("name' must match directory");
    });
  });

  describe("agent failures", () => {
    it("agent without frontmatter fails", () => {
      createAgent(tempDir, "plain-agent", "# Plain Agent\nNo metadata.");
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("frontmatter must start with ---");
    });

    it("agent name must match filename", () => {
      createAgent(
        tempDir,
        "file-name",
        ["---", "name: other-name", "description: Test", "---", "# Agent"].join("\n"),
      );
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("name' must match filename");
    });
  });

  describe("edge cases", () => {
    it("empty plugins/ and skills/ directories exits with code 1", () => {
      mkdirSync(join(tempDir, "plugins"), { recursive: true });
      mkdirSync(join(tempDir, "skills"), { recursive: true });
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("No content found to validate");
    });

    it("YAML value with surrounding quotes is stripped correctly", () => {
      createStandaloneSkill(
        tempDir,
        "quoted-name",
        ["---", 'name: "quoted-name"', "description: Test", "---", "# Skill"].join("\n"),
      );
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("PASS");
      expect(stdout).toContain("'name' is valid");
    });

    it("YAML value with single quotes is stripped correctly", () => {
      createStandaloneSkill(
        tempDir,
        "single-quoted",
        ["---", "name: 'single-quoted'", "description: Test", "---", "# Skill"].join("\n"),
      );
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("PASS");
      expect(stdout).toContain("'name' is valid");
    });

    it("no plugins/ or skills/ directories at all exits with code 1", () => {
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(1);
      expect(stdout).toContain("No content found to validate");
    });

    it("plugin with multiple skills validates all of them", () => {
      createPlugin(tempDir, "multi-skill", {
        skills: {
          "skill-one": ["---", "name: skill-one", "description: First", "---", "# One"].join("\n"),
          "skill-two": ["---", "name: skill-two", "description: Second", "---", "# Two"].join("\n"),
        },
      });
      const { stdout, exitCode } = validate(tempDir);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("skill-one");
      expect(stdout).toContain("skill-two");
      expect(stdout).not.toContain("FAIL");
    });
  });
});
