import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TermsModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms of Use</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={28} color="#94A3B8" />
          </Pressable>
        </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  scroll: { flex: 1 },
  body: { color: "#CBD5E1", fontSize: 15, lineHeight: 24 },
});