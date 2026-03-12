import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { tmdbApi } from "@/services/api";
import { SearchedItem } from "@/types/searchedItem";

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 3;
const STALE_TIME_MS = 1000 * 60 * 5; // 5 minutes

type UseSearchResult = {
  query: string;
  setQuery: (q: string) => void;
  results: SearchedItem[];
  isLoading: boolean;
  isError: boolean;
  hasSearched: boolean;
};

/**
 * Encapsulates search state and TMDB query logic.
 *
 * Uses useEffect to debounce the raw input before firing the API call,
 * so we don't send a request on every keystroke. The raw `query` drives
 * the input, while `debouncedQuery` drives the actual fetch.
 */
export function useSearch(): UseSearchResult {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce: wait DEBOUNCE_MS after the user stops typing before updating
  // debouncedQuery. The cleanup function clears the timer if the user keeps
  // typing, so only the final value triggers a fetch.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isFetching, isError } = useQuery<SearchedItem[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: () => tmdbApi.searchItem(debouncedQuery),
    enabled: debouncedQuery.length >= MIN_QUERY_LENGTH,
    staleTime: STALE_TIME_MS,
  });

  return {
    query,
    setQuery,
    results: data ?? [],
    isLoading: isLoading || isFetching,
    isError,
    hasSearched: debouncedQuery.length >= MIN_QUERY_LENGTH,
  };
}
