import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Easing,
  Platform,
} from 'react-native';
import Svg, { Circle, Rect, Path, G, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { triggerConfetti } from '../utils/confetti';
import { audioMixer } from '../audio';

// Animal characters definition
const ANIMAL_TYPES = [
  { id: 'panda', name: 'Panda', emoji: '🐼', color: '#2C3E50', earColor: '#1A252F', innerEar: '#BDC3C7' },
  { id: 'koala', name: 'Koala', emoji: '🐨', color: '#95A5A6', earColor: '#7F8C8D', innerEar: '#FFB8B8' },
  { id: 'penguin', name: 'Pinguin', emoji: '🐧', color: '#34495E', bellyColor: '#FFFFFF', beakColor: '#F39C12' },
  { id: 'cat', name: 'Pisicuță', emoji: '🐱', color: '#F39C12', stripeColor: '#D35400', noseColor: '#FF7675' },
  { id: 'squirrel', name: 'Veveriță', emoji: '🐿️', color: '#E67E22', earColor: '#D35400', bellyColor: '#FAD7A0' },
  { id: 'bee', name: 'Albinuță', emoji: '🐝', color: '#F1C40F', stripeColor: '#2C3E50', wingColor: '#E8F8F5' },
  { id: 'lion', name: 'Leușor', emoji: '🦁', color: '#F39C12', maneColor: '#C0392B', noseColor: '#2C3E50' },
];

const BALL_COLORS = [
  { fill: '#3ACFFE', shadow: '#0984E3', shine: '#74B9FF' },
  { fill: '#52CC3E', shadow: '#27AE60', shine: '#A8E6CF' },
  { fill: '#FF8855', shadow: '#D35400', shine: '#FFA07A' },
  { fill: '#F47099', shadow: '#D81B60', shine: '#F8BBD0' },
  { fill: '#8969E2', shadow: '#6C5CE7', shine: '#D6A2E8' },
  { fill: '#FFD84C', shadow: '#F39C12', shine: '#FFF3B0' },
];

const ROUNDS_CONFIG = [
  { ballsCount: 3, choices: [2, 3, 4] },
  { ballsCount: 4, choices: [3, 4, 5] },
  { ballsCount: 5, choices: [4, 5, 6] },
];

export function CountAndSelectGame({ onBack, onComplete, audio = {} }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const currentRound = ROUNDS_CONFIG[currentRoundIdx];
  const [poppedCount, setPoppedCount] = useState(0);
  const [isAllPopped, setIsAllPopped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  // Balls state
  const [balls, setBalls] = useState([]);

  // Animated values for entrance and choice cards
  const choiceCardAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Sound helper
  const playSoundEffect = (soundSource) => {
    if (!soundSource) return;
    try {
      audioMixer.playSFX(soundSource, 1.0);
    } catch (e) {
      console.log('Audio playback notice:', e.message);
    }
  };

  // Initialize round
  useEffect(() => {
    const count = currentRound.ballsCount;
    setPoppedCount(0);
    setIsAllPopped(false);
    setSelectedAnswer(null);
    setIsAnswerCorrect(false);
    choiceCardAnim.setValue(0);

    // Shuffle animal avatars and ball colors
    const shuffledAnimals = [...ANIMAL_TYPES].sort(() => 0.5 - Math.random());
    const initialBalls = [];

    for (let i = 0; i < count; i++) {
      const ballColor = BALL_COLORS[i % BALL_COLORS.length];
      const animal = shuffledAnimals[i % shuffledAnimals.length];
      initialBalls.push({
        id: `ball_${i}`,
        index: i,
        color: ballColor,
        animal: animal,
        isPopped: false,
        slideAnim: new Animated.Value(i % 2 === 0 ? -120 : 120),
        popAnim: new Animated.Value(1),
        characterAnim: new Animated.Value(0),
      });
    }

    setBalls(initialBalls);

    // Run roll-in entrance animation with stagger
    const entranceAnims = initialBalls.map((b, i) =>
      Animated.timing(b.slideAnim, {
        toValue: 0,
        duration: 500 + i * 80,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      })
    );
    Animated.parallel(entranceAnims).start();

    // Voice prompt intro
    if (audio.countSelectIntro) {
      setTimeout(() => playSoundEffect(audio.countSelectIntro), 400);
    }
  }, [currentRoundIdx]);

  // Handle ball tap
  const handleBallTap = (index) => {
    const ball = balls[index];
    if (!ball || ball.isPopped) return;

    const newCount = poppedCount + 1;
    setPoppedCount(newCount);

    // Mark ball as popped in state
    setBalls((prev) =>
      prev.map((b, i) => (i === index ? { ...b, isPopped: true } : b))
    );

    // Play count voice: 1, 2, 3, 4, 5
    const countSounds = [
      audio.count1,
      audio.count2,
      audio.count3,
      audio.count4,
      audio.count5,
    ];
    const soundToPlay = countSounds[newCount - 1] || audio.sfxPop;
    playSoundEffect(soundToPlay);

    // Trigger micro confetti
    triggerConfetti({
      particleCount: 20,
      spread: 45,
      origin: { y: 0.5 },
    });

    // Pop animation: shrink slightly, burst, then reveal animal bouncing up
    Animated.sequence([
      Animated.timing(ball.popAnim, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(ball.popAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.spring(ball.characterAnim, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // If all balls are popped
    if (newCount === currentRound.ballsCount) {
      setIsAllPopped(true);
      setTimeout(() => {
        if (audio.countSelectIntro) {
          playSoundEffect(audio.countSelectIntro);
        }
        Animated.spring(choiceCardAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }, 600);
    }
  };

  // Handle number choice tap
  const handleChoiceTap = (choice) => {
    setSelectedAnswer(choice);
    if (choice === currentRound.ballsCount) {
      // Correct!
      setIsAnswerCorrect(true);
      setEarnedStars((s) => s + 1);
      playSoundEffect(audio.countSelectWin || audio.sfxChime);
      triggerConfetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        if (currentRoundIdx + 1 < ROUNDS_CONFIG.length) {
          setCurrentRoundIdx((idx) => idx + 1);
        } else {
          setShowVictoryModal(true);
          playSoundEffect(audio.sfxRoyal);
        }
      }, 1600);
    } else {
      // Wrong choice shake
      playSoundEffect(audio.sfxIncorrect);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -15, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 15, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  // Dynamic responsive sizing for mobile portrait and landscape
  const isCompactHeight = height < 520;
  const maxBall = isCompactHeight ? Math.min(Math.floor(height * 0.18), 75) : 105;
  const ballSize = Math.min(Math.floor((width - 40) / Math.max(currentRound.ballsCount, 3)), maxBall);

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER */}
      <View style={[styles.header, isCompactHeight && { paddingVertical: 6 }]}>
        <TouchableOpacity
          style={[styles.backButton, isCompactHeight && { paddingVertical: 4, paddingHorizontal: 10 }]}
          onPress={() => {
            playSoundEffect(audio.sfxButton);
            onBack();
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.backButtonText, isCompactHeight && { fontSize: 14 }]}>⬅ Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={[styles.titleText, isCompactHeight && { fontSize: 17 }]}>Numără și Alege</Text>
          <Text style={[styles.subtitleText, isCompactHeight && { fontSize: 11 }]}>
            Nivelul {currentRoundIdx + 1} din {ROUNDS_CONFIG.length}
          </Text>
        </View>

        <View style={[styles.starCounter, isCompactHeight && { paddingVertical: 4, paddingHorizontal: 8 }]}>
          <Text style={[styles.starCounterText, isCompactHeight && { fontSize: 13 }]}>⭐ {earnedStars}</Text>
        </View>
      </View>

      {/* 2. PLAY AREA (SCROLLABLE & COMPACT FOR MOBILE) */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.playfield,
          isCompactHeight && { paddingVertical: 6, paddingHorizontal: 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Instruction Banner */}
        <View style={[styles.banner, isCompactHeight && { paddingVertical: 4, paddingHorizontal: 14, marginBottom: 4 }]}>
          <Text style={[styles.bannerText, isCompactHeight && { fontSize: 14 }]}>
            {!isAllPopped
              ? `Atinge fiecare minge magică! (${poppedCount} / ${currentRound.ballsCount})`
              : `Câte animăluțe sunt în total?`}
          </Text>
        </View>

        {/* Balls / Animals row */}
        <View style={[styles.ballsRow, isCompactHeight && { marginVertical: 6 }, { flexWrap: isLandscape ? 'nowrap' : 'wrap' }]}>
          {balls.map((ball, idx) => {
            return (
              <Animated.View
                key={ball.id}
                style={[
                  styles.ballItemContainer,
                  {
                    width: ballSize + 12,
                    height: ballSize + 24,
                    transform: [{ translateX: ball.slideAnim }],
                  },
                ]}
              >
                {/* Unpopped Ball */}
                {!ball.isPopped && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleBallTap(idx)}
                    style={styles.ballTouchable}
                  >
                    <Animated.View
                      style={[
                        styles.ballSvgWrap,
                        {
                          transform: [{ scale: ball.popAnim }],
                        },
                      ]}
                    >
                      <Svg width={ballSize} height={ballSize} viewBox="0 0 100 100">
                        {/* Drop shadow */}
                        <Ellipse cx="50" cy="92" rx="38" ry="8" fill="rgba(0,0,0,0.18)" />
                        {/* Ball sphere */}
                        <Circle cx="50" cy="50" r="42" fill={ball.color.fill} />
                        {/* Inner shadow/depth */}
                        <Circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke={ball.color.shadow}
                          strokeWidth="5"
                          opacity="0.4"
                        />
                        {/* Top-left gloss shine highlight */}
                        <Ellipse
                          cx="36"
                          cy="32"
                          rx="14"
                          ry="8"
                          transform="rotate(-25 36 32)"
                          fill={ball.color.shine}
                          opacity="0.75"
                        />
                        <Circle cx="32" cy="28" r="3.5" fill="#FFFFFF" opacity="0.9" />
                      </Svg>
                    </Animated.View>
                  </TouchableOpacity>
                )}

                {/* Popped Animal Reveal */}
                {ball.isPopped && (
                  <Animated.View
                    style={[
                      styles.animalCard,
                      {
                        width: ballSize,
                        height: ballSize,
                        borderRadius: ballSize / 2,
                        transform: [{ scale: ball.characterAnim }],
                      },
                    ]}
                  >
                    {/* Shadow underneath */}
                    <View style={styles.animalShadow} />
                    <Text style={[styles.animalEmoji, { fontSize: ballSize * 0.52 }]}>
                      {ball.animal.emoji}
                    </Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{idx + 1}</Text>
                    </View>
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* 3. NUMBER CHOICES (Displayed once all balls are popped) */}
        {isAllPopped && (
          <Animated.View
            style={[
              styles.choiceContainer,
              {
                opacity: choiceCardAnim,
                transform: [
                  {
                    scale: choiceCardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            <Text style={styles.choicePrompt}>Alege numărul corect:</Text>
            <View style={styles.choiceRow}>
              {currentRound.choices.map((choice) => {
                const isSelected = selectedAnswer === choice;
                const isCorrect = isSelected && isAnswerCorrect;
                return (
                  <TouchableOpacity
                    key={`choice_${choice}`}
                    style={[
                      styles.choiceCard,
                      isSelected &&
                        (isCorrect ? styles.choiceCardCorrect : styles.choiceCardWrong),
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleChoiceTap(choice)}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        isSelected &&
                          (isCorrect ? styles.choiceTextCorrect : styles.choiceTextWrong),
                      ]}
                    >
                      {choice}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* 4. CELEBRATION / VICTORY MODAL */}
      {showVictoryModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTrophy}>🏆</Text>
            <Text style={styles.modalTitle}>Felicitări! Ai Reușit!</Text>
            <Text style={styles.modalSubtitle}>
              Ai numărat cu succes toate animăluțele vesele din LogicLike!
            </Text>
            <View style={styles.modalStarsRow}>
              <Text style={styles.modalStar}>⭐</Text>
              <Text style={styles.modalStar}>⭐</Text>
              <Text style={styles.modalStar}>⭐</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCtaBtn}
              onPress={() => {
                playSoundEffect(audio.sfxButton);
                setShowVictoryModal(false);
                if (onComplete) onComplete();
                else onBack();
              }}
            >
              <Text style={styles.modalCtaText}>Continuă Aventura! 🚀</Text>
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#EDF2F7',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  titleWrap: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2B6CB0',
  },
  subtitleText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
  },
  starCounter: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEFCBF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ECC94B',
  },
  starCounterText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#B7791F',
  },
  playfield: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  banner: {
    backgroundColor: '#EBF8FF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#90CDF4',
    marginBottom: 6,
  },
  bannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B6CB0',
    textAlign: 'center',
  },
  ballsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  ballItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  ballTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballSvgWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animalCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    position: 'relative',
  },
  animalShadow: {
    position: 'absolute',
    bottom: -6,
    width: '75%',
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
  },
  animalEmoji: {
    textAlign: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3182CE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  choiceContainer: {
    alignItems: 'center',
    marginTop: 6,
    width: '100%',
  },
  choicePrompt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  choiceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  choiceCard: {
    width: 68,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 3,
    borderColor: '#CBD5E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  choiceCardCorrect: {
    backgroundColor: '#C6F6D5',
    borderColor: '#38A169',
  },
  choiceCardWrong: {
    backgroundColor: '#FED7D7',
    borderColor: '#E53E3E',
  },
  choiceText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#2D3748',
  },
  choiceTextCorrect: {
    color: '#22543D',
  },
  choiceTextWrong: {
    color: '#742A2A',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    maxWidth: 380,
    width: '100%',
    elevation: 10,
    borderWidth: 4,
    borderColor: '#ECC94B',
  },
  modalTrophy: {
    fontSize: 64,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2B6CB0',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  modalStarsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalStar: {
    fontSize: 36,
    marginHorizontal: 6,
  },
  modalCtaBtn: {
    backgroundColor: '#38A169',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalCtaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});

export default CountAndSelectGame;
