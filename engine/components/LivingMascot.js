import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Text,
} from 'react-native';
import { audioMixer } from '../audio/index.js';

// Base mascot portraits & platforms
const MASCOT_SPRITES = {
  kodi: {
    base: require('../../assets/images/mascots/kodi.png'),
    platform: require('../../assets/images/kodi_platform.png'),
    name: 'Kodi',
    color: '#8A4B27',
  },
  ollo: {
    base: require('../../assets/images/mascots/ollo.png'),
    platform: require('../../assets/images/kodi_platform.png'),
    name: 'Ollo',
    color: '#4B9CD3',
  },
  peck: {
    base: require('../../assets/images/mascots/peck.png'),
    platform: require('../../assets/images/kodi_platform.png'),
    name: 'Peck',
    color: '#E65100',
  },
  sandy: {
    base: require('../../assets/images/mascots/sandy.png'),
    platform: require('../../assets/images/kodi_platform.png'),
    name: 'Sandy',
    color: '#F48FB1',
  },
  reya: {
    base: require('../../assets/images/mascots/reya.png'),
    platform: require('../../assets/images/kodi_platform.png'),
    name: 'Reya',
    color: '#D84315',
  },
};

export const LivingMascot = ({
  mascot = 'kodi',
  size = 160,
  isSpeaking = false,
  onTickle,
  style,
  showPlatform = false,
  interactive = true,
}) => {
  const spriteData = MASCOT_SPRITES[mascot] || MASCOT_SPRITES.kodi;

  // 1. Idle Breathing Animation (Squash & Stretch)
  const breathAnim = useRef(new Animated.Value(0)).current;

  // 2. Eye Blinking Animation
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // 3. Mouth Viseme / Speaking Animation
  const mouthAnim = useRef(new Animated.Value(0)).current;

  // 4. Tickle / Tap Kinetic Spring
  const tickleScale = useRef(new Animated.Value(1)).current;
  const tickleTranslateY = useRef(new Animated.Value(0)).current;
  const tickleRotate = useRef(new Animated.Value(0)).current;

  // 5. Giggling Sparkle Particles
  const [particles, setParticles] = useState([]);

  // Loop Breathing
  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [breathAnim]);

  // Periodic Natural Blinking (every ~3.5 seconds)
  useEffect(() => {
    let blinkTimer;
    const scheduleNextBlink = () => {
      const delay = 2500 + Math.random() * 2000;
      blinkTimer = setTimeout(() => {
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.1,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 110,
            useNativeDriver: true,
          }),
        ]).start(() => scheduleNextBlink());
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimer);
  }, [blinkAnim]);

  // Mouth viseme flapping when speaking
  useEffect(() => {
    let speakingLoop;
    if (isSpeaking) {
      speakingLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(mouthAnim, {
            toValue: 1,
            duration: 140,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(mouthAnim, {
            toValue: 0.2,
            duration: 120,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
      speakingLoop.start();
    } else {
      Animated.timing(mouthAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
    return () => speakingLoop?.stop();
  }, [isSpeaking, mouthAnim]);

  // Handle Tickle / Tap Interaction
  const handlePress = () => {
    if (!interactive) return;

    // Play tactile sound
    audioMixer.playSFX(require('../../assets/audio/SFX_squish.mp3'), 0.85);

    // Giggling voice randomly
    if (Math.random() > 0.4) {
      try {
        audioMixer.playVoice(require('../../assets/audio/tickle_giggle_ro.mp3'));
      } catch (e) {
        // Fallback to awesome chime
        audioMixer.playSFX(require('../../assets/audio/kodi_awesome.mp3'), 0.6);
      }
    }

    // Spring kinetic bounce
    Animated.sequence([
      Animated.parallel([
        Animated.spring(tickleTranslateY, {
          toValue: -28,
          friction: 3,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.spring(tickleScale, {
          toValue: 1.15,
          friction: 3,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(tickleRotate, {
            toValue: 1,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.timing(tickleRotate, {
            toValue: -1,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(tickleRotate, {
            toValue: 0,
            duration: 90,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.parallel([
        Animated.spring(tickleTranslateY, {
          toValue: 0,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.spring(tickleScale, {
          toValue: 1,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Spawn heart and star particles
    const newParticles = [
      { id: Date.now() + '-1', symbol: '💖', x: -25, y: -40 },
      { id: Date.now() + '-2', symbol: '⭐', x: 25, y: -45 },
      { id: Date.now() + '-3', symbol: '✨', x: 0, y: -60 },
      { id: Date.now() + '-4', symbol: '😄', x: -15, y: -75 },
    ];
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200);

    onTickle?.();
  };

  // Interpolated transforms
  const breathingScaleY = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.038],
  });

  const breathingScaleX = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.985],
  });

  const breathingTranslateY = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const rotationDeg = tickleRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  return (
    <View style={[styles.wrapper, { width: size, height: size * 1.15 }, style]}>
      {showPlatform && (
        <Image
          source={spriteData.platform}
          style={[styles.platform, { width: size * 1.05, height: size * 0.28 }]}
          resizeMode="contain"
        />
      )}

      {/* Floating Particles on Giggles */}
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) },
              ],
            },
          ]}
        >
          <Text style={styles.particleText}>{p.symbol}</Text>
        </Animated.View>
      ))}

      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handlePress}
        disabled={!interactive}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.mascotContainer,
            {
              transform: [
                { translateY: Animated.add(breathingTranslateY, tickleTranslateY) },
                { scaleX: Animated.multiply(breathingScaleX, tickleScale) },
                { scaleY: Animated.multiply(breathingScaleY, tickleScale) },
                { rotate: rotationDeg },
              ],
            },
          ]}
        >
          {/* Main Mascot Character Body */}
          <Image
            source={spriteData.base}
            style={{ width: size, height: size }}
            resizeMode="contain"
          />

          {/* Living Eyes / Blinking Overlay for Kodi & Friends */}
          <Animated.View
            style={[
              styles.eyeLidsOverlay,
              {
                transform: [{ scaleY: blinkAnim }],
              },
            ]}
          />

          {/* Animated Speaking Mouth Overlay */}
          {isSpeaking && (
            <Animated.View
              style={[
                styles.speakingMouth,
                {
                  transform: [
                    { scaleY: mouthAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.3] }) },
                    { scaleX: mouthAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) },
                  ],
                },
              ]}
            >
              <View style={styles.mouthShape} />
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  platform: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    zIndex: 1,
  },
  eyeLidsOverlay: {
    position: 'absolute',
    top: '32%',
    alignSelf: 'center',
    width: 36,
    height: 8,
    backgroundColor: 'transparent',
  },
  speakingMouth: {
    position: 'absolute',
    bottom: '36%',
    alignSelf: 'center',
    width: 22,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  mouthShape: {
    width: 18,
    height: 10,
    backgroundColor: '#3E2723',
    borderRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  particle: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 99,
  },
  particleText: {
    fontSize: 26,
  },
});
