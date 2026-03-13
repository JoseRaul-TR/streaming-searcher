export type ColorScheme = Record<keyof typeof darkColors, string>;

export type ModePreference = "system" | "light" | "dark";

export const lightColors = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceMid: "#E2E8F0",
  surfaceAlt: "#94A3B8",
  primary: "#3B82F6",
  text: "#0F172A",
  textSecondary: "#1E293B",
  textMuted: "#475569",
  textDisabled: "#94A3B8",
  error: "#EF4444",
  success: "#22C55E",
} as const;

export const darkColors = {
  background: "#0F172A",
  surface: "#1E293B",
  surfaceMid: "#334155",
  surfaceAlt: "#475569",
  primary: "#60A5FA",
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  textDisabled: "#64748B",
  error: "#F87171",
  success: "#22C55E",
} as const;

/**
 * Appends an opacity value to a hex color as two extra hex digits.
 * withOpacity(Colors.primary, 0.15) → "#60A5FA26"
 * React Native supports 8-digit hex colors (#RRGGBBAA).
 */
export function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alpha}`;
}
