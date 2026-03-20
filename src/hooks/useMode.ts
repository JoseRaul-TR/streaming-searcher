import { lightColors, darkColors, ColorScheme } from "@/constants/colors";
import { useUserStore } from "@/store/useUserStore";

type UseModeResult = {
  /** The active color scheme object — either lightColors or darkColors. */
  colors: ColorScheme;
  /** True when the active theme is dark mode. */
  isDark: boolean;
};

/**
 * Resolves the active color scheme based on the user's stored preference
 * and the current OS color scheme.
 *
 * @returns An object with:
 *   - colors: the active ColorScheme (lightColors or darkColors). The reference
 *     is stable — components that depend on [colors] in their useMemo deps will
 *     only recompute when the theme actually changes.
 *   - isDark: a boolean that is true when dark mode is active.
 *
 * Resolution logic:
 *   - modePreference === "system" → follows the OS setting stored in systemScheme,
 *     defaulting to dark if the system value has not been set yet.
 *   - modePreference === "light" | "dark" → ignores the OS and returns the
 *     user's explicit choice.
 *
 * systemScheme is set by the Appearance.addChangeListener in _layout.tsx and is
 * NOT persisted to AsyncStorage — it reflects the live OS value at runtime.
 */
export function useMode(): UseModeResult {
  const { modePreference, systemScheme } = useUserStore();

  const isDark =
    modePreference === "system"
      ? systemScheme === "dark"
      : modePreference === "dark";

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
}
