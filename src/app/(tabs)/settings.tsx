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

  const { country, countryName, setCountry, resetOnboarding } = useUserStore();

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
        // Top inset for status bar, bottom inset for Android nav buttons
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom },
      ]}
    >
      {/* Region */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Country</Text>

        <Pressable
          style={styles.row}
          onPress={() => setShowCountryModal(true)}
          android_ripple={{ color: "rgba(255,255,255,0.05)" }}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="globe-outline" size={22} color="#60A5FA" />
            <Text style={styles.rowValue} numberOfLines={1}>
              {countryName}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#475569" />
        </Pressable>
      </View>

      {/* App */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>App settings</Text>

        <Pressable
          style={styles.row}
          onPress={handleResetOnboarding}
          android_ripple={{ color: "rgba(255,255,255,0.05)" }}
        >
          {/* Left side: icon + label */}
          <View style={styles.rowLeft}>
            <Ionicons name="refresh-outline" size={22} color="#F87171" />
            <Text style={[styles.rowTitle, styles.rowTitleDanger]}>
              Restart Setup
            </Text>
          </View>

          {/* Right side: chevron only */}
          <Ionicons name="chevron-forward" size={18} color="#475569" />
        </Pressable>
      </View>

      {/* TODO - Theme selector*/}
      {/*       <View>

      </View> */}

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
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
  },
  heading: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
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
  rowTitle: {
    color: "#F8FAFC",
    fontSize: 16,
  },
  rowTitleDanger: {
    color: "#F87171",
  },
  rowValue: {
    color: "#94A3B8",
    fontSize: 15,
    maxWidth: 160,
  },
});
