import React, { useState, useCallback } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWatchProviders } from "@/hooks/useWatchProviders";
import { useUserStore } from "@/store/useUserStore";
import CountryProviderSection from "@/components/CountryProviderSection";
import ProviderSection from "@/components/ProvidersSection";

export default function DetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { id, title, year, overview, poster_path, media_type } =
    useLocalSearchParams<{
      id: string;
      title: string;
      year: string;
      overview: string;
      poster_path?: string;
      media_type: "movie" | "tv" | "person";
    }>();

  const [expanded, setExpanded] = useState(false);
  const { countries, subscriptions } = useUserStore();

  const subscribedIds = new Set(subscriptions);
  const isMultiCountry = countries.length > 1;

  const { providers, isLoading, isError } = useWatchProviders(
    id,
    media_type,
    countries,
  );

  // useCallback: this handler is passed down to a Pressable inside the render.
  // Wrapping it prevents a new function reference on every re-render, which
  // would otherwise cause the Pressable to re-render unnecessarily.
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleToggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleOpenJustWatch = useCallback((link: string) => {
    void Linking.openURL(link);
  }, []);

  const hasProviders = providers.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: true }}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color="#94A3B8" />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Poster + Info */}
        <View style={styles.header}>
          <View style={styles.posterWrap}>
            {poster_path ? (
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w500${poster_path}`,
                }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.poster, styles.posterPlaceholder]}>
                <Ionicons
                  name={
                    media_type === "person" ? "person-outline" : "film-outline"
                  }
                  size={40}
                  color="#475569"
                />
              </View>
            )}
            <View style={styles.badge}>
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

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={3}>
              {title}
            </Text>
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{year}</Text>
            </View>
            <Pressable onPress={handleToggleExpanded}>
              <Text
                style={styles.overview}
                numberOfLines={expanded ? undefined : 3}
              >
                {overview || "No description available."}
              </Text>
              {overview && overview.length > 70 && (
                <Text style={styles.readMore}>
                  {expanded ? "Show less" : "Read more"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Streaming Providers */}
        <View style={styles.providers}>
          <Text style={styles.providersTitle}>Where can you watch it?</Text>

          {media_type === "person" ? (
            <Text style={styles.infoText}>
              Streaming info only available for movies and TV shows.
            </Text>
          ) : countries.length === 0 ? (
            <Text style={styles.infoText}>
              Select a country in Settings to see streaming providers.
            </Text>
          ) : isLoading ? (
            <ActivityIndicator color="#60A5FA" style={{ marginTop: 20 }} />
          ) : isError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={28} color="#F87171" />
              <Text style={styles.errorText}>
                Could not load streaming providers. Check your connection and
                try again.
              </Text>
            </View>
          ) : !hasProviders ? (
            <View style={styles.emptyProviders}>
              <Ionicons name="alert-circle-outline" size={24} color="#475569" />
              <Text style={styles.infoText}>
                Not available in{" "}
                {countries.length === 1
                  ? countries[0].name
                  : "your selected countries"}{" "}
                currently.
              </Text>
            </View>
          ) : isMultiCountry ? (
            /* Multi-country — hierarchical layout */
            <>
              <CountryProviderSection
                data={providers}
                subscribedIds={subscribedIds}
              />
              <View style={styles.justWatch}>
                <Text style={styles.jwLabel}>Data provided by </Text>
                <Text style={styles.jwBrand}>JustWatch</Text>
              </View>
            </>
          ) : (
            /* Single country — flat layout */
            <>
              <ProviderSection
                title="Free"
                providers={providers[0]?.free ?? []}
                subscribedIds={subscribedIds}
              />
              <ProviderSection
                title="Stream"
                providers={providers[0]?.flatrate ?? []}
                subscribedIds={subscribedIds}
              />
              <ProviderSection
                title="Rent"
                providers={providers[0]?.rent ?? []}
                subscribedIds={subscribedIds}
              />
              <ProviderSection
                title="Buy"
                providers={providers[0]?.buy ?? []}
                subscribedIds={subscribedIds}
              />
              {providers[0]?.link && (
                <Pressable
                  style={styles.justWatch}
                  onPress={() => Linking.openURL(providers[0].link!)}
                  android_ripple={{ color: "rgba(255,255,255,0.05)" }}
                >
                  <Text style={styles.jwLabel}>Data provided by </Text>
                  <Text style={styles.jwBrand}>JustWatch</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  backButton: { borderRadius: 20, padding: 4, overflow: "hidden" },
  topBarTitle: { color: "#FFF", fontSize: 17, fontWeight: "600", flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  posterWrap: { position: "relative", elevation: 8 },
  poster: {
    width: 110,
    height: 165,
    borderRadius: 12,
    backgroundColor: "#1E293B",
  },
  posterPlaceholder: { justifyContent: "center", alignItems: "center" },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(15,23,42,0.8)",
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  info: { flex: 1, marginLeft: 20, paddingTop: 5 },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
    marginBottom: 8,
  },
  yearBadge: {
    backgroundColor: "#1E293B",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  yearText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  overview: { color: "#94A3B8", fontSize: 13, lineHeight: 18 },
  readMore: { color: "#60A5FA", fontWeight: "500", marginTop: 4 },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 10,
  },
  providers: { marginTop: 10 },
  providersTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  infoText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  emptyProviders: { alignItems: "center", padding: 20, gap: 8 },
  errorBox: {
    alignItems: "center",
    gap: 12,
    padding: 24,
    backgroundColor: "rgba(248,113,113,0.08)",
    borderRadius: 12,
    marginTop: 10,
  },
  errorText: {
    color: "#F87171",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  justWatch: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  jwLabel: { color: "#475569", fontSize: 11 },
  jwBrand: { color: "#F8FAFC", fontSize: 11, fontWeight: "bold" },
});
