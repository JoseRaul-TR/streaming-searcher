import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  /** Delay before the fade starts, in ms. Defaults to 0. */
  delay?: number;
  /** Duration of the fade-in, in ms. Defaults to 250. */
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Wraps children in a one-shot fade-in animation that plays once on mount.
 *
 * Uses Animated.timing with useNativeDriver: true so the animation runs on
 * the UI thread and is not blocked by JavaScript work. This is safer than
 * LayoutAnimation for list items, which requires enabling an experimental
 * Android flag and can produce unexpected results when items are added or
 * removed.
 *
 * The delay prop enables staggered entrance animations in FlatList render items:
 *   delay={Math.min(index, 6) * 30}
 * The cap at index 6 (180ms maximum) prevents long waits on large lists.
 *
 * @param props.children - The content to fade in.
 * @param props.delay - How long to wait before starting, in ms. Defaults to 0.
 *   Used to stagger multiple cards so they appear one after another.
 * @param props.duration - How long the fade takes, in ms. Defaults to 250.
 * @param props.style - Optional additional styles applied to the Animated.View wrapper.
 */
export default function FadeView({
  children,
  delay = 0,
  duration = 250,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration, delay]);

  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>;
}
