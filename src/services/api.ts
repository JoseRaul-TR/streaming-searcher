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
 * ————————— Generic TMDB fetcher —————————
 * Using generics so every endpoint gets a typed response without repeating
 * the fetch boilerplate. T is the expected shape of response.json().
 * */

async function fetchTMDB<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, fetchOptions);
  if (!response.ok) {
    throw new Error(
      `TMDB API error: ${response.status} ${response.statusText}`,
    );
  }
  return response.json() as Promise<T>;
}

/**
 * ————————— Rab TMDB response shapes —————————
 * These types describe the raw API response before we transform it into our
 * own domain types. Avoid using 'any' while still handling optional fields.
 */

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

function toSearchedItem(item: TmdbRawSearchItem): SearchedItem {
  if (item.media_type === "person") {
    // Transform each known_for entry into a typed MediaItem.
    // Entries without a recognised media_type are filtered out to keep
    // the union type honest — we never render unknown content.
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
  // Fetch all available countries
  getCountries: async (): Promise<Country[]> => {
    const data = await fetchTMDB<TmdbCountriesResponse>(
      "/3/watch/providers/regions",
    );
    return data.results ?? [];
  },

  /**
   * Fetch all providers available in a country.
   * Makes two parallel requests (movie + tv) and deduplicates by provider_id
   * so both types are represented in the subscription picker.
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
    // would otherwise appear twice in the subscription picker
    const seen = new Set<number>();
    return combined.filter((p) => {
      if (seen.has(p.provider_id)) return false;
      seen.add(p.provider_id);
      return true;
    });
  },

  // Search movies, TV shows and people
  searchItem: async (query: string): Promise<SearchedItem[]> => {
    if (!query.trim()) return [];
    const data = await fetchTMDB<TmdbSearchResponse>(
      `/3/search/multi?query=${encodeURIComponent(query)}`,
    );
    return (data.results ?? []).map(toSearchedItem);
  },

  /**
   * Fetch extra details for a specific item (used to fetch missing overviews on saved items)
   */
  getMediaDetails: async (mediaType: string, id: number): Promise<MediaDetails> => {
    return await fetchTMDB<MediaDetails>(`/3/${mediaType}/${id}`);
  },

  /**
   * Fetch streaming availability for a movie or TV show.
   *
   * Two modes:
   *
   * — Filtered (countries.length > 0):
   *   TMDB returns all countries in a single response. We filter client-side
   *   to only the countries the user has selected.
   *
   * — Global (countries.length === 0):
   *   Return every country in the response that has at least one provider.
   *   Country names are resolved by fetching the regions list in parallel
   *   with the providers call so we can display full names instead of codes.
   *   Results are sorted alphabetically.
   */
  getWatchProviders: async (
    id: number | string,
    mediaType: "movie" | "tv" | "person",
    countries: SelectedCountry[],
  ): Promise<WatchProvidersData[]> => {
    if (mediaType === "person") return []; // No fetch for people

    const isGlobal = countries.length === 0;

    if (isGlobal) {
      // Fetch providers and countries names in parallel
      const [providerRes, countriesRes] = await Promise.all([
        fetchTMDB<TmdbWatchProvidersResponse>(
          `/3/${mediaType}/${id}/watch/providers`,
        ),
        fetchTMDB<TmdbCountriesResponse>("/3/watch/providers/regions"),
      ]);

      // Build a code -> english_name lookup map
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

    // Filtered mode - single API call, client side country filter
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
