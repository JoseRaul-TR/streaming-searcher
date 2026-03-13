import React, { useCallback, useMemo } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MediaItem } from "@/types/searchedItem";
import MediaCard from "./MediaCard";
import ApiStateDisplay from "./ApiStateDisplay";
import { ColorScheme } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

type Props = {
  items: MediaItem[];
};

// Fixed card width for the horizontal list — narrow enough to show
// a peek of the next card, signalling that the list is scrollable.
const CARD_WIDTH = 140;

export default function KnownForSection({ items }: Props) {
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
    <View>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `${item.media_type}-${item.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MediaCard
            item={item}
            width={CARD_WIDTH}
            onPress={() => handlePress(item)}
          />
        )}
      />
    </View>
  );
}

function makeStyles(_colors: ColorScheme) {
  return StyleSheet.create({
    list: { gap: 10, paddingBottom: 4 },
  });
}
