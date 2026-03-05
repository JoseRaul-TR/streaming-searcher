import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import SearchScreen from "../screens/SearchScreen";
import WatchlistScreen from "../screens/WatchListScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: "#0F172A" },
        headerTitleStyle: { color: "#FFF", fontWeight: "bold" },
        tabBarStyle: {
          backgroundColor: "#0F172A",
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#960000",
        tabBarInactiveTintColor: "#94A3B8",
        // Logic to change the icon depending of the route
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Watchlist") {
            iconName = focused ? "bookmark" : "bookmark-outline";
          } else {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: "Search" }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{ title: "Watchlist" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Tab.Navigator>
  );
}
