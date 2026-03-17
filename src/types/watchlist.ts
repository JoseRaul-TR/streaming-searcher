export type WatchlistItem = {
    id: number;
    media_type: "movie" | "tv";
    title: string;
    year: string;
    poster_path: string | null;
    added_at: number;   // Date.now() -> to sort by date added
}