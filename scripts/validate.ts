import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, extname, join, parse, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type AdapterId, ADAPTERS, CLAUDE_NATIVE, type AdapterSpec } from "./lib/adapters.js";
import {
  type PortableManifest,
  validateAgentFrontmatter,
  validatePortableManifest,
  validateSkillFrontmatter,
} from "./lib/schema.js";

const ROOT = resolve(import.meta.dirname ?? dirname(fileURLToPath(import.meta.url)), "..");
const PLUGINS_DIR = join(ROOT, "plugins");
const SKILLS_DIR = join(ROOT, "skills");
const AGENTS_DIR = join(ROOT, "agents");
const CLAUDE_NATIVE_DIR = join(ROOT, CLAUDE_NATIVE.dir);

let total = 0;
let passed = 0;
let failed = 0;

function pass(msg: string): void {
  console.log(`PASS: ${msg}`);
  total++;
  passed++;
}

function fail(msg: string): void {
  console.log(`FAIL: ${msg}`);
  total++;
  failed++;
}

function pushResult(context: string, errors: readonly string[], successMsg: string): void {
  if (errors.length === 0) {
    pass(`${context} ${successMsg}`);
    return;
  }
  for (const err of errors) {
    fail(`${context} ${err}`);
  }
}

function parseJsonFile(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch (e) {
    console.error((e as Error).message);
    return null;
  }
}

function getSubdirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function getMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && extname(entry.name) === ".md" && entry.name !== "README.md",
    )
    .map((entry) => entry.name)
    .sort();
}

function validateAgentsDir(dir: string, contextPrefix: string): void {
  const agentFiles = getMarkdownFiles(dir);
  if (agentFiles.length === 0) return;

  for (const fileName of agentFiles) {
    const expectedName = parse(fileName).name;
    const filePath = join(dir, fileName);
    const result = validateAgentFrontmatter(filePath, expectedName);
    pushResult(`${contextPrefix} ${fileName}`, result.errors, "agent frontmatter is valid");
  }
}

function validateSkillFile(skillMd: string, context: string, expectedName: string): void {
  if (!existsSync(skillMd)) {
    fail(`${context}/SKILL.md does not exist`);
    return;
  }
  pass(`${context}/SKILL.md exists`);
  const result = validateSkillFrontmatter(skillMd, expectedName);
  pushResult(`${context}/SKILL.md`, result.errors, "skill frontmatter is valid");
}

function validateAdapter(
  pluginName: string,
  pluginDir: string,
  adapter: AdapterSpec,
  expectedName: string,
): void {
  const manifestPath = join(pluginDir, adapter.manifestPath);
  const context = `[${pluginName}] adapter:${adapter.id}`;

  if (!existsSync(manifestPath)) {
    fail(`${context} manifest missing at ${adapter.manifestPath}`);
    return;
  }
  pass(`${context} manifest exists`);

  if (adapter.manifestKind === "json") {
    const data = parseJsonFile(manifestPath);
    if (data === null) {
      fail(`${context} manifest is not valid JSON`);
      return;
    }
    pass(`${context} manifest is valid JSON`);

    if (typeof data !== "object" || Array.isArray(data) || data === null) {
      fail(`${context} manifest must be an object`);
      return;
    }

    const obj = data as Record<string, unknown>;
    for (const field of adapter.requiredFields) {
      const value = obj[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        fail(`${context} manifest missing required field '${field}'`);
      } else {
        pass(`${context} manifest has '${field}'`);
      }
    }

    const manifestName = typeof obj.name === "string" ? obj.name : "";
    if (manifestName === expectedName) {
      pass(`${context} manifest 'name' matches directory`);
    } else {
      fail(`${context} manifest 'name' must match directory (got: '${manifestName}')`);
    }
  } else {
    fail(`${context} manifest kind '${adapter.manifestKind}' is not yet supported`);
  }
}

function validatePortablePlugin(pluginName: string): void {
  const pluginDir = join(PLUGINS_DIR, pluginName);
  const manifestPath = join(pluginDir, "plugin.json");

  if (!existsSync(manifestPath)) {
    fail(`[${pluginName}] portable plugin.json does not exist`);
    return;
  }
  pass(`[${pluginName}] portable plugin.json exists`);

  const data = parseJsonFile(manifestPath);
  if (data === null) {
    fail(`[${pluginName}] plugin.json is not valid JSON`);
    return;
  }
  pass(`[${pluginName}] plugin.json is valid JSON`);

  const { errors, manifest } = validatePortableManifest(data, pluginName);
  if (errors.length > 0) {
    for (const err of errors) {
      fail(`[${pluginName}] ${err}`);
    }
    return;
  }
  pass(`[${pluginName}] plugin.json schema is valid`);

  validateBundledArtifacts(pluginName, pluginDir, manifest!);
  validateDeclaredAdapters(pluginName, pluginDir, manifest!);

  if (existsSync(join(pluginDir, "README.md"))) {
    pass(`[${pluginName}] README.md exists`);
  } else {
    fail(`[${pluginName}] README.md does not exist`);
  }
}

function validateBundledArtifacts(
  pluginName: string,
  pluginDir: string,
  manifest: PortableManifest,
): void {
  const skillsDir = join(pluginDir, "skills");
  const skillsStat = statSync(skillsDir, { throwIfNoEntry: false });
  const declaredSkills = manifest.skills ?? [];
  const presentSkills = skillsStat?.isDirectory() ? getSubdirs(skillsDir) : [];

  if (declaredSkills.length === 0 && presentSkills.length === 0) {
    fail(`[${pluginName}] plugin must declare at least one skill or agent`);
  }

  if (skillsStat?.isDirectory()) {
    for (const skillName of presentSkills) {
      const skillDir = join(skillsDir, skillName);
      validateSkillFile(
        join(skillDir, "SKILL.md"),
        `[${pluginName}] skills/${skillName}`,
        skillName,
      );
      validateAgentsDir(join(skillDir, "agents"), `[${pluginName}] skills/${skillName}/agents`);
    }
  }

  for (const declared of declaredSkills) {
    if (!presentSkills.includes(declared)) {
      fail(`[${pluginName}] declared skill '${declared}' has no skills/${declared}/SKILL.md`);
    }
  }

  validateAgentsDir(join(pluginDir, "agents"), `[${pluginName}] agents`);
}

function validateDeclaredAdapters(
  pluginName: string,
  pluginDir: string,
  manifest: PortableManifest,
): void {
  const declared: AdapterId[] = manifest.adapters ?? [];
  if (declared.length === 0) {
    pass(`[${pluginName}] declares no adapters (portable-only plugin)`);
    return;
  }

  for (const id of declared) {
    validateAdapter(pluginName, pluginDir, ADAPTERS[id], pluginName);
  }
}

function validateClaudeNativePlugin(pluginName: string): void {
  const pluginDir = join(CLAUDE_NATIVE_DIR, pluginName);
  const manifestPath = join(pluginDir, CLAUDE_NATIVE.manifestPath);
  const context = `[claude-native/${pluginName}]`;

  if (!existsSync(manifestPath)) {
    fail(`${context} ${CLAUDE_NATIVE.manifestPath} does not exist`);
    return;
  }
  pass(`${context} manifest exists`);

  const data = parseJsonFile(manifestPath);
  if (data === null) {
    fail(`${context} manifest is not valid JSON`);
    return;
  }
  pass(`${context} manifest is valid JSON`);

  if (typeof data !== "object" || Array.isArray(data) || data === null) {
    fail(`${context} manifest must be an object`);
    return;
  }

  const obj = data as Record<string, unknown>;
  for (const field of ADAPTERS.claude.requiredFields) {
    const value = obj[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      fail(`${context} missing required field '${field}'`);
    } else {
      pass(`${context} has '${field}'`);
    }
  }

  const manifestName = typeof obj.name === "string" ? obj.name : "";
  if (manifestName === pluginName) {
    pass(`${context} 'name' matches directory`);
  } else {
    fail(`${context} 'name' must match directory (got: '${manifestName}')`);
  }

  if (existsSync(join(pluginDir, "README.md"))) {
    pass(`${context} README.md exists`);
  } else {
    fail(`${context} README.md does not exist`);
  }
}

// --- main ---

if (existsSync(PLUGINS_DIR)) {
  for (const pluginName of getSubdirs(PLUGINS_DIR)) {
    validatePortablePlugin(pluginName);
  }
}

if (existsSync(CLAUDE_NATIVE_DIR)) {
  for (const pluginName of getSubdirs(CLAUDE_NATIVE_DIR)) {
    validateClaudeNativePlugin(pluginName);
  }
}

if (existsSync(SKILLS_DIR)) {
  for (const skillName of getSubdirs(SKILLS_DIR)) {
    validateSkillFile(
      join(SKILLS_DIR, skillName, "SKILL.md"),
      `[standalone] ${skillName}`,
      skillName,
    );
  }
}

validateAgentsDir(AGENTS_DIR, "[agent]");

if (total === 0) {
  console.log("");
  console.log("ERROR: No content found to validate.");
  process.exit(1);
}

console.log("");
console.log("=========================================");
console.log(`Validation complete: ${total} checks, ${passed} passed, ${failed} failed`);
console.log("=========================================");

if (failed > 0) {
  process.exit(1);
}
