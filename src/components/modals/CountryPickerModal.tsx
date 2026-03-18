import React, { useMemo } from "react";
import { Modal, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/useUserStore";
import CountryAutocomplete from "@/components/search/CountryAutocomplete";
import ModalHeader from "../common/ModalHeader";
import { ColorScheme } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CountryPickerModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { countries, addCountry, removeCountry, removeAllCountries } =
    useUserStore();

  const selectionLabel =
    countries.length === 0
      ? "All countries selected"
      : countries.length === 1
        ? countries[0].name
        : `${countries.length} countries selected`;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header — uses same component for all modals to achieve the same layout*/}
        <ModalHeader
          title="Countries"
          subtitle={selectionLabel}
          onClose={onClose}
        />

        <View style={styles.content}>
          <CountryAutocomplete
            selectedCountries={countries}
            onAdd={addCountry}
            onRemove={removeCountry}
            onClear={removeAllCountries}
          />
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: 20 },
  });
}
