import { describe, it, expect } from "vitest";
import { isLegacyConfig, migrateLegacyConfig } from "./configMigration";

const createLegacyConfig = (overrides = {}) => ({
  theme: "dark" as const,
  sidebarWidth: 300,
  editorWidthPercent: 60,
  openTabsHeight: 200,
  lineBreaks: true,
  lineWrapping: false,
  editorFontFamily: "Consolas",
  editorFontSize: 16,
  previewFontFamily: "serif",
  previewFontSize: 18,
  projectRoot: "D:\\Data\\project",
  openedPaths: ["D:\\Data\\project\\readme.md"],
  activePath: "D:\\Data\\project\\readme.md",
  expandedFolders: ["D:\\Data\\project\\src"],
  cursorPositions: { "D:\\Data\\project\\readme.md": 42 },
  ...overrides,
});

describe("isLegacyConfig", () => {
  it("returns true for old flat format", () => {
    expect(isLegacyConfig(createLegacyConfig())).toBe(true);
  });

  it("returns false for new format with sessions", () => {
    expect(isLegacyConfig({ sessions: {}, lastProjectRoot: null })).toBe(false);
  });

  it("returns false for null", () => {
    expect(isLegacyConfig(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isLegacyConfig(undefined)).toBe(false);
  });

  it("returns false for non-object", () => {
    expect(isLegacyConfig("string")).toBe(false);
    expect(isLegacyConfig(42)).toBe(false);
  });

  it("returns false when openedPaths is not an array", () => {
    expect(isLegacyConfig({ openedPaths: "not-array" })).toBe(false);
  });

  it("returns false when both openedPaths and sessions exist", () => {
    expect(isLegacyConfig({ openedPaths: [], sessions: {} })).toBe(false);
  });
});

describe("migrateLegacyConfig", () => {
  it("moves session fields to sessions[projectRoot]", () => {
    const legacy = createLegacyConfig();
    const result = migrateLegacyConfig(legacy);

    expect(result.sessions["D:\\Data\\project"]).toEqual({
      openedPaths: ["D:\\Data\\project\\readme.md"],
      activePath: "D:\\Data\\project\\readme.md",
      expandedFolders: ["D:\\Data\\project\\src"],
      cursorPositions: { "D:\\Data\\project\\readme.md": 42 },
    });
  });

  it("sets lastProjectRoot from legacy projectRoot", () => {
    const result = migrateLegacyConfig(createLegacyConfig());
    expect(result.lastProjectRoot).toBe("D:\\Data\\project");
  });

  it("preserves all global preferences", () => {
    const legacy = createLegacyConfig();
    const result = migrateLegacyConfig(legacy);

    expect(result.theme).toBe("dark");
    expect(result.sidebarWidth).toBe(300);
    expect(result.editorWidthPercent).toBe(60);
    expect(result.openTabsHeight).toBe(200);
    expect(result.lineBreaks).toBe(true);
    expect(result.lineWrapping).toBe(false);
    expect(result.editorFontFamily).toBe("Consolas");
    expect(result.editorFontSize).toBe(16);
    expect(result.previewFontFamily).toBe("serif");
    expect(result.previewFontSize).toBe(18);
  });

  it("creates empty sessions when projectRoot is null", () => {
    const legacy = createLegacyConfig({ projectRoot: null });
    const result = migrateLegacyConfig(legacy);

    expect(result.sessions).toEqual({});
    expect(result.lastProjectRoot).toBeNull();
  });

  it("creates empty sessions when openedPaths is empty", () => {
    const legacy = createLegacyConfig({ openedPaths: [] });
    const result = migrateLegacyConfig(legacy);

    expect(result.sessions).toEqual({});
  });

  it("does not include old flat session fields in result", () => {
    const result = migrateLegacyConfig(createLegacyConfig());

    expect("projectRoot" in result).toBe(false);
    expect("openedPaths" in result).toBe(false);
    expect("activePath" in result).toBe(false);
    expect("expandedFolders" in result).toBe(false);
    expect("cursorPositions" in result).toBe(false);
  });
});
