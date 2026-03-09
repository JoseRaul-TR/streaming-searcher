import {
  Country,
  SelectedCountry,
  WatchProvidersData,
} from "@/types/providers";
import { SearchedItem } from "@/types/searchedItem";

const BASE_URL = "https://api.themoviedb.org/";
const BEARER_TOKEN = process.env.EXPO_PUBLIC_TMDB_BEARER_TOKEN;

const fetchOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${BEARER_TOKEN}`,
  },
};

export const tmdbApi = {
  /* Search movies, TV shows and people */
  searchItem: async (query: string): Promise<SearchedItem[]> => {
    if (!query) return [];
    try {
      const response = await fetch(
        `${BASE_URL}/3/search/multi?query=${encodeURIComponent(query)}`,
        fetchOptions,
      );
      const data = await response.json();

      return (data.results || []).map((item: any): SearchedItem => {
        if (item.media_type === "person") {
          return {
            id: item.id,
            media_type: "person",
            title: item.name,
            year: item.known_for_department || "N/A",
            poster_path: item.profile_path || null,
            known_for_department: item.known_for_department,
            overview: `Famous for: ${item.known_for?.map((m: any) => m.title || m.name).join(", ")}`,
          };
        }
        return {
          id: item.id,
          media_type: item.media_type as "movie" | "tv",
          title: item.title || item.name,
          year:
            (item.release_date || item.first_air_date || "").split("-")[0] ||
            "N/A",
          overview: item.overview,
          poster_path: item.poster_path || null,
        };
      });
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  },

  /* Fetch all available regions */
  getCountries: async (): Promise<Country[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/3/watch/providers/regions`,
        fetchOptions,
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching countries:", error);
      return [];
    }
  },

  /* Fetch all providers available in a country — used for subscription picker */
  getProvidersByCountry: async (countryCode: string): Promise<any[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/3/watch/providers/movie?watch_region=${countryCode}`,
        fetchOptions,
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching providers by country:", error);
      return [];
    }
  },

  /*
   * Single country — returns WatchProvidersData (existing behavior)
   * Used in details.tsx when countries.length === 1
   */
  getWatchProviders: async (
    id: number | string,
    mediaType: "movie" | "tv" | "person",
    countries: SelectedCountry[],
  ): Promise<WatchProvidersData[]> => {
    if (mediaType === "person" || countries.length === 0) return [];
    try {
      const response = await fetch(
        `${BASE_URL}/3/${mediaType}/${id}/watch/providers`,
        fetchOptions,
      );
      const data = await response.json();

      return countries
        .map((country) => {
          const countryData = data.results?.[country.code];
          return {
            countryCode: country.code,
            countryName: country.name,
            link: countryData?.link,
            free: countryData?.free || [],
            flatrate: countryData?.flatrate || [],
            rent: countryData?.rent || [],
            buy: countryData?.buy || [],
          };
        })
        .filter(
          (c) =>
            c.free.length > 0 ||
            c.flatrate.length > 0 ||
            c.rent.length > 0 ||
            c.buy.length > 0,
        );
    } catch (error) {
      console.error("Error fetching providers:", error);
      return [];
    }
  },
};
