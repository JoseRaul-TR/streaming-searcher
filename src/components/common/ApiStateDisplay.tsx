// src/components/ApiStateDisplay.tsx
import React, { useMemo } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ColorScheme, withOpacity } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

type Props =
  | { state: "loading" }
  | { state: "error"; message?: string }
  | { state: "empty"; message?: string; icon?: React.ReactNode };

/**
 * Renders the three common API states: loading, error, and empty.
 * Uses a discriminated union so each state only exposes relevant props.
 */
export default function ApiStateDisplay(props: Props) {
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // loading state
  if (props.state === "loading") {
    return <ActivityIndicator color={colors.primary} style={styles.centered} />;
  }

  // error state
  if (props.state === "error") {
    return (
      <View style={[styles.box, styles.errorBox]}>
        <Ionicons name="alert-circle-outline" size={28} color={colors.error} />
        <Text style={styles.errorText}>
          {props.message ?? "Something went wrong. Check your connection."}
        </Text>
      </View>
    );
  }

  // empty state
  return (
    <View style={styles.box}>
      {props.icon ?? (
        <Ionicons
          name="alert-circle-outline"
          size={24}
          color={colors.surfaceAlt}
        />
      )}
      <Text style={styles.emptyText}>
        {props.message ?? "No results found."}
      </Text>
    </View>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    centered: { marginTop: 20 },
    box: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 24,
      borderRadius: 12,
      marginTop: 10,
    },
    errorBox: {
      backgroundColor: withOpacity(colors.error, 0.12),
    },
    errorText: {
      color: colors.error,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 20,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: "center",
      fontSize: 14,
    },
  });
}
