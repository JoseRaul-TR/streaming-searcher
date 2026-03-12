import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WatchProvidersData } from "@/types/providers";
import ProviderSection from "./ProvidersSection";
import { Colors } from "@/constants/colors";

// ————— Internal Subcomponent —————
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(data.map((c) => [c.countryCode, defaultExpanded])),
  );

  const toggle = (code: string) =>
    setExpanded((prev) => ({ ...prev, [code]: !prev[code] }));

  return (
    <>
      {data.map((country) => (
        <View key={country.countryCode} style={styles.countryBlock}>
          <Pressable
            style={styles.countryHeader}
            onPress={() => toggle(country.countryCode)}
            android_ripple={{ color: "rgba(255,255,255,0.05)" }}
          >
            <Text style={styles.countryName}>{country.countryName}</Text>
            <Ionicons
              name={
                expanded[country.countryCode] ? "chevron-up" : "chevron-down"
              }
              size={18}
              color={Colors.surfaceAlt}
            />
          </Pressable>

          {expanded[country.countryCode] && (
            <View style={styles.categories}>
              <ProviderCategories
                data={country}
                subscribedKeys={subscribedKeys}
                countryCode={country.countryCode}
              />
            </View>
          )}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  countryBlock: {
    marginBottom: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
  },
  countryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  countryName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  categories: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
