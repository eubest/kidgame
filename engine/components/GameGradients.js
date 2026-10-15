import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * GameGradients - GPU-Accelerated Gradient System for Android & Web
 * 
 * Leverages `expo-linear-gradient` for native Android Skia/RenderNode hardware-accelerated rasterization.
 * Supports:
 *  - LagoonDepthGradient: Deep ocean/lagoon aquatic feel for Phonics Fishing & Ollo Bath
 *  - GoldenStarGradient: Radiant metallic gold for reward celebrations & star counters
 *  - SunsetSkyGradient: Warm sunset vibes for storybook reader & hub headers
 *  - RainbowPianoGradient: Color-coded musical keys for preschool soundbox
 *  - ForestCanopyGradient: Lush leafy green for outdoor exploration
 *  - RoyalMagicGradient: Vibrant purple for magic quest awards
 */

export const GameGradient = ({
  colors = ['#4facfe', '#00f2fe'],
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  style,
  children,
  ...props
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      renderToHardwareTextureAndroid={true}
      style={[styles.baseGradient, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
};

export const LagoonDepthGradient = ({ style, children, ...props }) => (
  <GameGradient
    colors={['#0052D4', '#4364F7', '#6FB1FC']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
    {...props}
  >
    {children}
  </GameGradient>
);

export const GoldenStarGradient = ({ style, children, ...props }) => (
  <GameGradient
    colors={['#FFE000', '#F7971E', '#FFB300']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
    {...props}
  >
    {children}
  </GameGradient>
);

export const SunsetSkyGradient = ({ style, children, ...props }) => (
  <GameGradient
    colors={['#FA709A', '#FEE140']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
    {...props}
  >
    {children}
  </GameGradient>
);

export const ForestCanopyGradient = ({ style, children, ...props }) => (
  <GameGradient
    colors={['#11998E', '#38EF7D']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
    {...props}
  >
    {children}
  </GameGradient>
);

export const RoyalMagicGradient = ({ style, children, ...props }) => (
  <GameGradient
    colors={['#8E2DE2', '#4A00E0']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
    {...props}
  >
    {children}
  </GameGradient>
);

const PIANO_RAINBOW_PALETTES = [
  ['#FF416C', '#FF4B2B'], // C (Do) - Ruby Red
  ['#FF7E5F', '#FEB47B'], // D (Re) - Warm Coral
  ['#F7971E', '#FFD200'], // E (Mi) - Amber Gold
  ['#11998E', '#38EF7D'], // F (Fa) - Emerald Green
  ['#00C6FF', '#0072FF'], // G (Sol) - Aqua Blue
  ['#4776E6', '#8E54E9'], // A (La) - Indigo Sky
  ['#8E2DE2', '#F000FF'], // B (Si) - Neon Orchid
  ['#FF416C', '#FF4B2B'], // High C - Brilliant Red
];

export const RainbowPianoGradient = ({ noteIndex = 0, style, children, ...props }) => {
  const palette = PIANO_RAINBOW_PALETTES[noteIndex % PIANO_RAINBOW_PALETTES.length];
  return (
    <GameGradient
      colors={palette}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={style}
      {...props}
    >
      {children}
    </GameGradient>
  );
};

const styles = StyleSheet.create({
  baseGradient: {
    overflow: 'hidden',
  },
});
