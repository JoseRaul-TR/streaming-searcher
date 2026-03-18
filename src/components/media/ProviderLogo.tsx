import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Provider } from "@/types/providers";
import { ColorScheme, withOpacity } from "@/constants/colors";
import { useMode } from "@/hooks/useMode";

type Props = {
  provider: Provider;
  isSubscribed: boolean;
  /** If provided the logo becomes tappable — used in SubscriptionPickerModal */
  onToggle?: (id: number) => void;
  /** Logo size in px. Defaults to 50 */
  size?: number;
  /** Whether to render the provider name below the logo. Defaults to true */
  showName?: boolean;
  /**
   * Max lines for the provider name. Defaults to 1.
   * ProviderSection passes 2 so longer names wrap instead of being truncated.
   */
  nameLines?: number;
  /**
   * Controls the subscription visual style:
   *   animated=true  → one-shot halo on subscribe + persistent badge
   *                    (ProviderSection in details screen)
   *   animated=false → spring scale up (SubscriptionPickerModal)
   * Defaults to false.
   */
  animated?: boolean;
};

export default function ProviderLogo({
  provider,
  isSubscribed,
  onToggle,
  size = 50,
  showName = true,
  nameLines = 1,
  animated: useAnimation = false,
}: Props) {
  const { colors } = useMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // ————— Animation values —————

  // `pulse` drives the one-shot halo that plays once when the user subscribes.
  // It expands outward and fades simultaneously, acting as a confirmation flash.
  const pulse = useRef(new Animated.Value(0)).current;

  // `badgeScale` drives the spring pop-in of the checkmark badge.
  // Separate from pulse so both can run concurrently without interfering.
  const badgeScale = useRef(new Animated.Value(isSubscribed ? 1 : 0)).current;

  // `scale` drives the spring scale-up in SubscriptionPickerModal (animated=false).
  const scale = useRef(new Animated.Value(1)).current;

  // ————— One-shot halo (ProviderSection) —————
  useEffect(() => {
    if (!useAnimation) return;

    if (isSubscribed) {
      // Reset to 0 so the halo replays each time the user re-subscribes.
      pulse.setValue(0);

      // Single forward pass: halo expands and fades in 800ms.
      // Easing.out(Easing.quad) decelerates toward the end so the
      // expansion feels like a ripple rather than a hard stop.
      Animated.timing(pulse, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      // Reset immediately when unsubscribed so a future re-subscribe
      // always starts from the beginning.
      pulse.setValue(0);
    }
  }, [isSubscribed, pulse, useAnimation]);

  // ————— Badge spring pop-in (ProviderSection) —————
  useEffect(() => {
    if (!useAnimation) return;

    // Spring in when subscribed, spring out when unsubscribed.
    // tension: 180 + friction: 8 produces a snappy overshoot that feels
    // responsive without being bouncy.
    Animated.spring(badgeScale, {
      toValue: isSubscribed ? 1 : 0,
      useNativeDriver: true,
      tension: 180,
      friction: 8,
    }).start();
  }, [isSubscribed, badgeScale, useAnimation]);

  // ————— Spring scale (SubscriptionPickerModal) —————
  useEffect(() => {
    if (useAnimation) return;
    Animated.spring(scale, {
      toValue: isSubscribed ? 1.15 : 1,
      useNativeDriver: true,
      friction: 10,
    }).start();
  }, [isSubscribed, scale, useAnimation]);

  // ————— Interpolations —————

  // Halo expands outward from the logo edge (1x) to 1.7x its size.
  // A larger outputRange makes the ripple more visible on small logos.
  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.7],
  });

  // Opacity peaks early (at 30% of the animation) then fades to 0,
  // so the halo is brightest at the start of the expansion — like a real ripple.
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.6, 0.4, 0],
  });

  // ————— Derived sizes —————
  // Badge sits in the bottom-right corner. Its size scales with the logo
  // so the proportion stays consistent regardless of the `size` prop.
  const badgeSize = size * 0.38;
  const badgeIconSize = size * 0.22;
  // Negative offset overlaps the badge onto the logo edge.
  const badgeOffset = -(badgeSize * 0.2);

  // ————— Styles —————
  const logoStyle = {
    width: size,
    height: size,
    borderRadius: size,
    backgroundColor: colors.surface,
  };

  // ————— JSX —————
  const content = (
    <View style={styles.wrapper}>
      <Animated.View
        style={{
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
          // Scale up in modal mode; locked at 1 in animated mode so the
          // halo and badge handle all visual feedback instead.
          transform: [{ scale: useAnimation ? 1 : scale }],
        }}
      >
        {/* One-shot ripple halo — renders only in animated mode */}
        {useAnimation && (
          <Animated.View
            style={[
              styles.halo,
              {
                width: size,
                height: size,
                borderRadius: size,
                transform: [{ scale: haloScale }],
                opacity: haloOpacity,
              },
            ]}
          />
        )}

        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
          }}
          style={logoStyle}
        />

        {/* Checkmark badge — renders only in animated mode.
            Always in the tree so the spring animates in/out smoothly
            without unmounting. Scale 0 makes it invisible when unsubscribed. */}
        {useAnimation && (
          <Animated.View
            style={[
              styles.badge,
              {
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize,
                bottom: badgeOffset,
                right: badgeOffset,
                // borderWidth separates the badge from the logo visually.
                borderWidth: size * 0.05,
                transform: [{ scale: badgeScale }],
              },
            ]}
          >
            <Ionicons name="checkmark" size={badgeIconSize} color="#FFF" />
          </Animated.View>
        )}
      </Animated.View>

      {showName && (
        <Text
          style={[styles.name, isSubscribed && styles.nameActive]}
          numberOfLines={nameLines}
        >
          {provider.provider_name}
        </Text>
      )}
    </View>
  );

  if (onToggle) {
    return (
      <Pressable
        onPress={() => onToggle(provider.provider_id)}
        android_ripple={{ color: withOpacity(colors.primary, 0.08), borderless: true }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    wrapper: {
      alignItems: "center",
      gap: 5,
    },
    halo: {
      position: "absolute",
      backgroundColor: colors.success,
    },
    badge: {
      position: "absolute",
      backgroundColor: colors.success,
      justifyContent: "center",
      alignItems: "center",
      // borderColor matches the screen background so the badge appears
      // to float above the logo with a clean separation ring.
      borderColor: colors.background,
    },
    name: {
      color: colors.textMuted,
      fontSize: 10,
      textAlign: "center",
      width: 60,
    },
    nameActive: {
      color: colors.success,
      fontWeight: "600",
    },
  });
}
