import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { tmdbApi } from "@/services/api";
import { Country, SelectedCountry } from "@/types/providers";

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedCountries: SelectedCountry[];
  onAdd: (country: SelectedCountry) => void;
  onRemove: (code: string) => void;
};

export default function CountryPickerModal({
  visible,
  onClose,
  selectedCountries,
  onAdd,
  onRemove,
}: Props) {
  const [search, setSearch] = useState("");

  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: tmdbApi.getCountries,
  });

  const filtered = useMemo(
    () =>
      countries.filter((c: Country) =>
        c.english_name.toLowerCase().includes(search.toLowerCase()),
      ),
    [countries, search],
  );

  const selectedCodes = new Set(selectedCountries.map((c) => c.code));

  const handleToggle = (item: Country) => {
    if (selectedCodes.has(item.iso_3166_1)) {
      onRemove(item.iso_3166_1);
    } else {
      onAdd({ code: item.iso_3166_1, name: item.english_name });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Countries</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={28} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Selected countries as removable chips */}
        {selectedCountries.length > 0 && (
          <View style={styles.chips}>
            {selectedCountries.map((c) => (
              <Pressable
                key={c.code}
                style={styles.chip}
                onPress={() => onRemove(c.code)}
              >
                <Text style={styles.chipText}>{c.name}</Text>
                <Ionicons name="close" size={14} color="#60A5FA" />
              </Pressable>
            ))}
          </View>
        )}

        <TextInput
          style={styles.searchBar}
          placeholder="Search country..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {isLoading ? (
          <ActivityIndicator color="#60A5FA" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.iso_3166_1}
            renderItem={({ item }) => {
              const isSelected = selectedCodes.has(item.iso_3166_1);
              return (
                <Pressable
                  style={styles.item}
                  onPress={() => handleToggle(item)}
                  android_ripple={{ color: "rgba(96,165,250,0.1)" }}
                >
                  <Text
                    style={[styles.itemText, isSelected && styles.itemActive]}
                  >
                    {item.english_name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color="#60A5FA" />
                  )}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(96,165,250,0.15)",
    borderWidth: 1,
    borderColor: "#60A5FA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { color: "#60A5FA", fontSize: 13, fontWeight: "600" },
  searchBar: {
    backgroundColor: "#1E293B",
    color: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  itemText: { color: "#94A3B8", fontSize: 17 },
  itemActive: { color: "#60A5FA", fontWeight: "bold" },
});
