import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "DetailsModal">;

export default function DetailsModal({ route, navigation }: Props) {
  const { id, title, year, overview, poster_path } = route.params;

  const [isInfoExpanded, setInfoIsExpanded] = useState(false);

  return (
    <View style={styles.mainContainer}>
      {/* Visual cue "Swipe to close" */}
      <View style={styles.modalHandle} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Info and Poster */}
        <View style={styles.header}>
          <View style={styles.posterContainer}>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${poster_path}` }}
              style={styles.poster}
              resizeMode="cover"
            />
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.title} numberOfLines={3}>
              {title}
            </Text>
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{year}</Text>
            </View>
            <View style={styles.overviewSection}>
              <Pressable onPress={() => setInfoIsExpanded(!isInfoExpanded)}>
                <Text
                  style={styles.overviewText}
                  numberOfLines={isInfoExpanded ? undefined : 3}
                >
                  {overview || "No description available."}
                </Text>

                {/* Only display "more info" button if overview is long enough */}
                {overview && overview.length > 100 && (
                  <Text style={styles.readMore}>
                    {isInfoExpanded ? "Show less" : "Read more"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Separating line */}
        <View style={styles.separator} />

        {/* Streaming Providers */}
        <View style={styles.providersSection}>
          <Text style={styles.providersSectionTitle}>Where can I watch it?</Text>
          <View>
            <Ionicons name="tv-outline" size={24} color="#475569" />
            <Text style={styles.placeholderText}>Loading providers...</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0F172A", // Azul oscuro profundo
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  posterContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  poster: {
    width: 110,
    height: 165,
    borderRadius: 12,
    backgroundColor: "#1E293B",
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 20,
    paddingTop: 5,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 8,
  },
  yearBadge: {
    backgroundColor: "#1E293B",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  yearText: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "600",
  },
  overviewSection: {
    marginTop: 12,
    flex: 1,
  },
  readMore: {
    color: "#60A5FA",
    fontWeight: "500",
    marginTop: 4,
    paddingVertical: 2,
  },
  overviewText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 15,
    textAlign: "left",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: 10,
  },
  providersSection: {
    marginTop: 15,
  },
  providersSectionTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  providersPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#334155",
  },
  placeholderText: {
    color: "#64748B",
    marginLeft: 10,
    fontSize: 15,
  },
});
