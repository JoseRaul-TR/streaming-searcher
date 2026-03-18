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
import { FilterType, SortKey } from "@/types/watchlist";
import { getShadow } from "@/utils/shadow";

// ————— Module level —————

type MenuOption = {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

type MenuProps = {
  visible: boolean;
  options: MenuOption[];
  current: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

// Static constants — do not depend on state or props.
// Defining them inside the component would recreate them on every render.
const FILTER_OPTIONS: MenuOption[] = [
  { label: "All", value: "all", icon: "grid-outline" },
  { label: "Movies", value: "movie", icon: "film-outline" },
  { label: "Series", value: "tv", icon: "tv-outline" },
];

const SORT_OPTIONS: MenuOption[] = [
  { label: "Recently Added", value: "added_at", icon: "time-outline" },
  { label: "Title", value: "title", icon: "text-outline" },
  { label: "Release Year", value: "year", icon: "calendar-outline" },
];

// Extracted to module level to avoid remounts caused by
// redefinition on every render of the parent component.
function OptionsMenu({
  visible,
  options,
  current,
  onSelect,
  onClose,
}: MenuProps) {
  const { colors, isDark } = useMode();
  const styles = useMemo(
    () => makeMenuStyles(colors, isDark),
    [colors, isDark],
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.menuContent, { backgroundColor: colors.surface }]}
          >
            {options.map((opt) => (
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
                  name={opt.icon}
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
}

// ————— Main Component —————

interface WatchlistControlsProps {
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  sortBy: SortKey;
  setSortBy: (s: SortKey) => void;
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
          {FILTER_OPTIONS.find((o) => o.value === filter)?.label}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      {/* Sort Button + Direction Toggle */}
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
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
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

      <OptionsMenu
        visible={showFilterMenu}
        options={FILTER_OPTIONS}
        current={filter}
        onSelect={(v) => setFilter(v as FilterType)}
        onClose={() => setShowFilterMenu(false)}
      />

      <OptionsMenu
        visible={showSortMenu}
        options={SORT_OPTIONS}
        current={sortBy}
        onSelect={(v) => setSortBy(v as SortKey)}
        onClose={() => setShowSortMenu(false)}
      />
    </View>
  );
}

// ————— Styles —————

// Styles for OptionsMenu — does not need isDark.
function makeMenuStyles(colors: ColorScheme, isDark: boolean) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: withOpacity("#000", 0.5),
      justifyContent: "center",
      alignItems: "center",
    },
    menuContent: {
      width: "80%",
      borderRadius: 25,
      padding: 10,
      ...getShadow({ isDark }),
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
      gap: 12,
    },
    menuItemText: { fontSize: 16, color: colors.text },
  });
}

// Styles for WatchlistControls — needs isDark for shadow values.
function makeStyles(colors: ColorScheme, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 12,
      margin: 15,
      borderRadius: 52,
      height: 52,
      zIndex: 10,
      ...getShadow({ isDark }),
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
      backgroundColor: withOpacity(colors.surfaceAlt, 0.4),
      marginHorizontal: 4,
    },
    triggerText: {
      flex: 1,
      fontSize: 13,
      fontWeight: "600",
      marginLeft: 8,
    },
  });
}
