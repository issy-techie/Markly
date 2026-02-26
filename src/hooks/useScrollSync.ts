import { useEffect, useRef, useCallback } from "react";
import type { EditorView } from "@codemirror/view";

interface UseScrollSyncOptions {
  editorViewRef: React.RefObject<EditorView | null>;
  previewRef: React.RefObject<HTMLDivElement | null>;
  enabled: boolean;
  /** Forces effect re-run on tab switch (scrollDOM is recreated) */
  activeTabId: string | null;
  /** Forces effect re-run when the CM editor view is first created */
  editorMountCount?: number;
}

/**
 * Synchronize scroll positions between the CodeMirror editor and the
 * Markdown preview pane using a percentage-based mapping.
 *
 * Loop prevention: `isSyncingRef` flag is set before programmatic scrolls
 * and reset after the next animation frame, ensuring the reciprocal scroll
 * event is ignored.
 */
export const useScrollSync = ({
  editorViewRef,
  previewRef,
  enabled,
  activeTabId,
  editorMountCount,
}: UseScrollSyncOptions) => {
  const isSyncingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  /** Compute scroll percentage (0.0 – 1.0) */
  const getScrollPercent = useCallback((el: HTMLElement): number => {
    const max = el.scrollHeight - el.clientHeight;
    return max <= 0 ? 0 : el.scrollTop / max;
  }, []);

  /** Set scroll position from a percentage */
  const setScrollPercent = useCallback((el: HTMLElement, percent: number) => {
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) return;
    el.scrollTop = percent * max;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const editorScrollDOM = editorViewRef.current?.scrollDOM;
    const previewDOM = previewRef.current;
    if (!editorScrollDOM || !previewDOM) return;

    const handleEditorScroll = () => {
      if (isSyncingRef.current) return;
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const percent = getScrollPercent(editorScrollDOM);
        isSyncingRef.current = true;
        setScrollPercent(previewDOM, percent);
        requestAnimationFrame(() => { isSyncingRef.current = false; });
      });
    };

    const handlePreviewScroll = () => {
      if (isSyncingRef.current) return;
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const percent = getScrollPercent(previewDOM);
        isSyncingRef.current = true;
        setScrollPercent(editorScrollDOM, percent);
        requestAnimationFrame(() => { isSyncingRef.current = false; });
      });
    };

    editorScrollDOM.addEventListener("scroll", handleEditorScroll, { passive: true });
    previewDOM.addEventListener("scroll", handlePreviewScroll, { passive: true });

    return () => {
      editorScrollDOM.removeEventListener("scroll", handleEditorScroll);
      previewDOM.removeEventListener("scroll", handlePreviewScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      isSyncingRef.current = false;
    };
  }, [enabled, activeTabId, editorMountCount, editorViewRef, previewRef, getScrollPercent, setScrollPercent]);
};
