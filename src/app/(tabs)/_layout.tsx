import { useMemo } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMode } from "@/hooks/useMode";

/**
 * Tab bar layout for the three main screens of the app.
 *
 * Responsibilities:
 * - Configures the shared header style (background, title color, no shadow).
 * - Calculates tab bar height accounting for the Android gesture navigation bar
 *   via useSafeAreaInsets — without this the tab bar overlaps the system bar.
 * - Applies the active/inactive tint colors from the current theme.
 * - Declares the three tabs (Explore, Watchlist, Settings) with their icons,
 *   switching between filled and outline variants when focused.
 *
 * screenOptions is memoised with useMemo([colors, insets.bottom]) so the
 * options object reference is stable between renders — the navigator only
 * recomputes styles when the theme or safe area actually changes, not on
 * every parent re-render.
 *
 * Note: screenOptions is a plain configuration object consumed by the navigator,
 * not a StyleSheet — this is why useMemo is used instead of StyleSheet.create.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useMode();

  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { color: colors.text, fontWeight: "bold" as const },
      headerShadowVisible: false,
      headerBorderVisible: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopWidth: 0,
        // Add insets.bottom so the tab bar clears the Android gesture
        // navigation bar (typically 48dp) on devices without hardware buttons.
        height: 60 + insets.bottom,
        paddingBottom: insets.bottom,
        paddingTop: 8,
      },
      tabBarBorderVisible: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
    }),
    [colors, insets.bottom],
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
