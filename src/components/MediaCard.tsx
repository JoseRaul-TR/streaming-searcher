import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SearchedItem } from "@/types/searchedItem";
import { Colors } from "@/constants/colors";

type Props = {
  item: SearchedItem;
  onPress: () => void;
};

export default function MediaCard({ item, onPress }: Props) {
  // useWindowDimensions re-renders if dimensions change (rotation, iPad multitasking),
  // unlike the module-level Dimensions.get() which is calculated once at import time.
  const { width } = useWindowDimensions();
  const columnWidth = (width - 40) / 2;

  return (
    <Pressable style={[styles.card, { width: columnWidth }]} onPress={onPress}>
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
              <Ionicons
                name="film-outline"
                size={50}
                color={Colors.surfaceAlt}
              />
            )}
            {item.media_type === "tv" && (
              <Feather name="tv" size={50} color={Colors.surfaceAlt} />
            )}
            {item.media_type === "person" && (
              <Ionicons
                name="person-outline"
                size={50}
                color={Colors.surfaceAlt}
              />
            )}
          </View>
        )}

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
    marginBottom: 15,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  posterContainer: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.surfaceMid,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
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
  year: { color: Colors.textMuted, fontSize: 10, marginTop: 4 },
});
