/**
 * Centralised shadow helper.
 *
 * React Native requires separate shadow props for iOS and Android (elevation).
 * This helper keeps that boilerplate in one place so every component gets
 * consistent shadows without repeating the same six lines everywhere.
 *
 * Usage in makeStyles:
 *   ...getShadow({ isDark, intensity: "medium" })
 */

type ShadowIntensity = "low" | "medium" | "high";

type ShadowOptions = {
  isDark: boolean;
  intensity?: ShadowIntensity;
};

type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

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
