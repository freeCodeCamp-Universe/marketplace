/**
 * Disk → catalog model. Single source of truth for the README catalog block
 * and any future generated index. Pure data builders; rendering lives in
 * `scripts/catalog.ts`.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { extname, join, parse } from "node:path";
import { CLAUDE_NATIVE } from "./adapters.js";
import { getStringField, parseFrontmatterFile } from "./metadata.js";

export interface CatalogPlugin {
  name: string;
  path: string;
  description: string;
  source: "portable" | "claude-native";
}

export interface CatalogSkill {
  name: string;
  path: string;
  description: string;
  plugin?: string;
}

export interface CatalogAgent {
  name: string;
  path: string;
  description: string;
  owner?: string;
}

export interface CatalogModel {
  plugins: CatalogPlugin[];
  standaloneSkills: CatalogSkill[];
  pluginSkills: CatalogSkill[];
  sharedAgents: CatalogAgent[];
  pluginAgents: CatalogAgent[];
}

export const CATALOG_START = "<!-- catalog:start -->";
export const CATALOG_END = "<!-- catalog:end -->";

export function buildCatalog(root: string): CatalogModel {
  return {
    plugins: collectPlugins(root),
    standaloneSkills: collectStandaloneSkills(root),
    pluginSkills: collectPluginSkills(root),
    sharedAgents: collectSharedAgents(root),
    pluginAgents: collectPluginAgents(root),
  };
}

export function renderCatalog(model: CatalogModel): string {
  const lines: string[] = [];

  lines.push("### Plugins", "");
  if (model.plugins.length === 0) {
    lines.push("_No plugins yet._");
  } else {
    for (const plugin of model.plugins) {
      const tag = plugin.source === "claude-native" ? " (claude-native)" : "";
      lines.push(`- [${plugin.name}](${plugin.path}) — ${plugin.description}${tag}`);
    }
  }
  lines.push("");

  lines.push("### Standalone Skills", "");
  if (model.standaloneSkills.length === 0) {
    lines.push("_No standalone skills yet._");
  } else {
    for (const skill of model.standaloneSkills) {
      lines.push(`- [${skill.name}](${skill.path}) — ${skill.description}`);
    }
  }
  lines.push("");

  lines.push("### Plugin Skills", "");
  if (model.pluginSkills.length === 0) {
    lines.push("_No plugin skills yet._");
  } else {
    for (const skill of model.pluginSkills) {
      lines.push(
        `- [${skill.name}](${skill.path}) — ${skill.description}` +
          (skill.plugin ? ` (\`${skill.plugin}\`)` : ""),
      );
    }
  }
  lines.push("");

  lines.push("### Shared Agents", "");
  if (model.sharedAgents.length === 0) {
    lines.push("_No shared agents yet._");
  } else {
    for (const agent of model.sharedAgents) {
      lines.push(`- [${agent.name}](${agent.path}) — ${agent.description}`);
    }
  }
  lines.push("");

  lines.push("### Plugin-Local Agents", "");
  if (model.pluginAgents.length === 0) {
    lines.push("_No plugin-local agents yet._");
  } else {
    for (const agent of model.pluginAgents) {
      const owner = agent.owner ? ` — \`${agent.owner}\`` : "";
      lines.push(`- [${agent.name}](${agent.path})${owner}`);
    }
  }

  return lines.join("\n").trimEnd();
}

export function applyCatalogToReadme(readme: string, body: string): string {
  const startIdx = readme.indexOf(CATALOG_START);
  const endIdx = readme.indexOf(CATALOG_END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `README is missing catalog markers. Add '${CATALOG_START}' and '${CATALOG_END}' around the catalog block.`,
    );
  }
  const before = readme.slice(0, startIdx + CATALOG_START.length);
  const after = readme.slice(endIdx);
  return `${before}\n\n${body}\n\n${after}`;
}

// ---------------------------------------------------------------- collectors

function collectPlugins(root: string): CatalogPlugin[] {
  const plugins: CatalogPlugin[] = [];

  const portableDir = join(root, "plugins");
  for (const name of getSubdirs(portableDir)) {
    const pluginDir = join(portableDir, name);
    const manifestPath = join(pluginDir, "plugin.json");
    if (!existsSync(manifestPath)) continue;
    const description = readJsonString(manifestPath, "description") ?? "";
    plugins.push({
      name,
      path: `plugins/${name}/`,
      description,
      source: "portable",
    });
  }

  const nativeDir = join(root, CLAUDE_NATIVE.dir);
  for (const name of getSubdirs(nativeDir)) {
    const manifestPath = join(nativeDir, name, CLAUDE_NATIVE.manifestPath);
    if (!existsSync(manifestPath)) continue;
    const description = readJsonString(manifestPath, "description") ?? "";
    plugins.push({
      name,
      path: `${CLAUDE_NATIVE.dir}/${name}/`,
      description,
      source: "claude-native",
    });
  }

  return sortByName(plugins);
}

function collectStandaloneSkills(root: string): CatalogSkill[] {
  const skills: CatalogSkill[] = [];
  const dir = join(root, "skills");
  for (const name of getSubdirs(dir)) {
    const skillPath = join(dir, name, "SKILL.md");
    if (!existsSync(skillPath)) continue;
    const description = readFrontmatterDescription(skillPath);
    skills.push({ name, path: `skills/${name}/`, description });
  }
  return sortByName(skills);
}

function collectPluginSkills(root: string): CatalogSkill[] {
  const skills: CatalogSkill[] = [];
  const portableDir = join(root, "plugins");
  for (const pluginName of getSubdirs(portableDir)) {
    const skillsDir = join(portableDir, pluginName, "skills");
    if (!isDir(skillsDir)) continue;
    for (const skillName of getSubdirs(skillsDir)) {
      const skillPath = join(skillsDir, skillName, "SKILL.md");
      if (!existsSync(skillPath)) continue;
      skills.push({
        name: skillName,
        path: `plugins/${pluginName}/skills/${skillName}/`,
        description: readFrontmatterDescription(skillPath),
        plugin: pluginName,
      });
    }
  }
  return sortByName(skills);
}

function collectSharedAgents(root: string): CatalogAgent[] {
  const agents: CatalogAgent[] = [];
  const dir = join(root, "agents");
  if (!isDir(dir)) return agents;
  for (const fileName of listMarkdownFiles(dir)) {
    const filePath = join(dir, fileName);
    const name = parse(fileName).name;
    agents.push({
      name,
      path: `agents/${fileName}`,
      description: readFrontmatterDescription(filePath),
    });
  }
  return sortByName(agents);
}

function collectPluginAgents(root: string): CatalogAgent[] {
  const agents: CatalogAgent[] = [];
  const portableDir = join(root, "plugins");
  for (const pluginName of getSubdirs(portableDir)) {
    const pluginDir = join(portableDir, pluginName);

    // plugin-level agents/
    const pluginAgentsDir = join(pluginDir, "agents");
    if (isDir(pluginAgentsDir)) {
      for (const fileName of listMarkdownFiles(pluginAgentsDir)) {
        const filePath = join(pluginAgentsDir, fileName);
        agents.push({
          name: parse(fileName).name,
          path: `plugins/${pluginName}/agents/${fileName}`,
          description: readFrontmatterDescription(filePath),
          owner: pluginName,
        });
      }
    }

    // skill-level agents/ (e.g. plugins/x/skills/y/agents/*.md)
    const skillsDir = join(pluginDir, "skills");
    if (!isDir(skillsDir)) continue;
    for (const skillName of getSubdirs(skillsDir)) {
      const skillAgentsDir = join(skillsDir, skillName, "agents");
      if (!isDir(skillAgentsDir)) continue;
      for (const fileName of listMarkdownFiles(skillAgentsDir)) {
        const filePath = join(skillAgentsDir, fileName);
        agents.push({
          name: parse(fileName).name,
          path: `plugins/${pluginName}/skills/${skillName}/agents/${fileName}`,
          description: readFrontmatterDescription(filePath),
          owner: `${pluginName}/${skillName}`,
        });
      }
    }
  }
  return sortByName(agents);
}

// --------------------------------------------------------------- file helpers

function getSubdirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function listMarkdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && extname(entry.name) === ".md" && entry.name !== "README.md",
    )
    .map((entry) => entry.name)
    .sort();
}

function isDir(p: string): boolean {
  if (!existsSync(p)) return false;
  return statSync(p).isDirectory();
}

function readJsonString(filePath: string, field: string): string | null {
  try {
    const data = JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
    const value = data[field];
    return typeof value === "string" ? firstSentence(value) : null;
  } catch {
    return null;
  }
}

function readFrontmatterDescription(filePath: string): string {
  const parsed = parseFrontmatterFile(filePath);
  const value = getStringField(parsed.fields, "description") ?? "";
  return firstSentence(value);
}

/**
 * Extract a catalog-friendly summary from a description.
 *
 * - Collapse whitespace.
 * - Strip leading bold-prefix patterns like `**Title**:` or `**Title** —`.
 * - Take the first real sentence (period + space) but skip period-space pairs
 *   that follow common title abbreviations ("Dra.", "Dr.", "Sr.", "Mr.", etc.).
 * - Hard-cap at 200 chars and trim to a word boundary if longer.
 */
function firstSentence(value: string): string {
  let s = value.replace(/\s+/g, " ").trim();
  if (s.length === 0) return "";

  s = s.replace(/^\*\*[^*]+\*\*\s*[:—–-]\s*/u, "");

  const ABBREVS = ["Dra", "Dr", "Sra", "Sr", "Mrs", "Mr", "Ms", "St", "vs", "e.g", "i.e"];
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== ".") continue;
    if (s[i + 1] !== " ") continue;
    const prefix = s.slice(0, i).split(/\s+/).pop() ?? "";
    if (ABBREVS.includes(prefix)) continue;
    s = s.slice(0, i + 1);
    break;
  }

  if (s.length > 200) {
    const truncated = s.slice(0, 200);
    const lastSpace = truncated.lastIndexOf(" ");
    s = (lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated).trimEnd() + "…";
  }

  return s;
}

function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}
