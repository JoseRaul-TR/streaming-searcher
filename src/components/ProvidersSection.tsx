import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Provider } from "@/types/providers";

interface Props {
  title: string;
  providers: Provider[];
}

export function ProviderSection({ title, providers }: Props) {
  if (!providers?.length) return null;

  return (
    <View style={styles.category}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <View style={styles.grid}>
        {providers.map((p) => (
          <View key={p.provider_id} style={styles.item}>
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/original${p.logo_path}`,
              }}
              style={styles.logo}
            />
            <Text style={styles.name} numberOfLines={1}>
              {p.provider_name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  category: { marginBottom: 20 },
  categoryTitle: {
    color: "#64748B",
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
  item: {
    alignItems: "center",
    width: 60,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#1E293B",
  },
  name: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
  },
});
