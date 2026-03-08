import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useUserStore } from "@/store/useUserStore";
import { CountryPickerModal } from "@/components/CountryPickerModal";
import { TermsModal } from "@/components/TermsModal";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const {
    country,
    setCountry,
    completeOnboarding,
    hasAcceptedTerms,
    acceptTerms,
  } = useUserStore();

  // Show the country name if already selected
  const selectedLabel = country || "Select Country";

  const handleComplete = () => {
    if (hasAcceptedTerms && country) {
      completeOnboarding();
      router.replace("/(tabs)");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.main}>
        {step === 1 ? (
          /* Step 1 – Welcome */
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
          /* Step 2 – Setup */
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Quick Setup</Text>

            {/* Country */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>1. Select your country</Text>
              <Pressable
                style={styles.selector}
                onPress={() => setShowCountryModal(true)}
                android_ripple={{ color: "rgba(96,165,250,0.15)" }}
              >
                <Text style={styles.selectorText}>{selectedLabel}</Text>
                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Terms */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>2. Terms of use</Text>
              <Pressable
                style={styles.checkboxRow}
                onPress={acceptTerms}
                android_ripple={{ color: "rgba(96,165,250,0.15)" }}
              >
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

      {/* Footer */}
      <View style={styles.footer}>
        {step === 1 ? (
          <Pressable
            style={styles.btnPrimary}
            onPress={() => setStep(2)}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          >
            <Text style={styles.btnText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Pressable>
        ) : (
          <View style={styles.row}>
            <Pressable
              style={styles.btnSecondary}
              onPress={() => setStep(1)}
              android_ripple={{ color: "rgba(255,255,255,0.1)" }}
            >
              <Text style={styles.btnText}>Back</Text>
            </Pressable>
            <Pressable
              style={[
                styles.btnPrimary,
                (!hasAcceptedTerms || !country) && styles.disabled,
              ]}
              onPress={handleComplete}
              disabled={!hasAcceptedTerms || !country}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Text style={styles.btnText}>Get Started</Text>
            </Pressable>
          </View>
        )}
      </View>

      <CountryPickerModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        selectedCountry={country}
        onSelect={setCountry}
      />

      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
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
    color: "#FFF",
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
  selector: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  selectorText: { color: "#FFF", fontSize: 16 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    overflow: "hidden",
  },
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
  btnPrimary: {
    flex: 2,
    backgroundColor: "#60A5FA",
    padding: 18,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    overflow: "hidden",
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 5,
  },
  disabled: { opacity: 0.4 },
});
