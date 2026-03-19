/**
 * Design system color tokens and opacity utility.
 *
 * Two color schemes are defined as const objects — lightColors and darkColors —
 * sharing an identical set of keys. ColorScheme is derived from the key set of
 * darkColors so that both objects are guaranteed to be structurally identical
 * at compile time.
 *
 * Components access colors via the useMode() hook, which returns the active
 * scheme based on the user's modePreference and the OS setting.
 */

/** Union of all valid color token keys, derived from darkColors. */
export type ColorScheme = Record<keyof typeof darkColors, string>;

/** The three possible theme preference values stored in the Zustand store. */
export type ModePreference = "system" | "light" | "dark";

/** Color tokens for light mode. All values are 6-digit hex strings. */
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

/** Color tokens for dark mode. Keys are identical to lightColors. */
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
 * Appends an opacity value to a hex color as two extra hex digits,
 * producing the 8-digit #RRGGBBAA format supported natively by React Native.
 *
 * @param hex - A 6-digit hex color string, with or without a leading "#"
 *              (e.g. "#3B82F6" or "#000000").
 * @param opacity - A number between 0 (fully transparent) and 1 (fully opaque).
 *                  Values outside this range are not clamped — pass valid values.
 * @returns The hex color string with the alpha channel appended
 *          (e.g. withOpacity("#3B82F6", 0.15) → "#3B82F626").
 *
 * @example
 * Semi-transparent primary background for a chip
 * backgroundColor: withOpacity(colors.primary, 0.12)
 *
 * @example
 * Dark modal backdrop
 * backgroundColor: withOpacity("#000000", 0.6)
 */
export function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alpha}`;
}
