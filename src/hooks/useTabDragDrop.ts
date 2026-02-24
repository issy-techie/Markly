import { useState, useCallback, useRef, useEffect } from "react";

interface UseTabDragDropOptions {
  tabs: { id: string }[];
  reorderTabs: (fromIndex: number, toIndex: number) => void;
}

interface UseTabDragDropReturn {
  draggedIndex: number | null;
  dropTargetIndex: number | null;
  dropPosition: "before" | "after" | null;
  handleTabMouseDown: (e: React.MouseEvent, index: number) => void;
}

// Minimum pixels of mouse movement before a drag is considered started.
// This prevents accidental drags from interfering with click-to-switch.
const DRAG_THRESHOLD = 5;

export const useTabDragDrop = ({ tabs, reorderTabs }: UseTabDragDropOptions): UseTabDragDropReturn => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);

  // Refs to avoid stale closures in global mousemove/mouseup listeners
  const dragStateRef = useRef<{
    fromIndex: number;
    startX: number;
    isDragging: boolean;
    tabElements: HTMLElement[];
  } | null>(null);

  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  const reorderTabsRef = useRef(reorderTabs);
  reorderTabsRef.current = reorderTabs;

  const resetState = useCallback(() => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
    setDropPosition(null);
    dragStateRef.current = null;
    document.body.style.cursor = "";
  }, []);

  // Compute drop target from current mouse position
  const computeDropTarget = useCallback((clientX: number) => {
    const state = dragStateRef.current;
    if (!state) return;

    const { fromIndex, tabElements } = state;
    let foundIndex: number | null = null;
    let foundPosition: "before" | "after" | null = null;

    for (let i = 0; i < tabElements.length; i++) {
      if (i === fromIndex) continue;
      const rect = tabElements[i].getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        const midpoint = rect.left + rect.width / 2;
        foundIndex = i;
        foundPosition = clientX < midpoint ? "before" : "after";
        break;
      }
    }

    setDropTargetIndex(foundIndex);
    setDropPosition(foundPosition);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const state = dragStateRef.current;
    if (!state) return;

    if (!state.isDragging) {
      // Check if mouse has moved enough to start dragging
      if (Math.abs(e.clientX - state.startX) < DRAG_THRESHOLD) return;
      state.isDragging = true;
      setDraggedIndex(state.fromIndex);
      document.body.style.cursor = "grabbing";
    }

    computeDropTarget(e.clientX);
  }, [computeDropTarget]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    const state = dragStateRef.current;
    if (!state || !state.isDragging) {
      // Drag never started (click without sufficient movement)
      resetState();
      return;
    }

    const { fromIndex, tabElements } = state;

    // Determine final drop position
    let toIndex: number | null = null;
    for (let i = 0; i < tabElements.length; i++) {
      if (i === fromIndex) continue;
      const rect = tabElements[i].getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        const midpoint = rect.left + rect.width / 2;
        const insertBefore = e.clientX < midpoint;
        toIndex = insertBefore ? i : i + 1;
        break;
      }
    }

    if (toIndex !== null) {
      // Adjust for removal of the dragged item
      if (fromIndex < toIndex) {
        toIndex -= 1;
      }
      toIndex = Math.max(0, Math.min(tabsRef.current.length - 1, toIndex));
      if (toIndex !== fromIndex) {
        reorderTabsRef.current(fromIndex, toIndex);
      }
    }

    resetState();
  }, [handleMouseMove, resetState]);

  const handleTabMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    // Only respond to left mouse button
    if (e.button !== 0) return;

    // Ignore clicks on the close button
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    // Collect all tab elements (direct children of the scrollable container)
    const tabElement = e.currentTarget as HTMLElement;
    const container = tabElement.parentElement;
    if (!container) return;

    const tabElements = Array.from(container.children) as HTMLElement[];

    dragStateRef.current = {
      fromIndex: index,
      startX: e.clientX,
      isDragging: false,
      tabElements,
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    draggedIndex,
    dropTargetIndex,
    dropPosition,
    handleTabMouseDown,
  };
};
