import React, { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { useUserStore } from "@/store/useUserStore";
import { tmdbApi } from "@/services/api";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State to control onboarding screen (1 or 2)
  const [step, setStep] = useState(1);

  // Global state for (country, onboarding and terms)
  const {
    country,
    setCountry,
    completeOnboarding,
    hasAcceptedTerms,
    acceptTerms,
  } = useUserStore();

  // Local States for Modals
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [searchCountry, setSearchCountry] = useState("");

  // Load countrys available in TMDB from API fetch
  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: tmdbApi.getCountries,
  });

  // Search countries/countrys inside a Modal
  const filteredCountries = useMemo(() => {
    return countries.filter((c) =>
      c.english_name.toLowerCase().includes(searchCountry.toLowerCase()),
    );
  }, [countries, searchCountry]);

  // Name of the currently selected country
  const selectedCountryName =
    countries.find((c) => c.iso_3166_1 === country)?.english_name ||
    "Select Country";

  const handleOnboardingCompletion = () => {
    if (hasAcceptedTerms && country) {
      completeOnboarding();
      router.replace("/(tabs)/explore");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Main content depending of step */}
      <View style={styles.main}>
        {step === 1 ? (
          /* Side 1: Welcome */
          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="film" size={80} color="#60A5FA" />
            </View>
            <Text style={styles.title}>Streaming Searcher</Text>
            <Text style={styles.subtitle}>
              Find where to watch movies and TV-series in seconds.
            </Text>
          </View>
        ) : (
          /* Side 2: Initial Settings */
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Quick Setup</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>1. Select your country</Text>
              <Pressable
                style={styles.input}
                onPress={() => setShowCountryModal(true)}
              >
                <Text style={styles.inputText}>{selectedCountryName}</Text>
                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>2. Terms of use</Text>
              <Pressable style={styles.checkboxRow} onPress={acceptTerms}>
                <View
                  style={[
                    styles.checkbox,
                    hasAcceptedTerms && styles.checkboxActive,
                  ]}
                >
                  {hasAcceptedTerms && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  I accept the{" "}
                  <Text
                    style={styles.link}
                    onPress={() => setShowTermsModal(true)}
                  >
                    Terms of Use
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* FOOTER – Navigation buttons */}
      <View style={styles.footer}>
        {step === 1 ? (
          <Pressable style={styles.buttonPrimary} onPress={() => setStep(2)}>
            <Text style={styles.buttonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Pressable>
        ) : (
          <View style={styles.row}>
            <Pressable
              style={styles.buttonSecondary}
              onPress={() => setStep(1)}
            >
              <Text style={styles.buttonText}>Back</Text>
            </Pressable>
            <Pressable
              style={[
                styles.buttonPrimary,
                (!hasAcceptedTerms || !country) && styles.disabled,
              ]}
              onPress={handleOnboardingCompletion}
              disabled={!hasAcceptedTerms || !country}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* MODAL – Country Selection */}
      <Modal visible={showCountryModal} animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <Pressable onPress={() => setShowCountryModal(false)}>
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
          </View>
          <TextInput
            style={styles.searchBar}
            placeholder="Search country..."
            placeholderTextColor="#64748B"
            onChangeText={setSearchCountry}
          />
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.iso_3166_1}
            renderItem={({ item }) => (
              <Pressable
                style={styles.item}
                onPress={() => {
                  setCountry(item.iso_3166_1);
                  setShowCountryModal(false);
                }}
              >
                <Text
                  style={[
                    styles.itemText,
                    country === item.iso_3166_1 && styles.itemTextActive,
                  ]}
                >
                  {item.english_name}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>

      {/* MODAL: TÉRMINOS */}
      <Modal visible={showTermsModal} transparent>
        <View style={styles.overlay}>
          <View style={styles.termsBox}>
            <Text style={styles.modalTitle}>Terms of Use</Text>
            <ScrollView style={{ marginVertical: 15 }}>
              <Text style={styles.termsTextBody}>
                This app uses TMDB data. Streaming providers are via JustWatch.
                {"\n\n"}
                1. No data is shared.{"\n"}
                2. Country data is not stored. It is used only for filtering
                available providers in your country.{"\n"}
                3. Be kind to others!
              </Text>
            </ScrollView>
            <Pressable
              style={styles.buttonPrimary}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  main: { flex: 1, paddingHorizontal: 30, justifyContent: "center" },
  centerContent: { alignItems: "center" },
  iconCircle: {
    backgroundColor: "#1E293B",
    padding: 30,
    borderRadius: 60,
    marginBottom: 30,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
  },

  stepContainer: { width: "100%" },
  formGroup: { marginBottom: 30 },
  label: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputText: { color: "white", fontSize: 16 },

  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#60A5FA",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: { backgroundColor: "#60A5FA" },
  checkboxLabel: { color: "#94A3B8", fontSize: 16 },
  link: {
    color: "#60A5FA",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  footer: { padding: 30 },
  row: { flexDirection: "row", gap: 15 },
  buttonPrimary: {
    flex: 2,
    backgroundColor: "#60A5FA",
    padding: 18,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 5,
  },
  disabled: { opacity: 0.4 },

  modalBg: { flex: 1, backgroundColor: "#0F172A", padding: 25 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { color: "white", fontSize: 24, fontWeight: "bold" },
  searchBar: {
    backgroundColor: "#1E293B",
    color: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  item: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  itemText: { color: "#94A3B8", fontSize: 18 },
  itemTextActive: { color: "#60A5FA", fontWeight: "bold" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 30,
  },
  termsBox: {
    backgroundColor: "#1E293B",
    padding: 25,
    borderRadius: 20,
    maxHeight: "70%",
  },
  termsTextBody: { color: "#CBD5E1", fontSize: 15, lineHeight: 22 },
});
