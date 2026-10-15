import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
  PanResponder,
} from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { audioMixer } from '../audio/index.js';
import confetti from '../utils/confetti';

const { width } = Dimensions.get('window');

const FISH_COLORS = ['#FF6B6B', '#FFA502', '#2ED573', '#1E90FF', '#9B59B6', '#FF4757'];

const FISHING_ROUNDS = [
  {
    target: 'M',
    voicePrompt: require('../../assets/audio/fishing_catch_m.mp3'),
    desc: 'Prinde peștișorii cu litera M',
    fishList: [
      { id: 'f1', char: 'M', y: 160, speed: 7000, color: '#FF6B6B', direction: 1 },
      { id: 'f2', char: 'A', y: 240, speed: 8500, color: '#FFA502', direction: -1 },
      { id: 'f3', char: 'M', y: 320, speed: 6500, color: '#2ED573', direction: 1 },
      { id: 'f4', char: 'O', y: 400, speed: 9000, color: '#1E90FF', direction: -1 },
      { id: 'f5', char: 'M', y: 480, speed: 7500, color: '#9B59B6', direction: 1 },
      { id: 'f6', char: 'E', y: 200, speed: 8000, color: '#FF4757', direction: -1 },
    ],
  },
  {
    target: 'B',
    voicePrompt: require('../../assets/audio/fishing_catch_b.mp3'),
    desc: 'Prinde peștișorii cu litera B',
    fishList: [
      { id: 'f1', char: 'B', y: 180, speed: 6800, color: '#2ED573', direction: 1 },
      { id: 'f2', char: 'P', y: 260, speed: 8200, color: '#FF6B6B', direction: -1 },
      { id: 'f3', char: 'B', y: 340, speed: 7200, color: '#FFA502', direction: 1 },
      { id: 'f4', char: 'D', y: 420, speed: 8800, color: '#1E90FF', direction: -1 },
      { id: 'f5', char: 'B', y: 220, speed: 6400, color: '#9B59B6', direction: -1 },
    ],
  },
  {
    target: 'R',
    voicePrompt: require('../../assets/audio/fishing_catch_r.mp3'),
    desc: 'Prinde peștișorii cu litera R',
    fishList: [
      { id: 'f1', char: 'R', y: 160, speed: 7000, color: '#FF6B6B', direction: 1 },
      { id: 'f2', char: 'B', y: 250, speed: 8000, color: '#1E90FF', direction: -1 },
      { id: 'f3', char: 'R', y: 330, speed: 6600, color: '#2ED573', direction: 1 },
      { id: 'f4', char: 'P', y: 410, speed: 8400, color: '#FFA502', direction: -1 },
      { id: 'f5', char: 'R', y: 490, speed: 7200, color: '#9B59B6', direction: 1 },
    ],
  },
];

export const PhonicsFishingGame = ({ audio, images, onComplete, onBack }) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const currentRound = FISHING_ROUNDS[roundIdx];

  const [caughtIds, setCaughtIds] = useState([]);
  const [isRoundWon, setIsRoundWon] = useState(false);
  const [hookTarget, setHookTarget] = useState(null); // fish currently being reeled in

  // Hook animation
  const hookAnimY = useRef(new Animated.Value(120)).current;
  const hookAnimX = useRef(new Animated.Value(width * 0.45)).current;
  const rodAngle = useRef(new Animated.Value(0)).current;

  // Fish swimming animations
  const fishAnims = useRef(
    currentRound.fishList.reduce((acc, f) => {
      acc[f.id] = new Animated.Value(f.direction === 1 ? -120 : width + 60);
      return acc;
    }, {})
  ).current;

  // Gentle water bobbing
  const waterBob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Water surface bobbing loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(waterBob, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(waterBob, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Rod subtle sway
    Animated.loop(
      Animated.sequence([
        Animated.timing(rodAngle, { toValue: 3, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(rodAngle, { toValue: -3, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Initialize and loop fish swimming
  useEffect(() => {
    // Play voice prompt
    try {
      if (roundIdx === 0) {
        audioMixer.playVoice(require('../../assets/audio/fishing_intro.mp3'));
        setTimeout(() => {
          if (currentRound.voicePrompt) audioMixer.playVoice(currentRound.voicePrompt);
        }, 3600);
      } else {
        if (currentRound.voicePrompt) audioMixer.playVoice(currentRound.voicePrompt);
      }
    } catch (e) {}

    setCaughtIds([]);
    setIsRoundWon(false);
    setHookTarget(null);
    hookAnimY.setValue(120);

    // Animate each fish swimming across
    const animLoops = currentRound.fishList.map((f) => {
      const anim = fishAnims[f.id];
      if (!anim) return null;

      const startX = f.direction === 1 ? -120 : width + 60;
      const endX = f.direction === 1 ? width + 60 : -120;

      anim.setValue(startX);
      const loop = Animated.loop(
        Animated.timing(anim, {
          toValue: endX,
          duration: f.speed,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
      return loop;
    });

    return () => {
      animLoops.forEach((l) => l && l.stop());
    };
  }, [roundIdx]);

  // Hooking a fish
  const handleCatchFish = (fish) => {
    if (caughtIds.includes(fish.id) || hookTarget || isRoundWon) return;

    if (fish.char === currentRound.target) {
      // Correct target fish!
      setHookTarget(fish);

      try {
        audioMixer.playSFX(require('../../assets/audio/bubble_break.mp3'), 0.8);
        audioMixer.playSFX(require('../../assets/audio/SFX_pop.mp3'), 0.9);
      } catch (e) {}

      // Drop hook to fish depth, then reel up with fish
      Animated.sequence([
        Animated.timing(hookAnimY, {
          toValue: fish.y + 10,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(150),
        Animated.timing(hookAnimY, {
          toValue: 90,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Landed in bucket
        try {
          audioMixer.playSFX(require('../../assets/audio/splash_out.mp3'), 0.85);
          audioMixer.playSFX(require('../../assets/audio/correct_chime.mp3'), 0.7);
        } catch (e) {}

        const newCaught = [...caughtIds, fish.id];
        setCaughtIds(newCaught);
        setHookTarget(null);
        hookAnimY.setValue(120);

        // Check if all targets caught (3 targets per round)
        const totalTargets = currentRound.fishList.filter((f) => f.char === currentRound.target).length;
        if (newCaught.length >= totalTargets) {
          setIsRoundWon(true);
          try {
            audioMixer.playVoice(require('../../assets/audio/fishing_win.mp3'));
            audioMixer.playSFX(require('../../assets/audio/BingoSuccessfulLineFIll.mp3'), 0.9);
          } catch (e) {}
          confetti({ particleCount: 130, spread: 90, origin: { y: 0.55 } });
        }
      });
    } else {
      // Non-target fish: gentle fail-soft escape
      try {
        audioMixer.playSFX(require('../../assets/audio/SFX_squish.mp3'), 0.7);
        audioMixer.playSFX(require('../../assets/audio/SFX_whoosh.mp3'), 0.6);
      } catch (e) {}
      // Drop hook slightly and snap back
      Animated.sequence([
        Animated.timing(hookAnimY, {
          toValue: fish.y - 20,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(hookAnimY, {
          toValue: 120,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleNextRound = () => {
    if (roundIdx < FISHING_ROUNDS.length - 1) {
      setRoundIdx((prev) => prev + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const targetCount = currentRound.fishList.filter((f) => f.char === currentRound.target).length;

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER & NAVIGATION */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>← Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>Căutăm Litera:</Text>
          <View style={styles.targetBubble}>
            <Text style={styles.targetLetter}>{currentRound.target}</Text>
          </View>
          <TouchableOpacity
            style={styles.replaySoundBtn}
            onPress={() => {
              if (currentRound.voicePrompt) audioMixer.playVoice(currentRound.voicePrompt);
            }}
          >
            <Text style={styles.replaySoundIcon}>🔊</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bucketPill}>
          <Text style={styles.bucketEmoji}>🪣</Text>
          <Text style={styles.bucketCount}>
            {caughtIds.length} / {targetCount}
          </Text>
        </View>
      </View>

      {/* 2. FISHING DOCK & ROD AREA */}
      <View style={styles.skyArea}>
        {/* Animated clouds */}
        <View style={styles.cloud1}>
          <Text style={{ fontSize: 36 }}>☁️</Text>
        </View>
        <View style={styles.cloud2}>
          <Text style={{ fontSize: 28 }}>☁️</Text>
        </View>

        {/* Mascot Peck on Wooden Dock */}
        <View style={styles.dockWrapper}>
          <View style={styles.dockPlanks}>
            <View style={styles.plank} />
            <View style={styles.plank} />
            <View style={styles.plank} />
          </View>

          {/* Mascot Icon */}
          <View style={styles.mascotHolder}>
            <Text style={styles.mascotEmoji}>🐧</Text>
          </View>

          {/* Wooden Bucket with Caught Fish */}
          <View style={styles.bucketContainer}>
            <Text style={{ fontSize: 32 }}>🪣</Text>
            {caughtIds.length > 0 && (
              <View style={styles.bucketFishBadge}>
                <Text style={{ fontSize: 13, color: '#FFFFFF', fontWeight: '800' }}>
                  +{caughtIds.length}
                </Text>
              </View>
            )}
          </View>

          {/* Fishing Rod */}
          <Animated.View
            style={[
              styles.fishingRod,
              {
                transform: [
                  {
                    rotate: rodAngle.interpolate({
                      inputRange: [-10, 10],
                      outputRange: ['-10deg', '10deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.rodPole} />
          </Animated.View>
        </View>
      </View>

      {/* 3. UNDERWATER AQUATIC REALM */}
      <View style={styles.waterArea}>
        {/* Water Surface Wave Layer */}
        <Animated.View
          style={[
            styles.waterSurfaceLine,
            {
              transform: [
                {
                  translateY: waterBob.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 6],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Ambient Bubbles */}
        <View style={[styles.ambientBubble, { left: '15%', top: '35%' }]}>
          <Text style={{ fontSize: 18, opacity: 0.6 }}>🫧</Text>
        </View>
        <View style={[styles.ambientBubble, { left: '75%', top: '65%' }]}>
          <Text style={{ fontSize: 14, opacity: 0.5 }}>🫧</Text>
        </View>
        <View style={[styles.ambientBubble, { left: '40%', top: '80%' }]}>
          <Text style={{ fontSize: 20, opacity: 0.7 }}>🫧</Text>
        </View>

        {/* Fishing Line & Hook */}
        <Animated.View
          style={[
            styles.hookAssembly,
            {
              transform: [{ translateY: hookAnimY }],
            },
          ]}
        >
          {/* Vertical Fishing Line (rendered up to the rod tip) */}
          <View style={styles.fishingLine} />

          {/* Shiny Magnetic Hook */}
          <View style={styles.magneticHook}>
            <Text style={styles.hookEmoji}>🪝</Text>
          </View>
        </Animated.View>

        {/* SWIMMING FISH */}
        {currentRound.fishList.map((fish) => {
          const isCaught = caughtIds.includes(fish.id);
          const isReeling = hookTarget?.id === fish.id;

          if (isCaught) return null;

          return (
            <Animated.View
              key={fish.id}
              style={[
                styles.fishWrapper,
                {
                  top: fish.y,
                  transform: [
                    {
                      translateX: isReeling ? hookAnimX : fishAnims[fish.id] || 0,
                    },
                    {
                      translateY: isReeling ? hookAnimY : 0,
                    },
                    {
                      scaleX: fish.direction === 1 ? 1 : -1,
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleCatchFish(fish)}
                activeOpacity={0.85}
                style={[styles.fishBody, { backgroundColor: fish.color }]}
              >
                {/* Fish Eye */}
                <View style={styles.fishEye}>
                  <View style={styles.fishPupil} />
                </View>

                {/* Phoneme Badge on Fish Flank */}
                <View style={styles.phonemeBadge}>
                  <Text style={styles.phonemeText}>{fish.char}</Text>
                </View>

                {/* Fish Tail Fin */}
                <View style={[styles.fishTail, { borderLeftColor: fish.color }]} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Hint bar at bottom */}
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>
            💡 Atinge peștișorii care au litera <Text style={{ color: '#FFEAA7', fontWeight: '900' }}>{currentRound.target}</Text> pentru a-i prinde în găletușă!
          </Text>
        </View>
      </View>

      {/* 4. WIN MODAL / ROUND COMPLETE */}
      {isRoundWon && (
        <View style={styles.winOverlay}>
          <View style={styles.winCard}>
            <Text style={styles.winTrophy}>🏆</Text>
            <Text style={styles.winTitle}>Bravo! Pescuit Excelent!</Text>
            <Text style={styles.winSubtitle}>
              Ai prins toți peștișorii cu litera <Text style={{ color: '#2ED573', fontWeight: '900' }}>{currentRound.target}</Text>!
            </Text>

            <TouchableOpacity style={styles.winBtn} onPress={handleNextRound}>
              <Text style={styles.winBtnText}>
                {roundIdx < FISHING_ROUNDS.length - 1 ? 'Următorul Peștișor ➔' : 'Revendică Comoara! 🎁'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#81ECEC',
    fontFamily: 'Fredoka, sans-serif',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 44 : 12,
    paddingBottom: 12,
    backgroundColor: '#0984E3',
    borderBottomWidth: 3,
    borderBottomColor: '#74B9FF',
    zIndex: 100,
  },
  backBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  targetLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    marginRight: 8,
  },
  targetBubble: {
    backgroundColor: '#FF7675',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  targetLetter: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  replaySoundBtn: {
    padding: 4,
  },
  replaySoundIcon: {
    fontSize: 20,
  },
  bucketPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEAA7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FDCB6E',
  },
  bucketEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  bucketCount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D63031',
  },
  skyArea: {
    height: 110,
    backgroundColor: '#74B9FF',
    position: 'relative',
    overflow: 'hidden',
  },
  cloud1: {
    position: 'absolute',
    top: 15,
    left: '20%',
    opacity: 0.8,
  },
  cloud2: {
    position: 'absolute',
    top: 30,
    right: '25%',
    opacity: 0.7,
  },
  dockWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dockPlanks: {
    width: 140,
    height: 22,
    backgroundColor: '#B53471',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 2,
    borderColor: '#833471',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  plank: {
    width: 35,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#6F1E51',
  },
  mascotHolder: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  mascotEmoji: {
    fontSize: 48,
  },
  bucketContainer: {
    position: 'absolute',
    bottom: 20,
    left: 80,
  },
  bucketFishBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#2ED573',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  fishingRod: {
    position: 'absolute',
    bottom: 35,
    left: 55,
    width: 120,
    height: 6,
    transformOrigin: 'bottom left',
  },
  rodPole: {
    width: 120,
    height: 6,
    backgroundColor: '#E67E22',
    borderRadius: 3,
    transform: [{ rotate: '-35deg' }],
  },
  waterArea: {
    flex: 1,
    backgroundColor: '#00CEC9',
    position: 'relative',
    overflow: 'hidden',
  },
  waterSurfaceLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  ambientBubble: {
    position: 'absolute',
  },
  hookAssembly: {
    position: 'absolute',
    left: width * 0.45,
    top: -20,
    alignItems: 'center',
    zIndex: 50,
  },
  fishingLine: {
    width: 2,
    height: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  magneticHook: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hookEmoji: {
    fontSize: 28,
  },
  fishWrapper: {
    position: 'absolute',
    zIndex: 20,
  },
  fishBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  fishEye: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  fishPupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
  },
  phonemeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  phonemeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2D3436',
  },
  fishTail: {
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
  hintBar: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(9, 132, 227, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  winOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  winCard: {
    backgroundColor: '#FFFFFF',
    width: Math.min(width * 0.85, 460),
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  winTrophy: {
    fontSize: 64,
    marginBottom: 12,
  },
  winTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2D3436',
    marginBottom: 8,
  },
  winSubtitle: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  winBtn: {
    backgroundColor: '#00B894',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: '#00B894',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  winBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default PhonicsFishingGame;
