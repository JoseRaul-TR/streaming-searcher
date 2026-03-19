// src/components/ApiStateDisplay.tsx
import React, { useMemo } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ColorScheme, withOpacity } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

/**
 * Discriminated union for ApiStateDisplay props.
 *
 * Each state variant only exposes the props that are relevant to it:
 * - "loading" has no extra props — the spinner is self-contained.
 * - "error" accepts an optional message to override the default text.
 * - "empty" accepts an optional message and an optional custom icon node.
 *
 * Using a discriminated union instead of a flat interface with all optional
 * fields means TypeScript enforces that callers only provide props that make
 * sense for the given state, and narrows the type correctly inside the component.
 */
type Props =
  | { state: "loading" }
  | { state: "error"; message?: string }
  | { state: "empty"; message?: string; icon?: React.ReactNode };

/**
 * Renders one of three common asynchronous states: loading, error, or empty.
 *
 * Centralizes these states so every screen and component shows a consistent
 * UI when data is not available, without duplicating spinner/error/empty markup.
 *
 * - loading: renders an ActivityIndicator in colors.primary.
 * - error: renders an alert icon and message on a colors.error tinted background.
 * - empty: renders a customizable icon (defaults to alert-circle-outline) and
 *     message on a neutral background.
 *
 * @param props.state - The current state to render. Determines which variant
 *   of the discriminated union is active and which JSX branch is returned.
 * @param props.message - (error, empty) Human-readable description shown below
 *   the icon. Falls back to a sensible default when omitted.
 * @param props.icon - (empty only) A custom React node to render instead of the
 *   default alert icon. Used in WatchlistScreen to show a bookmark icon.
 */
export default function ApiStateDisplay(props: Props) {
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (props.state === "loading") {
    return <ActivityIndicator color={colors.primary} style={styles.centered} />;
  }

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
