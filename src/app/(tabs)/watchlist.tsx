import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

export default function WatchlistScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="bookmark-outline" size={64} color={Colors.surface} />
      <Text style={styles.title}>Watchlist</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: "700" },
  subtitle: { color: Colors.surfaceAlt, fontSize: 14 },
});
