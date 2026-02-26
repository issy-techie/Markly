import { describe, it, expect } from "vitest";
import { extractHeadings } from "./headingExtractor";

describe("extractHeadings", () => {
  it("extracts h1 through h6 headings", () => {
    const text = [
      "# Heading 1",
      "## Heading 2",
      "### Heading 3",
      "#### Heading 4",
      "##### Heading 5",
      "###### Heading 6",
    ].join("\n");

    const headings = extractHeadings(text);

    expect(headings).toHaveLength(6);
    expect(headings[0]).toEqual({
      level: 1,
      text: "Heading 1",
      lineNumber: 1,
      from: 0,
    });
    expect(headings[1]).toEqual({
      level: 2,
      text: "Heading 2",
      lineNumber: 2,
      from: 12,
    });
    expect(headings[5]).toEqual({
      level: 6,
      text: "Heading 6",
      lineNumber: 6,
      from: 70,
    });
  });

  it("returns empty array for empty document", () => {
    expect(extractHeadings("")).toHaveLength(0);
  });

  it("returns empty array for document without headings", () => {
    const text = "This is a paragraph.\n\nAnother paragraph.";
    expect(extractHeadings(text)).toHaveLength(0);
  });

  it("ignores headings without space after #", () => {
    const text = "##no space\n###also no space\n## Valid Heading";
    const headings = extractHeadings(text);

    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Valid Heading");
  });

  it("skips headings inside fenced code blocks (backticks)", () => {
    const text = [
      "# Real Heading",
      "```",
      "# Code Comment",
      "## Another Code Comment",
      "```",
      "## After Code Block",
    ].join("\n");

    const headings = extractHeadings(text);

    expect(headings).toHaveLength(2);
    expect(headings[0].text).toBe("Real Heading");
    expect(headings[1].text).toBe("After Code Block");
  });

  it("skips headings inside fenced code blocks (tildes)", () => {
    const text = [
      "# Before",
      "~~~",
      "# Inside Tilde Block",
      "~~~",
      "# After",
    ].join("\n");

    const headings = extractHeadings(text);

    expect(headings).toHaveLength(2);
    expect(headings[0].text).toBe("Before");
    expect(headings[1].text).toBe("After");
  });

  it("handles code blocks with language specifier", () => {
    const text = [
      "# Title",
      "```javascript",
      "// # Not a heading",
      "```",
      "## Section",
    ].join("\n");

    const headings = extractHeadings(text);

    expect(headings).toHaveLength(2);
    expect(headings[0].text).toBe("Title");
    expect(headings[1].text).toBe("Section");
  });

  it("computes correct line numbers", () => {
    const text = [
      "Some text",
      "",
      "# First",
      "More text",
      "## Second",
    ].join("\n");

    const headings = extractHeadings(text);

    expect(headings).toHaveLength(2);
    expect(headings[0].lineNumber).toBe(3);
    expect(headings[1].lineNumber).toBe(5);
  });

  it("computes correct character offsets", () => {
    const text = "abc\n# Heading";
    // offset: "abc\n" = 4 chars
    const headings = extractHeadings(text);

    expect(headings).toHaveLength(1);
    expect(headings[0].from).toBe(4);
  });

  it("trims trailing whitespace from heading text", () => {
    const text = "# Heading with trailing space   ";
    const headings = extractHeadings(text);

    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Heading with trailing space");
  });

  it("ignores lines with more than 6 # characters", () => {
    const text = "####### Not a heading\n# Valid";
    const headings = extractHeadings(text);

    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Valid");
  });

  it("handles mixed content with headings", () => {
    const text = [
      "# Introduction",
      "",
      "Some paragraph text here.",
      "",
      "## Background",
      "",
      "- list item 1",
      "- list item 2",
      "",
      "### Details",
      "",
      "More text.",
    ].join("\n");

    const headings = extractHeadings(text);

    expect(headings).toHaveLength(3);
    expect(headings.map((h) => h.level)).toEqual([1, 2, 3]);
    expect(headings.map((h) => h.text)).toEqual([
      "Introduction",
      "Background",
      "Details",
    ]);
  });
});
