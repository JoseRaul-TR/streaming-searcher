import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Provider } from "@/types/providers";

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
   *   animated=true  → pulsing halo loop (ProviderSection in details screen)
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
  // ————— Animation values —————

  // `pulse` is a single 0→1 value driven by a sine-eased timing.
  // Because Easing.inOut(Easing.sin) produces a symmetric S-curve,
  // the halo expands and fades at the same rate — no visible seam in the loop.
  const pulse = useRef(new Animated.Value(0)).current;

  // `scale` drives the spring scale-up on selection in modal mode.
  const scale = useRef(new Animated.Value(1)).current;

  // ————— Seamless halo pulse (ProviderSection) —————
  useEffect(() => {
    if (!useAnimation) return;

    let animation: Animated.CompositeAnimation;

    if (isSubscribed) {
      pulse.setValue(0);

      // Single timing 0→1 looped. Easing.inOut(Easing.sin) produces a smooth
      // S-curve so the start and end of each cycle connect seamlessly — the halo
      // fades out at exactly the same speed it fades in, with no hard reset.
      animation = Animated.loop(
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      );
      animation.start();
    } else {
      pulse.setValue(0);
    }

    return () => animation?.stop();
  }, [isSubscribed, pulse, useAnimation]);

  // ————— Spring scale (SubscriptionPickerModal) —————
  useEffect(() => {
    if (useAnimation) return;
    Animated.spring(scale, {
      toValue: isSubscribed ? 1.15 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [isSubscribed, scale, useAnimation]);

  // ————— Interpolations —————

  // Scale: peaks at the midpoint of the cycle (0.5) then contracts back.
  // This mirrors the opacity curve so halo is largest when most visible.
  const haloScale = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  // Opacity: peaks at the midpoint and returns to 0 — the sine easing makes
  // both the rise and the fall smooth and continuous with no gap.
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 0],
  });

  // ————— Styles —————
  const logoStyle = {
    width: size,
    height: size,
    borderRadius: size,
    backgroundColor: "#1E293B" as const,
  };

  // ————— JSX —————
  const content = (
    <View style={styles.wrapper}>
      {/*
       * Animated.View applies the spring scale in modal mode (useAnimation=false).
       * In animated mode the transform is locked at 1 — the halo has its own scale.
       */}
      <Animated.View
        style={{
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
          transform: [{ scale: useAnimation ? 1 : scale }],
        }}
      >
        {/* Halo — position absolute so it renders behind the logo image */}
        {useAnimation && isSubscribed && (
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
        android_ripple={{ color: "rgba(96,165,250,0.08)", borderless: true }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 5,
  },
  halo: {
    position: "absolute",
    backgroundColor: "#22C55E",
  },
  name: {
    color: "#94A3B8",
    fontSize: 10,
    textAlign: "center",
    width: 60,
  },
  nameActive: {
    color: "#CBD5E1",
    fontWeight: "600",
  },
});
