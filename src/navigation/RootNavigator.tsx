import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  MovieDetails: { id: number; title: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  const isAppFirstTimeOpened = true; // Later will be storage with AsyncStorage

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAppFirstTimeOpened && (
        <Stack.Screen name="Onboarding" component={OnboardingPlaceholder} />
      )}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Modal definition */}
      <Stack.Group screenOptions={{ presentation: "fullScreenModal" }}>
        <Stack.Screen name="MovieDetails" component={DetailsPlaceholder} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

// TODO - Fast placeholder to avoid errors at the moment.
function OnboardingPlaceholder() {
  return null;
}
function TabNavigator() {
  return null;
}
function DetailsPlaceholder() {
  return null;
}
