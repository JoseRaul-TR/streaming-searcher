import React, { useState, useCallback, useEffect, memo, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import { SelectedCountry, Provider } from "@/types/providers";
import ProviderLogo from "../media/ProviderLogo";
import ApiStateDisplay from "../common/ApiStateDisplay";
import { ColorScheme, withOpacity } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";
import { getShadow } from "@/utils/shadow";
import { formatCount, formatCountriesLabel } from "@/utils/format";
import ModalHeader from "../common/ModalHeader";
import { useProvidersByCountry } from "@/hooks/useProvidersByCountry";

// Fixed row height used by getItemLayout.
// Must match paddingVertical (10 * 2) + content height (44px logo).
const ITEM_HEIGHT = 64;

// ————— Extracted item component —————
type ProviderItemProps = {
  item: Provider;
  isSubscribed: boolean;
  onToggle: (id: number) => void;
};

const ProviderItem = memo(function ProviderItem({
  item,
  isSubscribed,
  onToggle,
}: ProviderItemProps) {
  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  return (
    <Pressable
      style={styles.item}
      onPress={() => onToggle(item.provider_id)}
      android_ripple={{ color: withOpacity(colors.primary, 0.06) }}
    >
      <ProviderLogo
        provider={item}
        isSubscribed={isSubscribed}
        size={44}
        showName={false}
        animated={false}
      />
      <Text
        style={[styles.providerName, isSubscribed && styles.providerNameActive]}
        numberOfLines={1}
      >
        {item.provider_name}
      </Text>
      <View style={[styles.checkbox, isSubscribed && styles.checkboxActive]}>
        {isSubscribed && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
    </Pressable>
  );
});

// ————— Main Component ——————

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
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const { subscriptions, addSubscription, removeSubscription } = useUserStore();

  const [activeCountry, setActiveCountry] = useState<string>(
    countries.length === 1 ? countries[0].code : "",
  );

  useEffect(() => {
    if (countries.length === 1) {
      setActiveCountry(countries[0].code);
      return;
    }
    // Read activeCountry from ref
    setActiveCountry((prev) => {
      const stillValid = countries.some((c) => c.code === prev);
      return stillValid ? prev : "";
    });
  }, [countries]);

  const activeCode =
    activeCountry || (countries.length === 1 ? (countries[0]?.code ?? "") : "");

  const { providers, isLoading, isError } = useProvidersByCountry(activeCode);

  const isProviderSubscribed = useCallback(
    (providerId: number) =>
      subscriptions.some(
        (s) => s.providerId === providerId && s.countryCode === activeCode,
      ),
    [subscriptions, activeCode],
  );

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

  const renderItem = useCallback(
    ({ item }: { item: Provider }) => (
      <ProviderItem
        item={item}
        isSubscribed={isProviderSubscribed(item.provider_id)}
        onToggle={handleToggle}
      />
    ),
    [isProviderSubscribed, handleToggle],
  );

  const keyExtractor = useCallback(
    (item: Provider) => String(item.provider_id),
    [],
  );

  const subsLabel =
    subscriptions.length === 0
      ? "No services selected"
      : `${formatCount(subscriptions.length, "service")} selected${
          countries.length > 0 ? ` in ${formatCountriesLabel(countries)}` : ""
        }`;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header — uses same component for all modals to achieve the same layout*/}
        <ModalHeader
          title="Subscriptions"
          subtitle={subsLabel}
          onClose={onClose}
        />

        {/* Country tabs — only shown when multiple countries */}
        {countries.length > 1 && (
          <View style={styles.tabs}>
            {countries.map((c) => (
              <View key={c.code} style={styles.tabShadow}>
                <Pressable
                  style={[
                    styles.tab,
                    activeCountry === c.code && styles.tabActive,
                  ]}
                  onPress={() => setActiveCountry(c.code)}
                  android_ripple={{ color: withOpacity(colors.primary, 0.1) }}
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
              </View>
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
                color={colors.surfaceAlt}
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
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            getItemLayout={(_data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
          />
        )}
      </View>
    </Modal>
  );
}

function makeStyles(colors: ColorScheme, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    tabs: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 25,
      marginBottom: 16,
    },
    tabShadow: {
      borderRadius: 20,
      backgroundColor: colors.surface,
      ...getShadow({ isDark }), // Imported shadow
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    tabActive: { backgroundColor: withOpacity(colors.primary, 0.1) },
    tabText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
    tabTextActive: { color: colors.primary },
    list: { paddingHorizontal: 25, paddingBottom: 40 },
    item: {
      height: ITEM_HEIGHT,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceMid,
      gap: 14,
    },
    providerName: { flex: 1, color: colors.textMuted, fontSize: 15 },
    providerNameActive: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "bold",
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.surfaceAlt,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  });
}
