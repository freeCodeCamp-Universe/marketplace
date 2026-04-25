import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  applyCatalogToReadme,
  buildCatalog,
  CATALOG_END,
  CATALOG_START,
  renderCatalog,
} from "../scripts/lib/catalog.js";

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "catalog-test-"));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

function writeJson(path: string, value: unknown): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2));
}

function writeMarkdown(path: string, name: string, description: string): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(
    path,
    ["---", `name: ${name}`, `description: ${description}`, "---", "# Body", ""].join("\n"),
  );
}

describe("buildCatalog", () => {
  it("collects portable plugin description from plugin.json", () => {
    writeJson(join(tempDir, "plugins", "alpha", "plugin.json"), {
      name: "alpha",
      description: "Alpha plugin description.",
      version: "1.0.0",
      skills: ["alpha"],
    });
    writeMarkdown(
      join(tempDir, "plugins", "alpha", "skills", "alpha", "SKILL.md"),
      "alpha",
      "Alpha skill description.",
    );

    const model = buildCatalog(tempDir);
    expect(model.plugins).toHaveLength(1);
    expect(model.plugins[0]).toMatchObject({
      name: "alpha",
      path: "plugins/alpha/",
      source: "portable",
    });
    expect(model.plugins[0].description).toContain("Alpha plugin description");
    expect(model.pluginSkills).toHaveLength(1);
    expect(model.pluginSkills[0].plugin).toBe("alpha");
  });

  it("collects claude-native plugins with explicit source label", () => {
    writeJson(join(tempDir, "claude-native", "native", ".claude-plugin", "plugin.json"), {
      name: "native",
      description: "Native plugin.",
      version: "1.0.0",
    });

    const model = buildCatalog(tempDir);
    expect(model.plugins).toHaveLength(1);
    expect(model.plugins[0].source).toBe("claude-native");
    expect(model.plugins[0].path).toBe("claude-native/native/");
  });

  it("collects standalone skills, plugin skills, shared agents, and plugin agents", () => {
    writeMarkdown(join(tempDir, "skills", "standalone", "SKILL.md"), "standalone", "Standalone.");
    writeMarkdown(join(tempDir, "agents", "shared.md"), "shared", "Shared agent.");

    writeJson(join(tempDir, "plugins", "p", "plugin.json"), {
      name: "p",
      description: "Plugin p.",
      version: "1.0.0",
    });
    writeMarkdown(join(tempDir, "plugins", "p", "skills", "ps", "SKILL.md"), "ps", "Plugin skill.");
    writeMarkdown(
      join(tempDir, "plugins", "p", "skills", "ps", "agents", "helper.md"),
      "helper",
      "Helper agent.",
    );
    writeMarkdown(join(tempDir, "plugins", "p", "agents", "rooted.md"), "rooted", "Rooted agent.");

    const model = buildCatalog(tempDir);
    expect(model.standaloneSkills.map((s) => s.name)).toEqual(["standalone"]);
    expect(model.pluginSkills.map((s) => s.name)).toEqual(["ps"]);
    expect(model.sharedAgents.map((a) => a.name)).toEqual(["shared"]);
    expect(model.pluginAgents.map((a) => `${a.owner}:${a.name}`).sort()).toEqual([
      "p/ps:helper",
      "p:rooted",
    ]);
  });

  it("renders empty placeholders when no content exists", () => {
    const rendered = renderCatalog(buildCatalog(tempDir));
    expect(rendered).toContain("_No plugins yet._");
    expect(rendered).toContain("_No standalone skills yet._");
    expect(rendered).toContain("_No shared agents yet._");
  });
});

describe("applyCatalogToReadme", () => {
  const baseReadme = ["# Marketplace", "", CATALOG_START, "", "old", "", CATALOG_END, ""].join(
    "\n",
  );

  it("replaces only the marked block", () => {
    const next = applyCatalogToReadme(baseReadme, "new body");
    expect(next).toContain("new body");
    expect(next).not.toContain("old");
    expect(next.startsWith("# Marketplace")).toBe(true);
  });

  it("throws if markers are missing", () => {
    expect(() => applyCatalogToReadme("# Marketplace\n", "body")).toThrow(
      /missing catalog markers/,
    );
  });
});
