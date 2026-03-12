import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Provider } from "@/types/providers";
import ProviderLogo from "./ProviderLogo";
import { Colors } from "@/constants/colors";

type Props = {
  title: string;
  providers: Provider[];
  subscribedIds?: Set<number>;
};

export default function ProviderSection({
  title,
  providers,
  subscribedIds,
}: Props) {
  if (!providers?.length) return null;

  return (
    <View style={styles.category}>
      <Text style={styles.categoryTitle}>{title}</Text>

      <View style={styles.grid}>
        {providers.map((p) => (
          <ProviderLogo
            key={p.provider_id}
            provider={p}
            isSubscribed={subscribedIds?.has(p.provider_id) ?? false}
            size={50}
            nameLines={2}
            animated
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  category: { marginBottom: 20 },
  categoryTitle: {
    color: Colors.textDisabled,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
});
