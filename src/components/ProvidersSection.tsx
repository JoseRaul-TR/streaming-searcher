import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Provider } from "@/types/providers";

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
        {providers.map((p) => {
          const isSubscribed = subscribedIds?.has(p.provider_id) ?? false;
          return (
            <View key={p.provider_id} style={styles.item}>
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/original${p.logo_path}`,
                }}
                style={[styles.logo, isSubscribed && styles.logoSubscribed]}
              />
              {isSubscribed && <View style={styles.subscribedDot} />}
              <Text style={styles.name} numberOfLines={1}>
                {p.provider_name}
              </Text>
            </View>
          );
        })}
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
  logoSubscribed: {
    borderWidth: 2,
    borderColor: "#22C55E",
  },
  subscribedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    position: "absolute",
    top: -2,
    right: -2,
  },
  name: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
  },
});
