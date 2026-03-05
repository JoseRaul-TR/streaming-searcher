import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";
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

import { tmdbApi } from "../services/api";
import { SearchedItem } from "../types/searchedItem";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width / 2 - 20; // Dynamic calculation for column's width

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // TanStack Query manages loading, error and data automatically
  const {
    data: results = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => tmdbApi.searchedItem(searchQuery),
    enabled: searchQuery.length > 2, // Perform search if more than 2 characters in TextInput
    staleTime: 1000 * 60 * 5, // Cache every 5 mins
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#94A3B8"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a movie or a TV-serie"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {(isLoading || isFetching) && (
          <ActivityIndicator color="#60A5FA" style={{ marginLeft: 10 }} />
        )}
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        keyExtractor={(item) => `${item.media_type}-${item.id}`} // To avoid collisions between Movies/TV ID
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate("DetailsModal", {
                ...item,
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
    borderRadius: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 10,
  },
  card: {
    width: COLUMN_WIDTH,
    margin: 10,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
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
    fontSize: 14,
    textAlign: "center",
  },
  movieYear: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },
});
