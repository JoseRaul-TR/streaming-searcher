type BaseItem = {
  id: number;
  poster_path: string | null;
};

// Exported separately so KnownForSection can reference it directly
// without importing the full SearchedItem union.
export type MediaItem = BaseItem & {
  media_type: "movie" | "tv";
  title: string;
  year: string;
  overview?: string;
};

type PersonItem = BaseItem & {
  media_type: "person";
  title: string;
  year: string;
  overview: string;
  known_for_department: string;
  known_for_items: MediaItem[];
};

export type SearchedItem = MediaItem | PersonItem;
