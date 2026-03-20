import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { tmdbApi } from "@/services/api";
import { SearchedItem } from "@/types/searchedItem";

/** Milliseconds to wait after the last keystroke before firing the API request. */
const DEBOUNCE_MS = 350;

/** Minimum number of characters required to trigger a search query. */
const MIN_QUERY_LENGTH = 3;

/** How long TanStack Query keeps search results fresh before refetching. */
const STALE_TIME_MS = 1000 * 60 * 5; // 5 minutes

type UseSearchResult = {
  /** The raw input value — drives the TextInput. */
  query: string;
  /** Setter for query — passed directly to SearchBar's onChangeText. */
  setQuery: (q: string) => void;
  /** The search results from the last completed API call. Empty array while loading or idle. */
  results: SearchedItem[];
  /** True while a request is in-flight or TanStack Query is refetching in the background. */
  isLoading: boolean;
  /** True if the last request failed (network error, TMDB error, etc.). */
  isError: boolean;
  /** The Error object from the failed request, or null if there is no error. */
  error: Error | null;
  /**
   * True once the debounced query has reached MIN_QUERY_LENGTH characters.
   * Used by ExploreScreen to distinguish "user hasn't searched yet" from
   * "search returned no results".
   */
  hasSearched: boolean;
};

/**
 * Encapsulates search state and the TMDB multi-search query logic.
 *
 * The hook reads and writes searchQuery from the Zustand store instead of
 * local state — this preserves the query text when the user navigates to
 * details and presses back, without persisting it to AsyncStorage between
 * app sessions.
 *
 * @returns A UseSearchResult object with query, setQuery, results, loading/error
 *          states, and a hasSearched flag.
 *
 * Debounce behavior:
 *   Each time query changes, a timer is set for DEBOUNCE_MS (350ms). If query
 *   changes again before the timer fires, the previous timer is cancelled via
 *   the useEffect cleanup function. Only the final value after the user stops
 *   typing triggers a fetch. This prevents sending a request on every keystroke.
 *
 * Query enabling:
 *   The TanStack Query is only enabled when debouncedQuery.length >= MIN_QUERY_LENGTH (3).
 *   Shorter queries are not sent to the API.
 *
 * Caching:
 *   Results are cached by debouncedQuery for STALE_TIME_MS (5 minutes). Typing
 *   the same query again within that window returns the cached result instantly.
 */
export function useSearch(): UseSearchResult {
  const { searchQuery: query, setSearchQuery: setQuery } = useUserStore();
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

  const { data, isLoading, isFetching, isError, error } = useQuery<
    SearchedItem[],
    Error
  >({
    queryKey: ["search", debouncedQuery], // Cache key — if it already exists, no re-fetch
    queryFn: () => tmdbApi.searchItem(debouncedQuery), // What to fetch
    enabled: debouncedQuery.length >= MIN_QUERY_LENGTH, // Condition to perform fetch
    staleTime: STALE_TIME_MS, // How long cache is used to avoid re-fetch and existing key
  });

  return {
    query,
    setQuery,
    results: data ?? [],
    // Combine isLoading (no data yet) and isFetching (background refresh)
    // so the SearchBar spinner appears in both cases.
    isLoading: isLoading || isFetching,
    isError,
    error: error ?? null,
    hasSearched: debouncedQuery.length >= MIN_QUERY_LENGTH,
  };
}
