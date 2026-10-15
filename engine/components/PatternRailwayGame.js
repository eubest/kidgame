import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Easing,
  PanResponder,
} from 'react-native';
import confetti from '../utils/confetti';
import { AndroidHaptics } from '../native/AndroidHaptics';
import { audioMixer } from '../audio/index.js';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 5 Progressive Curricular Patterns (AB, AAB, ABC, AABB, ABCD)
const RAILWAY_LEVELS = [
  {
    id: 'lvl_ab',
    name: 'Model Alternant AB',
    patternRule: 'AB',
    ruleDescription: 'Fructe aromate: Măr, Banană',
    sequence: [
      { id: 'w1', item: '🍎', name: 'Măr' },
      { id: 'w2', item: '🍌', name: 'Banană' },
      { id: 'w3', item: '🍎', name: 'Măr' },
      { id: 'w4', item: '🍌', name: 'Banană' },
      { id: 'w5', item: null, missing: true }, // target
      { id: 'w6', item: '🍌', name: 'Banană' },
    ],
    correctItem: { item: '🍎', name: 'Măr' },
    options: [
      { id: 'opt_1', item: '🍎', name: 'Măr' },
      { id: 'opt_2', item: '🍌', name: 'Banană' },
      { id: 'opt_3', item: '🍇', name: 'Strugure' },
    ],
  },
  {
    id: 'lvl_aab',
    name: 'Model Dublu AAB',
    patternRule: 'AAB',
    ruleDescription: 'Corpuri cerești: Două Stele și o Lună',
    sequence: [
      { id: 'w1', item: '⭐', name: 'Stea' },
      { id: 'w2', item: '⭐', name: 'Stea' },
      { id: 'w3', item: '🌙', name: 'Lună' },
      { id: 'w4', item: '⭐', name: 'Stea' },
      { id: 'w5', item: '⭐', name: 'Stea' },
      { id: 'w6', item: null, missing: true }, // target
    ],
    correctItem: { item: '🌙', name: 'Lună' },
    options: [
      { id: 'opt_1', item: '☀️', name: 'Soare' },
      { id: 'opt_2', item: '🌙', name: 'Lună' },
      { id: 'opt_3', item: '⭐', name: 'Stea' },
    ],
  },
  {
    id: 'lvl_abc',
    name: 'Model Triplu ABC',
    patternRule: 'ABC',
    ruleDescription: 'Vehicule rapide: Mașină, Avion, Rachetă',
    sequence: [
      { id: 'w1', item: '🚗', name: 'Mașină' },
      { id: 'w2', item: '✈️', name: 'Avion' },
      { id: 'w3', item: '🚀', name: 'Rachetă' },
      { id: 'w4', item: '🚗', name: 'Mașină' },
      { id: 'w5', item: '✈️', name: 'Avion' },
      { id: 'w6', item: null, missing: true }, // target
    ],
    correctItem: { item: '🚀', name: 'Rachetă' },
    options: [
      { id: 'opt_1', item: '🚀', name: 'Rachetă' },
      { id: 'opt_2', item: '🚁', name: 'Elicopter' },
      { id: 'opt_3', item: '🚗', name: 'Mașină' },
    ],
  },
  {
    id: 'lvl_aabb',
    name: 'Model Pereche AABB',
    patternRule: 'AABB',
    ruleDescription: 'Prieteni animăluțe: Cățeluși și Pisicuțe',
    sequence: [
      { id: 'w1', item: '🐶', name: 'Cățel' },
      { id: 'w2', item: '🐶', name: 'Cățel' },
      { id: 'w3', item: '🐱', name: 'Pisică' },
      { id: 'w4', item: '🐱', name: 'Pisică' },
      { id: 'w5', item: '🐶', name: 'Cățel' },
      { id: 'w6', item: '🐶', name: 'Cățel' },
      { id: 'w7', item: null, missing: true }, // target
      { id: 'w8', item: '🐱', name: 'Pisică' },
    ],
    correctItem: { item: '🐱', name: 'Pisică' },
    options: [
      { id: 'opt_1', item: '🐰', name: 'Iepuraș' },
      { id: 'opt_2', item: '🐶', name: 'Cățel' },
      { id: 'opt_3', item: '🐱', name: 'Pisică' },
    ],
  },
  {
    id: 'lvl_abcd',
    name: 'Model Complex ABCD',
    patternRule: 'ABCD',
    ruleDescription: 'Salată tropicală: Căpșună, Strugure, Portocală, Ananas',
    sequence: [
      { id: 'w1', item: '🍓', name: 'Căpșună' },
      { id: 'w2', item: '🍇', name: 'Strugure' },
      { id: 'w3', item: '🍊', name: 'Portocală' },
      { id: 'w4', item: '🍍', name: 'Ananas' },
      { id: 'w5', item: '🍓', name: 'Căpșună' },
      { id: 'w6', item: '🍇', name: 'Strugure' },
      { id: 'w7', item: '🍊', name: 'Portocală' },
      { id: 'w8', item: null, missing: true }, // target
    ],
    correctItem: { item: '🍍', name: 'Ananas' },
    options: [
      { id: 'opt_1', item: '🍉', name: 'Pepene' },
      { id: 'opt_2', item: '🍍', name: 'Ananas' },
      { id: 'opt_3', item: '🍊', name: 'Portocală' },
      { id: 'opt_4', item: '🍓', name: 'Căpșună' },
    ],
  },
];

export function PatternRailwayGame({ onBack, onComplete }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [placedItem, setPlacedItem] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentLevel = RAILWAY_LEVELS[levelIndex];

  // Train animation values
  const trainTranslateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const steamScale = useRef(new Animated.Value(0.4)).current;
  const steamOpacity = useRef(new Animated.Value(0.8)).current;
  const targetSlotPulse = useRef(new Animated.Value(1)).current;
  const placedScale = useRef(new Animated.Value(0)).current;
  const errorWobble = useRef(new Animated.Value(0)).current;

  // Steam animation loop
  useEffect(() => {
    const steamAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(steamScale, {
            toValue: 1.6,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(steamOpacity, {
            toValue: 0,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(steamScale, { toValue: 0.4, duration: 0, useNativeDriver: true }),
          Animated.timing(steamOpacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    steamAnimation.start();
    return () => steamAnimation.stop();
  }, []);

  // Target slot glow pulse
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(targetSlotPulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(targetSlotPulse, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Train entry animation on level start
  useEffect(() => {
    setPlacedItem(null);
    setIsSuccess(false);
    setShowCelebration(false);
    placedScale.setValue(0);
    trainTranslateX.setValue(-SCREEN_WIDTH);

    // Audio cue
    audioMixer.playVoice(require('../../assets/audio/train_intro.mp3'), { volume: 1.0 });

    // Smooth train arrival
    Animated.spring(trainTranslateX, {
      toValue: 0,
      tension: 30,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [levelIndex]);

  const handleSelectOption = (option) => {
    if (isSuccess) return;

    if (option.item === currentLevel.correctItem.item) {
      // SUCCESS!
      setIsSuccess(true);
      setPlacedItem(option.item);

      // Tactile Haptics & SFX
      AndroidHaptics.notificationSuccess();
      audioMixer.playSFX(require('../../assets/audio/SFX_royal.mp3'), 0.9);

      // Snap item into place
      Animated.spring(placedScale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }).start();

      // Confetti burst
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.4 },
      });

      // Voice praise
      audioMixer.playVoice(require('../../assets/audio/train_win.mp3'), { volume: 1.0 });

      // Train departs after delay
      setTimeout(() => {
        // Departure whistle & chug
        audioMixer.playSFX(require('../../assets/audio/train_departure.mp3'), 1.0);
        AndroidHaptics.impactHeavy();

        Animated.timing(trainTranslateX, {
          toValue: SCREEN_WIDTH + 200,
          duration: 1600,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          if (levelIndex < RAILWAY_LEVELS.length - 1) {
            setLevelIndex(levelIndex + 1);
          } else {
            setShowCelebration(true);
            AndroidHaptics.victoryFanfare();
          }
        });
      }, 1500);
    } else {
      // MISMATCH
      AndroidHaptics.notificationWarning();
      audioMixer.playSFX(require('../../assets/audio/SFX_squish.mp3'), 0.7);
      audioMixer.playVoice(require('../../assets/audio/train_almost.mp3'), { volume: 0.9 });

      // Wobble error
      Animated.sequence([
        Animated.timing(errorWobble, { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(errorWobble, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(errorWobble, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(errorWobble, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. HEADER (Android status bar safe) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            AndroidHaptics.impactLight();
            onBack();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>🚂 Trenulețul Modelelor</Text>
          <Text style={styles.headerSubtitle}>
            Nivelul {levelIndex + 1} / {RAILWAY_LEVELS.length} • {currentLevel.name}
          </Text>
        </View>

        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>⭐ {levelIndex * 2}</Text>
        </View>
      </View>

      {/* 2. PEDAGOGICAL CUE */}
      <View style={styles.instructionBanner}>
        <Text style={styles.instructionText}>
          Observă modelul și alege vagonul potrivit pentru a completa șirul!
        </Text>
      </View>

      {/* 3. SCENE: SKY, MOUNTAINS, AND TRAIN TRACKS */}
      <View style={styles.sceneContainer}>
        {/* Background Clouds */}
        <View style={styles.cloud1} />
        <View style={styles.cloud2} />

        {/* Train on Tracks */}
        <Animated.View
          style={[
            styles.trainTrackRow,
            {
              transform: [{ translateX: trainTranslateX }],
            },
          ]}
        >
          {/* Steam Locomotive */}
          <View style={styles.locomotive}>
            {/* Steam Puff Animation */}
            <Animated.View
              style={[
                styles.steamPuff,
                {
                  transform: [{ scale: steamScale }],
                  opacity: steamOpacity,
                },
              ]}
            >
              <Text style={styles.steamEmoji}>💨</Text>
            </Animated.View>

            {/* Smokestack */}
            <View style={styles.smokestack} />

            {/* Locomotive Cab */}
            <View style={styles.locoCab}>
              <Text style={styles.locoFace}>😊</Text>
            </View>

            {/* Locomotive Boiler & Light */}
            <View style={styles.locoBoiler}>
              <View style={styles.headlight} />
            </View>

            {/* Wheels */}
            <View style={styles.locoWheelsRow}>
              <View style={[styles.wheel, styles.bigWheel]} />
              <View style={[styles.wheel, styles.bigWheel]} />
            </View>
          </View>

          {/* Wagons Row */}
          {currentLevel.sequence.map((wagon, idx) => {
            const isTarget = wagon.missing;
            return (
              <View key={wagon.id || `w_${idx}`} style={styles.wagonContainer}>
                {/* Coupler link */}
                <View style={styles.coupler} />

                {/* Wagon Body */}
                <View
                  style={[
                    styles.wagonBody,
                    isTarget && styles.targetWagonBody,
                    isTarget && isSuccess && styles.targetWagonSuccess,
                  ]}
                >
                  {isTarget ? (
                    // Target Slot
                    placedItem ? (
                      <Animated.View
                        style={[
                          styles.placedItemWrap,
                          { transform: [{ scale: placedScale }] },
                        ]}
                      >
                        <Text style={styles.freightEmoji}>{placedItem}</Text>
                        <Text style={styles.freightCheck}>✓</Text>
                      </Animated.View>
                    ) : (
                      <Animated.View
                        style={[
                          styles.emptySlot,
                          { transform: [{ scale: targetSlotPulse }] },
                        ]}
                      >
                        <Text style={styles.questionMark}>?</Text>
                      </Animated.View>
                    )
                  ) : (
                    // Normal Freight Wagon
                    <View style={styles.freightWrap}>
                      <Text style={styles.freightEmoji}>{wagon.item}</Text>
                    </View>
                  )}
                </View>

                {/* Wagon Wheels */}
                <View style={styles.wagonWheelsRow}>
                  <View style={styles.wheel} />
                  <View style={styles.wheel} />
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* Rails & Sleepers */}
        <View style={styles.tracksContainer}>
          <View style={styles.railTop} />
          <View style={styles.sleepersRow}>
            {Array.from({ length: 24 }).map((_, i) => (
              <View key={i} style={styles.sleeperTie} />
            ))}
          </View>
          <View style={styles.railBottom} />
        </View>
      </View>

      {/* 4. CARGO LOADING DOCK / OPTIONS SELECTION */}
      <View style={styles.stationDock}>
        <Text style={styles.dockTitle}>📦 Depozitul de Marfă: Alege Piesa Lipsă</Text>

        <Animated.View
          style={[
            styles.optionsRow,
            { transform: [{ translateX: errorWobble }] },
          ]}
        >
          {currentLevel.options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optionCard,
                isSuccess && opt.item === currentLevel.correctItem.item && styles.optionCardCorrect,
              ]}
              onPress={() => handleSelectOption(opt)}
              activeOpacity={0.8}
              disabled={isSuccess}
            >
              <Text style={styles.optionEmoji}>{opt.item}</Text>
              <Text style={styles.optionName}>{opt.name}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

      {/* 5. VICTORY MODAL */}
      {showCelebration && (
        <View style={styles.modalOverlay}>
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉🚂🌟</Text>
            <Text style={styles.celebrationTitle}>Toate Trenulețele Au Plecat!</Text>
            <Text style={styles.celebrationDesc}>
              Ai completat cu succes toate modelele logice și trenul a ajuns la destinație!
            </Text>

            <TouchableOpacity
              style={styles.finishBtn}
              onPress={() => {
                AndroidHaptics.impactMedium();
                onComplete();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.finishBtnText}>Deschide Cutia cu Premii 🎁</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 44 : 14,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#BAE6FD',
    zIndex: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  titleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0369A1',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    marginTop: 2,
  },
  scorePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B45309',
  },
  instructionBanner: {
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  // SCENE
  sceneContainer: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#BAE6FD',
  },
  cloud1: {
    position: 'absolute',
    top: 20,
    left: 40,
    width: 90,
    height: 35,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    opacity: 0.85,
  },
  cloud2: {
    position: 'absolute',
    top: 45,
    right: 50,
    width: 120,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    opacity: 0.85,
  },

  // TRAIN
  trainTrackRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 4,
    zIndex: 5,
  },
  locomotive: {
    width: 100,
    height: 90,
    position: 'relative',
    alignItems: 'center',
  },
  steamPuff: {
    position: 'absolute',
    top: -24,
    left: 15,
  },
  steamEmoji: {
    fontSize: 26,
  },
  smokestack: {
    width: 16,
    height: 20,
    backgroundColor: '#334155',
    position: 'absolute',
    top: 6,
    left: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  locoCab: {
    position: 'absolute',
    right: 6,
    bottom: 22,
    width: 44,
    height: 54,
    backgroundColor: '#EF4444',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 2,
    borderColor: '#991B1B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locoFace: {
    fontSize: 22,
  },
  locoBoiler: {
    position: 'absolute',
    left: 12,
    bottom: 22,
    width: 50,
    height: 38,
    backgroundColor: '#F97316',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 6,
    borderWidth: 2,
    borderColor: '#C2410C',
    justifyContent: 'center',
  },
  headlight: {
    width: 8,
    height: 12,
    backgroundColor: '#FDE047',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    marginLeft: -4,
  },
  locoWheelsRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 90,
  },
  wheel: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  bigWheel: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  // WAGONS
  wagonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  coupler: {
    width: 8,
    height: 6,
    backgroundColor: '#475569',
    marginBottom: 20,
  },
  wagonBody: {
    width: 68,
    height: 62,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  targetWagonBody: {
    backgroundColor: '#FEF08A',
    borderColor: '#EAB308',
    borderStyle: 'dashed',
    borderWidth: 3,
  },
  targetWagonSuccess: {
    backgroundColor: '#BBF7D0',
    borderColor: '#22C55E',
    borderStyle: 'solid',
  },
  freightWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  freightEmoji: {
    fontSize: 32,
  },
  emptySlot: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FEF9C3',
    borderWidth: 2,
    borderColor: '#CA8A04',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    fontSize: 26,
    fontWeight: '900',
    color: '#A16207',
  },
  placedItemWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  freightCheck: {
    position: 'absolute',
    top: -6,
    right: -10,
    fontSize: 16,
    fontWeight: '900',
    color: '#16A34A',
  },
  wagonWheelsRow: {
    position: 'absolute',
    bottom: -10,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // TRACKS
  tracksContainer: {
    height: 28,
    backgroundColor: '#78716C',
    position: 'relative',
    justifyContent: 'center',
  },
  railTop: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#D6D3D1',
  },
  railBottom: {
    position: 'absolute',
    bottom: 3,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#D6D3D1',
  },
  sleepersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  sleeperTie: {
    width: 6,
    height: 18,
    backgroundColor: '#44403C',
    borderRadius: 1,
  },

  // STATION DOCK
  stationDock: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
    paddingHorizontal: 16,
    borderTopWidth: 4,
    borderTopColor: '#38BDF8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dockTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  optionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 78,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  optionCardCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  optionEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  optionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  // CELEBRATION MODAL
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  celebrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '90%',
    maxWidth: 380,
    borderWidth: 4,
    borderColor: '#38BDF8',
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0369A1',
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  finishBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
