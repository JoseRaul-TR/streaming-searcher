import React, { useMemo, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import { useMode } from "@/hooks/useMode";
import { ColorScheme } from "@/constants/colors";
import MediaCard from "@/components/media/MediaCard";
import ApiStateDisplay from "@/components/common/ApiStateDisplay";
import WatchlistControls from "@/components/watchlist/WatchlistControls";
import { FilterType, SortKey } from "@/types/watchlist";

export default function WatchlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortKey>("added_at");
  const [isAscending, setIsAscending] = useState(false);

  // Get the watchlist list from store
  const { watchlist } = useUserStore();

  const filteredAndSortedWatchlist = useMemo(() => {
    let result = [...watchlist]; // Copy to avoid mutating the original

    // Filtering
    if (filter !== "all") {
      result = result.filter((item) => item.media_type === filter);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "year":
          const ya = parseInt(a.year, 10);
          const yb = parseInt(b.year, 10);
          // NaN ("N/A") goes to the end
          comparison =
            isNaN(ya) && isNaN(yb)
              ? 0
              : isNaN(ya)
                ? 1
                : isNaN(yb)
                  ? -1
                  : ya - yb;
          break;
        case "added_at":
        default:
          comparison = a.added_at - b.added_at; // More recent first
          break;
      }

      // TODO - Correct indication order
      return isAscending ? comparison : -comparison;
    });

    return result;
  }, [watchlist, filter, sortBy, isAscending]);

  return (
    <View style={[styles.container]}>
      <WatchlistControls
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        isAscending={isAscending}
        onToggleDirection={() => setIsAscending(!isAscending)}
      />
      <FlatList
        data={filteredAndSortedWatchlist}
        keyExtractor={(item) => `${item.media_type}-${item.id}`}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        // Use ApiStateDisplay when nothing is saved
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <ApiStateDisplay
              state="empty"
              message="Your watchlist is empty. Save movies or series to keep track of them."
              icon={
                <Ionicons
                  name="bookmark-outline"
                  size={48}
                  color={colors.surfaceAlt}
                />
              }
            />
          </View>
        }
        renderItem={({ item }) => (
          <MediaCard
            item={item}
            onPress={() =>
              router.push({
                pathname: "/details",
                params: {
                  id: String(item.id),
                  title: item.title,
                  year: item.year,
                  poster_path: item.poster_path ?? "",
                  media_type: item.media_type,
                },
              })
            }
          />
        )}
      />
    </View>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 15,
      paddingTop: 10,
      paddingBottom: 30,
      flexGrow: 1,
    },
    columnWrapper: {
      justifyContent: "space-between",
    },
    emptyWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 100,
    },
  });
}
