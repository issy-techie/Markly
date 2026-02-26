import { describe, it, expect } from "vitest";
import {
  RESIZE,
  DEFAULT_CONFIG,
  FONT_OPTIONS,
  PREVIEW_FONT_OPTIONS,
  IMAGE_EXTENSIONS,
  MARKDOWN_REFERENCE,
} from "./constants";

describe("RESIZE constants", () => {
  it("has valid sidebar width range", () => {
    expect(RESIZE.SIDEBAR_MIN_WIDTH).toBeLessThan(RESIZE.SIDEBAR_MAX_WIDTH);
    expect(RESIZE.SIDEBAR_MIN_WIDTH).toBeGreaterThan(0);
  });

  it("has valid editor percent range", () => {
    expect(RESIZE.EDITOR_MIN_PERCENT).toBeLessThan(RESIZE.EDITOR_MAX_PERCENT);
    expect(RESIZE.EDITOR_MIN_PERCENT).toBeGreaterThanOrEqual(0);
    expect(RESIZE.EDITOR_MAX_PERCENT).toBeLessThanOrEqual(100);
  });

  it("has valid open tabs height range", () => {
    expect(RESIZE.OPEN_TABS_MIN_HEIGHT).toBeLessThan(RESIZE.OPEN_TABS_MAX_HEIGHT);
    expect(RESIZE.OPEN_TABS_MIN_HEIGHT).toBeGreaterThan(0);
  });
});

describe("DEFAULT_CONFIG", () => {
  it("has a valid theme", () => {
    expect(["light", "dark"]).toContain(DEFAULT_CONFIG.theme);
  });

  it("has sidebar width within RESIZE bounds", () => {
    expect(DEFAULT_CONFIG.sidebarWidth).toBeGreaterThanOrEqual(RESIZE.SIDEBAR_MIN_WIDTH);
    expect(DEFAULT_CONFIG.sidebarWidth).toBeLessThanOrEqual(RESIZE.SIDEBAR_MAX_WIDTH);
  });

  it("has editor width percent within RESIZE bounds", () => {
    expect(DEFAULT_CONFIG.editorWidthPercent).toBeGreaterThanOrEqual(RESIZE.EDITOR_MIN_PERCENT);
    expect(DEFAULT_CONFIG.editorWidthPercent).toBeLessThanOrEqual(RESIZE.EDITOR_MAX_PERCENT);
  });

  it("has open tabs height within RESIZE bounds", () => {
    expect(DEFAULT_CONFIG.openTabsHeight).toBeGreaterThanOrEqual(RESIZE.OPEN_TABS_MIN_HEIGHT);
    expect(DEFAULT_CONFIG.openTabsHeight).toBeLessThanOrEqual(RESIZE.OPEN_TABS_MAX_HEIGHT);
  });

  it("has positive font sizes", () => {
    expect(DEFAULT_CONFIG.editorFontSize).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.previewFontSize).toBeGreaterThan(0);
  });

  it("has non-empty font families", () => {
    expect(DEFAULT_CONFIG.editorFontFamily.length).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.previewFontFamily.length).toBeGreaterThan(0);
  });

  it("has scrollSync as boolean defaulting to false", () => {
    expect(typeof DEFAULT_CONFIG.scrollSync).toBe("boolean");
    expect(DEFAULT_CONFIG.scrollSync).toBe(false);
  });

  it("has empty session state by default", () => {
    expect(DEFAULT_CONFIG.lastProjectRoot).toBeNull();
    expect(DEFAULT_CONFIG.sessions).toEqual({});
  });
});

describe("FONT_OPTIONS", () => {
  it("has at least one option", () => {
    expect(FONT_OPTIONS.length).toBeGreaterThan(0);
  });

  it("each option has label and value", () => {
    for (const opt of FONT_OPTIONS) {
      expect(opt.label).toBeTruthy();
      expect(opt.value).toBeTruthy();
    }
  });

  it("first option is the default monospace", () => {
    expect(FONT_OPTIONS[0].value).toBe("monospace");
  });
});

describe("PREVIEW_FONT_OPTIONS", () => {
  it("has at least one option", () => {
    expect(PREVIEW_FONT_OPTIONS.length).toBeGreaterThan(0);
  });

  it("each option has label and value", () => {
    for (const opt of PREVIEW_FONT_OPTIONS) {
      expect(opt.label).toBeTruthy();
      expect(opt.value).toBeTruthy();
    }
  });

  it("first option is the default sans-serif", () => {
    expect(PREVIEW_FONT_OPTIONS[0].value).toBe("sans-serif");
  });
});

describe("IMAGE_EXTENSIONS", () => {
  it("includes common image formats", () => {
    expect(IMAGE_EXTENSIONS).toContain(".png");
    expect(IMAGE_EXTENSIONS).toContain(".jpg");
    expect(IMAGE_EXTENSIONS).toContain(".jpeg");
    expect(IMAGE_EXTENSIONS).toContain(".gif");
    expect(IMAGE_EXTENSIONS).toContain(".svg");
    expect(IMAGE_EXTENSIONS).toContain(".webp");
  });

  it("all extensions start with a dot", () => {
    for (const ext of IMAGE_EXTENSIONS) {
      expect(ext.startsWith(".")).toBe(true);
    }
  });

  it("all extensions are lowercase", () => {
    for (const ext of IMAGE_EXTENSIONS) {
      expect(ext).toBe(ext.toLowerCase());
    }
  });
});

describe("MARKDOWN_REFERENCE", () => {
  it("has at least one category", () => {
    expect(MARKDOWN_REFERENCE.length).toBeGreaterThan(0);
  });

  it("each category has a non-empty name and items", () => {
    for (const cat of MARKDOWN_REFERENCE) {
      expect(cat.category).toBeTruthy();
      expect(cat.items.length).toBeGreaterThan(0);
    }
  });

  it("each item has label, syntax, and snippet", () => {
    for (const cat of MARKDOWN_REFERENCE) {
      for (const item of cat.items) {
        expect(item.label).toBeTruthy();
        expect(item.syntax).toBeTruthy();
        expect(item.snippet).toBeTruthy();
      }
    }
  });

  it("includes Mermaid and PlantUML in diagram category", () => {
    const diagramCat = MARKDOWN_REFERENCE.find(c => c.category === "図解");
    expect(diagramCat).toBeDefined();
    const labels = diagramCat!.items.map(i => i.label);
    expect(labels.some(l => l.includes("Mermaid"))).toBe(true);
    expect(labels.some(l => l.includes("PlantUML"))).toBe(true);
  });
});
