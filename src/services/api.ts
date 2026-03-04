const BASE_URL = process.env.EXPO_PUBLIC_TMDB_API_URL;
const BEARER_TOKEN = process.env.EXPO_PUBLIC_TMDB_BEARER_TOKEN;

export const tmdbApi = {
    searchFilms: async (query: string) => {
        try {
            const response = await fetch(
                `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-UK`,
                {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${BEARER_TOKEN}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Error in search query.");

const data = await response.json();
return data.results; // Returns array of films
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    getStreamingProviders: async (filmId: number) => {
        // TODO - Complete fetch of streaming providers
        const url = `${BASE_URL}/movie/${filmId}/watch/providers`;
        // TODO - Fill in logic
    }
}