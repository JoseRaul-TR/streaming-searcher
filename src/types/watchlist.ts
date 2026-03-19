/**
 * Domain types for the user's personal watchlist and media detail fetching.
 */

/**
 * A title saved to the user's watchlist.
 *
 * Stores only the fields needed to render a MediaCard and navigate to
 * DetailsScreen — the full metadata (overview, streaming providers) is
 * always fetched live from TMDB when the detail screen opens.
 *
 * The composite key (id + media_type) is required for uniqueness because
 * TMDB can assign the same numeric id to both a movie and a TV series.
 * This mirrors the pattern used in subscribedKeys ("countryCode:providerId").
 */
export type WatchlistItem = {
  id: number;
  media_type: "movie" | "tv";
  title: string;
  /**
   * Release year as a string, e.g. "2023" or "N/A".
   * Stored as a string (not number) to match the SearchedItem type and to
   * handle the "N/A" case without a separate nullable field.
   */
  year: string;
  /**
   * TMDB poster path, or null when unavailable.
   * Stored so MediaCard can display the poster without a network request.
   * Prepend "https://image.tmdb.org/t/p/w500" to get the full URL.
   */
  poster_path: string | null;
  /**
   * Unix timestamp (Date.now()) recorded when the item was saved.
   * Stored as a number rather than an ISO string so sort comparisons
   * are arithmetic (a.added_at - b.added_at) with no parsing overhead.
   */
  added_at: number;
};

/**
 * The subset of TMDB title metadata used when an overview is missing.
 *
 * WatchlistItem deliberately omits overview to keep the persisted AsyncStorage
 * payload small. When DetailsScreen opens a watchlist item and overview is
 * empty, it calls tmdbApi.getMediaDetails() and expects at least one of
 * these fields in the response.
 *
 * The index signature allows the full TMDB response to be assigned to this
 * type without listing every possible field — only overview and biography
 * are read by the app, the rest are safely ignored.
 */
export type MediaDetails = {
  /** Plot summary for movies and TV series. */
  overview?: string;
  /** Biography text for persons (media_type === "person"). */
  biography?: string;
  /** Catch-all for any other fields in the TMDB response that the app does not use. */
  [key: string]: unknown;
};

/**
 * The sort criteria available in the WatchlistControls dropdown.
 * Exported so WatchlistScreen and WatchlistControls share the same type
 * without duplicating it.
 */
export type FilterType = "all" | "movie" | "tv";

/**
 * The filter options available in the WatchlistControls dropdown.
 * "all" shows every item regardless of media_type.
 * Exported so WatchlistScreen and WatchlistControls share the same type.
 */
export type SortKey = "added_at" | "title" | "year";
