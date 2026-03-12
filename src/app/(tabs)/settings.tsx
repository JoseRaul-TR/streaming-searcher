import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import SubscriptionPickerModal from "@/components/SubscriptionPickerModal";
import { Colors } from "@/constants/colors";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { countries, subscriptions, resetOnboarding } = useUserStore();

  const isGlobal = countries.length === 0;

  const countriesLabel = isGlobal
    ? "All regions"
    : countries.length === 1
      ? countries[0].name
      : `${countries[0].name} +${countries.length - 1} more`;

  const subscriptionsLabel =
    subscriptions.length === 0
      ? "None selected"
      : `${subscriptions.length} service${subscriptions.length > 1 ? "s" : ""}`;

  const handleResetOnboarding = () => {
    Alert.alert(
      "Restart Setup",
      "This will reset your preferences and take you back to the initial setup screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetOnboarding();
            router.replace("/onboarding");
          },
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom },
      ]}
    >
      {/* Search preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Search preferences</Text>

        {/* Countries → dedicated screen */}
        <Pressable
          style={styles.row}
          onPress={() => router.push("/country-picker")}
          android_ripple={{ color: "rgba(255,255,255,0.05)" }}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="globe-outline" size={22} color={Colors.primary} />
            <Text style={styles.rowTitle}>Countries</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue} numberOfLines={1}>
              {countriesLabel}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.surfaceAlt}
            />
          </View>
        </Pressable>

        <View style={styles.rowSpacer} />

        {/* Subscriptions — disabled when global */}
        <Pressable
          style={[styles.row, isGlobal && styles.rowDisabled]}
          onPress={() => !isGlobal && setShowSubscriptionModal(true)}
          android_ripple={{ color: "rgba(255,255,255,0.05)" }}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="tv-outline" size={22} color={Colors.primary} />
            <Text style={styles.rowTitle}>My Subscriptions</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue} numberOfLines={1}>
              {subscriptionsLabel}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.surfaceAlt}
            />
          </View>
        </Pressable>

        {isGlobal && (
          <Text style={styles.hint}>
            Select one or more countries first to manage subscriptions.
          </Text>
        )}
      </View>

      {/* App */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>App</Text>

        <Pressable
          style={styles.row}
          onPress={handleResetOnboarding}
          android_ripple={{ color: "rgba(255,255,255,0.05)" }}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="refresh-outline" size={22} color={Colors.error} />
            <Text style={[styles.rowTitle, styles.rowTitleDanger]}>
              Restart Setup
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.surfaceAlt}
          />
        </Pressable>
      </View>

      <SubscriptionPickerModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        countries={countries}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  section: { marginBottom: 30 },
  sectionLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    overflow: "hidden",
  },
  rowDisabled: { opacity: 0.4 },
  rowSpacer: { height: 8 },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  rowTitle: { color: Colors.text, fontSize: 16 },
  rowTitleDanger: { color: Colors.error },
  rowValue: { color: Colors.textMuted, fontSize: 14, maxWidth: 140 },
  hint: {
    color: Colors.surfaceAlt,
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
});
