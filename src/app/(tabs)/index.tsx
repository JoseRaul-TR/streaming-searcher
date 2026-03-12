import React from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useSearch } from "@/hooks/useSearch";
import MediaCard from "@/components/MediaCard";
import SearchBar from "@/components/SearchBar";
import { Colors } from "@/constants/colors";

export default function ExploreScreen() {
  const router = useRouter();
  const { query, setQuery, results, isLoading, isError, hasSearched } =
    useSearch();

  return (
    <View style={styles.container}>
      <SearchBar value={query} onChangeText={setQuery} isLoading={isLoading} />

      {isError ? (
        <View style={styles.feedback}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={Colors.error}
          />
          <Text style={styles.feedbackTitle}>Something went wrong</Text>
          <Text style={styles.feedbackSub}>
            Could not reach TMDB. Check your connection and try again.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={() =>
            !isLoading && hasSearched ? (
              <View style={styles.feedback}>
                <Ionicons
                  name="search-outline"
                  size={80}
                  color={Colors.surface}
                />
                <Text style={styles.feedbackTitle}>
                  No results for "{query}"
                </Text>
                <Text style={styles.feedbackSub}>
                  Try a different title or name.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <MediaCard
              item={item}
              onPress={() =>
                router.push({
                  pathname: "/details",
                  params: {
                    id: item.id,
                    title: item.title,
                    year: item.year ?? "N/A",
                    overview: item.overview ?? "",
                    poster_path: item.poster_path ?? "",
                    media_type: item.media_type,
                    // Serialise known_for_items as JSON — Expo Router params
                    // are strings, so complex objects must be encoded.
                    // Non-persons get an empty array to keep the param shape consistent.
                    known_for_items:
                      item.media_type === "person"
                        ? JSON.stringify(item.known_for_items)
                        : "[]",
                  },
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingHorizontal: 10, paddingBottom: 20, flexGrow: 1 },
  columnWrapper: { justifyContent: "space-between", paddingHorizontal: 5 },
  feedback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
    gap: 12,
  },
  feedbackTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  feedbackSub: {
    color: Colors.textDisabled,
    fontSize: 14,
    textAlign: "center",
  },
});
