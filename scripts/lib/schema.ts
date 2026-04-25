/**
 * Single-source-of-truth schema validators for marketplace artifacts.
 *
 * - {@link validateSkillFrontmatter} / {@link validateAgentFrontmatter} mirror
 *   the agentskills.io spec (name + description required; license, compatibility,
 *   allowed-tools, metadata optional).
 * - {@link validatePortableManifest} validates `plugins/<name>/plugin.json`.
 *
 * All validators return a list of human-readable error strings. Empty array
 * means valid. Reuse from validate.ts and tests; do not re-implement.
 */

import {
  type FrontmatterValue,
  getStringField,
  parseFrontmatterFile,
  validateDescription,
  validatePortableName,
} from "./metadata.js";

import { ADAPTER_IDS, type AdapterId, isAdapterId } from "./adapters.js";

export type DefinitionKind = "skill" | "agent";

export interface FrontmatterValidation {
  readonly errors: readonly string[];
  readonly fields: Record<string, FrontmatterValue>;
  readonly body: string;
}

export function validateSkillFrontmatter(
  filePath: string,
  expectedName: string,
): FrontmatterValidation {
  return validateDefinitionFile("skill", filePath, expectedName, "directory");
}

export function validateAgentFrontmatter(
  filePath: string,
  expectedName: string,
): FrontmatterValidation {
  return validateDefinitionFile("agent", filePath, expectedName, "filename");
}

function validateDefinitionFile(
  kind: DefinitionKind,
  filePath: string,
  expectedName: string,
  matchLabel: "directory" | "filename",
): FrontmatterValidation {
  const parsed = parseFrontmatterFile(filePath);
  const errors: string[] = [...parsed.errors];

  const name = getStringField(parsed.fields, "name") ?? "";
  if (name.length === 0) {
    errors.push("missing 'name' in frontmatter");
  } else {
    for (const err of validatePortableName(name)) {
      errors.push(`'name' ${err}`);
    }
    if (name !== expectedName) {
      errors.push(`'name' must match ${matchLabel} (got: '${name}')`);
    }
  }

  const description = getStringField(parsed.fields, "description") ?? "";
  if (description.length === 0) {
    errors.push("missing 'description' in frontmatter");
  } else {
    for (const err of validateDescription(description)) {
      errors.push(`'description' ${err}`);
    }
  }

  pushOptionalString(errors, parsed.fields, "license");
  pushOptionalString(errors, parsed.fields, "compatibility", 500);
  pushOptionalString(errors, parsed.fields, "allowed-tools");
  pushMetadata(errors, parsed.fields);

  if (parsed.body.length === 0) {
    errors.push(`missing markdown body for ${kind}`);
  }

  return { errors, fields: parsed.fields, body: parsed.body };
}

function pushOptionalString(
  errors: string[],
  fields: Record<string, FrontmatterValue>,
  field: string,
  maxLength?: number,
): void {
  if (!(field in fields)) return;
  const value = getStringField(fields, field);
  if (value === undefined || value.trim().length === 0) {
    errors.push(`'${field}' must be a non-empty string`);
    return;
  }
  if (maxLength !== undefined && value.length > maxLength) {
    errors.push(`'${field}' must be ${maxLength} characters or fewer`);
  }
}

function pushMetadata(errors: string[], fields: Record<string, FrontmatterValue>): void {
  if (!("metadata" in fields)) return;
  const metadata = fields.metadata;
  if (typeof metadata === "string") {
    errors.push("'metadata' must be a mapping");
    return;
  }
  for (const [key, value] of Object.entries(metadata)) {
    if (key.trim().length === 0) {
      errors.push("'metadata' keys must be non-empty strings");
      return;
    }
    if (typeof value !== "string") {
      errors.push("'metadata' values must be strings");
      return;
    }
  }
}

/**
 * Schema for `plugins/<name>/plugin.json` — the portable plugin manifest.
 *
 * Required: `name`, `description`, `version`.
 * Optional: `author`, `keywords`, `skills` (string[]), `agents` (string[]),
 * `adapters` (AdapterId[]).
 */
export interface PortableManifest {
  name: string;
  description: string;
  version: string;
  author?: { name?: string; email?: string };
  keywords?: string[];
  skills?: string[];
  agents?: string[];
  adapters?: AdapterId[];
}

export function validatePortableManifest(
  data: unknown,
  expectedName: string,
): { errors: string[]; manifest: PortableManifest | null } {
  const errors: string[] = [];

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return { errors: ["plugin.json must be a JSON object"], manifest: null };
  }

  const obj = data as Record<string, unknown>;
  const requireString = (field: string): string => {
    const value = obj[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`plugin.json missing '${field}' field`);
      return "";
    }
    return value;
  };

  const name = requireString("name");
  const description = requireString("description");
  const version = requireString("version");

  if (name.length > 0) {
    for (const err of validatePortableName(name)) {
      errors.push(`plugin.json 'name' ${err}`);
    }
    if (name !== expectedName) {
      errors.push(`plugin.json 'name' must match directory (got: '${name}')`);
    }
  }

  if (description.length > 0) {
    for (const err of validateDescription(description)) {
      errors.push(`plugin.json 'description' ${err}`);
    }
  }

  const optionalStringArray = (field: string): string[] | undefined => {
    if (!(field in obj)) return undefined;
    const value = obj[field];
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
      errors.push(`plugin.json '${field}' must be an array of strings`);
      return undefined;
    }
    return value as string[];
  };

  const skills = optionalStringArray("skills");
  const agents = optionalStringArray("agents");
  const keywords = optionalStringArray("keywords");

  let adapters: AdapterId[] | undefined;
  if ("adapters" in obj) {
    const raw = obj.adapters;
    if (!Array.isArray(raw) || raw.some((entry) => typeof entry !== "string")) {
      errors.push("plugin.json 'adapters' must be an array of strings");
    } else {
      adapters = [];
      for (const entry of raw as string[]) {
        if (!isAdapterId(entry)) {
          errors.push(
            `plugin.json 'adapters' entry '${entry}' is not a known adapter (allowed: ${ADAPTER_IDS.join(", ")})`,
          );
          continue;
        }
        adapters.push(entry);
      }
    }
  }

  if (errors.length > 0) {
    return { errors, manifest: null };
  }

  const manifest: PortableManifest = {
    name,
    description,
    version,
    keywords,
    skills,
    agents,
    adapters,
  };

  if (typeof obj.author === "object" && obj.author !== null && !Array.isArray(obj.author)) {
    manifest.author = obj.author as PortableManifest["author"];
  }

  return { errors, manifest };
}
