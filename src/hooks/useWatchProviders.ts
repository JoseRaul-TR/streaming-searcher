import { useQuery } from "@tanstack/react-query";

import { tmdbApi } from "@/services/api";
import { SelectedCountry, WatchProvidersData } from "@/types/providers";

type MediaType = "movie" | "tv" | "person";

type UseWatchProvidersResult = {
  providers: WatchProvidersData[];
  isLoading: boolean;
  isError: boolean;
};

/**
 * Fetches streaming provider availability for a given title.
 *
 * Wraps TanStack Query so the Details screen stays clean.
 *
 * — countries.length > 0: filtered mode — only the selected countries.
 * — countries.length === 0: global mode — all available countries, sorted
 *   alphabetically. Handled entirely in api.getWatchProviders.
 *
 * The query is only disabled for persons since the providers endpoint
 * doesn't apply to them.
 */
export function useWatchProviders(
  id: string,
  mediaType: MediaType,
  countries: SelectedCountry[],
): UseWatchProvidersResult {
  const { data, isLoading, isError } = useQuery<WatchProvidersData[]>({
    queryKey: ["providers", id, mediaType, countries.map((c) => c.code)],
    queryFn: () => tmdbApi.getWatchProviders(id, mediaType, countries),
    // Skip the query if "person"
    enabled: mediaType !== "person",
  });

  return {
    providers: data ?? [],
    isLoading,
    isError,
  };
}
