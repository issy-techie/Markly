import { useState, useCallback, useRef, useEffect } from "react";

interface UseTabDragDropOptions {
  tabs: { id: string }[];
  selectedTabIds: Set<string>;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  reorderMultipleTabs: (draggedIds: string[], dropTargetId: string, position: "before" | "after") => void;
}

interface UseTabDragDropReturn {
  draggedIndex: number | null;
  /** All tab IDs being dragged (includes selected tabs when multi-dragging) */
  draggedIds: string[];
  dropTargetIndex: number | null;
  dropPosition: "before" | "after" | null;
  /** Mouse position for rendering drag ghost */
  dragClientX: number;
  dragClientY: number;
  /** Total width of all dragged tabs for ghost sizing and slide offset */
  draggedTotalWidth: number;
  handleTabMouseDown: (e: React.MouseEvent, index: number) => void;
}

// Minimum pixels of mouse movement before a drag is considered started.
// This prevents accidental drags from interfering with click-to-switch.
const DRAG_THRESHOLD = 5;

export const useTabDragDrop = ({
  tabs,
  selectedTabIds,
  reorderTabs,
  reorderMultipleTabs,
}: UseTabDragDropOptions): UseTabDragDropReturn => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedIds, setDraggedIds] = useState<string[]>([]);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const [dragClientX, setDragClientX] = useState(0);
  const [dragClientY, setDragClientY] = useState(0);
  const [draggedTotalWidth, setDraggedTotalWidth] = useState(0);

  // Refs to avoid stale closures in global mousemove/mouseup listeners
  const dragStateRef = useRef<{
    fromIndex: number;
    startX: number;
    startY: number;
    isDragging: boolean;
    tabElements: HTMLElement[];
    /** IDs of all tabs being dragged */
    dragIds: string[];
  } | null>(null);

  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  const reorderTabsRef = useRef(reorderTabs);
  reorderTabsRef.current = reorderTabs;

  const reorderMultipleTabsRef = useRef(reorderMultipleTabs);
  reorderMultipleTabsRef.current = reorderMultipleTabs;

  const resetState = useCallback(() => {
    setDraggedIndex(null);
    setDraggedIds([]);
    setDropTargetIndex(null);
    setDropPosition(null);
    setDragClientX(0);
    setDragClientY(0);
    setDraggedTotalWidth(0);
    dragStateRef.current = null;
    document.body.style.cursor = "";
  }, []);

  // Compute drop target from current mouse position
  const computeDropTarget = useCallback((clientX: number) => {
    const state = dragStateRef.current;
    if (!state) return;

    const { tabElements, dragIds } = state;
    const dragIdSet = new Set(dragIds);
    let foundIndex: number | null = null;
    let foundPosition: "before" | "after" | null = null;

    for (let i = 0; i < tabElements.length; i++) {
      // Skip tabs that are being dragged
      if (dragIdSet.has(tabsRef.current[i]?.id)) continue;
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
      setDraggedIds(state.dragIds);

      // Compute total width of all dragged tabs
      const dragIdSet = new Set(state.dragIds);
      let totalWidth = 0;
      state.tabElements.forEach((el, i) => {
        if (dragIdSet.has(tabsRef.current[i]?.id)) {
          totalWidth += el.offsetWidth + 2; // +2 for gap
        }
      });
      setDraggedTotalWidth(totalWidth);

      document.body.style.cursor = "grabbing";
    }

    setDragClientX(e.clientX);
    setDragClientY(e.clientY);
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

    const { fromIndex, tabElements, dragIds } = state;
    const dragIdSet = new Set(dragIds);
    const isMulti = dragIds.length > 1;

    // Determine final drop position
    let targetTabId: string | null = null;
    let finalPosition: "before" | "after" | null = null;

    for (let i = 0; i < tabElements.length; i++) {
      if (dragIdSet.has(tabsRef.current[i]?.id)) continue;
      const rect = tabElements[i].getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        const midpoint = rect.left + rect.width / 2;
        targetTabId = tabsRef.current[i]?.id ?? null;
        finalPosition = e.clientX < midpoint ? "before" : "after";
        break;
      }
    }

    if (targetTabId && finalPosition) {
      if (isMulti) {
        reorderMultipleTabsRef.current(dragIds, targetTabId, finalPosition);
      } else {
        // Single tab: use existing reorderTabs logic
        const targetIndex = tabsRef.current.findIndex(t => t.id === targetTabId);
        if (targetIndex >= 0) {
          let toIndex = finalPosition === "before" ? targetIndex : targetIndex + 1;
          if (fromIndex < toIndex) toIndex -= 1;
          toIndex = Math.max(0, Math.min(tabsRef.current.length - 1, toIndex));
          if (toIndex !== fromIndex) {
            reorderTabsRef.current(fromIndex, toIndex);
          }
        }
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

    // Ignore Ctrl+click and Shift+click (used for multi-select)
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    // Collect all tab elements (direct children of the scrollable container)
    const tabElement = e.currentTarget as HTMLElement;
    const container = tabElement.parentElement;
    if (!container) return;

    const tabElements = Array.from(container.children) as HTMLElement[];

    // Determine which tabs to drag
    const clickedTabId = tabsRef.current[index]?.id;
    let dragIds: string[];

    if (clickedTabId && selectedTabIds.has(clickedTabId) && selectedTabIds.size > 1) {
      // Clicked tab is part of a multi-selection: drag all selected tabs
      // Preserve their order in the tab bar
      dragIds = tabsRef.current
        .filter(t => selectedTabIds.has(t.id))
        .map(t => t.id);
    } else {
      // Single tab drag
      dragIds = clickedTabId ? [clickedTabId] : [];
    }

    dragStateRef.current = {
      fromIndex: index,
      startX: e.clientX,
      startY: e.clientY,
      isDragging: false,
      tabElements,
      dragIds,
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp, selectedTabIds]);

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
    draggedIds,
    dropTargetIndex,
    dropPosition,
    dragClientX,
    dragClientY,
    draggedTotalWidth,
    handleTabMouseDown,
  };
};
