import { describe, it, expect } from "vitest";
import {
  RESIZE,
  DEFAULT_CONFIG,
  FONT_OPTIONS,
  PREVIEW_FONT_OPTIONS,
  IMAGE_EXTENSIONS,
  getMarkdownReference,
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

describe("getMarkdownReference", () => {
  const jaRef = getMarkdownReference("ja");
  const enRef = getMarkdownReference("en");

  it("returns data for both languages", () => {
    expect(jaRef.length).toBeGreaterThan(0);
    expect(enRef.length).toBeGreaterThan(0);
  });

  it("both languages have the same category IDs", () => {
    const jaIds = jaRef.map(c => c.id);
    const enIds = enRef.map(c => c.id);
    expect(jaIds).toEqual(enIds);
  });

  it("each category has id, non-empty name, and items", () => {
    for (const ref of [jaRef, enRef]) {
      for (const cat of ref) {
        expect(cat.id).toBeTruthy();
        expect(cat.category).toBeTruthy();
        expect(cat.items.length).toBeGreaterThan(0);
      }
    }
  });

  it("each item has label, syntax, snippet, and sample", () => {
    for (const ref of [jaRef, enRef]) {
      for (const cat of ref) {
        for (const item of cat.items) {
          expect(item.label).toBeTruthy();
          expect(item.syntax).toBeTruthy();
          expect(item.snippet).toBeTruthy();
          expect(item.sample).toBeTruthy();
        }
      }
    }
  });

  it("both languages have same item count per category", () => {
    for (let i = 0; i < jaRef.length; i++) {
      expect(jaRef[i].items.length).toBe(enRef[i].items.length);
    }
  });

  it("has dedicated Mermaid category with multiple diagram types", () => {
    const jaMermaid = jaRef.find(c => c.id === "mermaid");
    const enMermaid = enRef.find(c => c.id === "mermaid");
    expect(jaMermaid).toBeDefined();
    expect(enMermaid).toBeDefined();
    expect(jaMermaid!.items.length).toBeGreaterThanOrEqual(5);

    const jaLabels = jaMermaid!.items.map(i => i.label);
    expect(jaLabels).toContain("フローチャート");
    expect(jaLabels).toContain("シーケンス図");
    expect(jaLabels).toContain("円グラフ");

    const enLabels = enMermaid!.items.map(i => i.label);
    expect(enLabels).toContain("Flowchart");
    expect(enLabels).toContain("Sequence diagram");
    expect(enLabels).toContain("Pie chart");
  });

  it("has dedicated PlantUML category with multiple diagram types", () => {
    const jaPuml = jaRef.find(c => c.id === "plantuml");
    const enPuml = enRef.find(c => c.id === "plantuml");
    expect(jaPuml).toBeDefined();
    expect(enPuml).toBeDefined();
    expect(jaPuml!.items.length).toBeGreaterThanOrEqual(4);

    const jaLabels = jaPuml!.items.map(i => i.label);
    expect(jaLabels).toContain("シーケンス図");
    expect(jaLabels).toContain("クラス図");

    const enLabels = enPuml!.items.map(i => i.label);
    expect(enLabels).toContain("Sequence diagram");
    expect(enLabels).toContain("Class diagram");
  });

  it("has embed category with iframe items", () => {
    const jaEmbed = jaRef.find(c => c.id === "embeds");
    const enEmbed = enRef.find(c => c.id === "embeds");
    expect(jaEmbed).toBeDefined();
    expect(enEmbed).toBeDefined();

    const jaLabels = jaEmbed!.items.map(i => i.label);
    expect(jaLabels).toContain("YouTube");
    expect(jaLabels).toContain("Google Maps");
    expect(jaLabels).toContain("汎用 iframe");

    const enLabels = enEmbed!.items.map(i => i.label);
    expect(enLabels).toContain("YouTube");
    expect(enLabels).toContain("Google Maps");
    expect(enLabels).toContain("Generic iframe");
  });

  it("has textColor category with preset colors and color picker support", () => {
    const jaColor = jaRef.find(c => c.id === "textColor");
    const enColor = enRef.find(c => c.id === "textColor");
    expect(jaColor).toBeDefined();
    expect(enColor).toBeDefined();
    expect(jaColor!.items.length).toBeGreaterThanOrEqual(6);

    const jaLabels = jaColor!.items.map(i => i.label);
    expect(jaLabels).toContain("赤");
    expect(jaLabels).toContain("青");
    expect(jaLabels).toContain("緑");
    expect(jaLabels).toContain("背景色付き");
    expect(jaLabels).toContain("カスタムカラー");

    const enLabels = enColor!.items.map(i => i.label);
    expect(enLabels).toContain("Red");
    expect(enLabels).toContain("Blue");
    expect(enLabels).toContain("Green");
    expect(enLabels).toContain("Background");
    expect(enLabels).toContain("Custom color");
  });

  it("textColor items with preset colors have valid hex color field", () => {
    for (const ref of [jaRef, enRef]) {
      const colorCat = ref.find(c => c.id === "textColor")!;
      const itemsWithColor = colorCat.items.filter((i: any) => i.color);
      expect(itemsWithColor.length).toBeGreaterThanOrEqual(5);
      for (const item of itemsWithColor) {
        expect((item as any).color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });

  it("textColor snippets contain span style tags", () => {
    for (const ref of [jaRef, enRef]) {
      const colorCat = ref.find(c => c.id === "textColor")!;
      for (const item of colorCat.items) {
        expect(item.snippet).toContain("<span");
        expect(item.snippet).toContain("style=");
      }
    }
  });

  it("all snippets in Mermaid/PlantUML categories contain code fences", () => {
    for (const ref of [jaRef, enRef]) {
      const diagramCats = ref.filter(c => c.id === "mermaid" || c.id === "plantuml");
      for (const cat of diagramCats) {
        for (const item of cat.items) {
          expect(item.snippet).toContain("```");
        }
      }
    }
  });
});
