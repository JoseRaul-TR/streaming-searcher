/**
 * Domain types for TMDB search results.
 *
 * The discriminated union SearchedItem = MediaItem | PersonItem allows
 * TypeScript to narrow the type at any point where media_type is checked,
 * giving full type safety for fields that only exist on one variant
 * (e.g. known_for_items is only on PersonItem, year is the same field
 * but means different things: release year for media, department for persons).
 */

/**
 * Fields shared by all search result types regardless of media_type.
 * Extracted as a base type to avoid repeating id and poster_path in each variant.
 */
type BaseItem = {
  /** TMDB numeric ID. Note: the same number can be assigned to both a movie
   *  and a TV series, so id alone is not a unique key — always use id + media_type. */
  id: number;
  /** Path to the poster/profile image on the TMDB CDN, or null when unavailable.
   *  Prepend "https://image.tmdb.org/t/p/w500" to get the full URL. */
  poster_path: string | null;
};

/**
 * A movie or TV series search result.
 *
 * Exported separately so KnownForSection can use it as the element type
 * of PersonItem.known_for_items without importing the full SearchedItem union.
 */
export type MediaItem = BaseItem & {
  media_type: "movie" | "tv";
  title: string;
  /**
   * The release year extracted from release_date (movies) or first_air_date (TV).
   * "N/A" when neither date is available in the API response.
   */
  year: string;
  /** Plot summary. May be empty for titles with no description in TMDB. */
  overview?: string;
};

/**
 * A person (actor, director, crew member) search result.
 *
 * The year field reuses the BaseItem-derived slot but holds the person's
 * known_for_department (e.g. "Acting", "Directing") rather than a year,
 * since persons don't have a release date. This drives the badge in MediaCard
 * and the department label in DetailsScreen without adding a separate field.
 */
type PersonItem = BaseItem & {
  media_type: "person";
  /** The person's full name. */
  title: string;
  /**
   * Repurposed to hold known_for_department (e.g. "Acting") for persons.
   * Allows MediaCard and DetailsScreen to use a single year/department badge
   * without conditional field access.
   */
  year: string;
  /**
   * Always an empty string for persons — kept in the type for structural
   * consistency with MediaItem so components can render overview without
   * checking media_type first. The person's info is surfaced via KnownForSection.
   */
  overview: string;
  /** The TMDB department the person is primarily known for, e.g. "Acting". */
  known_for_department: string;
  /**
   * The person's most notable works, already transformed into typed MediaItem
   * objects. Entries whose media_type is neither "movie" nor "tv" are filtered
   * out during the API transform to keep the union type honest.
   *
   * Serialised as JSON when passed as an Expo Router route param (params are
   * strings), and parsed back in DetailsScreen with useMemo + try/catch.
   */
  known_for_items: MediaItem[];
};

/**
 * The union type for all items returned by the TMDB /3/search/multi endpoint.
 *
 * Checking item.media_type narrows this to either MediaItem or PersonItem,
 * giving TypeScript full knowledge of which fields are available. This pattern
 * avoids optional fields and runtime null checks scattered throughout components.
 *
 * @example
 * if (item.media_type === "person") {
 *   item.known_for_items  // TypeScript knows this exists
 * } else {
 *   item.year             // TypeScript knows this is a release year
 * }
 */
export type SearchedItem = MediaItem | PersonItem;
