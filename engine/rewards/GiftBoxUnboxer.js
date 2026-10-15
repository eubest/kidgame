import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Svg, {
  Rect,
  Path,
  Circle,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import confetti from '../utils/confetti';
import { audioMixer } from '../audio/index.js';
import { SparkleParticle } from '../tracing/index.js';

// Pool of collectible kindergarten prizes
export const GIFT_PRIZES = [
  {
    id: 'prize_pirate_hat',
    name: 'Pălărie de Pirat',
    category: 'wearable',
    slot: 'head',
    emoji: '🏴‍☠️',
    color: '#2C3E50',
    desc: 'Pentru aventuri îndrăznețe pe mările albastre!',
    sound: 'instTrumpet',
  },
  {
    id: 'prize_astronaut_helmet',
    name: 'Cască de Cosmonaut',
    category: 'wearable',
    slot: 'head',
    emoji: '🧑‍🚀',
    color: '#0984E3',
    desc: 'Gata de zbor spre stele și lună!',
    sound: 'sfxWhoosh',
  },
  {
    id: 'prize_golden_crown',
    name: 'Coroană Regală',
    category: 'wearable',
    slot: 'head',
    emoji: '👑',
    color: '#F1C40F',
    desc: 'O coroană din aur strălucitor pentru un campion!',
    sound: 'sfxRoyal',
  },
  {
    id: 'prize_superhero_cape',
    name: 'Pelerină de Erou',
    category: 'wearable',
    slot: 'back',
    emoji: '🦸‍♂️',
    color: '#E74C3C',
    desc: 'Flutură în vânt când alergi cu viteză!',
    sound: 'sfxWhoosh',
  },
  {
    id: 'prize_teddy_bear',
    name: 'Ursuleț de Pluș',
    category: 'toy',
    slot: 'bed',
    emoji: '🧸',
    color: '#D35400',
    desc: 'Moale, pufos și gata de îmbrățișat!',
    sound: 'sfxSquish',
  },
  {
    id: 'prize_toy_rocket',
    name: 'Rachetă Cosmică',
    category: 'toy',
    slot: 'shelf',
    emoji: '🚀',
    color: '#E17055',
    desc: 'Numărătoarea inversă a început: 3, 2, 1, lansare!',
    sound: 'sfxWhoosh',
  },
  {
    id: 'prize_rubber_duck',
    name: 'Rățușcă de Cauciuc',
    category: 'toy',
    slot: 'bath',
    emoji: '🦆',
    color: '#F39C12',
    desc: 'Face mac-mac vesel în cădița lui Ollo!',
    sound: 'sfxPop',
  },
  {
    id: 'prize_magic_wand',
    name: 'Baghetă Magică',
    category: 'toy',
    slot: 'shelf',
    emoji: '✨',
    color: '#A29BFE',
    desc: 'Creează steluțe și vise colorate!',
    sound: 'sfxChime',
  },
];

export const GiftBoxUnboxer = ({
  audio,
  prize = null,
  onClaim,
  onClose,
  boxColor = '#6C5CE7',
  ribbonColor = '#FFD32A',
}) => {
  const [taps, setTaps] = useState(0);
  const [isOpened, setIsOpened] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [activePrize] = useState(
    prize || GIFT_PRIZES[Math.floor(Math.random() * GIFT_PRIZES.length)]
  );

  // Animations
  const boxShake = useRef(new Animated.Value(0)).current;
  const boxScale = useRef(new Animated.Value(1)).current;
  const lidTranslateY = useRef(new Animated.Value(0)).current;
  const lidRotate = useRef(new Animated.Value(0)).current;
  const prizeY = useRef(new Animated.Value(40)).current;
  const prizeScale = useRef(new Animated.Value(0.1)).current;
  const sunburstRot = useRef(new Animated.Value(0)).current;
  const claimBtnBounce = useRef(new Animated.Value(0.8)).current;

  // Start continuous sunburst rotation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sunburstRot, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [sunburstRot]);

  const spawnSparklesAt = (x, y, count = 6) => {
    const newItems = [];
    const colors = ['#FFD700', '#FFA502', '#FF4757', '#00CEC9', '#FD79A8'];
    for (let i = 0; i < count; i++) {
      newItems.push({
        id: `${Date.now()}_${Math.random()}`,
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 80,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setSparkles((prev) => [...prev.slice(-20), ...newItems]);
  };

  const handleBoxTap = () => {
    if (isOpened) return;

    const nextTaps = taps + 1;
    setTaps(nextTaps);

    if (nextTaps === 1) {
      // First Tap: Gentle playful shake
      audioMixer.playSFX(audio?.sfxPop || null, 0.7);
      spawnSparklesAt(170, 160, 4);

      Animated.sequence([
        Animated.timing(boxScale, { toValue: 1.08, duration: 90, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: 0.5, duration: 60, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: 0, duration: 60, useNativeDriver: true }),
        Animated.spring(boxScale, { toValue: 1, friction: 3, tension: 70, useNativeDriver: true }),
      ]).start();
    } else if (nextTaps === 2) {
      // Second Tap: Violent build-up shake with squishy squash
      audioMixer.playSFX(audio?.sfxSquish || null, 1.0);
      spawnSparklesAt(170, 150, 8);

      Animated.sequence([
        Animated.timing(boxScale, { toValue: 1.18, duration: 80, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: 2, duration: 40, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: -2, duration: 40, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: 2, duration: 40, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: -1.5, duration: 40, useNativeDriver: true }),
        Animated.timing(boxShake, { toValue: 0, duration: 50, useNativeDriver: true }),
        Animated.spring(boxScale, { toValue: 1.04, friction: 4, tension: 80, useNativeDriver: true }),
      ]).start();
    } else if (nextTaps >= 3) {
      // Third Tap: UNBOXING CLIMAX! Lid flies off, confetti explodes, fanfare plays!
      setIsOpened(true);
      audioMixer.playSFX(audio?.sfxReward || audio?.sfxRoyal || null, 1.0);
      spawnSparklesAt(170, 120, 20);

      // Canvas Confetti burst
      confetti({
        particleCount: 160,
        spread: 95,
        origin: { y: 0.55 },
        colors: ['#FFD700', '#FF4757', '#2ED573', '#1E90FF', '#FFA502'],
      });

      // Lid flies up and spins off
      Animated.parallel([
        Animated.timing(lidTranslateY, {
          toValue: -170,
          duration: 650,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(lidRotate, {
          toValue: -40,
          duration: 650,
          useNativeDriver: true,
        }),
        // Prize floats out and scales up
        Animated.spring(prizeY, {
          toValue: -110,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(prizeScale, {
          toValue: 1.35,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        // Claim button pops in
        Animated.sequence([
          Animated.delay(450),
          Animated.spring(claimBtnBounce, {
            toValue: 1,
            friction: 4,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  };

  const shakeInterpolate = boxShake.interpolate({
    inputRange: [-2, -1, 0, 1, 2],
    outputRange: ['-16deg', '-8deg', '0deg', '8deg', '16deg'],
  });

  const lidRotateInterpolate = lidRotate.interpolate({
    inputRange: [-45, 0],
    outputRange: ['-45deg', '0deg'],
  });

  const sunburstInterpolate = sunburstRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Title & Emotional Prompt */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isOpened ? '🎉 Ai Deschis Cadoul Magic!' : '🎁 O Surpriză Specială pentru Tine!'}
        </Text>
        <Text style={styles.subtitle}>
          {!isOpened
            ? taps === 0
              ? 'Atinge cutia pentru a vedea ce se ascunde înăuntru!'
              : taps === 1
              ? 'Cutia se mișcă! Mai atinge o dată!'
              : 'Cutia este pe cale să explodeze de bucurie! Ultima atingere!'
            : 'Felicitări! Ai deblocat o nouă jucărie minunată!'}
        </Text>
      </View>

      {/* Main Unboxing Stage */}
      <View style={styles.stage}>
        {/* Sunburst Rays Behind Unlocked Prize */}
        {isOpened && (
          <Animated.View
            style={[
              styles.sunburstWrap,
              { transform: [{ rotate: sunburstInterpolate }] },
            ]}
          >
            <Svg width={360} height={360} viewBox="0 0 300 300">
              <Defs>
                <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFF200" stopOpacity="0.8" />
                  <Stop offset="60%" stopColor="#FFA502" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#FFA502" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="150" cy="150" r="140" fill="url(#sunGlow)" />
              {/* Sunburst beams */}
              {[...Array(12)].map((_, i) => (
                <Path
                  key={i}
                  d="M150 150 L135 0 L165 0 Z"
                  fill="#FFA502"
                  opacity={0.3}
                  transform={`rotate(${i * 30} 150 150)`}
                />
              ))}
            </Svg>
          </Animated.View>
        )}

        {/* Floating Prize */}
        {isOpened && (
          <Animated.View
            style={[
              styles.prizeFloatingWrap,
              {
                transform: [
                  { translateY: prizeY },
                  { scale: prizeScale },
                ],
              },
            ]}
          >
            <View style={styles.prizeBubble}>
              <Text style={styles.prizeEmoji}>{activePrize.emoji}</Text>
            </View>
            <View style={styles.prizeNamePill}>
              <Text style={styles.prizeNameText}>{activePrize.name}</Text>
            </View>
            <Text style={styles.prizeDescText}>{activePrize.desc}</Text>
          </Animated.View>
        )}

        {/* Interactive Gift Box with Animated Lid */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleBoxTap}
          disabled={isOpened}
        >
          <Animated.View
            style={[
              styles.boxContainer,
              {
                transform: [
                  { scale: boxScale },
                  { rotate: shakeInterpolate },
                ],
              },
            ]}
          >
            {/* Flying Animated Lid */}
            <Animated.View
              style={[
                styles.lidWrap,
                {
                  transform: [
                    { translateY: lidTranslateY },
                    { rotate: lidRotateInterpolate },
                  ],
                },
              ]}
            >
              <Svg width={190} height={60} viewBox="0 0 190 60">
                <Defs>
                  <LinearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#8072FA" />
                    <Stop offset="100%" stopColor="#5E4CD8" />
                  </LinearGradient>
                  <LinearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#FFE066" />
                    <Stop offset="100%" stopColor="#F5B041" />
                  </LinearGradient>
                </Defs>

                {/* Ribbon Bow on top */}
                <Path
                  d="M75 18 C60 2 62 25 80 20 Z"
                  fill="url(#ribbonGrad)"
                />
                <Path
                  d="M115 18 C130 2 128 25 110 20 Z"
                  fill="url(#ribbonGrad)"
                />
                <Circle cx="95" cy="20" r="9" fill="#FFC048" />

                {/* Lid Rim */}
                <Rect
                  x="10"
                  y="24"
                  width="170"
                  height="32"
                  rx="9"
                  fill="url(#lidGrad)"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
                {/* Vertical Ribbon */}
                <Rect
                  x="82"
                  y="24"
                  width="26"
                  height="32"
                  fill="url(#ribbonGrad)"
                />
              </Svg>
            </Animated.View>

            {/* Box Body */}
            <Svg width={170} height={140} viewBox="0 0 170 140" style={styles.boxBodySvg}>
              <Defs>
                <LinearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#6C5CE7" />
                  <Stop offset="100%" stopColor="#4834D4" />
                </LinearGradient>
                <LinearGradient id="ribbonBodyGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#FFE066" />
                  <Stop offset="100%" stopColor="#F5B041" />
                </LinearGradient>
              </Defs>

              {/* Main Box Rect */}
              <Rect
                x="5"
                y="0"
                width="160"
                height="135"
                rx="14"
                fill="url(#bodyGrad)"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />

              {/* Vertical Center Ribbon */}
              <Rect
                x="72"
                y="0"
                width="26"
                height="135"
                fill="url(#ribbonBodyGrad)"
              />

              {/* Horizontal Center Ribbon */}
              <Rect
                x="5"
                y="52"
                width="160"
                height="26"
                fill="url(#ribbonBodyGrad)"
              />

              {/* Subtle 3D Shadow Highlight */}
              <Path
                d="M5 14 Q85 30 165 14 L165 0 L5 0 Z"
                fill="#000000"
                opacity={0.12}
              />
            </Svg>

            {/* Tap indicator stars badge */}
            {!isOpened && (
              <View style={styles.tapBadge}>
                <Text style={styles.tapBadgeText}>
                  {taps === 0 ? '👆 Atinge-mă!' : taps === 1 ? '⭐ 1 / 3' : '💥 2 / 3'}
                </Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Sparkles Overlay */}
        {sparkles.map((s) => (
          <SparkleParticle
            key={s.id}
            x={s.x}
            y={s.y}
            color={s.color}
            onFinish={() => setSparkles((curr) => curr.filter((i) => i.id !== s.id))}
          />
        ))}
      </View>

      {/* Claim Button after unboxing */}
      {isOpened && (
        <Animated.View
          style={[
            styles.claimBtnWrap,
            { transform: [{ scale: claimBtnBounce }] },
          ]}
        >
          <TouchableOpacity
            style={styles.claimBtn}
            onPress={() => {
              audioMixer.playSFX(audio?.sfxButton || null);
              if (onClaim) onClaim(activePrize);
            }}
          >
            <Text style={styles.claimBtnIcon}>🏡</Text>
            <Text style={styles.claimBtnText}>Pune Cadoul în Cameră!</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2F3542',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#57606F',
    marginTop: 6,
    textAlign: 'center',
  },
  stage: {
    width: 360,
    height: 320,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    paddingBottom: 20,
  },
  sunburstWrap: {
    position: 'absolute',
    top: -20,
    width: 360,
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  boxContainer: {
    alignItems: 'center',
    zIndex: 10,
    position: 'relative',
  },
  lidWrap: {
    zIndex: 12,
    marginBottom: -6,
  },
  boxBodySvg: {
    zIndex: 10,
  },
  tapBadge: {
    position: 'absolute',
    bottom: 25,
    backgroundColor: '#FFD32A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 20,
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  },
  tapBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2F3542',
  },
  prizeFloatingWrap: {
    position: 'absolute',
    top: 140,
    alignItems: 'center',
    zIndex: 25,
  },
  prizeBubble: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#FFA502',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 25px rgba(255, 165, 2, 0.45)',
  },
  prizeEmoji: {
    fontSize: 48,
  },
  prizeNamePill: {
    marginTop: 8,
    backgroundColor: '#2ED573',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 16,
    boxShadow: '0 4px 10px rgba(46, 213, 115, 0.3)',
  },
  prizeNameText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  prizeDescText: {
    marginTop: 4,
    fontSize: 13,
    color: '#2F3542',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  claimBtnWrap: {
    marginTop: 18,
    zIndex: 30,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA502',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    boxShadow: '0 8px 20px rgba(255, 165, 2, 0.45)',
    gap: 10,
  },
  claimBtnIcon: {
    fontSize: 22,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
