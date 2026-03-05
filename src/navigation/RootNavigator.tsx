import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { TabNavigator } from "./TabNavigator";

import MovieDetailsScreen from "../screens/MovieDetailsScreen";
import OnboardingScreen from "../screens/OnboardingScreen";

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  MovieDetails: {
    id: number;
    title: string;
    year: string;
    poster_path?: string | null | undefined;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding ? (
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen
              {...props}
              onFinish={() => setShowOnboarding(false)}
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      )}

      {/* Modal definition */}
      <Stack.Group
        screenOptions={{
          presentation: "modal",
          headerShown: true,
          headerStyle: { backgroundColor: "#1E293B" },
          headerTintColor: "#FFF",
        }}
      >
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={({ route }) => ({ title: route.params.title })}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
