// src/components/ApiStateDisplay.tsx
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

type Props =
  | { state: "loading" }
  | { state: "error"; message?: string }
  | { state: "empty"; message?: string; icon?: React.ReactNode };

/**
 * Renders the state of a API petition: loading, error or empty.
 * Uses a discriminated union type so that every state has its own props.
 */
export default function ApiStateDisplay(props: Props) {
  if (props.state === "loading") {
    return <ActivityIndicator color={Colors.primary} style={styles.centered} />;
  }

  if (props.state === "error") {
    return (
      <View style={[styles.box, styles.errorBox]}>
        <Ionicons name="alert-circle-outline" size={28} color={Colors.error} />
        <Text style={styles.errorText}>
          {props.message ?? "Something went wrong. Check your connection."}
        </Text>
      </View>
    );
  }

  // state === "empty"
  return (
    <View style={styles.box}>
      {props.icon ?? (
        <Ionicons name="alert-circle-outline" size={24} color="#475569" />
      )}
      <Text style={styles.emptyText}>
        {props.message ?? "No results found."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { marginTop: 20 },
  box: {
    alignItems: "center",
    gap: 12,
    padding: 24,
    borderRadius: 12,
    marginTop: 10,
  },
  errorBox: {
    backgroundColor: "rgba(248,113,113,0.08)",
  },
  errorText: {
    color: Colors.error,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 14,
  },
});