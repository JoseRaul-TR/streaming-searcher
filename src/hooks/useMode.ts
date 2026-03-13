import {
  lightColors,
  darkColors,
  ColorScheme,
} from "@/constants/colors";
import { useUserStore } from "@/store/useUserStore";

type UseModeResult = {
  colors: ColorScheme;
  isDark: boolean;
};

/**
 * Resolves which color scheme to apply based on the user's stored preference
 * and the current system setting.
 *
 * — "system": follows the OS, defaulting to dark if the system value is null
 * — "light" / "dark": user's explicit override, ignores the system setting
 *
 * Returns a stable object reference (either lightColors or darkColors),
 * so useMemo([colors]) in components only recomputes on actual theme changes.
 */
export function useMode(): UseModeResult {
  const { modePreference, systemScheme } = useUserStore();

  // Resolve which scheme to actually apply:
  // "system" → follow the OS, defaulting to dark if null
  // "light" / "dark" → use the user's explicit choice
  const isDark =
    modePreference === "system"
      ? systemScheme === "dark"
      : modePreference === "dark";

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
}
