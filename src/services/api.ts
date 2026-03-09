import { Country, WatchProvidersData } from "@/types/providers";
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
  /* Perform search */
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

  /* Fetch list of available countrys */
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

  /* Fetch providers by item.id, item.media_type and country */
  getWatchProviders: async (
    id: number | string,
    mediaType: "movie" | "tv" | "person",
    countryCode: string,
  ): Promise<WatchProvidersData | null> => {
    // Limit providers search to movies and tv only. Not persons
    if (mediaType === "person") return null;

    try {
      const response = await fetch(
        `${BASE_URL}/3/${mediaType}/${id}/watch/providers`,
        fetchOptions,
      );
      const data = await response.json();

      // Filter info for the country/country the user has selected
      const countryData = data.results?.[countryCode];

      if (!countryData) return null;

      return {
        link: countryData.link,
        free: countryData.free || [],
        flatrate: countryData.flatrate || [],
        rent: countryData.rent || [],
        buy: countryData.buy || [],
      };
    } catch (error) {
      console.error("Error fetching available watch providers:", error);
      return null;
    }
  },
};
