import React, { useMemo } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import CountryAutocomplete from "@/components/CountryAutocomplete";
import { ColorScheme } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CountryPickerModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { countries, addCountry, removeCountry, removeAllCountries } =
    useUserStore();

  const selectionLabel =
    countries.length === 0
      ? "All countries selected"
      : countries.length === 1
        ? countries[0].name
        : `${countries.length} countries selected`;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header — same layout as SubscriptionPickerModal */}
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textMuted} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Countries</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {selectionLabel}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <CountryAutocomplete
            selectedCountries={countries}
            onAdd={addCountry}
            onRemove={removeCountry}
            onClear={removeAllCountries}
          />
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 25,
      paddingTop: 20,
      paddingBottom: 12,
      gap: 16,
    },
    backBtn: { padding: 4 },
    headerText: { flex: 1 },
    title: { color: colors.text, fontSize: 24, fontWeight: "bold" },
    headerSub: { color: colors.textDisabled, fontSize: 13, marginTop: 2 },
    content: { flex: 1, padding: 20 },
  });
}