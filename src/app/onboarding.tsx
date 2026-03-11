import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useUserStore } from "@/store/useUserStore";
import CountryAutocomplete from "@/components/CountryAutocomplete";
import SubscriptionPickerModal from "@/components/SubscriptionPickerModal";
import TermsModal from "@/components/TermsModal";
import InfoTooltip from "@/components/InfoTooltip";

const TOTAL_STEPS = 3;

const STEP_INFO = {
  1: "Select one or more countries to filter streaming availability. Leave empty to check global availability across all regions.",
  2: "Mark which streaming services you subscribe to. They will be highlighted when you find a match in search results.",
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const {
    countries,
    addCountry,
    removeCountry,
    removeAllCountries,
    subscriptions,
    completeOnboarding,
    hasAcceptedTerms,
    toggleTerms,
  } = useUserStore();

  const handleComplete = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const subscriptionsLabel =
    subscriptions.length === 0
      ? "Select your services (optional)"
      : `${subscriptions.length} service${subscriptions.length > 1 ? "s" : ""} selected`;

  const isGlobal = countries.length === 0;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Progress dots */}
      <View style={styles.progressBar}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i < step && styles.progressDotActive]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ————— Step 1 — Countries ————— */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>Step 1 of 3</Text>

            <View style={styles.titleRow}>
              <Text style={styles.title}>Country Selection</Text>
              <InfoTooltip text={STEP_INFO[1]} />
            </View>

            <CountryAutocomplete
              selectedCountries={countries}
              onAdd={addCountry}
              onRemove={removeCountry}
              onClear={removeAllCountries}
            />
          </View>
        )}

        {/* ————— Step 2 — Services ————— */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>Step 2 of 3</Text>

            <View style={styles.titleRow}>
              <Text style={styles.title}>Your Services</Text>
              <InfoTooltip text={STEP_INFO[2]} />
            </View>

            {isGlobal ? (
              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#60A5FA"
                />
                <Text style={styles.infoText}>
                  You selected global search. Go back and pick specific
                  countries to enable subscription highlights.
                </Text>
              </View>
            ) : (
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
            )}

            <Text style={styles.hint}>
              This can edit later in Settings.
            </Text>
          </View>
        )}

        {/* ————— Step 3 — Terms ————— */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>Step 3 of 3</Text>
            <Text style={styles.title}>Terms of Use</Text>

            <Pressable
              style={styles.checkboxRow}
              onPress={toggleTerms}
              android_ripple={{ color: "rgba(96,165,250,0.1)" }}
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
                I accept the following{" "}
                <Text
                  style={styles.link}
                  onPress={() => setShowTermsModal(true)}
                >
                  Terms of Use
                </Text>
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.row}>
          {step > 1 && (
            <Pressable
              style={styles.btnSecondary}
              onPress={() => setStep((s) => s - 1)}
              android_ripple={{ color: "rgba(255,255,255,0.1)" }}
            >
              <Text style={styles.btnText}>Back</Text>
            </Pressable>
          )}

          {step < TOTAL_STEPS ? (
            <Pressable
              style={[
                styles.btnPrimary,
                step === 1 ? styles.btnFull : styles.btnRowItem,
              ]}
              onPress={() => setStep((s) => s + 1)}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Text style={styles.btnText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.btnPrimary,
                styles.btnRowItem,
                !hasAcceptedTerms && styles.disabled,
              ]}
              onPress={handleComplete}
              disabled={!hasAcceptedTerms}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Text style={styles.btnText}>Get Started</Text>
            </Pressable>
          )}
        </View>
      </View>

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
  progressBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressDot: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1E293B",
  },
  progressDotActive: { backgroundColor: "#60A5FA" },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 20,
  },
  stepContainer: { gap: 20 },
  stepLabel: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 34,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(96,165,250,0.08)",
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    flex: 1,
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
  },
  selector: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  selectorText: { color: "#FFF", fontSize: 15, flex: 1, marginRight: 8 },
  selectorPlaceholder: { color: "#64748B" },
  hint: { color: "#475569", fontSize: 13, textAlign: "center" },
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
  checkboxLabel: { color: "#94A3B8", fontSize: 16, flex: 1 },
  link: {
    color: "#60A5FA",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  footer: { paddingHorizontal: 28, paddingBottom: 16, paddingTop: 8 },
  row: { flexDirection: "row", gap: 12 },
  btnPrimary: {
    backgroundColor: "#60A5FA",
    padding: 18,
    borderRadius: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  btnFull: { flex: 1 },
  btnRowItem: { flex: 2 },
  btnSecondary: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 50,
    alignItems: "center",
    overflow: "hidden",
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  disabled: { opacity: 0.4 },
});
