import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/api";
import { Provider } from "@/types/providers";

type UseProvidersByCountryResult = {
  /** The list of streaming providers available in the given country.
   * Empty while loading or on error. */
  providers: Provider[];
  /** True while the request is in-flight. */
  isLoading: boolean;
  /** True if the request failed (network error, TMDB error, etc.). */
  isError: boolean;
};

/**
 * Fetches all streaming providers available in a specific country.
 *
 * Wraps the TanStack Query for the ["providers-by-country", countryCode] key
 * so SubscriptionPickerModal does not call useQuery directly, keeping it
 * consistent with useWatchProviders and useSearch.
 *
 * @param countryCode - An ISO 3166-1 alpha-2 country code (e.g. "SE", "US").
 *                      The query is disabled when countryCode is an empty string,
 *                      which occurs in SubscriptionPickerModal when the user has
 *                      multiple countries and has not selected an active tab yet.
 * @returns A UseProvidersByCountryResult with providers, isLoading, and isError.
 *
 * Results are cached by countryCode — switching between country tabs in
 * SubscriptionPickerModal reuses cached responses without a new network request.
 */
export function useProvidersByCountry(
  countryCode: string,
): UseProvidersByCountryResult {
  const { data, isLoading, isError } = useQuery<Provider[]>({
    queryKey: ["providers-by-country", countryCode],
    queryFn: () => tmdbApi.getProvidersByCountry(countryCode),
    // Skip the query when no country is selected yet.
    enabled: countryCode.length > 0,
  });

  return {
    providers: data ?? [],
    isLoading,
    isError,
  };
}
