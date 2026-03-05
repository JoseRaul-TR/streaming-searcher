import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { tmdbApi } from "../services/api";
import { Movie } from "../types/movie";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width / 2 - 20; // Dynamic calculation for column's width

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSearch = async (search: string) => {
    setSearchQuery(search);
    if (search.length > 2) {
      // Perform search only if more than 2 characters
      setLoading(true);
      const results = await tmdbApi.searchMovies(search);
      setMovies(results);
      setLoading(false);
    }
  };

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
          onChangeText={handleSearch}
        />
      </View>

      {/* Results List */}
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.movieCard}
            onPress={() =>
              navigation.navigate("DetailsModal", {
                id: item.id,
                title: item.title,
                year: item.year,
                overview: item.overview,
                poster_path: item.poster_path
              })
            }
          >
            <View style={styles.posterPlaceholder}>
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                }}
                style={styles.posterImage}
                resizeMode="cover"
              />
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
  movieCard: {
    width: COLUMN_WIDTH,
    margin: 10,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  posterPlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#334155",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  posterImage: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
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
