import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMode } from "@/hooks/useMode";

type Props = {
  title: string;
  /** Secondary line shown below the title — e.g. selection summary. */
  subtitle?: string;
  onClose: () => void;
    /** Icon shown in the back button. Defaults to "arrow-back". */
  closeIcon?: React.ComponentProps<typeof Ionicons>["name"];
};

/**
 * Shared header for full-screen modals (slide-up style).
 * Used by CountryPickerModal, SubscriptionPickerModal and TermsModal.
 *
 * Layout: [back arrow]  [title / subtitle]
 */
export default function ModalHeader({ title, subtitle, onClose, closeIcon = "arrow-back" }: Props) {
  const { colors } = useMode();

  return (
    <View style={styles.header}>
      <Pressable onPress={onClose} hitSlop={10} style={styles.backBtn}>
        <Ionicons name={closeIcon} size={24} color={colors.textMuted} />
      </Pressable>
      <View style={styles.headerText}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle !== undefined && (
          <Text
            style={[styles.subtitle, { color: colors.textDisabled }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

// Static layout — no theme-dependent sizing, colors are applied inline.
const styles = StyleSheet.create({
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
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 13, marginTop: 2 },
});
