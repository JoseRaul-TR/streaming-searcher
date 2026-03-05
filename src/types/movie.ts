export type Movie = {
  id: number;
  title: string;
  year: string;
  overview: string;
  poster_path?: string | null; // TMDB API can return null if no movie poster
};
