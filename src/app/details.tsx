import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWatchProviders } from "@/hooks/useWatchProviders";
import { useUserStore } from "@/store/useUserStore";
import CountryProviderSection from "@/components/CountryProviderSection";
import ProviderSection from "@/components/ProvidersSection";
import ApiStateDisplay from "@/components/ApiStateDisplay";
import { Colors, withOpacity } from "@/constants/colors";

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

  // Composite key: "${countryCode}:${providerId}"
  // This ensures that the same provider available in multiple countries
  // only gets highlighted in the country the user is actually subscribed to.
  const subscribedKeys = new Set(
    subscriptions.map((s) => `${s.countryCode}:${s.providerId}`),
  );
  // Single country → flat category layout (no country header needed).
  // Multiple countries or global (countries=[]) → collapsible tabs per country.
  const isSingleCountry = countries.length === 1;

  const { providers, isLoading, isError } = useWatchProviders(
    id,
    media_type,
    countries,
  );

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
          onPress={handleBack}
          android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: true }}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textMuted} />
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
                  color={Colors.surfaceAlt}
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

        {/* Streaming providers */}
        <View style={styles.providers}>
          <Text style={styles.providersTitle}>Where can you watch it?</Text>

          {media_type === "person" ? (
            <Text style={styles.infoText}>
              Streaming info only available for movies and TV shows.
            </Text>
          ) : isLoading ? (
            <ApiStateDisplay state="loading" />
          ) : isError ? (
            <ApiStateDisplay
              state="error"
              message="Could not load streaming providers. Check your connection and try again."
            />
          ) : !hasProviders ? (
            <ApiStateDisplay
              state="empty"
              message={
                countries.length === 0
                  ? "Not available on any streaming service."
                  : `Not available in ${
                      isSingleCountry
                        ? countries[0].name
                        : "your selected countries"
                    } currently.`
              }
            />
          ) : isSingleCountry ? (
            /* ── Single country: flat category layout ── */
            <>
              <ProviderSection
                title="Free"
                providers={providers[0]?.free ?? []}
                subscribedKeys={subscribedKeys}
                countryCode={providers[0]?.countryCode ?? ""}
              />
              <ProviderSection
                title="Stream"
                providers={providers[0]?.flatrate ?? []}
subscribedKeys={subscribedKeys}
                countryCode={providers[0]?.countryCode ?? ""}              />
              <ProviderSection
                title="Rent"
                providers={providers[0]?.rent ?? []}
subscribedKeys={subscribedKeys}
                countryCode={providers[0]?.countryCode ?? ""}              />
              <ProviderSection
                title="Buy"
                providers={providers[0]?.buy ?? []}
subscribedKeys={subscribedKeys}
                countryCode={providers[0]?.countryCode ?? ""}              />
              {providers[0]?.link && (
                <Pressable
                  style={styles.justWatch}
                  onPress={() => handleOpenJustWatch(providers[0].link!)}
                  android_ripple={{ color: "rgba(255,255,255,0.05)" }}
                >
                  <Text style={styles.jwLabel}>Data provided by </Text>
                  <Text style={styles.jwBrand}>JustWatch</Text>
                </Pressable>
              )}
            </>
          ) : (
            /* ── Multiple countries / global: collapsible tabs per country ── */
            <>
              <CountryProviderSection
                data={providers}
                subscribedKeys={subscribedKeys}
                defaultExpanded={false}
              />
              <View style={styles.justWatch}>
                <Text style={styles.jwLabel}>Data provided by </Text>
                <Text style={styles.jwBrand}>JustWatch</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 15 },
  posterWrap: { position: "relative", elevation: 8 },
  poster: {
    width: 110,
    height: 165,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  posterPlaceholder: { justifyContent: "center", alignItems: "center" },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: withOpacity(Colors.background, 0.8),
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
    backgroundColor: Colors.surface,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  yearText: { color: Colors.textMuted, fontSize: 13, fontWeight: "600" },
  overview: { color: Colors.textMuted, fontSize: 13, lineHeight: 18 },
  readMore: { color: Colors.primary, fontWeight: "500", marginTop: 4 },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 10,
  },
  providers: { marginTop: 10 },
  providersTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  infoText: {
    color: Colors.textDisabled,
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
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
  jwLabel: { color: Colors.surfaceAlt, fontSize: 11 },
  jwBrand: { color: Colors.text, fontSize: 11, fontWeight: "bold" },
});
