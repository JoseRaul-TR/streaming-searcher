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
import { Country } from "@/types/providers";

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedCountry: string;
  onSelect: (code: string) => void;
}

export function CountryPickerModal({
  visible,
  onClose,
  selectedCountry,
  onSelect,
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Country</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={28} color="#94A3B8" />
          </Pressable>
        </View>

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
            renderItem={({ item }) => (
              <Pressable
                style={styles.item}
                onPress={() => {
                  onSelect(item.iso_3166_1);
                  onClose();
                }}
                android_ripple={{ color: "rgba(96,165,250,0.1)" }}
              >
                <Text
                  style={[
                    styles.itemText,
                    selectedCountry === item.iso_3166_1 && styles.itemActive,
                  ]}
                >
                  {item.english_name}
                </Text>
                {selectedCountry === item.iso_3166_1 && (
                  <Ionicons name="checkmark" size={20} color="#60A5FA" />
                )}
              </Pressable>
            )}
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
    marginBottom: 20,
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
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
  itemText: {
    color: "#94A3B8",
    fontSize: 17,
  },
  itemActive: {
    color: "#60A5FA",
    fontWeight: "bold",
  },
});
