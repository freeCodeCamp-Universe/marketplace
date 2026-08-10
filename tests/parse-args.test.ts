import { describe, it, expect } from "vitest";
import { parseArgs } from "../scripts/lib/scaffold.js";

describe("parseArgs", () => {
  it("returns empty object for no arguments", () => {
    expect(parseArgs([])).toEqual({});
  });

  it("parses --name flag", () => {
    expect(parseArgs(["--name", "my-plugin"])).toEqual({ name: "my-plugin" });
  });

  it("parses --description flag", () => {
    expect(parseArgs(["--description", "A test"])).toEqual({ description: "A test" });
  });

  it("parses --type plugin", () => {
    expect(parseArgs(["--type", "plugin"])).toEqual({ type: "plugin" });
  });

  it("parses --type skill", () => {
    expect(parseArgs(["--type", "skill"])).toEqual({ type: "skill" });
  });

  it("parses --type agent", () => {
    expect(parseArgs(["--type", "agent"])).toEqual({ type: "agent" });
  });

  it("parses all flags together", () => {
    const result = parseArgs(["--name", "foo", "--description", "A foo", "--type", "plugin"]);

    expect(result).toEqual({ name: "foo", description: "A foo", type: "plugin" });
  });

  it("ignores invalid --type values", () => {
    expect(parseArgs(["--type", "invalid"])).toEqual({});
  });

  it("ignores --name when no value follows", () => {
    expect(parseArgs(["--name"])).toEqual({});
  });

  it("ignores --description when no value follows", () => {
    expect(parseArgs(["--description"])).toEqual({});
  });

  it("ignores --type when no value follows", () => {
    expect(parseArgs(["--type"])).toEqual({});
  });

  it("ignores unknown flags", () => {
    expect(parseArgs(["--verbose", "--name", "foo"])).toEqual({ name: "foo" });
  });
});
