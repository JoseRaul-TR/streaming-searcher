import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useUserStore } from "@/store/useUserStore";
import CountryPickerModal from "@/components/CountryPickerModal";
import TermsModal from "@/components/TermsModal";
import SubscriptionPickerModal from "@/components/SubscriptionPickerModal";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const {
    countries,
    addCountry,
    removeCountry,
    subscriptions,
    completeOnboarding,
    hasAcceptedTerms,
    acceptTerms,
  } = useUserStore();

  const handleComplete = () => {
    if (hasAcceptedTerms && countries.length > 0) {
      completeOnboarding();
      router.replace("/(tabs)");
    }
  };

  const countriesLabel =
    countries.length === 0
      ? "Select Country"
      : countries.length === 1
        ? countries[0].name
        : `${countries[0].name} +${countries.length - 1} more`;

  const subscriptionsLabel =
    subscriptions.length === 0
      ? "Select your services (optional)"
      : `${subscriptions.length} service${subscriptions.length > 1 ? "s" : ""} selected`;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.main}>
        {step === 1 && (
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
        )}

        {step === 2 && (
          /* Step 2 – Countries + Terms */
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Quick Setup</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                1. Select your country or countries
              </Text>
              <Pressable
                style={styles.selector}
                onPress={() => setShowCountryModal(true)}
                android_ripple={{ color: "rgba(96,165,250,0.15)" }}
              >
                <Text
                  style={[
                    styles.selectorText,
                    countries.length === 0 && styles.selectorPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {countriesLabel}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
              </Pressable>
            </View>

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

        {step === 3 && (
          /* Step 3 – Subscriptions */
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Your Services</Text>
            <Text style={styles.subtitle}>
              Select the streaming services you are subscribed to. They will be
              highlighted when browsing results.
            </Text>

            <View style={styles.formGroup}>
              <Pressable
                style={styles.selector}
                onPress={() => setShowSubscriptionModal(true)}
                android_ripple={{ color: "rgba(96,165,250,0.15)" }}
              >
                <Text
                  style={[
                    styles.selectorText,
                    subscriptions.length === 0 && styles.selectorPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {subscriptionsLabel}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <Text style={styles.hint}>
              You can skip this step and add your services later in Settings.
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {step === 1 && (
          <Pressable
            style={[styles.btnPrimary, styles.btnFull]}
            onPress={() => setStep(2)}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          >
            <Text style={styles.btnText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Pressable>
        )}

        {step === 2 && (
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
                styles.btnRowItem,
                (!hasAcceptedTerms || countries.length === 0) &&
                  styles.disabled,
              ]}
              onPress={() => setStep(3)}
              disabled={!hasAcceptedTerms || countries.length === 0}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Text style={styles.btnText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </Pressable>
          </View>
        )}

        {step === 3 && (
          <View style={styles.row}>
            <Pressable
              style={styles.btnSecondary}
              onPress={() => setStep(2)}
              android_ripple={{ color: "rgba(255,255,255,0.1)" }}
            >
              <Text style={styles.btnText}>Back</Text>
            </Pressable>
            <Pressable
              style={[styles.btnPrimary, styles.btnRowItem]}
              onPress={handleComplete}
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
        selectedCountries={countries}
        onAdd={addCountry}
        onRemove={removeCountry}
      />

      <SubscriptionPickerModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        countries={countries}
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
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  hint: {
    color: "#475569",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10,
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
  selectorText: { color: "#FFF", fontSize: 16, flex: 1, marginRight: 8 },
  selectorPlaceholder: { color: "#64748B" },
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
    backgroundColor: "#60A5FA",
    padding: 18,
    borderRadius: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  btnFull: { alignSelf: "stretch" },
  btnRowItem: { flex: 2 },
  btnSecondary: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 50,
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
