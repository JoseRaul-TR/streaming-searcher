import { useMemo } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMode } from "@/hooks/useMode";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useMode();

  // screenOptions is not a StyleSheet — it's a plain object consumed by
  // the navigator. useMemo prevents recreation on unrelated re-renders.
  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { color: colors.text, fontWeight: "bold" as const },
      headerShadowVisible: false,
      headerBorderVisible: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopWidth: 0,
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
