import {
  Country,
  Provider,
  SelectedCountry,
  WatchProvidersData,
} from "@/types/providers";
import { MediaItem, SearchedItem } from "@/types/searchedItem";
import { MediaDetails } from "@/types/watchlist";

const BASE_URL = "https://api.themoviedb.org";
const BEARER_TOKEN = process.env.EXPO_PUBLIC_TMDB_BEARER_TOKEN;

const fetchOptions: RequestInit = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${BEARER_TOKEN}`,
  },
};

/**
 * Generic TMDB fetcher.
 *
 * @param path - The API path to append to the base URL
 *               (e.g. "/3/search/multi?query=inception").
 * @returns A Promise that resolves to the parsed JSON response body typed as T.
 * @throws An Error with the HTTP status and status text if response.ok is false
 *         (e.g. 401 Unauthorized, 429 Too Many Requests, 500 Internal Server Error).
 *
 * @example
 * const data = await fetchTMDB<TmdbSearchResponse>("/3/search/multi?query=inception");
 */

async function fetchTMDB<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, fetchOptions);
  if (!response.ok) {
    throw new Error(
      `TMDB API error: ${response.status} ${response.statusText}`,
    );
  }
  return response.json() as Promise<T>;
}

// ————————— Raw TMDB response shapes —————————
// These types describe the raw API response before we transform it into our
// own domain types. Avoids 'any' while still handling optional fields.

type TmdbKnownForItem = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string;
};

type TmdbRawSearchItem = {
  id: number;
  media_type: string;
  name?: string;
  title?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  known_for_department?: string;
  known_for: TmdbKnownForItem[];
};

type TmdbSearchResponse = {
  results: TmdbRawSearchItem[];
};

type TmdbCountriesResponse = {
  results: Country[];
};

type TmdbProvidersResponse = {
  results: Provider[];
};

type TmdbWatchProviderEntry = {
  link?: string;
  free?: Provider[];
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
};

type TmdbWatchProvidersResponse = {
  results: { [countryCode: string]: TmdbWatchProviderEntry };
};

// ————————— Transform helpers —————————

/**
 * Transforms a raw TMDB search result item into the app's typed SearchedItem domain type.
 *
 * @param item - A raw search result object as returned by /3/search/multi.
 *               May be a movie, TV show, or person, distinguished by item.media_type.
 * @returns A SearchedItem — either a MediaItem (movie/tv) or a PersonItem (person).
 *
 * For persons, known_for entries are filtered to only "movie" | "tv" media types
 * and mapped to typed MediaItem objects. Entries with unrecognised media_type are
 * dropped to keep the union type honest.
 *
 * For movies and TV shows, the title is resolved from item.title (movies) or
 * item.name (TV shows), and the year is extracted from the first segment of
 * release_date or first_air_date split by "-".
 */

function toSearchedItem(item: TmdbRawSearchItem): SearchedItem {
  if (item.media_type === "person") {
    const known_for_items: MediaItem[] = (item.known_for ?? [])
      .filter(
        (m): m is TmdbKnownForItem & { media_type: "movie" | "tv" } =>
          m.media_type === "movie" || m.media_type === "tv",
      )
      .map((m) => ({
        id: m.id,
        media_type: m.media_type,
        title: m.title ?? m.name ?? "Unknown",
        year: (m.release_date ?? m.first_air_date ?? "").split("-")[0] || "N/A",
        overview: m.overview ?? "",
        poster_path: m.poster_path ?? null,
      }));

    return {
      id: item.id,
      media_type: "person",
      title: item.name ?? "Unknown",
      year: item.known_for_department ?? "N/A",
      poster_path: item.profile_path ?? null,
      known_for_department: item.known_for_department ?? "N/A",
      overview: "",
      known_for_items,
    };
  }

  return {
    id: item.id,
    media_type: item.media_type as "movie" | "tv",
    title: item.title ?? item.name ?? "Unknown",
    year:
      (item.release_date ?? item.first_air_date ?? "").split("-")[0] || "N/A",
    overview: item.overview ?? "",
    poster_path: item.poster_path ?? null,
  };
}

// ————————— Public API —————————

export const tmdbApi = {
  /**
   * Fetches the full list of countries/regions that have streaming provider data on TMDB.
   *
   * @returns A Promise resolving to an array of Country objects
   *          ({ iso_3166_1, english_name, native_name }), or an empty array on empty response.
   */
  getCountries: async (): Promise<Country[]> => {
    const data = await fetchTMDB<TmdbCountriesResponse>(
      "/3/watch/providers/regions",
    );
    return data.results ?? [];
  },

  /**
   * Fetches all streaming providers available in a given country, deduplicated
   * across both movie and TV provider lists.
   *
   * @param countryCode - An ISO 3166-1 alpha-2 country code (e.g. "SE", "US").
   * @returns A Promise resolving to a deduplicated array of Provider objects
   *          ({ provider_id, provider_name, logo_path }).
   *
   * Makes two parallel requests — one for movie providers and one for TV providers —
   * then merges and deduplicates by provider_id so that a service present in both
   * (e.g. Netflix) only appears once in the subscription picker.
   */
  getProvidersByCountry: async (countryCode: string): Promise<Provider[]> => {
    const [movieData, tvData] = await Promise.all([
      fetchTMDB<TmdbProvidersResponse>(
        `/3/watch/providers/movie?watch_region=${countryCode}`,
      ),
      fetchTMDB<TmdbProvidersResponse>(
        `/3/watch/providers/tv?watch_region=${countryCode}`,
      ),
    ]);

    const combined = [...(movieData.results ?? []), ...(tvData.results ?? [])];

    // Deduplicate by provider_id — a provider present in both movie and tv
    // would otherwise appear twice in the subscription picker.
    const seen = new Set<number>();
    return combined.filter((p) => {
      if (seen.has(p.provider_id)) return false;
      seen.add(p.provider_id);
      return true;
    });
  },

  /**
   * Searches TMDB for movies, TV shows and people matching the given query string.
   *
   * @param query - The search string entered by the user.
   * @returns A Promise resolving to an array of SearchedItem (MediaItem | PersonItem).
   *          Returns an empty array immediately if query is blank or whitespace-only,
   *          avoiding an unnecessary network request.
   *
   * Raw results are transformed via toSearchedItem() into typed domain objects
   * before being returned to the caller.
   */
  searchItem: async (query: string): Promise<SearchedItem[]> => {
    if (!query.trim()) return [];
    const data = await fetchTMDB<TmdbSearchResponse>(
      `/3/search/multi?query=${encodeURIComponent(query)}`,
    );
    return (data.results ?? []).map(toSearchedItem);
  },

  /**
   * Fetches full details for a movie or TV show by its TMDB id.
   *
   * @param mediaType - The type of media: "movie" or "tv".
   * @param id - The TMDB numeric id of the title.
   * @returns A Promise resolving to a MediaDetails object ({ overview?, biography? }).
   *
   * Used as a fallback in the Details screen when a Watchlist item is opened
   * and the overview was not stored at save time (WatchlistItem only persists
   * id, title, year, poster_path, and media_type).
   */
  getMediaDetails: async (
    mediaType: string,
    id: number,
  ): Promise<MediaDetails> => {
    return await fetchTMDB<MediaDetails>(`/3/${mediaType}/${id}`);
  },

  /**
   * Fetches streaming availability for a movie or TV show, optionally filtered by country.
   *
   * @param id - The TMDB numeric id of the title (number or string).
   * @param mediaType - "movie" | "tv" | "person". Returns [] immediately for persons
   *                    since the providers endpoint does not apply to them.
   * @param countries - Array of SelectedCountry objects the user has selected.
   *   - Empty array (global mode): fetches all countries that have at least one provider,
   *     resolves country codes to full names by fetching the regions list in parallel,
   *     and returns results sorted alphabetically by country name.
   *   - Non-empty (filtered mode): makes a single API call and filters client-side
   *     to only the selected countries, avoiding N parallel requests.
   * @returns A Promise resolving to an array of WatchProvidersData, one entry per country.
   *          Each entry contains countryCode, countryName, an optional JustWatch link,
   *          and arrays for free, flatrate, rent, and buy providers (empty arrays when absent).
   *          Countries with no providers in any category are filtered out of the result.
   */
  getWatchProviders: async (
    id: number | string,
    mediaType: "movie" | "tv" | "person",
    countries: SelectedCountry[],
  ): Promise<WatchProvidersData[]> => {
    if (mediaType === "person") return []; // No fetch for people

    const isGlobal = countries.length === 0;

    if (isGlobal) {
      // Fetch providers and country names in parallel to avoid a sequential waterfall.
      const [providerRes, countriesRes] = await Promise.all([
        fetchTMDB<TmdbWatchProvidersResponse>(
          `/3/${mediaType}/${id}/watch/providers`,
        ),
        fetchTMDB<TmdbCountriesResponse>("/3/watch/providers/regions"),
      ]);

      // Build a code → english_name lookup map for O(1) resolution per country.
      const nameByCode = new Map<string, string>(
        (countriesRes.results ?? []).map((c) => [c.iso_3166_1, c.english_name]),
      );

      return Object.entries(providerRes.results ?? [])
        .map(
          ([code, entry]): WatchProvidersData => ({
            countryCode: code,
            countryName: nameByCode.get(code) ?? code,
            link: entry.link,
            free: entry.free ?? [],
            flatrate: entry.flatrate ?? [],
            rent: entry.rent ?? [],
            buy: entry.buy ?? [],
          }),
        )
        .filter(
          (c) =>
            (c.free?.length ?? 0) > 0 ||
            (c.flatrate?.length ?? 0) > 0 ||
            (c.rent?.length ?? 0) > 0 ||
            (c.buy?.length ?? 0) > 0,
        )
        .sort((a, b) => a.countryName.localeCompare(b.countryName));
    }

    // Filtered mode — single API call, client-side country filter.
    const data = await fetchTMDB<TmdbWatchProvidersResponse>(
      `/3/${mediaType}/${id}/watch/providers`,
    );

    return countries
      .map((country): WatchProvidersData => {
        const entry = data.results?.[country.code];
        return {
          countryCode: country.code,
          countryName: country.name,
          link: entry?.link,
          free: entry?.free ?? [],
          flatrate: entry?.flatrate ?? [],
          rent: entry?.rent ?? [],
          buy: entry?.buy ?? [],
        };
      })
      .filter(
        (c) =>
          (c.free?.length ?? 0) > 0 ||
          (c.flatrate?.length ?? 0) > 0 ||
          (c.rent?.length ?? 0) > 0 ||
          (c.buy?.length ?? 0) > 0,
      );
  },
};
