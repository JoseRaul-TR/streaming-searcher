import React, { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useUserStore } from "@/store/useUserStore";
import SubscriptionPickerModal from "@/components/SubscriptionPickerModal";
import TermsModal from "@/components/TermsModal";
import InfoTooltip from "@/components/InfoTooltip";
import { ColorScheme, withOpacity } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";
import CountryPickerModal from "@/components/CountryPickerModal";

const TOTAL_STEPS = 4;

const STEP_INFO = {
  1: "Select one or more countries to filter streaming availability. Leave empty to check global availability across all countries.",
  2: "Mark which streaming services you subscribe to. They will be highlighted when you find a match in search results.",
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [step, setStep] = useState(0);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const {
    countries,
    subscriptions,
    completeOnboarding,
    hasAcceptedTerms,
    toggleTerms,
  } = useUserStore();

  const handleComplete = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const countriesLabel =
    countries.length === 0
      ? "Select countries (optional)"
      : countries.length === 1
        ? countries[0].name
        : `${countries.length} countries selected`;

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
      {/* Progress dots – hidden on welcome slide */}
      <View style={styles.progressBar}>
        {step === 0 ? (
          <View style={styles.progressPlaceholder} />
        ) : (
          Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i < step && styles.progressDotActive]}
            />
          ))
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ————— Step 0 — Welcome ————— */}
        {step === 0 && (
          <View style={styles.welcomeContainer}>
            <View style={styles.logoWrap}>
              <View style={styles.logoShadow}>
                {/* ← outer: sombra */}
                <View style={styles.logoOuter}>
                  <MaterialCommunityIcons
                    name="filmstrip-box-multiple"
                    size={38}
                    color={colors.primary}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.welcomeTitle}>StreamSearch</Text>
            <Text style={styles.welcomeTagline}>
              Find where to watch anything,{"\n"}in any country.
            </Text>

            <View style={styles.welcomeFeatures}>
              <FeatureRow
                icon="search-outline"
                text="Search movies, series and people"
                colors={colors}
              />
              <FeatureRow
                icon="globe-outline"
                text="Check streaming availability by country"
                colors={colors}
              />
              <FeatureRow
                icon="star-outline"
                text="Highlight the services you subscribe to"
                colors={colors}
              />
            </View>
          </View>
        )}

        {/* ————— Step 1 — Countries ————— */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>Step 1 of 3</Text>

            <View style={styles.titleRow}>
              <Text style={styles.title}>Country Selection</Text>
              <InfoTooltip text={STEP_INFO[1]} />
            </View>

            {/* Country selector — opens CountryPickerModal */}
            <View style={styles.selectorShadow}>
              <Pressable
                style={styles.selector}
                onPress={() => setShowCountryModal(true)}
                android_ripple={{ color: withOpacity(colors.primary, 0.15) }}
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
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>

            {countries.length === 0 && (
              <View style={styles.perfHint}>
                <Ionicons
                  name="speedometer-outline"
                  size={15}
                  color={colors.surfaceAlt}
                />
                <Text style={styles.perfHintText}>
                  By not selecting at least one country you will be performing
                  global searches. A global search loads availability for every
                  country at once and at this stage of app development can
                  create performance issues.
                </Text>
              </View>
            )}
            <Text style={styles.hint}>
              This can be edited later in Settings.
            </Text>
          </View>
        )}

        {/* ————— Step 2 — Streaming Providers ————— */}
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
                  color={colors.primary}
                />
                <Text style={styles.infoText}>
                  You selected global search. If you want to have highlighted
                  the providers you are subscribed to in the search results go
                  back and pick specific country or countries to enable
                  subscription highlights.
                </Text>
              </View>
            ) : (
              <View style={styles.selectorShadow}>
                <Pressable
                  style={styles.selector}
                  onPress={() => setShowSubscriptionModal(true)}
                  android_ripple={{ color: withOpacity(colors.primary, 0.15) }}
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
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            )}

            <Text style={styles.hint}>
              This can be edited later in Settings.
            </Text>
          </View>
        )}

        {/* ————— Step 3 — Terms ————— */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>Step 3 of 3</Text>
            <Text style={styles.title}>Terms of Use</Text>

            <View style={styles.checkboxRow}>
              <Pressable
                onPress={toggleTerms}
                android_ripple={{
                  color: withOpacity(colors.primary, 0.1),
                  borderless: true,
                }}
                hitSlop={10}
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
              </Pressable>

              <Text style={styles.checkboxLabel}>
                I accept the following{" "}
                <Text
                  style={styles.link}
                  onPress={() => setShowTermsModal(true)}
                >
                  Terms of Use
                </Text>
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.row}>
          {step > 0 && (
            <Pressable
              style={styles.btnSecondary}
              onPress={() => setStep((s) => s - 1)}
              android_ripple={{ color: "rgba(255,255,255,0.1)" }}
            >
              <Text style={styles.btnSecondaryText}>Back</Text>
            </Pressable>
          )}

          {step < TOTAL_STEPS - 1 ? (
            <Pressable
              style={[
                styles.btnPrimary,
                step === 0 ? styles.btnFull : styles.btnRowItem,
              ]}
              onPress={() => setStep((s) => s + 1)}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Text style={styles.btnPrimaryText}>
                {step === 0 ? "Get Started" : "Next"}
              </Text>
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
              <Text style={styles.btnPrimaryText}>Get Started</Text>
            </Pressable>
          )}
        </View>
      </View>

      <CountryPickerModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
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

// ————— Feature row helper —————
function FeatureRow({
  icon,
  text,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
  colors: ColorScheme;
}) {
  return (
    <View style={featureStyles.row}>
      <View
        style={[
          featureStyles.iconWrap,
          { backgroundColor: withOpacity(colors.primary, 0.12) },
        ]}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[featureStyles.text, { color: colors.textSecondary }]}>
        {text}
      </Text>
    </View>
  );
}

const featureStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  text: { flex: 1, fontSize: 15, lineHeight: 20 },
});

function makeStyles(colors: ColorScheme, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    progressBar: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      paddingTop: 16,
      paddingBottom: 8,
      minHeight: 28,
    },
    progressPlaceholder: { height: 4 },
    progressDot: {
      width: 28,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.surfaceMid,
    },
    progressDotActive: { backgroundColor: colors.primary },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 20 },

    // — Welcome —
    welcomeContainer: {
      flex: 1,
      alignItems: "center",
      paddingTop: 20,
      gap: 24,
    },
    logoWrap: { position: "relative", marginBottom: 8 },
    logoShadow: {
      borderRadius: 28,
      backgroundColor: withOpacity(colors.primary, 0.12),
      shadowColor: isDark ? "#000" : "#64748B",
      shadowOffset: { width: 0, height: isDark ? 6 : 3 },
      shadowOpacity: isDark ? 0.35 : 0.12,
      shadowRadius: isDark ? 14 : 10,
      elevation: isDark ? 8 : 4,
    },
    logoOuter: {
      width: 96,
      height: 96,
      borderRadius: 28,
      backgroundColor: withOpacity(colors.primary, 0.12),
      justifyContent: "center",
      alignItems: "center",
    },
    welcomeTitle: {
      color: colors.text,
      fontSize: 32,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    welcomeTagline: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 24,
      textAlign: "center",
    },
    welcomeFeatures: {
      width: "100%",
      gap: 16,
      marginTop: 8,
      paddingHorizontal: 4,
    },

    // — Setup steps —
    stepContainer: { gap: 20 },
    stepLabel: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "bold",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "bold",
      lineHeight: 34,
    },
    infoBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: withOpacity(colors.primary, 0.12),
      borderRadius: 12,
      padding: 14,
    },
    infoText: {
      flex: 1,
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    selectorShadow: {
      borderRadius: 50,
      backgroundColor: colors.surface,
      shadowColor: isDark ? "#000" : "#64748B",
      shadowOffset: { width: 0, height: isDark ? 4 : 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: isDark ? 10 : 8,
      elevation: isDark ? 5 : 2,
    },
    selector: {
      borderRadius: 50,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      overflow: "hidden",
      padding: 18,
    },
    selectorText: { color: colors.text, fontSize: 15, flex: 1, marginRight: 8 },
    selectorPlaceholder: { color: colors.textDisabled },
    hint: { color: colors.textMuted, fontSize: 13, textAlign: "center" },
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
      borderColor: colors.surfaceAlt,
      marginRight: 15,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxLabel: { color: colors.textMuted, fontSize: 16, flex: 1 },
    link: {
      color: colors.primary,
      fontWeight: "bold",
      textDecorationLine: "underline",
    },
    footer: { paddingHorizontal: 28, paddingBottom: 16, paddingTop: 8 },
    row: { flexDirection: "row", gap: 12 },
    btnPrimary: {
      backgroundColor: colors.primary,
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
      backgroundColor: withOpacity(colors.primary, 0.12),
      padding: 18,
      borderRadius: 50,
      alignItems: "center",
      overflow: "hidden",
    },
    btnPrimaryText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
    btnSecondaryText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "bold",
    },
    disabled: { opacity: 0.4 },
    perfHint: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: colors.surfaceMid,
      borderRadius: 10,
      padding: 12,
    },
    perfHintText: {
      flex: 1,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
