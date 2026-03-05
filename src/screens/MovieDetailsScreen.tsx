import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "MovieDetails">;

export default function MovieDetailsScreen({ route, navigation }: Props) {
  const { id, title, year, poster_path } = route.params;

  return (
    <View style={styles.mainContainer}>
      <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={24} color="#FFF" />
      </Pressable>

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
          </View>
        </View>

        {/* Separating line */}
        <View style={styles.separator} />

        {/* Streaming Providers */}
        <View style={styles.providersSection}>
          <Text style={styles.providersSectionTitle}>Streaming Platforms</Text>
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
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20, // Ajuste para el notch de iOS
    left: 20,
    zIndex: 99,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Efecto cristal
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 100 : 70, // Espacio para no chocar con el botón
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 25,
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
    fontSize: 24,
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
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: 10,
  },
  providersSection: {
    marginTop: 20,
  },
  providersSectionTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },
  providersPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
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
