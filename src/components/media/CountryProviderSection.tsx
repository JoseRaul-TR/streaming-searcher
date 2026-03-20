import React, { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { WatchProvidersData } from "@/types/providers";
import ProviderSection from "./ProvidersSection";
import { ColorScheme, withOpacity } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";
import { getShadow } from "@/utils/shadow";

// ————— Internal Sub-component —————
type ProviderCategoriesProps = {
  /**
   * A subset of WatchProvidersData containing only the four provider category
   * arrays. Using Pick keeps this sub-component decoupled from fields it does
   * not need (countryCode, countryName, link).
   */
  data: Pick<WatchProvidersData, "free" | "flatrate" | "rent" | "buy">;
  /** Set of "countryCode:providerId" composite keys for O(1) subscription lookups. */
  subscribedKeys: Set<string>;
  /** ISO 3166-1 alpha-2 code for the country these providers belong to. */
  countryCode: string;
};

/**
 * Renders the four provider category sections (Free, Stream, Rent, Buy) for
 * a single country.
 *
 * Extracted as a sub-component so CountryProviderSection can render the same
 * four sections inside each collapsible country block without repeating the
 * four ProviderSection calls. ProviderSection itself returns null when its
 * providers array is empty, so categories with no providers are hidden
 * automatically without any conditional logic here.
 *
 * @param props.data - The provider arrays for this country.
 * @param props.subscribedKeys - Passed through to each ProviderSection so
 *   subscribed provider logos are highlighted.
 * @param props.countryCode - Passed through to each ProviderSection to build
 *   the composite key for subscription lookups.
 */
function ProviderCategories({
  data,
  subscribedKeys,
  countryCode,
}: ProviderCategoriesProps) {
  return (
    <>
      <ProviderSection
        title="Free"
        providers={data.free ?? []}
        subscribedKeys={subscribedKeys}
        countryCode={countryCode}
      />
      <ProviderSection
        title="Stream"
        providers={data.flatrate ?? []}
        subscribedKeys={subscribedKeys}
        countryCode={countryCode}
      />
      <ProviderSection
        title="Rent"
        providers={data.rent ?? []}
        subscribedKeys={subscribedKeys}
        countryCode={countryCode}
      />
      <ProviderSection
        title="Buy"
        providers={data.buy ?? []}
        subscribedKeys={subscribedKeys}
        countryCode={countryCode}
      />
    </>
  );
}

// ————— Main Component ——————
type Props = {
  /** One WatchProvidersData entry per country to render. */
  data: WatchProvidersData[];
  /** Set of "countryCode:providerId" composite keys for O(1) subscription lookups. */
  subscribedKeys: Set<string>;
  /**
   * Whether each country block starts expanded. Defaults to false.
   * In DetailsScreen, all countries start collapsed so the user can scan
   * the list of available countries before drilling into one.
   */
  defaultExpanded?: boolean;
};

/**
 * Renders streaming provider availability for multiple countries as a list
 * of collapsible cards — one card per country.
 *
 * Used in DetailsScreen when countries.length > 1 or when global mode is
 * active (countries = []). For single-country mode, DetailsScreen renders
 * flat ProviderSection components directly instead.
 *
 * Collapse state is managed locally with a Record<string, boolean> keyed by
 * countryCode. Object.fromEntries initialises every country to defaultExpanded
 * so the initial state always matches the data, even if the data changes.
 *
 * The toggle function uses the functional form of setExpanded so it always
 * reads the latest state — important if multiple toggles fire in quick
 * succession before React batches the updates.
 *
 * Visual shape: collapsed → pill (borderRadius 50), expanded → card
 * (borderRadius 14). Both the shadow wrapper and the inner block need their
 * borderRadius updated together because the shadow wrapper clips the inner
 * overflow on Android.
 *
 * @param props.data - The array of WatchProvidersData to render, one entry per country.
 * @param props.subscribedKeys - Passed down to ProviderCategories for badge highlighting.
 * @param props.defaultExpanded - Initial expanded state for all country blocks.
 */
export default function CountryProviderSection({
  data,
  subscribedKeys,
  defaultExpanded = false,
}: Props) {
  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  /**
   * Tracks the expanded/collapsed state of each country block.
   * Keyed by countryCode so lookups are O(1) and independent — expanding
   * one country does not affect any other.
   *
   * Initialized from data so the record always has an entry for every country
   * in the current data array, even if data changes after mount.
   */
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(data.map((c) => [c.countryCode, defaultExpanded])),
  );

  /**
   * Toggles the expanded state of a single country block.
   * Uses the functional updater form (prev => ...) so the latest state is
   * always read, avoiding stale closure issues if toggles fire rapidly.
   *
   * @param code - The ISO 3166-1 alpha-2 code of the country to toggle.
   */
  const toggle = (code: string) =>
    setExpanded((prev) => ({ ...prev, [code]: !prev[code] }));

  return (
    <>
      {data.map((country) => (
        <View
          key={country.countryCode}
          style={[
            styles.countryBlockShadow,
            // Shape transitions from pill to card when expanded.
            expanded[country.countryCode] && styles.countryBlockShadowExpanded,
          ]}
        >
          <View
            style={[
              styles.countryBlock,
              expanded[country.countryCode] && styles.countryBlockExpanded,
            ]}
          >
            <Pressable
              style={styles.countryHeader}
              onPress={() => toggle(country.countryCode)}
              android_ripple={{ color: withOpacity(colors.primary, 0.08) }}
            >
              <Text style={styles.countryName}>{country.countryName}</Text>
              <Ionicons
                name={
                  expanded[country.countryCode] ? "chevron-up" : "chevron-down"
                }
                size={18}
                color={colors.surfaceAlt}
              />
            </Pressable>

            {/* Provider categories — only rendered when expanded.
                Conditional rendering (not opacity/scale) so ProviderLogo
                animations do not run for off-screen countries. */}
            {expanded[country.countryCode] && (
              <View style={styles.categories}>
                <ProviderCategories
                  data={country}
                  subscribedKeys={subscribedKeys}
                  countryCode={country.countryCode}
                />
                {/* JustWatch attribution link — shown per country, only when
                    TMDB provides a link for this title in this country. */}
                {country.link && (
                  <Pressable
                    style={styles.jwRow}
                    onPress={() =>
                      void WebBrowser.openBrowserAsync(country.link!)
                    }
                    android_ripple={{
                      color: withOpacity(colors.primary, 0.05),
                    }}
                  >
                    <Text style={styles.jwLabel}>Data provided by </Text>
                    <Text style={styles.jwBrand}>JustWatch</Text>
                    <Ionicons
                      name="open-outline"
                      size={10}
                      color={colors.surfaceAlt}
                      style={{ marginLeft: 3 }}
                    />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      ))}
    </>
  );
}

function makeStyles(colors: ColorScheme, isDark: boolean) {
  return StyleSheet.create({
    countryBlockShadow: {
      marginBottom: 10,
      // Pill shape when collapsed — matches the subscription tab style.
      borderRadius: 50,
      backgroundColor: colors.surface,
      ...getShadow({ isDark }),
    },
    // Transition to card shape when expanded to give the open block more
    // visual weight and clearly separate it from adjacent collapsed blocks.
    countryBlockShadowExpanded: {
      borderRadius: 14,
    },
    countryBlock: {
      borderRadius: 50,
      overflow: "hidden",
      backgroundColor: colors.surface,
    },
    countryBlockExpanded: {
      borderRadius: 14,
    },
    countryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    countryName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    categories: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    jwRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 5,
    },
    jwLabel: { color: colors.surfaceAlt, fontSize: 11 },
    jwBrand: { color: colors.textSecondary, fontSize: 11, fontWeight: "600" },
  });
}
