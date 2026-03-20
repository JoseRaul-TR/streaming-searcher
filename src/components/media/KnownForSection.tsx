import React, { useCallback } from "react";
import { FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { MediaItem } from "@/types/searchedItem";
import MediaCard from "./MediaCard";
import ApiStateDisplay from "../common/ApiStateDisplay";
import FadeView from "../common/FadeView";

type Props = {
  /** The list of notable works to render, already typed as MediaItem[]. */
  items: MediaItem[];
};

/**
 * Fixed card width for the horizontal list — narrow enough to show a peek of
 * the next card, signalling to the user that the list is scrollable.
 */
const CARD_WIDTH = 140;

/**
 * Renders a person's notable works as a horizontal scrolling list of MediaCards.
 *
 * Shown in DetailsScreen in place of the streaming providers section when
 * media_type === "person". Reuses MediaCard with a fixed width prop so the
 * visual language is consistent with the two-column grid on ExploreScreen.
 *
 * Navigation to a nested detail screen passes from_nested: "true" as a param
 * so DetailsScreen knows to render the X button (close full stack) alongside
 * the back arrow, allowing the user to exit the person → work → details flow
 * in one tap.
 *
 * known_for_items are always movies or TV — the API transform in api.ts filters
 * out entries whose media_type is neither "movie" nor "tv", so known_for_items
 * is always an empty array for the nested detail screens (passed as "[]").
 *
 * @param props.items - The MediaItem array from PersonItem.known_for_items.
 *   Shows an ApiStateDisplay empty state when the array is empty.
 */
export default function KnownForSection({ items }: Props) {
  const router = useRouter();

  /**
   * Navigates to the detail screen for a known-for item.
   * Wrapped in useCallback so the FlatList renderItem does not receive a new
   * function reference on every render of KnownForSection.
   *
   * @param item - The MediaItem that was tapped.
   */
  const handlePress = useCallback(
    (item: MediaItem) => {
      router.push({
        pathname: "/details",
        params: {
          id: item.id,
          title: item.title,
          year: item.year ?? "N/A",
          overview: item.overview ?? "",
          poster_path: item.poster_path ?? "",
          media_type: item.media_type,
          // Known-for items are always movies/tv, so known_for_items is
          // always empty — passed as "[]" to satisfy the param shape.
          known_for_items: "[]",
          from_nested: "true",
        },
      });
    },
    [router],
  );

  if (items.length === 0) {
    return (
      <ApiStateDisplay state="empty" message="No known works available." />
    );
  }

  return (
    <FlatList
      data={items}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => `${item.media_type}-${item.id}`}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <FadeView>
          <MediaCard
            item={item}
            width={CARD_WIDTH}
            onPress={() => handlePress(item)}
          />
        </FadeView>
      )}
    />
  );
}

// Static styles — no theme-dependent values, so no makeStyles needed.
const styles = StyleSheet.create({
  list: { gap: 10, paddingBottom: 4 },
});
