import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ColorScheme } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

export default function WatchlistScreen() {
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Ionicons name="bookmark-outline" size={64} color={colors.surfaceMid} />
      <Text style={styles.title}>Watchlist</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    title: { color: colors.text, fontSize: 20, fontWeight: "700" },
    subtitle: { color: colors.textMuted, fontSize: 14 },
  });
}
