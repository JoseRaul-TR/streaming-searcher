import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WatchlistScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="bookmark-outline" size={64} color="#1E293B" />
      <Text style={styles.title}>Watchlist</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: { color: "#F8FAFC", fontSize: 20, fontWeight: "700" },
  subtitle: { color: "#475569", fontSize: 14 },
});
