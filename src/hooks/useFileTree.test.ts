import { describe, it, expect } from "vitest";
import { updateTreeNode } from "./useFileTree";
import type { FileEntry } from "../types";

// --- Helper to create FileEntry objects ---
const file = (name: string, path: string): FileEntry => ({
  name,
  path,
  isDirectory: false,
});

const dir = (name: string, path: string, children?: FileEntry[]): FileEntry => ({
  name,
  path,
  isDirectory: true,
  children,
});

describe("updateTreeNode", () => {
  it("sets children for a top-level folder", () => {
    const tree: FileEntry[] = [
      dir("src", "/project/src"),
      file("readme.md", "/project/readme.md"),
    ];
    const newChildren: FileEntry[] = [
      file("App.tsx", "/project/src/App.tsx"),
      file("main.tsx", "/project/src/main.tsx"),
    ];

    const result = updateTreeNode(tree, "/project/src", newChildren);

    expect(result[0].children).toEqual(newChildren);
    // Original should be unchanged (immutability)
    expect(tree[0].children).toBeUndefined();
  });

  it("updates children for a nested folder (forward slash)", () => {
    const tree: FileEntry[] = [
      dir("src", "/project/src", [
        dir("components", "/project/src/components", []),
        file("App.tsx", "/project/src/App.tsx"),
      ]),
    ];
    const newChildren: FileEntry[] = [
      file("Button.tsx", "/project/src/components/Button.tsx"),
    ];

    const result = updateTreeNode(tree, "/project/src/components", newChildren);

    expect(result[0].children![0].children).toEqual(newChildren);
  });

  it("updates children for a nested folder (backslash)", () => {
    const tree: FileEntry[] = [
      dir("src", "C:\\project\\src", [
        dir("hooks", "C:\\project\\src\\hooks", []),
      ]),
    ];
    const newChildren: FileEntry[] = [
      file("useConfig.ts", "C:\\project\\src\\hooks\\useConfig.ts"),
    ];

    const result = updateTreeNode(tree, "C:\\project\\src\\hooks", newChildren);

    expect(result[0].children![0].children).toEqual(newChildren);
  });

  it("returns the same structure when targetPath is not found", () => {
    const tree: FileEntry[] = [
      dir("src", "/project/src"),
      file("readme.md", "/project/readme.md"),
    ];
    const newChildren: FileEntry[] = [file("x.md", "/x.md")];

    const result = updateTreeNode(tree, "/nonexistent", newChildren);

    expect(result).toEqual(tree);
  });

  it("does not mutate the original tree", () => {
    const originalChildren = [file("old.tsx", "/project/src/old.tsx")];
    const tree: FileEntry[] = [
      dir("src", "/project/src", [...originalChildren]),
    ];
    const newChildren: FileEntry[] = [
      file("new.tsx", "/project/src/new.tsx"),
    ];

    const result = updateTreeNode(tree, "/project/src", newChildren);

    // Original tree is unchanged
    expect(tree[0].children).toEqual(originalChildren);
    // New tree has new children
    expect(result[0].children).toEqual(newChildren);
  });

  it("handles deeply nested paths (3+ levels)", () => {
    const tree: FileEntry[] = [
      dir("a", "/a", [
        dir("b", "/a/b", [
          dir("c", "/a/b/c", []),
        ]),
      ]),
    ];
    const newChildren: FileEntry[] = [file("deep.md", "/a/b/c/deep.md")];

    const result = updateTreeNode(tree, "/a/b/c", newChildren);

    expect(result[0].children![0].children![0].children).toEqual(newChildren);
  });

  it("handles empty tree", () => {
    const result = updateTreeNode([], "/some/path", [file("x.md", "/x.md")]);
    expect(result).toEqual([]);
  });

  it("handles folder with undefined children (not yet loaded)", () => {
    const tree: FileEntry[] = [
      dir("src", "/project/src"), // children is undefined (lazy)
    ];
    const newChildren: FileEntry[] = [
      file("App.tsx", "/project/src/App.tsx"),
    ];

    // Direct match still works even without children
    const result = updateTreeNode(tree, "/project/src", newChildren);
    expect(result[0].children).toEqual(newChildren);
  });

  it("does not recurse into folders with undefined children for nested paths", () => {
    const tree: FileEntry[] = [
      dir("src", "/project/src"), // children is undefined
    ];
    const newChildren: FileEntry[] = [
      file("x.ts", "/project/src/sub/x.ts"),
    ];

    // Should not find nested target because parent has no loaded children
    const result = updateTreeNode(tree, "/project/src/sub", newChildren);
    // No match: tree returned as-is
    expect(result[0].children).toBeUndefined();
  });

  it("replaces children entirely, not merging", () => {
    const tree: FileEntry[] = [
      dir("src", "/project/src", [
        file("old1.tsx", "/project/src/old1.tsx"),
        file("old2.tsx", "/project/src/old2.tsx"),
      ]),
    ];
    const newChildren: FileEntry[] = [
      file("new.tsx", "/project/src/new.tsx"),
    ];

    const result = updateTreeNode(tree, "/project/src", newChildren);

    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].name).toBe("new.tsx");
  });
});
