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
 * Wraps children in a fade-in animation that plays once on mount.
 *
 * Used to soften the entrance of content that loads asynchronously,
 * such as provider lists, watchlist cards, and search results.
 *
 * Example:
 *   <FadeView delay={100}>
 *     <ProviderSection ... />
 *   </FadeView>
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
