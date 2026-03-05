import { Movie } from "../types/movie";

const BASE_URL = process.env.EXPO_PUBLIC_TMDB_API_URL;
const BEARER_TOKEN = process.env.EXPO_PUBLIC_TMDB_BEARER_TOKEN;

export const tmdbApi = {
  searchMovies: async (query: string): Promise<Movie[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/3/search/movie?query=${encodeURIComponent(query)}&language=en-US`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
        },
      );

      if (!response.ok) throw new Error("Error in search query.");

      const data = await response.json();

      // Map the return of TMDB API to Movie type
      return data.results.map(
        (m: any): Movie => ({
          id: m.id,
          title: m.title || m.name || "Unknown Title",
          year: m.release_date
            ? m.release_date.split("-")[0]
            : m.first_air_date
              ? m.first_ard_date.split("-")[0]
              : "N/A",
          overview: m.overview,
          poster_path: m.poster_path,
        }),
      );
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },

  getStreamingProviders: async (movieId: number) => {
    // TODO - Complete fetch of streaming providers
    const url = `${BASE_URL}/movie/${movieId}/watch/providers`;
    // TODO - Fill in logic
  },
};
