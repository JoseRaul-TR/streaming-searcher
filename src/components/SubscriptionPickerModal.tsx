import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { tmdbApi } from "@/services/api";
import { useUserStore } from "@/store/useUserStore";
import { SelectedCountry, Provider } from "@/types/providers";
import ProviderLogo from "./ProviderLogo";
import ApiStateDisplay from "./ApiStateDisplay";
import { Colors, withOpacity } from "@/constants/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  countries: SelectedCountry[];
};

export default function SubscriptionPickerModal({
  visible,
  onClose,
  countries,
}: Props) {
  const { subscriptions, addSubscription, removeSubscription } = useUserStore();

  // Single country → load directly. Multiple countries → wait for user to pick
  // one from the tabs first, to avoid showing an unfiltered provider list.
  const [activeCountry, setActiveCountry] = useState<string>(
    countries.length === 1 ? (countries[0]?.code ?? "") : "",
  );

  // Sync activeCountry if the countries array changes while the modal is mounted.
  // If the active country was removed from the list, reset to empty.
  // activeCountry is intentionally excluded from deps — this only reacts to external changes.
  useEffect(() => {
    if (countries.length === 1) {
      setActiveCountry(countries[0]?.code ?? "");
      return;
    }
    const stillValid = countries.some((c) => c.code === activeCountry);
    if (!stillValid) setActiveCountry("");
  }, [countries]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCode =
    activeCountry || (countries.length === 1 ? (countries[0]?.code ?? "") : "");

  const {
    data: providers = [],
    isLoading,
    isError,
  } = useQuery<Provider[]>({
    queryKey: ["providers-by-country", activeCode],
    queryFn: () => tmdbApi.getProvidersByCountry(activeCode),
    enabled: !!activeCode,
  });

  // Subscription check and toggle are scoped to activeCode so the same
  // provider in a different country is treated as a separate subscription.
  const isProviderSubscribed = useCallback(
    (providerId: number) =>
      subscriptions.some(
        (s) => s.providerId === providerId && s.countryCode === activeCode,
      ),
    [subscriptions, activeCode],
  );

  // useCallback: handleToggle is passed into each FlatList renderItem.
  // Wrapping prevents a new reference on every render.
  const handleToggle = useCallback(
    (providerId: number) => {
      if (isProviderSubscribed(providerId)) {
        removeSubscription(providerId, activeCode);
      } else {
        addSubscription(providerId, activeCode);
      }
    },
    [isProviderSubscribed, addSubscription, removeSubscription, activeCode],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Subscriptions</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={28} color={Colors.textMuted} />
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Select the services you are subscribed to. They will be highlighted in
          search results.
        </Text>

        {/* Country tabs — only shown when multiple countries */}
        {countries.length > 1 && (
          <View style={styles.tabs}>
            {countries.map((c) => (
              <Pressable
                key={c.code}
                style={[
                  styles.tab,
                  activeCountry === c.code && styles.tabActive,
                ]}
                onPress={() => setActiveCountry(c.code)}
                android_ripple={{ color: withOpacity(Colors.primary, 0.1) }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeCountry === c.code && styles.tabTextActive,
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Providers list */}
        {!activeCode ? (
          <ApiStateDisplay
            state="empty"
            icon={
              <Ionicons
                name="flag-outline"
                size={28}
                color={Colors.surfaceAlt}
              />
            }
            message="Select a country above to see its available streaming services."
          />
        ) : isLoading ? (
          <ApiStateDisplay state="loading" />
        ) : isError ? (
          <ApiStateDisplay
            state="error"
            message="Could not load providers. Check your connection."
          />
        ) : (
          <FlatList
            data={providers}
            keyExtractor={(item) => String(item.provider_id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isSubscribed = isProviderSubscribed(item.provider_id);
              return (
                <Pressable
                  style={styles.item}
                  onPress={() => handleToggle(item.provider_id)}
                  android_ripple={{ color: "rgba(96,165,250,0.06)" }}
                >
                  <ProviderLogo
                    provider={item}
                    isSubscribed={isSubscribed}
                    size={44}
                    showName={false}
                    animated={false}
                  />
                  <Text
                    style={[
                      styles.providerName,
                      isSubscribed && styles.providerNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {item.provider_name}
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      isSubscribed && styles.checkboxActive,
                    ]}
                  >
                    {isSubscribed && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
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
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 8,
  },
  title: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  subtitle: {
    color: Colors.textDisabled,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 25,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: withOpacity(Colors.primary, 0.15),
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tabText: { color: Colors.textDisabled, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: Colors.primary },
  list: { paddingHorizontal: 25, paddingBottom: 40 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
    gap: 14,
  },
  providerName: { flex: 1, color: Colors.textMuted, fontSize: 15 },
  providerNameActive: {
    color: Colors.textMuted,
    fontSize: 17,
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.surfaceMid,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
