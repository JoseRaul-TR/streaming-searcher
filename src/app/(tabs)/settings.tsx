import React, { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import SubscriptionPickerModal from "@/components/SubscriptionPickerModal";
import { ColorScheme, ModePreference, withOpacity } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

const MODE_OPTIONS: { label: string; value: ModePreference }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const {
    countries,
    subscriptions,
    resetOnboarding,
    modePreference,
    setModePreference,
  } = useUserStore();

  const isGlobal = countries.length === 0;

  const countriesLabel = isGlobal
    ? "All countries"
    : countries.length === 1
      ? countries[0].name
      : `${countries[0].name} +${countries.length - 1} more`;

  const subscriptionsLabel =
    subscriptions.length === 0
      ? "None"
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
      {/* Appearance settings (System|Light|Dark Mode) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="theme-light-dark"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.sectionLabel}>Appearance</Text>
        </View>

        <View style={styles.segmentedRow}>
          {MODE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.segment,
                modePreference === option.value && styles.segmentActive,
              ]}
              onPress={() => setModePreference(option.value)}
              android_ripple={{ color: withOpacity(colors.primary, 0.1) }}
            >
              <Text
                style={[
                  styles.segmentText,
                  modePreference === option.value && styles.segmentTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Search preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Search Settings</Text>

        {/* Countries → dedicated screen */}
        <Pressable
          style={styles.row}
          onPress={() => router.push("/country-picker")}
          android_ripple={{ color: withOpacity(colors.primary, 0.08) }}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="globe-outline" size={22} color={colors.primary} />
            <Text style={styles.rowTitle}>Countries</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue} numberOfLines={1}>
              {countriesLabel}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.surfaceAlt}
            />
          </View>
        </Pressable>

        {/* Subscriptions — disabled when global */}
        <Pressable
          style={[styles.row, isGlobal && styles.rowDisabled]}
          onPress={() => !isGlobal && setShowSubscriptionModal(true)}
          android_ripple={{ color: withOpacity(colors.primary, 0.08) }}
        >
          <View style={styles.rowLeft}>
            <MaterialIcons name="subscriptions" size={22} color={colors.primary} />
            <Text style={styles.rowTitle}>Subscriptions</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue} numberOfLines={1}>
              {subscriptionsLabel}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.surfaceAlt}
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
          android_ripple={{ color: withOpacity(colors.error, 0.08) }}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="refresh-outline" size={22} color={colors.error} />
            <Text style={[styles.rowTitle, styles.rowTitleDanger]}>
              Restart Setup
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.surfaceAlt}
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

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    section: { marginBottom: 30, gap: 30 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    sectionLabel: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "bold",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    // — Segmented control —
    segmentedRow: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: 50,
      padding: 4,
      gap: 4,
      borderWidth: 1,
      borderColor: colors.surfaceMid,
    },
    segment: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 50,
      alignItems: "center",
      overflow: "hidden",
    },
    segmentActive: {
      backgroundColor: colors.primary,
    },
    segmentText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: "600",
    },
    segmentTextActive: {
      color: "#FFF",
    },
    // — Rows —
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.surfaceMid,
    },
    rowDisabled: { opacity: 0.4 },
    rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexShrink: 0,
    },
    rowTitle: { color: colors.text, fontSize: 16 },
    rowTitleDanger: { color: colors.error },
    rowValue: { color: colors.textMuted, fontSize: 14, maxWidth: 140 },
    hint: {
      color: colors.surfaceAlt,
      fontSize: 12,
      marginTop: 8,
      marginLeft: 4,
    },
  });
}
