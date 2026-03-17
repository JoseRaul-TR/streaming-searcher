import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ColorScheme, withOpacity } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

interface WatchlistControlsProps {
  colors: ColorScheme;
  filter: string;
  setFilter: (f: any) => void;
  sortBy: string;
  setSortBy: (s: any) => void;
  isAscending: boolean;
  onToggleDirection: () => void;
}

export default function WatchlistControls({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  isAscending,
  onToggleDirection,
}: WatchlistControlsProps) {
  const { colors, isDark } = useMode();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filterOptions = [
    { label: "All", value: "all", icon: "grid-outline" },
    { label: "Movies", value: "movie", icon: "film-outline" },
    { label: "Series", value: "tv", icon: "tv-outline" },
  ];

  const sortOptions = [
    { label: "Recently Added", value: "added_at", icon: "time-outline" },
    { label: "Title", value: "title", icon: "text-outline" },
    { label: "Release Year", value: "year", icon: "calendar-outline" },
  ];

  const Menu = ({ visible, options, current, onSelect, onClose }: any) => (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.menuContent, { backgroundColor: colors.surface }]}
          >
            {options.map((opt: any) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.menuItem,
                  current === opt.value && {
                    backgroundColor: withOpacity(colors.primary, 0.1),
                  },
                ]}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={20}
                  color={
                    current === opt.value
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: colors.text },
                    current === opt.value && {
                      color: colors.primary,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <Pressable
        style={[styles.trigger, { backgroundColor: colors.surface }]}
        onPress={() => setShowFilterMenu(true)}
      >
        <Ionicons name="filter" size={18} color={colors.primary} />
        <Text
          style={[styles.triggerText, { color: colors.text }]}
          numberOfLines={1}
        >
          {filterOptions.find((o) => o.value === filter)?.label}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      {/*Sort Button + Direction Toggle */}
      <View style={[styles.sortGroup, { backgroundColor: colors.surface }]}>
        <Pressable
          style={styles.sortTrigger}
          onPress={() => setShowSortMenu(true)}
        >
          <Ionicons name="swap-vertical" size={18} color={colors.primary} />
          <Text
            style={[styles.triggerText, { color: colors.text }]}
            numberOfLines={1}
          >
            {sortOptions.find((o) => o.value === sortBy)?.label}
          </Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          onPress={onToggleDirection}
          style={styles.directionToggle}
          hitSlop={8}
        >
          <Ionicons
            name={isAscending ? "arrow-up" : "arrow-down"}
            size={18}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <Menu
        visible={showFilterMenu}
        options={filterOptions}
        current={filter}
        onSelect={setFilter}
        onClose={() => setShowFilterMenu(false)}
      />

      <Menu
        visible={showSortMenu}
        options={sortOptions}
        current={sortBy}
        onSelect={setSortBy}
        onClose={() => setShowSortMenu(false)}
      />
    </View>
  );
}

function makeStyles(colors: ColorScheme, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 12,
      margin: 15,
      borderRadius: 52,
      height: 52,
      zIndex: 10,
      // — iOS shadow —
      shadowColor: isDark ? "#000" : "#64748B",
      shadowOffset: { width: 0, height: isDark ? 4 : 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: isDark ? 10 : 8,
      // — Android elevation —
      elevation: isDark ? 5 : 2,
    },
    trigger: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      height: 48,
      borderRadius: 50,
    },
    sortGroup: {
      flex: 1.4,
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 50,
      paddingHorizontal: 8,
    },
    sortTrigger: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      height: 48,
      paddingLeft: 4,
    },
    directionToggle: {
      paddingHorizontal: 8,
      height: 48,
      justifyContent: "center",
    },
    divider: {
      width: 1,
      height: "100%",
      backgroundColor: "rgba(128,128,128,0.2)",
      marginHorizontal: 4,
    },
    triggerText: {
      flex: 1,
      fontSize: 13,
      fontWeight: "600",
      marginLeft: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    menuContent: {
      width: "80%",
      borderRadius: 25,
      padding: 10,
      elevation: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
      gap: 12,
    },
    menuItemText: { fontSize: 16 },
  });
}
