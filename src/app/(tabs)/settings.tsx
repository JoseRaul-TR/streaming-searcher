import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import CountryPickerModal from "@/components/CountryPickerModal";
import SubscriptionPickerModal from "@/components/SubscriptionPickerModal";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const {
    countries,
    addCountry,
    removeCountry,
    subscriptions,
    resetOnboarding,
  } = useUserStore();

  const countriesLabel =
    countries.length === 0
      ? "Not set"
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
      "This will reset your preferences and take you back to the setup screen.",
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

        <Pressable
          style={styles.row}
          onPress={() => setShowCountryModal(true)}
          android_ripple={{ color: "rgba(255,255,255,0.05)" }}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="globe-outline" size={22} color="#60A5FA" />
            <Text style={styles.rowTitle}>Countries</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue} numberOfLines={1}>
              {countriesLabel}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#475569" />
          </View>
        </Pressable>

        <View style={styles.rowSpacer} />

        <Pressable
          style={[styles.row, countries.length === 0 && styles.rowDisabled]}
          onPress={() => countries.length > 0 && setShowSubscriptionModal(true)}
          android_ripple={{ color: "rgba(255,255,255,0.05)" }}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="tv-outline" size={22} color="#60A5FA" />
            <Text style={styles.rowTitle}>My Subscriptions</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue} numberOfLines={1}>
              {subscriptionsLabel}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#475569" />
          </View>
        </Pressable>

        {countries.length === 0 && (
          <Text style={styles.hint}>
            Select a country first to manage subscriptions.
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
            <Ionicons name="refresh-outline" size={22} color="#F87171" />
            <Text style={[styles.rowTitle, styles.rowTitleDanger]}>
              Restart Setup
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#475569" />
        </Pressable>
      </View>

      <CountryPickerModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        selectedCountries={countries}
        onAdd={addCountry}
        onRemove={removeCountry}
      />

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
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
  },
  section: { marginBottom: 30 },
  sectionLabel: {
    color: "#60A5FA",
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
    backgroundColor: "#1E293B",
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
  rowTitle: { color: "#F8FAFC", fontSize: 16 },
  rowTitleDanger: { color: "#F87171" },
  rowValue: { color: "#94A3B8", fontSize: 14, maxWidth: 140 },
  hint: {
    color: "#475569",
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
});
