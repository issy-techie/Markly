import { useState, useCallback, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ProjectSearchMatch, ProjectSearchFileGroup } from "../types";

export const useProjectSearch = (projectRoot: string | null) => {
  const [query, setQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [results, setResults] = useState<ProjectSearchFileGroup[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the latest request to discard stale results
  const searchIdRef = useRef(0);

  const executeSearch = useCallback(async (
    q: string,
    cs: boolean,
    re: boolean,
  ) => {
    if (!projectRoot || !q.trim()) {
      setResults([]);
      setTotalMatches(0);
      setError(null);
      setIsSearching(false);
      return;
    }

    const currentId = ++searchIdRef.current;
    setIsSearching(true);
    setError(null);

    try {
      const matches = await invoke<ProjectSearchMatch[]>("search_in_project", {
        rootPath: projectRoot,
        query: q,
        caseSensitive: cs,
        useRegex: re,
      });

      // Discard if a newer search has been triggered
      if (currentId !== searchIdRef.current) return;

      // Group matches by file
      const groupMap = new Map<string, ProjectSearchFileGroup>();
      for (const m of matches) {
        let group = groupMap.get(m.file_path);
        if (!group) {
          group = { filePath: m.file_path, fileName: m.file_name, matches: [] };
          groupMap.set(m.file_path, group);
        }
        group.matches.push(m);
      }

      setResults(Array.from(groupMap.values()));
      setTotalMatches(matches.length);
    } catch (err: unknown) {
      if (currentId !== searchIdRef.current) return;
      setError(String(err));
      setResults([]);
      setTotalMatches(0);
    } finally {
      if (currentId === searchIdRef.current) {
        setIsSearching(false);
      }
    }
  }, [projectRoot]);

  // Debounced search trigger
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setTotalMatches(0);
      setError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      executeSearch(query, caseSensitive, useRegex);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, caseSensitive, useRegex, executeSearch]);

  // Clear on project root change
  useEffect(() => {
    setQuery("");
    setResults([]);
    setTotalMatches(0);
    setError(null);
    setIsSearching(false);
  }, [projectRoot]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setTotalMatches(0);
    setError(null);
  }, []);

  return {
    query, setQuery,
    caseSensitive, setCaseSensitive,
    useRegex, setUseRegex,
    results,
    totalMatches,
    isSearching,
    error,
    clearSearch,
  };
};
