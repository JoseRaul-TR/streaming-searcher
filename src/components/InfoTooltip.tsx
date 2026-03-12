import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

type Props = {
  text: string;
};

/**
 * A small info icon that shows a centered modal overlay with explanatory text.
 * Tapping the backdrop or the close button dismisses it.
 */
export default function InfoTooltip({ text }: Props) {
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
          color={Colors.surfaceAlt}
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
                color={Colors.primary}
              />
              <Text style={styles.cardTitle}>Info</Text>
              <Pressable
                onPress={() => setVisible(false)}
                hitSlop={10}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={Colors.textDisabled} />
              </Pressable>
            </View>
            <Text style={styles.cardText}>{text}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  closeBtn: {
    padding: 2,
  },
  cardText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
});
