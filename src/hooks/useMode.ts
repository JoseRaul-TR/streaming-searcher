import { lightColors, darkColors, ColorScheme } from "@/constants/colors";
import { useUserStore } from "@/store/useUserStore";

type UseModeResult = {
  colors: ColorScheme;
  isDark: boolean;
};

/**
 * Resolves the active color scheme from the user preference and OS setting.
 * "system" follows the OS (defaults to dark); "light"/"dark" are explicit overrides.
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
