import {
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
  MatchDecorator,
} from "@codemirror/view";

/**
 * CodeMirror 6 extension that highlights [[wiki link]] syntax
 * with a distinctive decoration (`.cm-wiki-link` CSS class).
 *
 * Uses MatchDecorator for efficient incremental updates.
 */
const wikiLinkMatcher = new MatchDecorator({
  regexp: /\[\[([^\[\]]+?)\]\]/g,
  decoration: Decoration.mark({ class: "cm-wiki-link" }),
});

export const wikiLinkHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: any) {
      this.decorations = wikiLinkMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.decorations = wikiLinkMatcher.updateDeco(update, this.decorations);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);
