import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Text, Link, PhrasingContent } from "mdast";

const WIKI_LINK_REGEX = /\[\[([^\[\]]+?)\]\]/g;

/**
 * A remark plugin that transforms [[filename]] wiki-link syntax into
 * link nodes with a custom `wikilink:` URL scheme.
 *
 * Only `text` nodes are processed, so content inside code blocks
 * and inline code is automatically skipped.
 */
const remarkWikiLink: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const value = node.value;
      const matches = [...value.matchAll(WIKI_LINK_REGEX)];
      if (matches.length === 0) return;

      const children: PhrasingContent[] = [];
      let lastIndex = 0;

      for (const match of matches) {
        const matchStart = match.index!;
        const matchEnd = matchStart + match[0].length;
        const linkTarget = match[1]; // content inside [[ ]]

        // Text before the match
        if (matchStart > lastIndex) {
          children.push({
            type: "text",
            value: value.slice(lastIndex, matchStart),
          });
        }

        // Wiki link → link node with wikilink: scheme
        const linkNode: Link = {
          type: "link",
          url: `wikilink:${linkTarget}`,
          children: [{ type: "text", value: linkTarget }],
          data: {
            hProperties: {
              className: "wiki-link",
              "data-wiki-target": linkTarget,
            },
          },
        };
        children.push(linkNode);

        lastIndex = matchEnd;
      }

      // Remaining text after last match
      if (lastIndex < value.length) {
        children.push({
          type: "text",
          value: value.slice(lastIndex),
        });
      }

      // Replace the original text node with the new children
      parent.children.splice(index, 1, ...(children as any[]));
    });
  };
};

export default remarkWikiLink;
