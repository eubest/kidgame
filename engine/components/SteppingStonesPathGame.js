import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Easing,
  Vibration,
} from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText, Ellipse, Rect } from 'react-native-svg';
import confetti from '../utils/confetti';
import { audioMixer } from '../audio';
import { AndroidHaptics } from '../native/AndroidHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 4 Animale Interactive inspirate din LogicLike count-in-order
export const ANIMAL_THEMES = [
  {
    id: 'frog',
    name: 'Broscuța',
    emoji: '🐸',
    padType: 'nuferi',
    padFill: '#2ECC71',
    padTarget: '#27AE60',
    padVisited: '#1ABC9C',
    padItem: '🪷',
    waterBg: '#0C2461',
    headerBg: '#0A3D62',
    banner: '🐸 Broscuța pe Nuferi',
  },
  {
    id: 'rabbit',
    name: 'Iepurașul',
    emoji: '🐰',
    padType: 'morcovi',
    padFill: '#FF7675',
    padTarget: '#D63031',
    padVisited: '#E17055',
    padItem: '🥕',
    waterBg: '#1E3727',
    headerBg: '#133926',
    banner: '🐰 Iepurașul pe Pajiște',
  },
  {
    id: 'bee',
    name: 'Albinuța',
    emoji: '🐝',
    padType: 'flori',
    padFill: '#FDCB6E',
    padTarget: '#E1B12C',
    padVisited: '#E58E26',
    padItem: '🌸',
    waterBg: '#341F97',
    headerBg: '#2A1A80',
    banner: '🐝 Albinuța din Floare în Floare',
  },
  {
    id: 'squirrel',
    name: 'Veverița',
    emoji: '🐿️',
    padType: 'ghinde',
    padFill: '#E17055',
    padTarget: '#C0392B',
    padVisited: '#B53471',
    padItem: '🌰',
    waterBg: '#2F1E1E',
    headerBg: '#3B1D1D',
    banner: '🐿️ Veverița pe Butuci',
  },
];

// Presets for pond lily pad sequences
const LEVELS = [
  {
    id: 1,
    title: 'Nivelul 1: Numără până la 5',
    targetNumbers: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    title: 'Nivelul 2: Călătoria până la 8',
    targetNumbers: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 3,
    title: 'Nivelul 3: Din 2 în 2 până la 10',
    targetNumbers: [2, 4, 6, 8, 10],
  },
];

// Compute responsive pad coordinates based on container width and height
const computeLevelLayout = (level, width, height) => {
  const isPort = width < height;
  const isCompactHeight = height < 500;
  const numPads = level.targetNumbers.length;
  const pads = [];

  if (isPort) {
    // Mobile Portrait: winding path ascending from bottom to top
    const startY = height - (isCompactHeight ? 75 : 90);
    const endY = isCompactHeight ? 90 : 120;
    const centerX = width * 0.5;
    const amplitude = Math.min(width * 0.28, isCompactHeight ? 80 : 110);

    level.targetNumbers.forEach((num, i) => {
      const progress = i / Math.max(1, numPads - 1);
      const y = startY - progress * (startY - endY);
      // Alternating wave
      const wave = Math.sin(progress * Math.PI * 2.2);
      const x = centerX + wave * amplitude;
      pads.push({
        id: i + 1,
        number: num,
        x: Math.round(x),
        y: Math.round(y),
      });
    });

    return {
      ...level,
      pads,
      trophyPosition: { x: Math.round(centerX), y: isCompactHeight ? 48 : 65 },
    };
  } else {
    // Landscape: winding path left to right
    const startX = isCompactHeight ? 65 : 80;
    const endX = width - (isCompactHeight ? 95 : 120);
    const centerY = isCompactHeight ? height * 0.50 : height * 0.55;
    const ampY = isCompactHeight ? Math.min(height * 0.16, 45) : Math.min(height * 0.22, 75);

    level.targetNumbers.forEach((num, i) => {
      const progress = i / Math.max(1, numPads - 1);
      const x = startX + progress * (endX - startX);
      const y = centerY + Math.sin(progress * Math.PI * 2.5) * ampY;
      pads.push({
        id: i + 1,
        number: num,
        x: Math.round(x),
        y: Math.round(y),
      });
    });

    return {
      ...level,
      pads,
      trophyPosition: { x: Math.round(width - (isCompactHeight ? 50 : 60)), y: Math.round(centerY) },
    };
  }
};

export const SteppingStonesPathGame = ({ audio, images, onBack, onComplete }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const rawLevel = LEVELS[levelIndex];

  // LogicLike Animal Theme selection (Broscuța 🐸, Iepurașul 🐰, Albinuța 🐝, Veverița 🐿️)
  const [selectedAnimal, setSelectedAnimal] = useState(ANIMAL_THEMES[0]);

  const winDim = Dimensions.get('window');
  const [pondLayout, setPondLayout] = useState({
    width: winDim.width,
    height: Math.max(400, winDim.height - 80),
  });

  const currentLevel = computeLevelLayout(rawLevel, pondLayout.width, pondLayout.height);

  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Index in targetNumbers
  const [visitedPads, setVisitedPads] = useState([]);
  const [isJumping, setIsJumping] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [waterRipples, setWaterRipples] = useState([]);

  // Frog/Animal position and animation
  const initialPad = currentLevel.pads[0] || { x: pondLayout.width * 0.5, y: pondLayout.height - 90 };
  const frogPos = useRef(new Animated.ValueXY({ x: initialPad.x, y: initialPad.y - 45 })).current;
  const frogScale = useRef(new Animated.ValueXY({ x: 1, y: 1 })).current;
  const frogWobble = useRef(new Animated.Value(0)).current;
  const victoryScale = useRef(new Animated.Value(0)).current;

  // Idle breathing & blinking
  const frogBreathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Breathing loop
    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(frogBreathe, { toValue: 1.06, duration: 800, useNativeDriver: false }),
        Animated.timing(frogBreathe, { toValue: 0.96, duration: 800, useNativeDriver: false }),
      ])
    );
    breatheLoop.start();
    return () => breatheLoop.stop();
  }, [frogBreathe]);

  // Reset when level changes
  useEffect(() => {
    const pad = currentLevel.pads[0];
    if (!pad) return;
    setCurrentStepIndex(0);
    setVisitedPads([pad.number]);
    setIsJumping(false);
    setIsVictory(false);
    frogPos.setValue({ x: pad.x, y: pad.y - 45 });
    victoryScale.setValue(0);

    // Play intro audio
    if (audio?.steppingStonesIntro) {
      audioMixer.playVoice(audio.steppingStonesIntro, 0.95);
    }
  }, [levelIndex]);

  // Smoothly adjust animal position on screen orientation/layout changes without resetting progress
  useEffect(() => {
    const activePad = currentLevel.pads[currentStepIndex];
    if (activePad && !isJumping) {
      frogPos.setValue({ x: activePad.x, y: activePad.y - 45 });
    }
  }, [pondLayout.width, pondLayout.height]);

  const handlePadPress = (pad) => {
    if (isJumping || isVictory) return;

    const expectedNumber = currentLevel.targetNumbers[currentStepIndex + 1];

    if (pad.number === expectedNumber) {
      // Correct pad!
      AndroidHaptics.waterSplash();
      executeJump(pad, currentStepIndex + 1);
    } else if (pad.number !== currentLevel.targetNumbers[currentStepIndex]) {
      // Wrong pad tap!
      AndroidHaptics.warning();
      handleWrongPad();
    }
  };

  const executeJump = (targetPad, nextStepIndex) => {
    setIsJumping(true);

    if (audio?.sfxWhoosh) {
      audioMixer.playSFX(audio.sfxWhoosh, 0.8);
    }

    const currentPad = currentLevel.pads.find(
      (p) => p.number === currentLevel.targetNumbers[currentStepIndex]
    ) || initialPad;

    const startX = currentPad.x;
    const startY = currentPad.y - 45;
    const targetX = targetPad.x;
    const targetY = targetPad.y - 45;

    // LogicLike parabolic arc physics:
    // Compute peak jump height mid-way
    const midX = (startX + targetX) / 2;
    const midY = Math.min(startY, targetY) - 85; // high arc leap

    // Anticipation squash before launch
    Animated.sequence([
      Animated.timing(frogScale, {
        toValue: { x: 1.25, y: 0.75 },
        duration: 90,
        useNativeDriver: false,
      }),
      // Mid-air stretch
      Animated.timing(frogScale, {
        toValue: { x: 0.85, y: 1.3 },
        duration: 160,
        useNativeDriver: false,
      }),
      // Landing squash
      Animated.timing(frogScale, {
        toValue: { x: 1.35, y: 0.65 },
        duration: 110,
        useNativeDriver: false,
      }),
      // Spring back to normal
      Animated.spring(frogScale, {
        toValue: { x: 1, y: 1 },
        friction: 4,
        tension: 80,
        useNativeDriver: false,
      }),
    ]).start();

    // Two-segment parabolic translation (up to apex, down to pad)
    Animated.sequence([
      Animated.parallel([
        Animated.timing(frogPos.x, {
          toValue: midX,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(frogPos.y, {
          toValue: midY,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(frogPos.x, {
          toValue: targetX,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(frogPos.y, {
          toValue: targetY,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      // Landing event!
      setIsJumping(false);
      setCurrentStepIndex(nextStepIndex);
      setVisitedPads((prev) => [...prev, targetPad.number]);

      // Trigger landing water ripple
      triggerWaterRipple(targetPad.x, targetPad.y);

      // Sound feedback
      if (audio?.sfxPop) {
        audioMixer.playSFX(audio.sfxPop, 0.9);
      }
      if (audio?.sfxChime) {
        audioMixer.playSFX(audio.sfxChime, 0.7);
      }

      // Check win condition
      if (nextStepIndex === currentLevel.targetNumbers.length - 1) {
        triggerVictory();
      }
    });
  };

  const handleWrongPad = () => {
    if (audio?.sfxIncorrect) {
      audioMixer.playSFX(audio.sfxIncorrect, 0.7);
    }
    // Shake wobble animation
    Animated.sequence([
      Animated.timing(frogWobble, { toValue: -12, duration: 60, useNativeDriver: false }),
      Animated.timing(frogWobble, { toValue: 12, duration: 60, useNativeDriver: false }),
      Animated.timing(frogWobble, { toValue: -8, duration: 60, useNativeDriver: false }),
      Animated.timing(frogWobble, { toValue: 8, duration: 60, useNativeDriver: false }),
      Animated.timing(frogWobble, { toValue: 0, duration: 60, useNativeDriver: false }),
    ]).start();
  };

  const triggerWaterRipple = (x, y) => {
    const rippleId = Date.now();
    setWaterRipples((prev) => [...prev, { id: rippleId, x, y }]);
    setTimeout(() => {
      setWaterRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 800);
  };

  const triggerVictory = () => {
    setIsVictory(true);
    AndroidHaptics.victoryFanfare();

    if (audio?.steppingStonesWin) {
      audioMixer.playVoice(audio.steppingStonesWin, 1.0);
    }
    if (audio?.sfxBingo) {
      audioMixer.playSFX(audio.sfxBingo, 0.9);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2ED573', '#FFD32A', '#1E90FF', '#FF4757', '#FFA502'],
      });
    } catch (e) {
      // Confetti fallback
    }

    Animated.spring(victoryScale, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: false,
    }).start();
  };

  const nextLevel = () => {
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else {
      setLevelIndex(0);
      if (onComplete) onComplete();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: selectedAnimal.headerBg }]}>
      {/* 1. Header Bar */}
      <View style={[styles.header, { backgroundColor: selectedAnimal.headerBg }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>⬅ Înapoi</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{selectedAnimal.banner}</Text>
          <Text style={styles.subtitleText}>{currentLevel.title}</Text>
        </View>
        <View style={[styles.badgeContainer, { backgroundColor: selectedAnimal.padTarget }]}>
          <Text style={styles.badgeText}>
            {currentStepIndex + 1} / {currentLevel.targetNumbers.length}
          </Text>
        </View>
      </View>

      {/* 1.1 Selector de Animăluțe (LogicLike Animal Themes) */}
      <View style={styles.animalSelectorRow}>
        {ANIMAL_THEMES.map((theme) => {
          const isSelected = selectedAnimal.id === theme.id;
          return (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.animalThemeBtn,
                isSelected && [styles.animalThemeBtnActive, { backgroundColor: theme.padFill }],
              ]}
              onPress={() => {
                if (selectedAnimal.id !== theme.id) {
                  setSelectedAnimal(theme);
                  try { Vibration.vibrate(25); } catch (e) {}
                  if (audio?.sfxPop) audioMixer.playSFX(audio.sfxPop, 0.7);
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.animalThemeEmoji}>{theme.emoji}</Text>
              <Text style={[styles.animalThemeName, isSelected && styles.animalThemeNameActive]}>
                {theme.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Lagoon Pond Canvas */}
      <View
        style={[styles.pondArea, { backgroundColor: selectedAnimal.waterBg }]}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          if (w > 0 && h > 0 && (Math.abs(w - pondLayout.width) > 5 || Math.abs(h - pondLayout.height) > 5)) {
            setPondLayout({ width: Math.round(w), height: Math.round(h) });
          }
        }}
      >
        {/* SVG Decorative Water Background with Lily Pads & Connections */}
        <Svg style={StyleSheet.absoluteFill}>
          {/* Gentle water reflections */}
          <Ellipse cx={pondLayout.width * 0.3} cy={pondLayout.height * 0.3} rx="120" ry="25" fill="rgba(255,255,255,0.08)" />
          <Ellipse cx={pondLayout.width * 0.7} cy={pondLayout.height * 0.65} rx="150" ry="32" fill="rgba(255,255,255,0.06)" />

          {/* Dash lines connecting visited pads (inspired by LogicLike DashLine.ts) */}
          {currentLevel.pads.map((pad, idx) => {
            if (idx === 0) return null;
            const prevPad = currentLevel.pads[idx - 1];
            const isCompletedSegment = visitedPads.includes(pad.number);
            const isPort = pondLayout.width < pondLayout.height;

            const midX = isPort
              ? (prevPad.x + pad.x) / 2 + (idx % 2 === 0 ? 30 : -30)
              : (prevPad.x + pad.x) / 2;
            const midY = isPort
              ? (prevPad.y + pad.y) / 2
              : Math.min(prevPad.y, pad.y) - 40;

            return (
              <Path
                key={`dash-${idx}`}
                d={`M ${prevPad.x} ${prevPad.y} Q ${midX} ${midY} ${pad.x} ${pad.y}`}
                stroke={isCompletedSegment ? '#FFD32A' : 'rgba(255,255,255,0.35)'}
                strokeWidth={isCompletedSegment ? 4 : 3}
                strokeDasharray={isCompletedSegment ? 'none' : '8, 8'}
                fill="none"
              />
            );
          })}

          {/* Water ripples on landing */}
          {waterRipples.map((ripple) => (
            <G key={`ripple-${ripple.id}`}>
              <Circle
                cx={ripple.x}
                cy={ripple.y}
                r="42"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="3"
                fill="none"
              />
              <Circle
                cx={ripple.x}
                cy={ripple.y}
                r="56"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="2"
                fill="none"
              />
            </G>
          ))}
        </Svg>

        {/* Lily Pads / Stepping Stones with Thematic Items */}
        {currentLevel.pads.map((pad) => {
          const isVisited = visitedPads.includes(pad.number);
          const isNextTarget =
            currentLevel.targetNumbers[currentStepIndex + 1] === pad.number;

          const padColor = isVisited
            ? selectedAnimal.padFill
            : isNextTarget
            ? selectedAnimal.padTarget
            : selectedAnimal.padVisited;

          return (
            <TouchableOpacity
              key={`pad-${pad.id}`}
              style={[
                styles.padContainer,
                { left: pad.x - 45, top: pad.y - 40 },
              ]}
              onPress={() => handlePadPress(pad)}
              activeOpacity={0.85}
            >
              <Svg width="90" height="80" viewBox="0 0 90 80">
                {/* Pad Leaf Shadow */}
                <Ellipse cx="45" cy="46" rx="42" ry="32" fill="#000000" opacity="0.35" />
                {/* Pad Body */}
                <Path
                  d="M 45 10 C 65 10, 85 22, 85 45 C 85 68, 65 75, 45 75 C 25 75, 5 68, 5 45 C 5 22, 25 10, 45 10 Z"
                  fill={padColor}
                />
                {/* Pad Cut Notch */}
                <Path d="M 45 45 L 85 35 L 75 50 Z" fill="#000000" opacity="0.2" />
                {/* Thematic Item Emoji Badge */}
                <SvgText
                  x="45"
                  y="20"
                  fontSize="13"
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {selectedAnimal.padItem}
                </SvgText>
              </Svg>

              {/* Number Badge */}
              <View
                style={[
                  styles.numberBadge,
                  isVisited && styles.numberBadgeVisited,
                  isNextTarget && styles.numberBadgeTarget,
                ]}
              >
                <Text
                  style={[
                    styles.numberText,
                    isVisited && styles.numberTextVisited,
                    isNextTarget && styles.numberTextTarget,
                  ]}
                >
                  {pad.number}
                </Text>
              </View>

              {/* Pulsing Guide Glow on the Next Target */}
              {isNextTarget && <View style={styles.guideRing} />}
            </TouchableOpacity>
          );
        })}

        {/* Golden Trophy at Destination */}
        <View
          style={[
            styles.trophyContainer,
            { left: currentLevel.trophyPosition.x - 30, top: currentLevel.trophyPosition.y - 40 },
          ]}
        >
          <Text style={{ fontSize: 52 }}>🏆</Text>
        </View>

        {/* The Hopping Animal Mascot */}
        <Animated.View
          style={[
            styles.frogContainer,
            {
              transform: [
                { translateX: frogPos.x },
                { translateY: frogPos.y },
                { scaleX: Animated.multiply(frogScale.x, frogBreathe) },
                { scaleY: Animated.multiply(frogScale.y, frogBreathe) },
                {
                  rotate: frogWobble.interpolate({
                    inputRange: [-15, 15],
                    outputRange: ['-15deg', '15deg'],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          {selectedAnimal.id === 'frog' && (
            <Svg width="72" height="64" viewBox="0 0 72 64">
              <Ellipse cx="36" cy="56" rx="26" ry="7" fill="rgba(0,0,0,0.25)" />
              <Ellipse cx="36" cy="38" rx="28" ry="20" fill="#2ED573" />
              <Ellipse cx="36" cy="42" rx="20" ry="14" fill="#7BED9F" />
              <Circle cx="22" cy="18" r="10" fill="#2ED573" />
              <Circle cx="50" cy="18" r="10" fill="#2ED573" />
              <Circle cx="22" cy="18" r="7" fill="#FFFFFF" />
              <Circle cx="50" cy="18" r="7" fill="#FFFFFF" />
              <Circle cx="24" cy="17" r="4" fill="#2F3542" />
              <Circle cx="48" cy="17" r="4" fill="#2F3542" />
              <Circle cx="22" cy="15" r="1.5" fill="#FFFFFF" />
              <Circle cx="46" cy="15" r="1.5" fill="#FFFFFF" />
              <Path d="M 28 36 Q 36 44 44 36" stroke="#1E272C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <Circle cx="24" cy="38" r="3.5" fill="#FF6B81" opacity="0.8" />
              <Circle cx="48" cy="38" r="3.5" fill="#FF6B81" opacity="0.8" />
            </Svg>
          )}

          {selectedAnimal.id === 'rabbit' && (
            <Svg width="72" height="64" viewBox="0 0 72 64">
              <Ellipse cx="36" cy="58" rx="24" ry="6" fill="rgba(0,0,0,0.25)" />
              <Ellipse cx="25" cy="14" rx="7" ry="16" fill="#F1F2F6" />
              <Ellipse cx="25" cy="14" rx="3.5" ry="11" fill="#FFB8B8" />
              <Ellipse cx="47" cy="14" rx="7" ry="16" fill="#F1F2F6" />
              <Ellipse cx="47" cy="14" rx="3.5" ry="11" fill="#FFB8B8" />
              <Ellipse cx="36" cy="40" rx="26" ry="20" fill="#F8F9FA" />
              <Circle cx="26" cy="36" r="4.5" fill="#2F3542" />
              <Circle cx="46" cy="36" r="4.5" fill="#2F3542" />
              <Circle cx="24.5" cy="34.5" r="1.5" fill="#FFFFFF" />
              <Circle cx="44.5" cy="34.5" r="1.5" fill="#FFFFFF" />
              <Circle cx="36" cy="42" r="3" fill="#FF7675" />
              <Path d="M 16 41 L 28 42 M 16 45 L 28 44 M 56 41 L 44 42 M 56 45 L 44 44" stroke="#A4B0BE" strokeWidth="1.5" strokeLinecap="round" />
              <Path d="M 32 46 Q 36 50 40 46" stroke="#2F3542" strokeWidth="2" strokeLinecap="round" fill="none" />
              <Circle cx="22" cy="43" r="3" fill="#FF6B81" opacity="0.6" />
              <Circle cx="50" cy="43" r="3" fill="#FF6B81" opacity="0.6" />
            </Svg>
          )}

          {selectedAnimal.id === 'bee' && (
            <Svg width="72" height="64" viewBox="0 0 72 64">
              <Ellipse cx="36" cy="58" rx="24" ry="6" fill="rgba(0,0,0,0.25)" />
              <Ellipse cx="22" cy="18" rx="14" ry="8" fill="rgba(255,255,255,0.75)" stroke="#74B9FF" strokeWidth="1.5" />
              <Ellipse cx="50" cy="18" rx="14" ry="8" fill="rgba(255,255,255,0.75)" stroke="#74B9FF" strokeWidth="1.5" />
              <Ellipse cx="36" cy="38" rx="25" ry="20" fill="#FDCB6E" />
              <Path d="M 22 32 C 30 35, 42 35, 50 32" stroke="#2D3436" strokeWidth="4.5" strokeLinecap="round" />
              <Path d="M 18 40 C 28 44, 44 44, 54 40" stroke="#2D3436" strokeWidth="4.5" strokeLinecap="round" />
              <Path d="M 22 48 C 30 51, 42 51, 50 48" stroke="#2D3436" strokeWidth="4.5" strokeLinecap="round" />
              <Circle cx="26" cy="30" r="5" fill="#2D3436" />
              <Circle cx="46" cy="30" r="5" fill="#2D3436" />
              <Circle cx="24.5" cy="28.5" r="2" fill="#FFFFFF" />
              <Circle cx="44.5" cy="28.5" r="2" fill="#FFFFFF" />
              <Path d="M 31 38 Q 36 43 41 38" stroke="#D63031" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <Circle cx="20" cy="35" r="2.5" fill="#FF7675" opacity="0.8" />
              <Circle cx="52" cy="35" r="2.5" fill="#FF7675" opacity="0.8" />
            </Svg>
          )}

          {selectedAnimal.id === 'squirrel' && (
            <Svg width="72" height="64" viewBox="0 0 72 64">
              <Ellipse cx="36" cy="58" rx="24" ry="6" fill="rgba(0,0,0,0.25)" />
              <Path d="M 48 48 C 65 42, 68 20, 54 14 C 44 10, 42 22, 50 30" stroke="#E17055" strokeWidth="12" strokeLinecap="round" fill="none" />
              <Path d="M 48 48 C 63 42, 66 22, 54 16 C 46 12, 44 22, 50 30" stroke="#FAB1A0" strokeWidth="5" strokeLinecap="round" fill="none" />
              <Ellipse cx="32" cy="38" rx="22" ry="18" fill="#E17055" />
              <Circle cx="20" cy="20" r="7" fill="#E17055" />
              <Circle cx="20" cy="20" r="4" fill="#FAB1A0" />
              <Circle cx="38" cy="20" r="7" fill="#E17055" />
              <Circle cx="38" cy="20" r="4" fill="#FAB1A0" />
              <Circle cx="25" cy="34" r="4" fill="#2D3436" />
              <Circle cx="39" cy="34" r="4" fill="#2D3436" />
              <Circle cx="24" cy="32.5" r="1.5" fill="#FFFFFF" />
              <Circle cx="38" cy="32.5" r="1.5" fill="#FFFFFF" />
              <Circle cx="32" cy="39" r="2.5" fill="#2D3436" />
              <Path d="M 28 43 Q 32 47 36 43" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" fill="none" />
              <Circle cx="32" cy="48" r="5" fill="#B53471" />
            </Svg>
          )}
        </Animated.View>
      </View>

      {/* 3. Victory Celebration Modal */}
      {isVictory && (
        <Animated.View
          style={[
            styles.victoryOverlay,
            {
              transform: [{ scale: victoryScale }],
              opacity: victoryScale,
            },
          ]}
        >
          <View style={styles.victoryCard}>
            <Text style={{ fontSize: 68, textAlign: 'center' }}>🏆{selectedAnimal.emoji}⭐</Text>
            <Text style={styles.victoryTitle}>Bravo! Ai Reușit!</Text>
            <Text style={styles.victoryDesc}>
              {selectedAnimal.name} a sărit vesel(ă) pe toți {selectedAnimal.padType} în ordinea corectă și a ajuns la comoară!
            </Text>

            <View style={styles.victoryButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.replayButton]}
                onPress={() => setLevelIndex(levelIndex)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalButtonText}>🔄 Reia Nivelul</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.nextButton, { backgroundColor: selectedAnimal.padTarget }]}
                onPress={nextLevel}
                activeOpacity={0.85}
              >
                <Text style={styles.modalButtonText}>Următorul Nivel ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A3D62', // Deep lagoon blue
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 44 : 14,
    paddingBottom: 10,
    backgroundColor: 'rgba(10, 61, 98, 0.95)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
  animalSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    gap: 6,
    zIndex: 10,
  },
  animalThemeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  animalThemeBtnActive: {
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  animalThemeEmoji: {
    fontSize: 16,
    marginRight: 5,
  },
  animalThemeName: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  animalThemeNameActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  backButton: {
    backgroundColor: '#3C6382',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleText: {
    color: '#FFD32A',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  subtitleText: {
    color: '#E4F1FE',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  badgeContainer: {
    backgroundColor: '#2ED573',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  pondArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0C2461', // Rich pond water
    overflow: 'hidden',
  },
  padContainer: {
    position: 'absolute',
    width: 90,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  numberBadge: {
    position: 'absolute',
    top: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0E4429',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  numberBadgeVisited: {
    backgroundColor: '#FFD32A',
    borderColor: '#D35400',
  },
  numberBadgeTarget: {
    backgroundColor: '#FFF200',
    borderColor: '#FF4757',
    transform: [{ scale: 1.15 }],
  },
  numberText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2C3E50',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  numberTextVisited: {
    color: '#8E44AD',
  },
  numberTextTarget: {
    color: '#D63031',
  },
  guideRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FFD32A',
    borderStyle: 'dashed',
    top: 2,
  },
  trophyContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  frogContainer: {
    position: 'absolute',
    width: 72,
    height: 64,
    zIndex: 20,
  },
  victoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  victoryCard: {
    width: '85%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFD32A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  victoryTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2ED573',
    marginVertical: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  victoryDesc: {
    fontSize: 16,
    color: '#57606F',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  victoryButtonRow: {
    flexDirection: 'row',
    gap: 14,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayButton: {
    backgroundColor: '#747D8C',
  },
  nextButton: {
    backgroundColor: '#FF4757',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
});

export default SteppingStonesPathGame;
