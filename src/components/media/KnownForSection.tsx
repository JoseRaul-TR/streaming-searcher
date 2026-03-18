import React, { useCallback } from "react";
import { FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { MediaItem } from "@/types/searchedItem";
import MediaCard from "./MediaCard";
import ApiStateDisplay from "../common/ApiStateDisplay";
import FadeView from "../common/FadeView";

type Props = {
  items: MediaItem[];
};

// Fixed card width for the horizontal list — narrow enough to show
// a peek of the next card, signalling that the list is scrollable.
const CARD_WIDTH = 140;

export default function KnownForSection({ items }: Props) {
  const router = useRouter();

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
          // Known-for items are movies/tv, never persons,
          // so we pass an empty array to satisfy the param shape.
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
