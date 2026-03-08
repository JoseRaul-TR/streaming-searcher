import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SearchedItem } from "@/types/searchedItem";

const COLUMN_WIDTH = (Dimensions.get("window").width - 40) / 2;

interface Props {
  item: SearchedItem;
  onPress: () => void;
}

export function MediaCard({ item, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.posterContainer}>
        {item.poster_path ? (
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
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

        {/* Media type badge */}
        <View style={styles.badge}>
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

      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.year}>{item.year}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: COLUMN_WIDTH,
    marginBottom: 15,
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
    marginBottom: 10,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E293B",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(15,23,42,0.7)",
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  year: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 4,
  },
});
