export type BaseItem = {
  id: number;
  poster_path: string | null;
};

export type MovieItem = BaseItem & {
  media_type: 'movie';
  title: string;
  year: string;
  overview: string;
};

export type TVItem = BaseItem & {
  media_type: 'tv';
  title: string;
  year: string;
  overview: string;
};

export type PersonItem = BaseItem & {
  media_type: 'person';
  title: string; // Person's name
  year: string;  // Department (Director, Acting, Producer, ...)
  overview: string; // "Famous for: ..."
  known_for_department: string;
};

export type SearchedItem = MovieItem | TVItem | PersonItem;