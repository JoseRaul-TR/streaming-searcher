import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { TabNavigator } from "./TabNavigator";

import DetailsModal from "../screens/DetailsModal";
import OnboardingScreen from "../screens/OnboardingScreen";

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  DetailsModal: {
    id: number;
    title: string;
    year: string;
    overview: string;
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
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="DetailsModal"
          component={DetailsModal}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
