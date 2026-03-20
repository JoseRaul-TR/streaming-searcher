/**
 * Domain types for streaming providers and country data from the TMDB API.
 *
 * These types represent the app's internal data model after transformation
 * from the raw TMDB response shapes defined in api.ts. Components and hooks
 * always work with these types, never with the raw API shapes.
 */

/**
 * A country or region as returned by the TMDB /3/watch/providers/regions endpoint.
 * Used to populate the CountryPickerModal and to resolve country codes to
 * human-readable names in global search mode.
 */
export type Country = {
  /** ISO 3166-1 alpha-2 country code, e.g. "SE", "US", "ES". */
  iso_3166_1: string;
  english_name: string;
  native_name: string;
};

/**
 * A streaming provider as returned by the TMDB watch/providers endpoints.
 * Used in ProviderLogo, ProviderSection, and SubscriptionPickerModal.
 */
export type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

/**
 * Streaming availability data for a single country, produced by
 * tmdbApi.getWatchProviders() after transforming the raw TMDB response.
 *
 * Each field corresponds to a TMDB availability category. All provider arrays
 * are optional because the TMDB API omits categories that have no providers
 * for a given title in a given country — a country entry may have only
 * flatrate, or only rent and buy, or any other combination.
 *
 * Used as the element type of the WatchProvidersData[] arrays in
 * ProviderSection (single country) and CountryProviderSection (multi-country).
 */
export type WatchProvidersData = {
  countryCode: string;
  countryName: string;
  link?: string; // Official JustWatch link
  free?: Provider[];
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
};

/**
 * A country the user has explicitly selected in CountryPickerModal.
 * Stored in the Zustand store as countries: SelectedCountry[].
 *
 * A subset of Country — only the fields needed at runtime are stored,
 * keeping the persisted payload small and avoiding stale cached names
 * if TMDB ever updates a country's english_name.
 */
export type SelectedCountry = {
  code: string;
  /** English display name, e.g. "Sweden". Stored to avoid re-fetching for labels. */
  name: string;
};
