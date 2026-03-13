import { useEffect } from "react";
import { Appearance } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useMode } from "@/hooks/useMode";
import { useUserStore } from "@/store/useUserStore";

const queryClient = new QueryClient();

function AppLayout() {
  const { isDark } = useMode();
  const setSystemScheme = useUserStore((s) => s.setSystemScheme);

  const toScheme = (s: string | null | undefined): "light" | "dark" => s === "light" ? "light" : "dark";

  useEffect(() => {
    setSystemScheme(toScheme(Appearance.getColorScheme()));

    // Appearance.addChangeListener works at native level, independently of
    // the React tree — this is what Modal components can't do by themselves
    // with useColorScheme(), since they render in a separate UIWindow on iOS.
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(toScheme(colorScheme));
    });

    return () => subscription.remove();
  }, [setSystemScheme]);

  return (
    <>
      {/* "light" icons for dark bg, "dark" icons for light bg */}
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="details" options={{ gestureEnabled: false }} />
        <Stack.Screen name="country-picker" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppLayout />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
