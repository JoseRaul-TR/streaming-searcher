import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/api";
import { Provider } from "@/types/providers";

type UseProvidersByCountryResult = {
  providers: Provider[];
  isLoading: boolean;
  isError: boolean;
};

/**
 * Fetches all streaming providers available in a given country.
 *
 * Wraps the TanStack Query so SubscriptionPickerModal (and any future
 * consumer) stays clean. The query is disabled when countryCode is empty.
 *
 * Results are cached by countryCode — switching tabs between countries
 * in the modal reuses the cached response without a new network request.
 */
export function useProvidersByCountry(
  countryCode: string,
): UseProvidersByCountryResult {
  const { data, isLoading, isError } = useQuery<Provider[]>({
    queryKey: ["providers-by-country", countryCode],
    queryFn: () => tmdbApi.getProvidersByCountry(countryCode),
    enabled: countryCode.length > 0,
  });

  return {
    providers: data ?? [],
    isLoading,
    isError,
  };
}
