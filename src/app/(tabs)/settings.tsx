import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import CountryPickerModal from "@/components/CountryPickerModal";
import SubscriptionPickerModal from "@/components/SubscriptionPickerModal";
import { ColorScheme, ModePreference, withOpacity } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

// ————— Mode/Theme Options —————
const MODE_OPTIONS: { label: string; value: ModePreference }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

// ————— Sliding Pill Selector —————
function ModeSelector({
  value,
  onChange,
  colors,
  isDark,
}: {
  value: ModePreference;
  onChange: (v: ModePreference) => void;
  colors: ColorScheme;
  isDark: boolean;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const currentIndex = MODE_OPTIONS.findIndex((o) => o.value === value);
  const segmentWidth = containerWidth / MODE_OPTIONS.length;

  useEffect(() => {
    if (containerWidth === 0) return;
    Animated.spring(translateX, {
      toValue: currentIndex * segmentWidth,
      useNativeDriver: true,
      tension: 180,
      friction: 20,
    }).start();
  }, [currentIndex, segmentWidth, containerWidth, translateX]);

  return (
    <View
      style={[
        selectorStyles.track,
        {
          backgroundColor: colors.surface,
          shadowColor: isDark ? "#000" : "#64748B",
          shadowOffset: { width: 0, height: isDark ? 4 : 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: isDark ? 10 : 8,
          elevation: isDark ? 5 : 2,
        },
      ]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            selectorStyles.pill,
            {
              width: segmentWidth - 8,
              backgroundColor: colors.primary,
              transform: [{ translateX }],
            },
          ]}
        />
      )}

      {MODE_OPTIONS.map((option) => (
        <Pressable
          key={option.value}
          style={selectorStyles.segment}
          onPress={() => onChange(option.value)}
          android_ripple={{ color: withOpacity(colors.primary, 0.08) }}
        >
          <Text
            style={[
              selectorStyles.label,
              {
                color: value === option.value ? "#FFF" : colors.textMuted,
                fontWeight: value === option.value ? "700" : "400",
              },
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const selectorStyles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 50,
    padding: 4,
    position: "relative",
  },
  pill: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 50,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 13 },
});

// ————— Main Component —————
export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [showCountryModal, setShowCountryModal] = useState(false);
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
      {/* Appearance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="theme-light-dark"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.sectionLabel}>Appearance</Text>
        </View>

        <ModeSelector
          value={modePreference}
          onChange={setModePreference}
          colors={colors}
          isDark={isDark}
        />
      </View>

      {/* Search preferences */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="search-outline" size={22} color={colors.primary} />
          <Text style={styles.sectionLabel}>Search Settings</Text>
        </View>

        {/* Countries → modal */}
        <View style={styles.rowShadow}>
          <Pressable
            style={styles.row}
            onPress={() => setShowCountryModal(true)}
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
        </View>

        {/* Subscriptions — disabled when global */}
        <View style={[styles.rowShadow, isGlobal && styles.rowDisabled]}>
          <Pressable
            style={styles.row}
            onPress={() => !isGlobal && setShowSubscriptionModal(true)}
            android_ripple={{ color: withOpacity(colors.primary, 0.08) }}
          >
            <View style={styles.rowLeft}>
              <MaterialIcons
                name="subscriptions"
                size={22}
                color={colors.primary}
              />
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
        </View>

        {isGlobal && (
          <Text style={styles.hint}>
            Select one or more countries first to manage subscriptions.
          </Text>
        )}
      </View>

      {/* App */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="apps" size={22} color={colors.primary} />
          <Text style={styles.sectionLabel}>App</Text>
        </View>

        <View style={styles.rowShadow}>
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
      </View>

      <CountryPickerModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
      />

      <SubscriptionPickerModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        countries={countries}
      />
    </View>
  );
}

function makeStyles(colors: ColorScheme, isDark: boolean) {
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
    rowShadow: {
      borderRadius: 50,
      backgroundColor: colors.surface,
      shadowColor: isDark ? "#000" : "#64748B",
      shadowOffset: { width: 0, height: isDark ? 4 : 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: isDark ? 10 : 8,
      elevation: isDark ? 5 : 2,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: 50,
      overflow: "hidden",
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