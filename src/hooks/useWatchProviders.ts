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
 * Fetches streaming provider availability for a given title across all
 * selected countries. Wraps the TanStack Query so Details screen stays clean.
 *
 * The query is disabled for persons and when no country has been selected,
 * since neither case has a meaningful result from the providers endpoint.
 */
export function useWatchProviders(
  id: string,
  mediaType: MediaType,
  countries: SelectedCountry[],
): UseWatchProvidersResult {
  const { data, isLoading, isError } = useQuery<WatchProvidersData[]>({
    queryKey: ["providers", id, mediaType, countries.map((c) => c.code)],
    queryFn: () => tmdbApi.getWatchProviders(id, mediaType, countries),
    enabled: mediaType !== "person" && countries.length > 0,
  });

  return {
    providers: data ?? [],
    isLoading,
    isError,
  };
}
