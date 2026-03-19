import { useEffect } from "react";
import { Appearance } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useMode } from "@/hooks/useMode";
import { useUserStore } from "@/store/useUserStore";

/**
 * A single QueryClient instance shared across the entire app.
 * Created at module level (outside any component) so it is never recreated
 * on re-renders and its cache persists for the lifetime of the app session.
 */
const queryClient = new QueryClient();

/**
 * Resolves the OS color scheme string to our union type.
 *
 * Defined at module level because it is a pure function with no component
 * dependencies — creating it inside AppLayout would produce a new function
 * reference on every render.
 *
 * @param s - The raw value from Appearance.getColorScheme(), which can be
 *   "light", "dark", or null (when the OS reports no preference).
 * @returns "light" when the OS explicitly reports light mode; "dark" in all
 *   other cases, including null, so the app defaults to dark.
 */
function toScheme(s: string | null | undefined): "light" | "dark" {
  return s === "light" ? "light" : "dark";
}

/**
 * Inner layout component that consumes the Zustand store and renders the
 * Stack navigator. Separated from RootLayout so it can access the
 * QueryClientProvider and SafeAreaProvider context set up by its parent.
 *
 * Responsibilities:
 * - Reads the OS color scheme on mount and subscribes to future changes via
 *   Appearance.addChangeListener. The listener fires at native level and
 *   works correctly inside Modal components (which render in a separate
 *   UIWindow on iOS, making useColorScheme() unreliable there).
 * - Applies the correct StatusBar style ("light" icons on dark background,
 *   "dark" icons on light background).
 * - Declares the four Stack screens with their animation types:
 *     index      → none    (invisible redirect)
 *     onboarding → fade    (soft entrance on first launch)
 *     (tabs)     → fade    (crossfade from onboarding)
 *     details    → slide_from_bottom, 400ms (card-expansion feel)
 */
function AppLayout() {
  const { isDark } = useMode();
  const setSystemScheme = useUserStore((s) => s.setSystemScheme);

  useEffect(() => {
    // Sync the store with the current OS scheme on mount.
    setSystemScheme(toScheme(Appearance.getColorScheme()));

    // Subscribe to OS scheme changes for the lifetime of AppLayout.
    // The listener is removed on unmount via the cleanup return.
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
        {/* Details — slides up from the bottom: feels like expanding a card.
            400ms is slightly slower than the default 350ms so the poster image
            has time to be perceived before the screen is fully visible. */}
        <Stack.Screen
          name="details"
          options={{
            headerShown: false,
            animation: "slide_from_bottom",
            animationDuration: 400,
          }}
        />
      </Stack>
    </>
  );
}

/**
 * The root layout of the Expo Router app.
 *
 * Wraps the entire app in the three providers required by its children:
 * - SafeAreaProvider: makes useSafeAreaInsets() available to all screens.
 * - QueryClientProvider: makes TanStack Query available for all useQuery calls.
 * - AppLayout: renders the Stack navigator and manages the OS theme listener.
 *
 * The provider order matters — AppLayout must be inside QueryClientProvider
 * so it can call useQuery if needed, and inside SafeAreaProvider so screens
 * can access insets.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppLayout />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
