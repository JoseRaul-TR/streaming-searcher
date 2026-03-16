import React, { useState, useMemo } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ColorScheme } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

type Props = {
  text: string;
};

/**
 * A small info icon that shows a centered modal overlay with explanatory text.
 * Tapping the backdrop or the close button dismisses it.
 */
export default function InfoTooltip({ text }: Props) {
  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        hitSlop={10}
        style={styles.iconButton}
      >
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.surfaceAlt}
        />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        {/* Backdrop — tap to dismiss */}
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          {/* Stop propagation so tapping the card doesn't close */}
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="information-circle"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.cardTitle}>Info</Text>
              <Pressable
                onPress={() => setVisible(false)}
                hitSlop={10}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.textDisabled} />
              </Pressable>
            </View>
            <Text style={styles.cardText}>{text}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function makeStyles(colors: ColorScheme, isDark: boolean) {
  return StyleSheet.create({
    iconButton: {
      padding: 2,
    },
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      width: "100%",
      gap: 12,
      // Shadow instead of border — card floats over the backdrop
      shadowColor: isDark ? "#000" : "#64748B",
      shadowOffset: { width: 0, height: isDark ? 8 : 4 },
      shadowOpacity: isDark ? 0.5 : 0.15,
      shadowRadius: isDark ? 20 : 12,
      elevation: isDark ? 12 : 6,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cardTitle: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
      flex: 1,
    },
    closeBtn: {
      padding: 2,
    },
    cardText: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 22,
    },
  });
}
