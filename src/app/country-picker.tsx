import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import CountryAutocomplete from "@/components/CountryAutocomplete";
import { ColorScheme } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

/**
 * Full-screen country picker navigated to from Settings.
 * Changes are written directly to the store — no explicit save needed.
 * Pressing Back returns to Settings with the updated selection.
 */
export default function CountryPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { countries, addCountry, removeCountry, removeAllCountries } =
    useUserStore();

  const selectionLabel =
    countries.length === 0
      ? "All countries"
      : countries.length === 1
        ? countries[0].name
        : `${countries.length} countries selected`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: true }}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textMuted} />
        </Pressable>
        <View style={styles.topBarText}>
          <Text style={styles.topBarTitle}>Countries</Text>
          <Text style={styles.topBarSub} numberOfLines={1}>
            {selectionLabel}
          </Text>
        </View>
      </View>

      {/* Autocomplete */}
      <View style={styles.content}>
        <CountryAutocomplete
          selectedCountries={countries}
          onAdd={addCountry}
          onRemove={removeCountry}
          onClear={removeAllCountries}
        />
      </View>
    </View>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.05)",
      gap: 12,
    },
    backButton: { borderRadius: 20, padding: 4, overflow: "hidden" },
    topBarText: { flex: 1 },
    topBarTitle: { color: colors.text, fontSize: 17, fontWeight: "600" },
    topBarSub: { color: colors.textDisabled, fontSize: 13, marginTop: 1 },
    content: { flex: 1, padding: 20 },
  });
}
