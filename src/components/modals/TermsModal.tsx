import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ColorScheme } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";
import ModalHeader from "../common/ModalHeader";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TermsModal({ visible, onClose }: Props) {
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header — uses same component for all modals to achieve the same layout*/}
        <ModalHeader title="Terms of Use" onClose={onClose} closeIcon="close" />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.body}>
            This app uses data from The Movie Database (TMDB). Streaming
            provider information is sourced via JustWatch.{"\n\n"}
            1. No personal data is collected or shared with third parties.
            {"\n\n"}
            2. Your country selection and subscription preferences are stored
            locally on your device only. They are used exclusively to filter
            available streaming providers.{"\n\n"}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: { flex: 1 },
    body: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 24,
      paddingTop: 4,
    },
  });
}
