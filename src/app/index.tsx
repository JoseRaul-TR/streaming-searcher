import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="film" size={100} color="#60A5FA" />
        </View>

        <Text style={styles.title}>Streaming Searcher</Text>
        <Text style={styles.subtitle}>
          Find where to watch movies and TV-series
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.replace("/(tabs)/explore")}
        >
          <Text style={styles.buttonText}>Let's start</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
    backgroundColor: "#1E293B",
    padding: 30,
    borderRadius: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#60A5FA",
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
});
