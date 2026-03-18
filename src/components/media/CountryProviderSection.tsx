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
  data: Pick<WatchProvidersData, "free" | "flatrate" | "rent" | "buy">;
  subscribedKeys: Set<string>;
  countryCode: string;
};

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
  data: WatchProvidersData[];
  subscribedKeys: Set<string>;
  defaultExpanded?: boolean;
};

export default function CountryProviderSection({
  data,
  subscribedKeys,
  defaultExpanded = false,
}: Props) {
  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(data.map((c) => [c.countryCode, defaultExpanded])),
  );

  const toggle = (code: string) =>
    setExpanded((prev) => ({ ...prev, [code]: !prev[code] }));

  return (
    <>
      {data.map((country) => (
        <View
          key={country.countryCode}
          style={[
            styles.countryBlockShadow,
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

            {expanded[country.countryCode] && (
              <View style={styles.categories}>
                <ProviderCategories
                  data={country}
                  subscribedKeys={subscribedKeys}
                  countryCode={country.countryCode}
                />
                {/* JustWatch link — per country, only when available */}
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
      borderRadius: 50,
      backgroundColor: colors.surface,
      ...getShadow({ isDark }),
    },
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
