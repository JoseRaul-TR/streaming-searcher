import React, { useMemo } from "react";
import {
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ColorScheme } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";
import { getShadow } from "@/utils/shadow";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  isLoading?: boolean;
};

export default function SearchBar({ value, onChangeText, isLoading }: Props) {
  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={colors.primary} />
      <TextInput
        style={styles.input}
        placeholder="Search movies, series ..."
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      <View style={styles.rightArea}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : value.length > 0 ? (
          <Pressable onPress={() => onChangeText("")} hitSlop={10}>
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function makeStyles(colors: ColorScheme, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      margin: 15,
      paddingHorizontal: 15,
      borderRadius: 52,
      height: 52,
      ...getShadow({ isDark }), // Shadow imported from helper
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      marginLeft: 8,
    },
    rightArea: {
      minWidth: 30,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
