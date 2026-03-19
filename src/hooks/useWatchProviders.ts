import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/api";
import { SelectedCountry, WatchProvidersData } from "@/types/providers";

type MediaType = "movie" | "tv" | "person";

type UseWatchProvidersResult = {
  /** The array of streaming provider data, one entry per country.
   * Empty while loading or on error. */
  providers: WatchProvidersData[];
  /** True while the request is in-flight. */
  isLoading: boolean;
  /** True if the request failed (network error, TMDB error, etc.). */
  isError: boolean;
};

/**
 * Fetches streaming provider availability for a given title.
 *
 * Wraps TanStack Query so the Details screen stays clean and does not
 * need to manage queryKey construction or handle the person edge case.
 *
 * @param id - The TMDB id of the title as a string (Expo Router params are strings).
 * @param mediaType - "movie" | "tv" | "person". The query is disabled entirely
 *                    for persons since the providers endpoint does not apply to them.
 * @param countries - Array of SelectedCountry objects selected by the user.
 *   - Empty array (global mode): all available countries are returned, sorted
 *     alphabetically. Handled entirely inside tmdbApi.getWatchProviders.
 *   - Non-empty (filtered mode): only the selected countries are returned.
 * @returns A UseWatchProvidersResult with providers, isLoading, and isError.
 *
 * The queryKey includes the array of country codes so TanStack Query correctly
 * invalidates and refetches when the user changes their country selection.
 */
export function useWatchProviders(
  id: string,
  mediaType: MediaType,
  countries: SelectedCountry[],
): UseWatchProvidersResult {
  const { data, isLoading, isError } = useQuery<WatchProvidersData[]>({
    queryKey: ["providers", id, mediaType, countries.map((c) => c.code)],
    queryFn: () => tmdbApi.getWatchProviders(id, mediaType, countries),
    // The providers endpoint does not exist for persons — skip the query entirely.
    enabled: mediaType !== "person",
  });

  return {
    providers: data ?? [],
    isLoading,
    isError,
  };
}
