import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';

export const AmbientWorldOverlay = ({ children }) => {
  // Cloud drift animations
  const cloud1Anim = useRef(new Animated.Value(-120)).current;
  const cloud2Anim = useRef(new Animated.Value(-150)).current;
  const cloud3Anim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Drifting clouds looping infinitely
    const startCloud = (anim, duration, delay = 0) => {
      anim.setValue(-180);
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1200,
            duration,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    startCloud(cloud1Anim, 38000, 0);
    startCloud(cloud2Anim, 48000, 10000);
    startCloud(cloud3Anim, 32000, 5000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Drifting Clouds in Sky Background */}
      <Animated.View pointerEvents="none" style={[styles.cloud, { top: 20, transform: [{ translateX: cloud1Anim }] }]}>
        <Text style={styles.cloudEmoji}>☁️</Text>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.cloud, { top: 70, opacity: 0.7, transform: [{ translateX: cloud2Anim }] }]}>
        <Text style={[styles.cloudEmoji, { fontSize: 44 }]}>☁️</Text>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.cloud, { top: 120, opacity: 0.5, transform: [{ translateX: cloud3Anim }] }]}>
        <Text style={[styles.cloudEmoji, { fontSize: 34 }]}>☁️</Text>
      </Animated.View>

      {/* Content Children */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  cloud: {
    position: 'absolute',
    zIndex: 1,
  },
  cloudEmoji: {
    fontSize: 52,
  },
});


export default AmbientWorldOverlay;
