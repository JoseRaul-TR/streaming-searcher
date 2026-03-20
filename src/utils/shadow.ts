/**
 * Centralised shadow helper.
 *
 * React Native requires separate shadow props for iOS (shadowColor, shadowOffset,
 * shadowOpacity, shadowRadius) and Android (elevation). This helper keeps that
 * boilerplate in one place so every component gets consistent shadows without
 * repeating the same six lines in every makeStyles call.
 *
 * @example
 * Inside a makeStyles function:
 * container: {
 *   backgroundColor: colors.surface,
 *   borderRadius: 50,
 *   ...getShadow({ isDark }),
 * }
 */

type ShadowIntensity = "low" | "medium" | "high";

type ShadowOptions = {
  // Whether the app is currently in dark mode. Affects shadow color and opacity.
  isDark: boolean;
  /**
   * The visual weight of the shadow.
   * - "low"    — subtle lift, used for small UI elements (chips, tags).
   * - "medium" — default depth, used for cards and modals (default).
   * - "high"   — strong shadow, used for posters and prominent surfaces.
   */
  intensity?: ShadowIntensity;
};

type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

/**
 * Pre-computed shadow config for each intensity level.
 * Dark mode uses deeper offsets, higher opacity, and larger blur radius
 * to produce a visible shadow on dark surfaces. Light mode uses a
 * blue-grey shadow color (#64748B) for a natural tint on light backgrounds.
 */
const SHADOW_CONFIG: Record<
  ShadowIntensity,
  {
    darkH: number;
    darkOpacity: number;
    darkRadius: number;
    lightH: number;
    lightOpacity: number;
    lightRadius: number;
    elevation: { dark: number; light: number };
  }
> = {
  low: {
    darkH: 2,
    darkOpacity: 0.2,
    darkRadius: 6,
    lightH: 1,
    lightOpacity: 0.06,
    lightRadius: 4,
    elevation: { dark: 3, light: 1 },
  },
  medium: {
    darkH: 4,
    darkOpacity: 0.3,
    darkRadius: 10,
    lightH: 2,
    lightOpacity: 0.1,
    lightRadius: 8,
    elevation: { dark: 5, light: 2 },
  },
  high: {
    darkH: 6,
    darkOpacity: 0.4,
    darkRadius: 14,
    lightH: 3,
    lightOpacity: 0.15,
    lightRadius: 10,
    elevation: { dark: 8, light: 4 },
  },
} as const;

/**
 * Returns a complete React Native shadow style object for both iOS and Android.
 *
 * @param options.isDark - Whether the current theme is dark. Controls shadow color
 *                         ("#000" in dark mode, "#64748B" in light mode) and opacity.
 * @param options.intensity - Visual weight of the shadow ("low" | "medium" | "high").
 *                            Defaults to "medium".
 * @returns A ShadowStyle object with shadowColor, shadowOffset, shadowOpacity,
 *          shadowRadius (iOS), and elevation (Android) pre-filled for the given options.
 *
 * @example
 *  Poster card — needs a strong shadow to lift off the background
 * posterWrap: {
 *   ...getShadow({ isDark, intensity: "high" }),
 * }
 *
 * @example
 *  Pill button — subtle lift is enough
 * pill: {
 *   ...getShadow({ isDark, intensity: "low" }),
 * }
 */

export function getShadow(options: ShadowOptions): ShadowStyle {
  const { isDark, intensity = "medium" } = options;
  const c = SHADOW_CONFIG[intensity];

  return {
    shadowColor: isDark ? "#000" : "#64748B",
    shadowOffset: { width: 0, height: isDark ? c.darkH : c.lightH },
    shadowOpacity: isDark ? c.darkOpacity : c.lightOpacity,
    shadowRadius: isDark ? c.darkRadius : c.lightRadius,
    elevation: isDark ? c.elevation.dark : c.elevation.light,
  };
}
