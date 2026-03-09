type BaseItem = {
  id: number;
  poster_path: string | null;
};

type MediaItem = BaseItem & {
  media_type: "movie" | "tv";
  title: string;
  year: string;
  overview: string;
};

type PersonItem = BaseItem & {
  media_type: "person";
  title: string;
  year: string;
  overview: string;
  known_for_department: string;
};

export type SearchedItem = MediaItem | PersonItem;
