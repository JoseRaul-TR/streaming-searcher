import React, { useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import { useMode } from "@/hooks/useMode";
import { ColorScheme } from "@/constants/colors";
import MediaCard from "@/components/MediaCard";
import ApiStateDisplay from "@/components/ApiStateDisplay";
import { Ionicons } from "@expo/vector-icons";

export default function WatchlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Get the watchlist list from store
  const { watchlist } = useUserStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={watchlist}
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
              message="Your watchlist is empty. Save moview or series to keep track of them."
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
      ></FlatList>
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
