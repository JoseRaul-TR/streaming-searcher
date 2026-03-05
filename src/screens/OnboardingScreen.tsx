import React from "react";
import { StyleSheet, View, Text, Pressable, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onFinish: () => void;
};

export default function OnboardingScreen({ onFinish }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="film" size={100} color="#60A5FA" />
        </View>

        <Text style={styles.title}>Streaming Searcher</Text>
        <Text style={styles.subtitle}>
          Find where to watch movies and TV-series
        </Text>

        <Pressable style={styles.button} onPress={onFinish}>
          <Text style={styles.buttonText}>Let's start</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      </View>
    </SafeAreaView>
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
