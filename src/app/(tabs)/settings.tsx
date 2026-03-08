import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import { CountryPickerModal } from "@/components/CountryPickerModal";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showCountryModal, setShowCountryModal] = useState(false);

  const { country, setCountry, resetOnboarding } = useUserStore();

  const handleResetOnboarding = () => {
    Alert.alert(
      "Restart Setup",
      "This will reset your onboarding preferences and take you back to the setup screen.",
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.heading}>Settings</Text>

      {/* Region */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Region</Text>

        <Pressable
          style={styles.row}
          onPress={() => setShowCountryModal(true)}
          android_ripple={{ color: "rgba(255,255,255,0.05)" }}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="globe-outline" size={22} color="#60A5FA" />
            <Text style={styles.rowTitle}>Country</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{country}</Text>
            <Ionicons name="chevron-forward" size={18} color="#475569" />
          </View>
        </Pressable>
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
            <Text style={[styles.rowTitle, { color: "#F87171" }]}>
              Restart Setup
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#475569" />
        </Pressable>
      </View>

      <CountryPickerModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        selectedCountry={country}
        onSelect={setCountry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", paddingHorizontal: 20 },
  heading: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 30,
  },
  section: { marginBottom: 30 },
  sectionLabel: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
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
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowTitle: { color: "#F8FAFC", fontSize: 16 },
  rowValue: { color: "#94A3B8", fontSize: 15 },
});
