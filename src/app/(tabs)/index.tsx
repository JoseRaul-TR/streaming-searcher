import React, { useState } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { tmdbApi } from "@/services/api";
import { SearchedItem } from "@/types/searchedItem";
import { MediaCard } from "@/components/MediaCard";
import SearchBar from "@/components/SearchBar";

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const {
    data: results = [],
    isLoading,
    isFetching,
  } = useQuery<SearchedItem[]>({
    queryKey: ["search", query],
    queryFn: () => tmdbApi.searchItem(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        isLoading={isLoading || isFetching}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => `${item.media_type}-${item.id}`}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={() =>
          !isLoading && !isFetching && query.length > 2 ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={80} color="#1E293B" />
              <Text style={styles.emptyTitle}>No results for "{query}"</Text>
              <Text style={styles.emptySub}>
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
                },
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  listContent: { paddingHorizontal: 10, paddingBottom: 20, flexGrow: 1 },
  columnWrapper: { justifyContent: "space-between", paddingHorizontal: 5 },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 'auto',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
  emptySub: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
