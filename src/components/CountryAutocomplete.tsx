import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { tmdbApi } from "@/services/api";
import { Country, SelectedCountry } from "@/types/providers";
import { Colors, withOpacity } from "@/constants/colors";

const MAX_SUGGESTIONS = 4;

type Props = {
  selectedCountries: SelectedCountry[];
  onAdd: (country: SelectedCountry) => void;
  onRemove: (code: string) => void;
  onClear: () => void;
};

/**
 * Inline country selector. Global is the default state (selectedCountries = []).
 * When the user types, up to MAX_SUGGESTIONS suggestions appear below the input.
 * Already-selected countries are excluded from suggestions.
 */
export default function CountryAutocomplete({
  selectedCountries,
  onAdd,
  onRemove,
  onClear,
}: Props) {
  const [search, setSearch] = useState("");

  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: tmdbApi.getCountries,
  });

  const selectedCodes = useMemo(
    () => new Set(selectedCountries.map((c) => c.code)),
    [selectedCountries],
  );

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    return countries
      .filter(
        (c: Country) =>
          c.english_name.toLowerCase().includes(search.toLowerCase()) &&
          !selectedCodes.has(c.iso_3166_1),
      )
      .slice(0, MAX_SUGGESTIONS); // cap suggestions to MAX_SUGGESTIONS
  }, [countries, search, selectedCodes]);

  const handleAdd = (item: Country) => {
    onAdd({ code: item.iso_3166_1, name: item.english_name });
    setSearch("");
  };

  const handleClear = () => {
    onClear();
    setSearch("");
  };

  const isGlobal = selectedCountries.length === 0;

  return (
    <View style={styles.container}>
      {/* Search input */}
      <View style={styles.inputRow}>
        <Ionicons name="search" size={18} color={Colors.textDisabled} />

        <TextInput
          style={styles.input}
          placeholder="Search country..."
          placeholderTextColor={Colors.textDisabled}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={Colors.surfaceAlt} />
          </Pressable>
        )}
      </View>

      {/* Loading while countries list fetches */}
      {isLoading && search.length > 0 && (
        <ActivityIndicator color={Colors.primary} style={styles.loading} />
      )}

      {/* Inline suggestions — max 4 */}
      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map((item: Country) => (
            <Pressable
              key={item.iso_3166_1}
              style={styles.suggestion}
              onPress={() => handleAdd(item)}
              android_ripple={{ color: withOpacity(Colors.primary, 0.08) }}
            >
              <Text style={styles.suggestionText}>{item.english_name}</Text>
              <Ionicons name="add" size={18} color={Colors.primary} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Selected chips + clear all */}
      {selectedCountries.length > 0 && (
        <View style={styles.chipsContainer}>
          <View style={styles.chips}>
            {selectedCountries.map((c) => (
              <Pressable
                key={c.code}
                style={styles.chip}
                onPress={() => onRemove(c.code)}
              >
                <Text style={styles.chipText}>{c.name}</Text>
                <Ionicons name="close" size={13} color={Colors.primary} />
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.clearBtn} onPress={handleClear}>
            <Ionicons
              name="close-circle-outline"
              size={15}
              color={Colors.error}
            />
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        </View>
      )}

      {/* Global info — shown only when nothing is selected and not typing */}
      {isGlobal && search.length === 0 && (
        <View style={styles.globalInfo}>
          <Ionicons name="earth" size={18} color={Colors.primary} />
          <Text style={styles.globalText}>
            <Text style={styles.globalBold}>Global search active. </Text>
            Select a country to enable subscription highlights.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", gap: 12 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 15,
  },
  loading: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  suggestions: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  suggestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  suggestionText: { color: Colors.textSecondary, fontSize: 15 },
  chipsContainer: { gap: 10 },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: withOpacity(Colors.primary, 0.15),
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-end",
  },
  clearText: { color: Colors.error, fontSize: 13 },
  globalInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: withOpacity(Colors.primary, 0.08),
    borderRadius: 12,
    padding: 14,
  },
  globalText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  globalBold: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});
