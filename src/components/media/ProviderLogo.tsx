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
  /** The provider object containing provider_id, provider_name, and logo_path. */
  provider: Provider;
  /** Whether the user is currently subscribed to this provider in the active country. */
  isSubscribed: boolean;
  /**
   * If provided, the logo becomes tappable and calls this function on press.
   * Used in SubscriptionPickerModal to toggle subscriptions inline.
   * When omitted, the logo is display-only (used in ProviderSection on DetailsScreen).
   */
  onToggle?: (id: number) => void;
  /** Logo size in px. Defaults to 50 */
  size?: number;
  /** Whether to render the provider name below the logo. Defaults to true. */
  showName?: boolean;
  /**
   * Max number of lines for the provider name. Defaults to 1.
   * ProviderSection passes 2 so longer names wrap instead of being truncated.
   */
  nameLines?: number;
  /**
   * Controls which animation style is used for subscription feedback:
   *
   * true  (animated mode) — used in ProviderSection on DetailsScreen:
   *   - A one-shot ripple halo expands outward and fades when subscribing.
   *   - A spring-animated checkmark badge pops in on subscribe, pops out on
   *     unsubscribe. The badge stays in the tree at scale 0 when not subscribed
   *     so the spring can animate in either direction without remounting.
   *   - The logo itself does NOT scale — the halo and badge handle all feedback.
   *
   * false (scale mode, default) — used in SubscriptionPickerModal:
   *   - The logo springs to 1.15× scale when subscribed, back to 1× when not.
   *   - No halo or badge is rendered.
   *
   * Defaults to false.
   */
  animated?: boolean;
};

/**
 * Renders a circular streaming provider logo with subscription feedback animations.
 *
 * Two animation modes are supported via the animated prop (see prop docs above).
 * The separation exists because the two contexts have different UX needs:
 * DetailsScreen shows the logo in a grid where the halo and badge provide
 * clear per-item feedback; SubscriptionPickerModal shows logos in a flat list
 * where a scale animation is sufficient and less visually noisy.
 *
 * When onToggle is provided, the component wraps its content in a Pressable.
 * When omitted, the content is returned directly — avoiding an extra View in
 * the tree for display-only logos.
 *
 * @param props - See the Props type above for full documentation of each prop.
 */
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
  // Three separate Animated.Values are used because each drives a distinct
  // visual element that must be able to run concurrently without interfering:
  // pulse (halo) and badgeScale (badge) both react to isSubscribed changes
  // in animated mode, while scale reacts to it in non-animated mode.

  /**
   * Drives the one-shot ripple halo in animated mode.
   * Goes from 0 → 1 on subscribe (plays the halo); resets to 0 on
   * unsubscribe so a future subscribe always replays from the beginning.
   */
  const pulse = useRef(new Animated.Value(0)).current;

  /**
   * Drives the spring pop-in/pop-out of the checkmark badge in animated mode.
   * Initialised to 1 when already subscribed so the badge is immediately
   * visible if the component mounts in a subscribed state (e.g. after
   * navigating back to DetailsScreen with existing subscriptions).
   */
  const badgeScale = useRef(new Animated.Value(isSubscribed ? 1 : 0)).current;

  /**
   * Drives the spring scale-up of the logo in non-animated (modal) mode.
   * Always starts at 1 — the spring animates to 1.15 on subscribe.
   */
  const scale = useRef(new Animated.Value(1)).current;

  // ————— One-shot ripple halo (animated mode only) —————
  useEffect(() => {
    if (!useAnimation) return;

    if (isSubscribed) {
      // Reset to 0 each time so the halo replays if the user unsubscribes
      // and re-subscribes without unmounting the component.
      pulse.setValue(0);

      // Single forward pass: the halo expands from 1× to 1.7× the logo size
      // and simultaneously fades from 0.6 to 0 opacity.
      // Easing.out(Easing.quad) decelerates toward the end so the expansion
      // feels like a natural ripple rather than a hard stop.
      Animated.timing(pulse, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      // Reset immediately so a future re-subscribe always starts the halo
      // from the beginning rather than from wherever the last animation stopped.
      pulse.setValue(0);
    }
  }, [isSubscribed, pulse, useAnimation]);

  // ————— Badge spring pop-in/pop-out (animated mode only) —————
  useEffect(() => {
    if (!useAnimation) return;

    // Spring in to scale 1 when subscribed, spring out to scale 0 when not.
    // tension: 180 + friction: 8 produces a snappy overshoot that feels
    // responsive without being overly bouncy.
    // The badge is always in the tree (never unmounted) so the spring can
    // animate in either direction smoothly — at scale 0 it is invisible.
    Animated.spring(badgeScale, {
      toValue: isSubscribed ? 1 : 0,
      useNativeDriver: true,
      tension: 180,
      friction: 8,
    }).start();
  }, [isSubscribed, badgeScale, useAnimation]);

  // ————— Logo scale-up spring (non-animated / modal mode only) —————
  useEffect(() => {
    if (useAnimation) return;

    // Spring the logo to 1.15× when subscribed, back to 1× when not.
    // friction: 10 keeps the overshoot subtle since the logo is already
    // a prominent element in the list row.
    Animated.spring(scale, {
      toValue: isSubscribed ? 1.15 : 1,
      useNativeDriver: true,
      friction: 10,
    }).start();
  }, [isSubscribed, scale, useAnimation]);

  // ————— Interpolations for the halo —————

  /**
   * Maps the pulse value (0 → 1) to a visual scale (1× → 1.7×).
   * The 1.7× upper bound makes the ripple clearly visible even on small logos
   * without extending so far that it overlaps adjacent logos in a grid.
   */
  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.7],
  });

  /**
   * Maps the pulse value to opacity with an early peak at 30% of the animation.
   * The halo is brightest at the start of the expansion (0.6 at t=0, 0.4 at t=30%)
   * then fades to 0, matching the look of a real ripple where energy dissipates
   * as it spreads outward.
   */
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.6, 0.4, 0],
  });

  // ————— Derived sizes —————
  // All badge dimensions are computed from size so the proportions stay
  // consistent regardless of which size the caller passes in.

  /** Badge diameter — 38% of the logo size. */
  const badgeSize = size * 0.38;
  /** Icon size inside the badge — 22% of the logo size. */
  const badgeIconSize = size * 0.22;
  /**
   * Negative offset that moves the badge into the bottom-right corner of the
   * logo, overlapping the edge by 20% of the badge size.
   */
  const badgeOffset = -(badgeSize * 0.2);

  // ————— Inline style for the logo image —————
  // Defined here rather than in StyleSheet because it depends on the size prop.
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
          // In non-animated (modal) mode, the entire logo scales.
          // In animated mode, scale is locked at 1 because the halo and
          // badge handle all visual feedback instead.
          transform: [{ scale: useAnimation ? 1 : scale }],
        }}
      >
        {/* Ripple halo — renders only in animated mode */}
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
            Always kept in the tree (never conditionally unmounted) so the
            spring animation works in both directions. At scale 0 it is
            invisible; the Animated.spring in the useEffect above brings
            it to scale 1 when the user subscribes. */}
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
                // borderWidth creates a gap between the badge and the logo,
                // making it appear to float above rather than overlap.                borderWidth: size * 0.05,
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

  // Wrap in Pressable only when onToggle is provided.
  // Returning content directly avoids an extra View in the tree for
  // display-only logos in ProviderSection.
  if (onToggle) {
    return (
      <Pressable
        onPress={() => onToggle(provider.provider_id)}
        android_ripple={{
          color: withOpacity(colors.primary, 0.08),
          borderless: true,
        }}
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
