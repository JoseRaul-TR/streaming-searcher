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
import { ColorScheme, withOpacity } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";
import { getShadow } from "@/utils/shadow";

type Props = {
  /** The search result item to render. Can be a movie, TV series, or person. */
  item: SearchedItem;
  /** Called when the user taps anywhere on the card (except the bookmark badge). */
  onPress: () => void;
  /**
   * Optional fixed width in px. Used when the card renders inside a horizontal
   * FlatList (e.g. KnownForSection). When omitted, the card fills half the
   * screen width minus gutters, matching the two-column grid on ExploreScreen.
   *
   * A single width prop avoids creating a separate component for the horizontal
   * list — the visual language stays consistent between the two contexts.
   */
  width?: number;
};

/**
 * Renders a vertically oriented card for a movie, TV series, or person.
 *
 * Used in two layouts:
 * - Two-column grid on ExploreScreen and WatchlistScreen (width omitted).
 * - Horizontal list in KnownForSection on DetailsScreen (width prop provided).
 *
 * The card width is computed from useWindowDimensions rather than the
 * module-level Dimensions.get() so the card reacts correctly to orientation
 * changes and iPad multitasking — Dimensions.get() is evaluated once at import
 * time and does not update.
 *
 * The bookmark badge (top-right) is a separate Pressable nested inside the
 * card Pressable. React Native propagates touch events to the innermost handler,
 * so tapping the badge calls handleWatchlist without also triggering onPress.
 *
 * @param props.item - The SearchedItem to render. media_type drives the
 *   placeholder icon, the type badge icon, and whether the bookmark badge
 *   is shown (persons cannot be saved to the watchlist).
 * @param props.onPress - Navigation callback — called when the card body is tapped.
 * @param props.width - Optional override for the card width in px.
 */
export default function MediaCard({ item, onPress, width: widthProp }: Props) {
  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useUserStore();

  const { width: windowWidth } = useWindowDimensions();
  // Default: fill half the screen width with a 20px gutter on each side
  // (10px padding × 2 columns + 20px outer padding = 40px total).
  const cardWith = widthProp ?? (windowWidth - 40) / 2;

  // Persons cannot be saved — isInWatchlist is never called for them.
  const saved =
    item.media_type !== "person" && isInWatchlist(item.id, item.media_type);

  /**
   * Toggles the watchlist state for this item.
   *
   * Wrapped in useCallback to produce a stable function reference — this
   * handler is passed to the bookmark Pressable inside a FlatList renderItem,
   * so avoiding a new reference on every render prevents unnecessary re-renders
   * of the Pressable.
   *
   * The composite key (id + media_type) is used because TMDB can assign the
   * same numeric id to both a movie and a TV series — id alone is not unique.
   */
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
          // Placeholder — shown when TMDB has no poster/profile image.
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
        {/* Media type badge — top left, always visible */}
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
        {/* Bookmark badge — top right, only for movie/tv.
            Nested Pressable so tapping it does not also trigger onPress. */}
        {item.media_type !== "person" && (
          <Pressable
            style={styles.bookmarkBadge}
            onPress={handleWatchlist}
            hitSlop={6}
            android_ripple={{
              color: withOpacity("#FFFFFF", 0.15),
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

      {/* For persons, item.year contains the known_for_department (e.g. "Acting"). */}
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
      // Platform-aware shadow: blue-grey in light mode (softer, blends with
      // the cool palette), stronger black in dark mode (more dramatic contrast).
      ...getShadow({ isDark }),
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
      backgroundColor: withOpacity("#0F172A", 0.7),
      padding: 6,
      borderRadius: 8,
    },
    bookmarkBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: withOpacity("#0F172A", 0.7),
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
