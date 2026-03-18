import { useEffect } from "react";
import { Appearance } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useMode } from "@/hooks/useMode";
import { useUserStore } from "@/store/useUserStore";

const queryClient = new QueryClient();

// Resolves the OS color scheme string to our union type.
// Defined at module level — it's a pure function with no component dependencies.
function toScheme(s: string | null | undefined): "light" | "dark" {
  return s === "light" ? "light" : "dark";
}

function AppLayout() {
  const { isDark } = useMode();
  const setSystemScheme = useUserStore((s) => s.setSystemScheme);

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
      <Stack>
        {/* Entry point — instant redirect, no visible transition */}
        <Stack.Screen
          name="index"
          options={{ headerShown: false, animation: "none" }}
        />
        {/* Onboarding — fades in from nothing on first launch */}
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, animation: "fade" }}
        />
        {/* Tab shell — crossfade when coming from onboarding or index */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, animation: "fade" }}
        />
        {/* Details — slides up from the bottom: feels like expanding a card */}
        <Stack.Screen
          name="details"
          options={{
            headerShown: false,
            animation: "slide_from_bottom",
            // Slightly slower than the default 350ms so the poster image
            // has time to be perceived before the screen is fully visible.
            animationDuration: 400,
          }}
        />
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
