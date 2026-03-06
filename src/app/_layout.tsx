import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  const { hasCompletedOnboarding, resetOnboarding, completeOnboarding } = useUserStore();

  useEffect(() => {
    // DEBUG LINE – Uncoment what you need to test
     resetOnboarding();    // <--- This will send you always to the Onboarding when reload
    // completeOnboarding(); // <--- This will always skip the Onboarding

    // If the user has already completed the onboarding once and is at the app's root, it will be send direct to Explore.
    const isAuthGroup = segments[0] === "(tabs)";

    if (hasCompletedOnboarding && !isAuthGroup) {
      router.replace("/(tabs)/explore");
    }
  }, [hasCompletedOnboarding, segments]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Initial Onboarding screen */}
          <Stack.Screen name="index" />
          {/* Tab navigation */}
          <Stack.Screen name="(tabs)" />
          {/* Details Modal */}
          <Stack.Screen
            name="details"
            options={{ presentation: "modal", gestureEnabled: true }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
