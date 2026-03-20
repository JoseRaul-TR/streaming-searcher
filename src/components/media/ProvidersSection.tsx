import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Provider } from "@/types/providers";
import ProviderLogo from "./ProviderLogo";
import { ColorScheme } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

type Props = {
  title: string;
  providers: Provider[];
  // Composite key set: "${countryCode}:${providerId}"
  // Using a string key instead of just provider_id prevents a provider
  // available in multiple countries from matching subscriptions in all of them.
  subscribedKeys?: Set<string>;
  countryCode: string;
};

export default function ProviderSection({
  title,
  providers,
  subscribedKeys,
  countryCode,
}: Props) {
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!providers?.length) return null;

  return (
    <View style={styles.category}>
      <Text style={styles.categoryTitle}>{title}</Text>

      <View style={styles.grid}>
        {providers.map((p) => (
          <ProviderLogo
            key={p.provider_id}
            provider={p}
            isSubscribed={
              subscribedKeys?.has(`${countryCode}:${p.provider_id}`) ?? false
            }
            size={50}
            nameLines={2}
            animated
          />
        ))}
      </View>
    </View>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    category: { marginBottom: 20 },
    categoryTitle: {
      color: colors.textDisabled,
      fontSize: 12,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 10,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 15,
    },
  });
}
