import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const SparkleParticle = ({ x, y, size = 26, color = '#FFD700', onFinish }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const randomDx = useRef((Math.random() - 0.5) * 35).current;
  const randomDy = useRef((Math.random() - 0.5) * 35 - 10).current;
  const randomRot = useRef(Math.random() * 90).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });
  }, [anim, onFinish]);

  const scale = anim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.2, 1.3, 0],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.9, 0],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, randomDx],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, randomDy],
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${randomRot}deg`, `${randomRot + 120}deg`],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {/* 4-point golden star sparkle */}
        <Path
          d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
          fill={color}
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    zIndex: 9999,
  },
});
