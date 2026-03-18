import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMode } from "@/hooks/useMode";
import { withOpacity } from "@/constants/colors";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  onPress: () => void;
  label: string;
  /** Visual style of the button. Defaults to "primary". */
  variant?: "primary" | "secondary" | "ghost";
  /** Ionicons icon rendered to the right of the label. */
  trailingIcon?: IconName;
  /** Ionicons icon rendered to the left of the label. */
  leadingIcon?: IconName;
  disabled?: boolean;
  /** flex value applied to the outer Pressable. Useful for row layouts. */
  flex?: number;
};

/**
 * Rounded pill-shaped button used throughout the app.
 *
 * Variants:
 *   primary   — filled with colors.primary, white text
 *   secondary — semi-transparent primary background, primary text
 *   ghost     — no background, primary text (used for Back buttons)
 */
export default function PillButton({
  onPress,
  label,
  variant = "primary",
  trailingIcon,
  leadingIcon,
  disabled = false,
  flex,
}: Props) {
  const { colors } = useMode();

  const bgColor =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
        ? withOpacity(colors.primary, 0.12)
        : "transparent";

  const textColor = variant === "primary" ? "#FFF" : colors.primary;

  const rippleColor =
    variant === "primary"
      ? "rgba(255,255,255,0.2)"
      : withOpacity(colors.primary, 0.1);

  return (
    <Pressable
      style={[
        styles.pill,
        { backgroundColor: bgColor, flex },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: rippleColor }}
    >
      {leadingIcon && (
        <Ionicons name={leadingIcon} size={20} color={textColor} />
      )}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      {trailingIcon && (
        <Ionicons name={trailingIcon} size={20} color={textColor} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 50,
    overflow: "hidden",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.4,
  },
});
