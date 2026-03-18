export type WatchlistItem = {
    id: number;
    media_type: "movie" | "tv";
    title: string;
    year: string;
    poster_path: string | null;
    added_at: number;   // Date.now() -> to sort by date added
}

export type MediaDetails = {
    overview?: string;
    biography?: string;
    [key: string]: unknown; // for unused extra fields
}

export type FilterType = "all" | "movie" | "tv";

export type SortKey = "added_at" | "title" | "year";