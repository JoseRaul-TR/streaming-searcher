import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useUserStore } from "@/store/useUserStore";
import { SearchedItem } from "@/types/searchedItem";
import { ColorScheme } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

type Props = {
  item: SearchedItem;
  onPress: () => void;
  // Optional fixed width — used when the card renders inside a horizontal list
  // (e.g. KnownForSection). When omitted, the card fills half the screen width
  // as in the two-column grid on ExploreScreen.
  width?: number;
};

export default function MediaCard({ item, onPress, width: widthProp }: Props) {
  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useUserStore();

  // useWindowDimensions re-renders if dimensions change (rotation, iPad
  // multitasking), unlike the module-level Dimensions.get() which is
  // calculated once at import time.
  const { width: windowWidth } = useWindowDimensions();
  const cardWith = widthProp ?? (windowWidth - 40) / 2;

  const saved =
    item.media_type !== "person" && isInWatchlist(item.id, item.media_type);

  const handleWatchlist = useCallback(() => {
    if (item.media_type === "person") return;
    if (saved) {
      removeFromWatchlist(item.id, item.media_type);
    } else {
      addToWatchlist({
        id: item.id,
        media_type: item.media_type,
        title: item.title,
        year: item.year,
        poster_path: item.poster_path,
        added_at: Date.now(),
      });
    }
  }, [saved, item, addToWatchlist, removeFromWatchlist]);

  return (
    <Pressable style={[styles.card, { width: cardWith }]} onPress={onPress}>
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
                color={colors.surfaceAlt}
              />
            )}
            {item.media_type === "tv" && (
              <Feather name="tv" size={50} color={colors.surfaceAlt} />
            )}
            {item.media_type === "person" && (
              <Ionicons
                name="person-outline"
                size={50}
                color={colors.surfaceAlt}
              />
            )}
          </View>
        )}

        {/* Media type badge - top left */}
        <View style={styles.mediaBadge}>
          {item.media_type === "movie" && (
            <Ionicons name="film-outline" size={14} color="#FFF" />
          )}
          {item.media_type === "tv" && (
            <Feather name="tv" size={14} color="#FFF" />
          )}
          {item.media_type === "person" && (
            <Ionicons name="person-circle" size={14} color="#FFF" />
          )}
        </View>
        {/* Watchlist badge - top right, only for movie/series */}
        {item.media_type !== "person" && (
          <Pressable
            style={styles.bookmarkBadge}
            onPress={handleWatchlist}
            hitSlop={6}
            android_ripple={{
              color: "rgba(255,255,255,0.15)",
              borderless: true,
            }}
          >
            <MaterialIcons
              name={saved ? "bookmark-added" : "bookmark-add"}
              size={18}
              color={saved ? colors.primary : "#FFF"}
            />
          </Pressable>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.year}>{item.year}</Text>
    </Pressable>
  );
}

function makeStyles(colors: ColorScheme, isDark: boolean) {
  return StyleSheet.create({
    card: {
      marginBottom: 15,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 10,
      alignItems: "center",
      // — iOS shadow —
      shadowColor: isDark ? "#000" : "#64748B",
      shadowOffset: { width: 0, height: isDark ? 4 : 2 },
      shadowOpacity: isDark ? 0.35 : 0.12,
      shadowRadius: isDark ? 8 : 6,
      // — Android elevation —
      elevation: isDark ? 6 : 3,
    },
    posterContainer: {
      width: "100%",
      height: 180,
      backgroundColor: colors.surfaceMid,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 10,
    },
    placeholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceMid,
    },
    mediaBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: "rgba(15,23,42,0.7)",
      padding: 6,
      borderRadius: 8,
    },
    bookmarkBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(15,23,42,0.7)",
      padding: 5,
      borderRadius: 8,
    },
    title: {
      color: colors.text,
      fontWeight: "bold",
      fontSize: 13,
      textAlign: "center",
    },
    year: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  });
}
