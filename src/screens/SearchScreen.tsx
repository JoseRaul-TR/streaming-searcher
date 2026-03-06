import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Dimensions,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { tmdbApi } from "../services/api";
import { SearchedItem } from "../types/searchedItem";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 40) / 2; // Dynamic calculation for column's width

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // TanStack Query manages loading, error and data automatically
  const {
    data: results = [],
    isLoading,
    isFetching,
  } = useQuery<SearchedItem[]>({
    queryKey: ["search", searchQuery],
    queryFn: () => tmdbApi.searchedItem(searchQuery),
    enabled: searchQuery.length > 2, // Perform search if more than 2 characters in TextInput
    staleTime: 1000 * 60 * 5, // Cache search results for 5 mins. If user perform same search twice or more it saves unnecessary API fetches
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search a movie, TV-show or person"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="never" // Deactivate native iOS clean input field button
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {/* Logic to display either loading or clean input button*/}
        <View style={styles.rightIconsContainer}>
          {/* Priority to ActivityIndicator if loading/fetching */}
          {isLoading || isFetching ? (
            <ActivityIndicator size="small" color="#60A5FA" />
          ) : (
            /* Displa clear input just if there is text and not loading/fetching */
            searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                hitSlop={10} // Makes it easier to press
              >
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            )
          )}
        </View>
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        keyExtractor={(item) => `${item.media_type}-${item.id}`} // To avoid collisions between Movies/TV ID
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        // "No results" message to empty array search result
        ListEmptyComponent={() =>
          !isLoading && !isFetching && searchQuery.length > 2 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={80} color="#1E293B" />
              <Text style={styles.emptyText}>
                No results found for "{searchQuery}"
              </Text>
              <Text style={styles.emptySubText}>
                Try a different title or name.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate("DetailsModal", {
                id: item.id,
                title: item.title,
                year: item.year ?? "N/A",
                overview: item.overview ?? "",
                poster_path: item.poster_path,
                media_type: item.media_type,
              })
            }
          >
            <View style={styles.posterContainer}>
              {item.poster_path ? (
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                  }}
                  style={styles.posterImage}
                  resizeMode="cover"
                />
              ) : (
                /* Show placeholders depending of media_type if no poster_path */
                <View style={styles.posterPlaceholderInside}>
                  {item.media_type === "movie" && (
                    <Ionicons name="film-outline" size={50} color="#475569" />
                  )}
                  {item.media_type === "tv" && (
                    <Feather name="tv" size={50} color="#475569" />
                  )}
                  {item.media_type === "person" && (
                    <Ionicons name="person-outline" size={50} color="#475569" />
                  )}
                </View>
              )}

              {/* Badge media type (Movie or TV-serie) */}
              <View style={styles.typeBadge}>
                {item.media_type === "movie" && (
                  <Ionicons name="film" size={14} color="#FFF" />
                )}
                {item.media_type === "tv" && (
                  <Feather name="tv" size={14} color="#FFF" />
                )}
                {item.media_type === "person" && (
                  <Ionicons name="person-circle" size={14} color="#FFF" />
                )}
              </View>
            </View>
            <Text style={styles.movieTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.movieYear}>{item.year}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 14,
    height: 52,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    marginLeft: 8,
  },
  rightIconsContainer: {
    width: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  card: {
    width: COLUMN_WIDTH,
    marginBottom: 15,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
  emptySubText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  posterContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#334155",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    marginBottom: 10,
  },
  posterPlaceholderInside: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E293B",
  },
  typeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  movieTitle: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  movieYear: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 4,
  },
});
