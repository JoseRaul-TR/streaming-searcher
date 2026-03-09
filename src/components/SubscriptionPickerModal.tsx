import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { tmdbApi } from "@/services/api";
import { useUserStore } from "@/store/useUserStore";
import { SelectedCountry, Provider } from "@/types/providers";

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

  // Active country tab — defaults to first selected country
  const [activeCountry, setActiveCountry] = useState<string>(
    countries[0]?.code ?? "",
  );

  const activeCode = activeCountry || countries[0]?.code;

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["providers-by-country", activeCode],
    queryFn: () => tmdbApi.getProvidersByCountry(activeCode),
    enabled: !!activeCode,
  });

  const handleToggle = (providerId: number) => {
    if (subscriptions.includes(providerId)) {
      removeSubscription(providerId);
    } else {
      addSubscription(providerId);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Subscriptions</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={28} color="#94A3B8" />
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
                android_ripple={{ color: "rgba(96,165,250,0.1)" }}
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
        {isLoading ? (
          <ActivityIndicator color="#60A5FA" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={providers}
            keyExtractor={(item: Provider) => String(item.provider_id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }: { item: Provider }) => {
              const isSubscribed = subscriptions.includes(item.provider_id);
              return (
                <Pressable
                  style={styles.item}
                  onPress={() => handleToggle(item.provider_id)}
                  android_ripple={{ color: "rgba(96,165,250,0.08)" }}
                >
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/original${item.logo_path}`,
                    }}
                    style={[styles.logo, isSubscribed && styles.logoSubscribed]}
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
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 8,
  },
  title: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  subtitle: {
    color: "#64748B",
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
    backgroundColor: "#1E293B",
  },
  tabActive: {
    backgroundColor: "rgba(96,165,250,0.15)",
    borderWidth: 1,
    borderColor: "#60A5FA",
  },
  tabText: { color: "#64748B", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#60A5FA" },
  list: { paddingHorizontal: 25, paddingBottom: 40 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
    gap: 14,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1E293B",
  },
  logoSubscribed: {
    borderWidth: 2,
    borderColor: "#22C55E",
  },
  providerName: {
    flex: 1,
    color: "#94A3B8",
    fontSize: 16,
  },
  providerNameActive: {
    color: "#F8FAFC",
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
});
