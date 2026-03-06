import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { tmdbApi } from "@/services/api";
import { useUserStore } from "@/store/useUserStore";
import { Provider } from "@/types/providers";

export default function DetailsModal() {
  const { id, title, year, overview, poster_path, media_type } =
    useLocalSearchParams<{
      id: string;
      title: string;
      year: string;
      overview: string;
      poster_path?: string;
      media_type: "movie" | "tv" | "person";
    }>();

  const [isInfoExpanded, setInfoIsExpanded] = useState(false);
  const { country } = useUserStore();

  // Fetch from TMDB Providers API
  const { data: providers, isLoading } = useQuery({
    queryKey: ["providers", id, media_type, country],
    queryFn: () => tmdbApi.getWatchProviders(id, media_type, country),
    enabled: media_type !== "person", // Never fetch if media_type is "person"
  });

  // Helper function to render providers logos
  const renderProviderIcons = (list: Provider[]) => (
    <View style={styles.providerIconsGrid}>
      {list.map((provider) => (
        <View key={provider.provider_id} style={styles.providerItem}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
            }}
            style={styles.providerLogo}
          />
          <Text style={styles.providerName} numberOfLines={1}>
            {provider.provider_name}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Visual cue "Swipe to close" */}
      <View style={styles.modalHandle} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Info and Poster */}
        <View style={styles.header}>
          <View style={styles.posterContainer}>
            {poster_path ? (
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w500${poster_path}`,
                }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              /* Combined poster size with plageholder background */
              <View style={[styles.poster, styles.placeholderInside]}>
                <Ionicons
                  name={
                    media_type === "person" ? "person-outline" : "film-outline"
                  }
                  size={40}
                  color="#475569"
                />
                <Text style={styles.placeholderInsideText}>
                  {media_type === "person" ? "No Photo" : "No Poster"}
                </Text>
              </View>
            )}

            {/* Badge de tipo sobre el póster del Modal */}
            <View style={styles.typeBadge}>
              {media_type === "movie" && (
                <Ionicons name="film" size={16} color="#FFF" />
              )}
              {media_type === "tv" && (
                <Feather name="tv" size={16} color="#FFF" />
              )}
              {media_type === "person" && (
                <Ionicons name="person-circle" size={16} color="#FFF" />
              )}
            </View>
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.title} numberOfLines={3}>
              {title}
            </Text>
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{year}</Text>
            </View>
            <View style={styles.overviewSection}>
              <Pressable onPress={() => setInfoIsExpanded(!isInfoExpanded)}>
                <Text
                  style={styles.overviewText}
                  numberOfLines={isInfoExpanded ? undefined : 3}
                >
                  {overview || "No description available."}
                </Text>

                {/* Only display "more info" button if overview is long enough */}
                {overview && overview.length > 70 && (
                  <Text style={styles.readMore}>
                    {isInfoExpanded ? "Show less" : "Read more"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Separating line */}
        <View style={styles.separator} />

        {/* Streaming Providers */}
        <View style={styles.providersSection}>
          <Text style={styles.providersSectionTitle}>
            Where can you watch it?
          </Text>

          {media_type === "person" ? (
            <Text style={styles.noProvidersText}>
              Streaming info only available for movies and TV shows.
            </Text>
          ) : isLoading ? (
            <ActivityIndicator color="#60A5FA" style={{ marginTop: 20 }} />
          ) : !providers ||
            (!providers.free?.length &&
              !providers.flatrate?.length &&
              !providers.rent?.length &&
              !providers.buy?.length) ? (
            <View style={styles.emptyProviders}>
              <Ionicons name="alert-circle-outline" size={24} color="#475569" />
              <Text style={styles.noProvidersText}>
                Not available in {country} currently.
              </Text>
            </View>
          ) : (
            <View>
              {/* CATEGORY – Free */}
              {providers.free && providers.free.length > 0 && (
                <View style={styles.categoryRow}>
                  <Text style={styles.categoryTitle}>Free</Text>
                  {renderProviderIcons(providers.free)}
                </View>
              )}

              {/* CATEGORY – Subscription (Flatrate) */}
              {providers.flatrate && providers.flatrate.length > 0 && (
                <View style={styles.categoryRow}>
                  <Text style={styles.categoryTitle}>Stream</Text>
                  {renderProviderIcons(providers.flatrate)}
                </View>
              )}

              {/* CATEGORY – Rent */}
              {providers.rent && providers.rent.length > 0 && (
                <View style={styles.categoryRow}>
                  <Text style={styles.categoryTitle}>Rent</Text>
                  {renderProviderIcons(providers.rent)}
                </View>
              )}

              {/* CATEGORY – Buy */}
              {providers.buy && providers.buy.length > 0 && (
                <View style={styles.categoryRow}>
                  <Text style={styles.categoryTitle}>Buy</Text>
                  {renderProviderIcons(providers.buy)}
                </View>
              )}

              {/* JustWatch Badge */}
              {providers.link && (
                <Pressable
                  style={styles.justWatchButton}
                  onPress={() => Linking.openURL(providers.link)}
                >
                  <Text style={styles.justWatchText}>Data provided by</Text>
                  <Text style={styles.justWatchBrand}>JustWatch</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0F172A", // Azul oscuro profundo
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  posterContainer: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  poster: {
    width: 110,
    height: 165,
    borderRadius: 12,
    backgroundColor: "#1E293B",
  },
  typeBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  placeholderInside: {
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  placeholderInsideText: {
    color: "#475569",
    fontSize: 12,
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 5,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 20,
    paddingTop: 5,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
    marginBottom: 8,
  },
  yearBadge: {
    backgroundColor: "#1E293B",
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: 6,
  },
  yearText: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "600",
  },
  overviewSection: {
    paddingTop: 3,
    flex: 1,
  },
  readMore: {
    color: "#60A5FA",
    fontWeight: "500",
    marginTop: 3,
    paddingVertical: 2,
  },
  overviewText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 12,
    textAlign: "left",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: 10,
  },
  providersSection: {
    marginTop: 10,
  },
  providersSectionTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  categoryRow: {
    marginBottom: 20,
  },
  categoryTitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  providerIconsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  providerItem: {
    alignItems: "center",
    width: 60,
  },
  providerLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#1E293B",
  },
  providerName: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
  },
  noProvidersText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  emptyProviders: {
    alignItems: "center",
    padding: 20,
  },
  justWatchButton: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    paddingVertical: 8,
    borderRadius: 8,
  },
  justWatchText: {
    color: "#475569",
    fontSize: 11,
  },
  justWatchBrand: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "bold",
    marginLeft: 4,
  },
});
