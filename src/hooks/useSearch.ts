import { useState, useCallback, useEffect, useRef } from "react";
import type { EditorView } from "@codemirror/view";

export const useSearch = (editorViewRef: { current: EditorView | null }) => {
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [searchCaseSensitive, setSearchCaseSensitive] = useState(false);
  const [searchUseRegex, setSearchUseRegex] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [searchDialogPos, setSearchDialogPos] = useState({ x: 100, y: 100 });
  const [isDraggingDialog, setIsDraggingDialog] = useState(false);
  const dialogDragOffset = useRef({ x: 0, y: 0 });

  const findMatches = useCallback(() => {
    if (!editorViewRef.current || !searchQuery) {
      setMatchCount(0);
      return [];
    }
    const doc = editorViewRef.current.state.doc.toString();
    const matches: { from: number; to: number }[] = [];
    try {
      if (searchUseRegex) {
        const flags = searchCaseSensitive ? "g" : "gi";
        const regex = new RegExp(searchQuery, flags);
        let match;
        while ((match = regex.exec(doc)) !== null) {
          matches.push({ from: match.index, to: match.index + match[0].length });
        }
      } else {
        const searchStr = searchCaseSensitive ? searchQuery : searchQuery.toLowerCase();
        const searchIn = searchCaseSensitive ? doc : doc.toLowerCase();
        let pos = 0;
        while ((pos = searchIn.indexOf(searchStr, pos)) !== -1) {
          matches.push({ from: pos, to: pos + searchQuery.length });
          pos += searchQuery.length;
        }
      }
    } catch (e) {
      // Ignore invalid regex
    }
    setMatchCount(matches.length);
    return matches;
  }, [searchQuery, searchCaseSensitive, searchUseRegex, editorViewRef]);

  const highlightAndGoToMatch = useCallback((direction: "next" | "prev") => {
    const matches = findMatches();
    if (matches.length === 0) return;

    let newIndex = currentMatchIndex;
    if (direction === "next") {
      newIndex = (currentMatchIndex + 1) % matches.length;
    } else {
      newIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    }
    setCurrentMatchIndex(newIndex);

    const match = matches[newIndex];
    if (editorViewRef.current && match) {
      editorViewRef.current.dispatch({
        selection: { anchor: match.from, head: match.to },
        scrollIntoView: true
      });
      editorViewRef.current.focus();
    }
  }, [findMatches, currentMatchIndex, editorViewRef]);

  const replaceCurrentMatch = useCallback(() => {
    const matches = findMatches();
    if (matches.length === 0 || !editorViewRef.current) return;

    const match = matches[currentMatchIndex];
    if (match) {
      editorViewRef.current.dispatch({
        changes: { from: match.from, to: match.to, insert: replaceQuery }
      });
    }
  }, [findMatches, currentMatchIndex, replaceQuery, editorViewRef]);

  const replaceAllMatches = useCallback(() => {
    const matches = findMatches();
    if (matches.length === 0 || !editorViewRef.current) return;

    // Replace from back to front to avoid index shift
    const reversedMatches = [...matches].reverse();
    const changes = reversedMatches.map(m => ({
      from: m.from,
      to: m.to,
      insert: replaceQuery
    }));
    editorViewRef.current.dispatch({ changes });
    setMatchCount(0);
    setCurrentMatchIndex(0);
  }, [findMatches, replaceQuery, editorViewRef]);

  const handleDialogDragStart = useCallback((e: React.MouseEvent) => {
    setIsDraggingDialog(true);
    dialogDragOffset.current = {
      x: e.clientX - searchDialogPos.x,
      y: e.clientY - searchDialogPos.y
    };
  }, [searchDialogPos]);

  // Update search results
  useEffect(() => {
    if (showSearchDialog) {
      findMatches();
      setCurrentMatchIndex(0);
    }
  }, [searchQuery, searchCaseSensitive, searchUseRegex, showSearchDialog, findMatches]);

  // Dialog drag handling
  useEffect(() => {
    if (!isDraggingDialog) return;
    const handleMove = (e: MouseEvent) => {
      setSearchDialogPos({
        x: e.clientX - dialogDragOffset.current.x,
        y: e.clientY - dialogDragOffset.current.y
      });
    };
    const handleUp = () => setIsDraggingDialog(false);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [isDraggingDialog]);

  return {
    showSearchDialog, setShowSearchDialog,
    searchQuery, setSearchQuery,
    replaceQuery, setReplaceQuery,
    searchCaseSensitive, setSearchCaseSensitive,
    searchUseRegex, setSearchUseRegex,
    matchCount,
    currentMatchIndex,
    searchDialogPos,
    findMatches,
    highlightAndGoToMatch,
    replaceCurrentMatch,
    replaceAllMatches,
    handleDialogDragStart,
  };
};
