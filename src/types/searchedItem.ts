export type SearchedItem = {
  id: number;
  title: string;
  year?: string;
  overview?: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv' | 'person';
  known_for_department?: string; // Ex. "Directing" or "Acting"
};
