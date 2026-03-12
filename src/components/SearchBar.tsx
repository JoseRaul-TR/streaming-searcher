import React from "react";
import {
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  isLoading?: boolean;
};

export default function SearchBar({ value, onChangeText, isLoading }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={Colors.textMuted} />
      <TextInput
        style={styles.input}
        placeholder="Search movies, shows or people"
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      <View style={styles.rightArea}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : value.length > 0 ? (
          <Pressable onPress={() => onChangeText("")} hitSlop={10}>
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={Colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 52,
    height: 52,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    marginLeft: 8,
  },
  rightArea: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
