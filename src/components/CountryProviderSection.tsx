import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WatchProvidersData } from "@/types/providers";
import ProviderSection from "./ProvidersSection";

type Props = {
  data: WatchProvidersData[];
  subscribedIds: Set<number>;
};

export default function CountryProviderSection({ data, subscribedIds }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(data.map((c) => [c.countryCode, true])),
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
              color="#475569"
            />
          </Pressable>

          {expanded[country.countryCode] && (
            <View style={styles.categories}>
              <ProviderSection
                title="Free"
                providers={country.free ?? []}
                subscribedIds={subscribedIds}
              />
              <ProviderSection
                title="Stream"
                providers={country.flatrate ?? []}
                subscribedIds={subscribedIds}
              />
              <ProviderSection
                title="Rent"
                providers={country.rent ?? []}
                subscribedIds={subscribedIds}
              />
              <ProviderSection
                title="Buy"
                providers={country.buy ?? []}
                subscribedIds={subscribedIds}
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
    backgroundColor: "#1E293B",
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
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  categories: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
