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

  it("has scrollSync as boolean defaulting to true", () => {
    expect(typeof DEFAULT_CONFIG.scrollSync).toBe("boolean");
    expect(DEFAULT_CONFIG.scrollSync).toBe(true);
  });

  it("has language defaulting to null (first launch trigger)", () => {
    expect(DEFAULT_CONFIG.language).toBeNull();
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

  it("each item has label, syntax, snippet, and sample", () => {
    for (const cat of MARKDOWN_REFERENCE) {
      for (const item of cat.items) {
        expect(item.label).toBeTruthy();
        expect(item.syntax).toBeTruthy();
        expect(item.snippet).toBeTruthy();
        expect(item.sample).toBeTruthy();
      }
    }
  });

  it("has dedicated Mermaid category with multiple diagram types", () => {
    const mermaidCat = MARKDOWN_REFERENCE.find(c => c.category === "Mermaid");
    expect(mermaidCat).toBeDefined();
    expect(mermaidCat!.items.length).toBeGreaterThanOrEqual(5);
    const labels = mermaidCat!.items.map(i => i.label);
    expect(labels).toContain("フローチャート");
    expect(labels).toContain("シーケンス図");
    expect(labels).toContain("円グラフ");
  });

  it("has dedicated PlantUML category with multiple diagram types", () => {
    const pumlCat = MARKDOWN_REFERENCE.find(c => c.category === "PlantUML");
    expect(pumlCat).toBeDefined();
    expect(pumlCat!.items.length).toBeGreaterThanOrEqual(4);
    const labels = pumlCat!.items.map(i => i.label);
    expect(labels).toContain("シーケンス図");
    expect(labels).toContain("クラス図");
  });

  it("has embed category with iframe items", () => {
    const embedCat = MARKDOWN_REFERENCE.find(c => c.category === "埋め込み");
    expect(embedCat).toBeDefined();
    const labels = embedCat!.items.map(i => i.label);
    expect(labels).toContain("YouTube");
    expect(labels).toContain("Google Maps");
    expect(labels).toContain("汎用 iframe");
  });

  it("has 文字色 category with preset colors and color picker support", () => {
    const colorCat = MARKDOWN_REFERENCE.find(c => c.category === "文字色");
    expect(colorCat).toBeDefined();
    expect(colorCat!.items.length).toBeGreaterThanOrEqual(6);
    const labels = colorCat!.items.map(i => i.label);
    expect(labels).toContain("赤");
    expect(labels).toContain("青");
    expect(labels).toContain("緑");
    expect(labels).toContain("背景色付き");
    expect(labels).toContain("カスタムカラー");
  });

  it("文字色 items with preset colors have valid hex color field", () => {
    const colorCat = MARKDOWN_REFERENCE.find(c => c.category === "文字色")!;
    const itemsWithColor = colorCat.items.filter((i: any) => i.color);
    expect(itemsWithColor.length).toBeGreaterThanOrEqual(5);
    for (const item of itemsWithColor) {
      expect((item as any).color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("文字色 snippets contain span style tags", () => {
    const colorCat = MARKDOWN_REFERENCE.find(c => c.category === "文字色")!;
    for (const item of colorCat.items) {
      expect(item.snippet).toContain("<span");
      expect(item.snippet).toContain("style=");
    }
  });

  it("all snippets in Mermaid/PlantUML categories contain code fences", () => {
    const diagramCats = MARKDOWN_REFERENCE.filter(c => c.category === "Mermaid" || c.category === "PlantUML");
    for (const cat of diagramCats) {
      for (const item of cat.items) {
        expect(item.snippet).toContain("```");
      }
    }
  });
});
