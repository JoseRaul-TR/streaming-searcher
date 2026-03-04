import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width / 2 - 20; // Dynamic calculation for column's width

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // TODO Delete ->Test data (placeholders)
  const dummyMovies = [
    { id: "1", title: "Inception", year: "2010" },
    { id: "2", title: "Interstellar", year: "2014" },
    { id: "3", title: "The Dark Knight", year: "2008" },
    { id: "4", title: "Dunkirk", year: "2017" },
    { id: "5", title: "Oppenheimer", year: "2023" },
  ];

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
          placeholder="Search a film or TV-serie"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Results List */}
      <FlatList
        data={dummyMovies}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable style={styles.filmCard}>
            <View style={styles.posterPlaceholder}>
              <Ionicons name="image-outline" size={40} color="#475569" />
            </View>
            <Text style={styles.filmTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.filmYear}>{item.year}</Text>
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
  filmCard: {
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
  },
  filmTitle: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  filmYear: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },
});
