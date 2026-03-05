import { SearchedItem } from "../types/searchedItem";

const BASE_URL = process.env.EXPO_PUBLIC_TMDB_API_URL;
const BEARER_TOKEN = process.env.EXPO_PUBLIC_TMDB_BEARER_TOKEN;

const fetchOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${BEARER_TOKEN}`,
  },
};
export const tmdbApi = {
  searchedItem: async (query: string): Promise<SearchedItem[]> => {
    if (!query) return [];

    const response = await fetch(
      `${BASE_URL}/3/search/multi?query=${encodeURIComponent(query)}`,
      fetchOptions,
    );

    const data = await response.json();

    return (data.results || []).map((item: any) => {
      if (item.media_type === "person") {
        return {
          id: item.id,
          title: item.name,
          year: item.known_for_department, // Use department as subtitle
          poster_path: item.profile_path ? item.profile_path : null,
          media_type: "person",
          overview: `Famous for: ${item.known_for?.map((m: any) => m.title || m.name).join(", ")}`,
        };
      }

      return {
        id: item.id,
        title: item.title || item.name,
        year:
          (item.release_date || item.first_air_date || "").split("-")[0] ||
          "N/A",
        overview: item.overview,
        poster_path: item.poster_path ? item.poster_path : null,
        media_type: item.media_type,
      };
    });
  },
};
