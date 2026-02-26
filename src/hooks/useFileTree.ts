import { useState, useCallback, useEffect } from "react";
import { readDir } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { FileEntry } from "../types";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "../constants";
import { joinPath } from "../utils/pathHelpers";

interface UseFileTreeOptions {
  addToast: (message: string, type: "success" | "error" | "warning" | "info") => void;
}

/** Load only the immediate children of a directory (no recursion) */
const loadDirectoryShallow = async (
  dirPath: string,
  addToast: UseFileTreeOptions["addToast"]
): Promise<FileEntry[]> => {
  try {
    const entries = await readDir(dirPath);
    const tree: FileEntry[] = [];

    for (const entry of entries) {
      if (entry.name?.startsWith('.')) continue;

      const fullPath = joinPath(dirPath, entry.name!);

      const item: FileEntry = {
        name: entry.name || "",
        path: fullPath,
        isDirectory: entry.isDirectory,
        // Directories start with children: undefined (lazy, loaded on expand)
      };

      const ext = item.name.toLowerCase().substring(item.name.lastIndexOf('.'));
      // Include folders, .md files, image files, and video files in the tree
      if (item.isDirectory || item.name.endsWith(".md") || IMAGE_EXTENSIONS.includes(ext) || VIDEO_EXTENSIONS.includes(ext)) {
        tree.push(item);
      }
    }
    return tree.sort(
      (a, b) => (b.isDirectory ? 1 : -1) - (a.isDirectory ? 1 : -1) || a.name.localeCompare(b.name)
    );
  } catch (e) {
    console.error("Folder read error:", e);
    addToast("フォルダの読み込みに失敗しました", "error");
    return [];
  }
};

/** Pure function: update a node's children at a target path within a tree */
export const updateTreeNode = (
  nodes: FileEntry[],
  targetPath: string,
  children: FileEntry[]
): FileEntry[] => {
  return nodes.map(node => {
    if (node.path === targetPath) {
      return { ...node, children };
    }
    if (node.isDirectory && node.children && targetPath.startsWith(node.path + '/') || node.isDirectory && node.children && targetPath.startsWith(node.path + '\\')) {
      return { ...node, children: updateTreeNode(node.children, targetPath, children) };
    }
    return node;
  });
};

/** Check if a node's children have been loaded */
const findNodeChildren = (nodes: FileEntry[], targetPath: string): FileEntry[] | undefined => {
  for (const node of nodes) {
    if (node.path === targetPath) return node.children;
    if (node.isDirectory && node.children) {
      const result = findNodeChildren(node.children, targetPath);
      if (result !== undefined) return result;
    }
  }
  return undefined;
};

export const useFileTree = ({ addToast }: UseFileTreeOptions) => {
  const [fileTree, setFileTree] = useState<FileEntry[]>([]);
  const [projectRoot, setProjectRoot] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());

  // Shallow directory load (single level)
  const loadDirectory = useCallback(
    (dirPath: string) => loadDirectoryShallow(dirPath, addToast),
    [addToast]
  );

  /** Load children for a specific folder and merge into tree */
  const loadChildren = useCallback(async (folderPath: string) => {
    setLoadingFolders(prev => new Set([...prev, folderPath]));
    try {
      const children = await loadDirectoryShallow(folderPath, addToast);
      setFileTree(prev => updateTreeNode(prev, folderPath, children));
      return children;
    } finally {
      setLoadingFolders(prev => {
        const next = new Set(prev);
        next.delete(folderPath);
        return next;
      });
    }
  }, [addToast]);

  const refreshTree = useCallback(async () => {
    if (projectRoot) {
      setIsRefreshing(true);
      try {
        // Reload root level with minimum animation duration
        const [rootTree] = await Promise.all([
          loadDirectory(projectRoot),
          new Promise(resolve => setTimeout(resolve, 500))
        ]);

        // Reload children for all currently expanded folders (parent-first order)
        const sortedExpanded = Array.from(expandedFolders).sort(
          (a, b) => a.length - b.length
        );

        let currentTree = rootTree;
        for (const folderPath of sortedExpanded) {
          try {
            const children = await loadDirectoryShallow(folderPath, addToast);
            currentTree = updateTreeNode(currentTree, folderPath, children);
          } catch {
            // Folder may have been deleted; skip
          }
        }
        setFileTree(currentTree);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [projectRoot, loadDirectory, expandedFolders, addToast]);

  const openFolder = useCallback(async () => {
    const selected = await open({ directory: true });
    if (selected && typeof selected === "string") {
      setProjectRoot(selected);
      const tree = await loadDirectory(selected);
      setFileTree(tree);
      setExpandedFolders(new Set());
    }
  }, [loadDirectory]);

  // Display directory path in window title
  useEffect(() => {
    const title = projectRoot ? `Markly - ${projectRoot}` : "Markly";
    getCurrentWindow().setTitle(title);
  }, [projectRoot]);

  return {
    fileTree, setFileTree,
    projectRoot, setProjectRoot,
    expandedFolders, setExpandedFolders,
    isRefreshing,
    loadingFolders,
    loadDirectory,
    loadChildren,
    refreshTree,
    openFolder,
    findNodeChildren,
  };
};
