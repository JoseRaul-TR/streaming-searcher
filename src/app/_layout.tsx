import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

export default function RootLayout() {
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
