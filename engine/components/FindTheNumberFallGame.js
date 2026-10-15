import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  useWindowDimensions,
  Easing,
} from 'react-native';
import Svg, { Circle, Rect, Path, G, Ellipse } from 'react-native-svg';
import { triggerConfetti } from '../utils/confetti';
import { audioMixer } from '../audio';
import { AndroidHaptics } from '../native/AndroidHaptics';

const FRUIT_TYPES = [
  { type: 'apple', emoji: '🍎', color: '#E74C3C', bg: '#FDEDEC' },
  { type: 'acorn', emoji: '🌰', color: '#D35400', bg: '#FDF2E9' },
  { type: 'strawberry', emoji: '🍓', color: '#C0392B', bg: '#FADBD8' },
  { type: 'orange', emoji: '🍊', color: '#E67E22', bg: '#FBEEE6' },
  { type: 'plum', emoji: '🫐', color: '#8E44AD', bg: '#F4ECF7' },
];

const LEVELS = [
  { targetNumber: 3, goalCount: 4, poolNumbers: [1, 2, 3, 4, 3, 5, 3, 2, 3] },
  { targetNumber: 4, goalCount: 4, poolNumbers: [2, 4, 1, 4, 3, 5, 4, 6, 4] },
  { targetNumber: 5, goalCount: 5, poolNumbers: [3, 5, 2, 5, 4, 5, 1, 5, 5] },
];

export function FindTheNumberFallGame({ onBack, onComplete, audio = {} }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel = LEVELS[levelIdx];
  const [collectedCount, setCollectedCount] = useState(0);
  const [items, setItems] = useState([]);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  // Mascot animation refs
  const mascotChompAnim = useRef(new Animated.Value(1)).current;
  const mascotBounceAnim = useRef(new Animated.Value(0)).current;

  // Sound ref
  const playSoundEffect = (soundSource) => {
    if (!soundSource) return;
    try {
      audioMixer.playSFX(soundSource, 1.0);
    } catch (e) {
      console.log('Audio playback notice:', e.message);
    }
  };

  // Run mascot eating chomp animation
  const triggerMascotEat = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(mascotBounceAnim, { toValue: -18, duration: 150, useNativeDriver: true }),
        Animated.spring(mascotBounceAnim, { toValue: 0, friction: 3, tension: 40, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(mascotChompAnim, { toValue: 1.25, duration: 120, useNativeDriver: true }),
        Animated.timing(mascotChompAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(mascotChompAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]),
    ]).start();
  };

  // Initialize level items
  useEffect(() => {
    setCollectedCount(0);
    const pool = [...currentLevel.poolNumbers];
    const initialItems = pool.map((num, i) => {
      const fruit = FRUIT_TYPES[i % FRUIT_TYPES.length];
      return {
        id: `fruit_${i}_${Date.now()}`,
        number: num,
        fruit: fruit,
        isActive: true,
        isCollected: false,
        shakeAnim: new Animated.Value(0),
        scaleAnim: new Animated.Value(0),
        flyAnim: new Animated.ValueXY({ x: 0, y: 0 }),
      };
    });

    setItems(initialItems);

    // Stagger spawn animation
    initialItems.forEach((item, i) => {
      Animated.spring(item.scaleAnim, {
        toValue: 1,
        delay: i * 70,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }).start();
    });

    // Voice intro
    if (audio.findNumberIntro) {
      setTimeout(() => playSoundEffect(audio.findNumberIntro), 400);
    }
  }, [levelIdx]);

  // Handle item tap
  const handleItemTap = (index) => {
    const item = items[index];
    if (!item || !item.isActive || item.isCollected) return;

    if (item.number === currentLevel.targetNumber) {
      // Correct!
      AndroidHaptics.tap();
      const newCount = collectedCount + 1;
      setCollectedCount(newCount);

      // Disable item
      setItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, isCollected: true, isActive: false } : it))
      );

      triggerMascotEat();
      playSoundEffect(audio.sfxChime || audio.sfxCorrect);
      triggerConfetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.5 },
      });

      // Fly to mascot animation
      Animated.parallel([
        Animated.timing(item.scaleAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(item.flyAnim.y, {
          toValue: 180,
          duration: 350,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      // Check level complete
      if (newCount >= currentLevel.goalCount) {
        AndroidHaptics.victoryFanfare();
        setEarnedStars((s) => s + 1);
        setTimeout(() => {
          playSoundEffect(audio.findNumberWin || audio.sfxRoyal);
          triggerConfetti({ particleCount: 60, spread: 90, origin: { y: 0.5 } });

          if (levelIdx + 1 < LEVELS.length) {
            setTimeout(() => setLevelIdx((l) => l + 1), 1500);
          } else {
            setShowVictoryModal(true);
          }
        }, 600);
      }
    } else {
      // Incorrect item: wobble shake and warning voice
      AndroidHaptics.warning();
      playSoundEffect(audio.findNumberWrong || audio.sfxIncorrect);
      Animated.sequence([
        Animated.timing(item.shakeAnim, { toValue: -14, duration: 60, useNativeDriver: true }),
        Animated.timing(item.shakeAnim, { toValue: 14, duration: 60, useNativeDriver: true }),
        Animated.timing(item.shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(item.shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(item.shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const isCompactHeight = height < 520;
  const maxItem = isCompactHeight ? Math.min(Math.floor(height * 0.16), 62) : 95;
  const itemWidth = Math.min(Math.floor((width - 50) / (isLandscape ? 5 : 3)), maxItem);

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
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
          <Text style={[styles.titleText, isCompactHeight && { fontSize: 17 }]}>Mâncăciosul de Numere</Text>
          <Text style={[styles.subtitleText, isCompactHeight && { fontSize: 11 }]}>
            Nivelul {levelIdx + 1} din {LEVELS.length}
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
          isCompactHeight && { paddingVertical: 4, paddingHorizontal: 10 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress & Target Banner */}
        <View style={[styles.targetBanner, isCompactHeight && { paddingVertical: 4, paddingHorizontal: 12 }]}>
          <Text style={[styles.targetBannerLabel, isCompactHeight && { fontSize: 13 }]}>Caută toate fructele cu numărul:</Text>
          <View style={[styles.targetNumberBadge, isCompactHeight && { width: 30, height: 30, borderRadius: 15 }]}>
            <Text style={[styles.targetNumberText, isCompactHeight && { fontSize: 17 }]}>{currentLevel.targetNumber}</Text>
          </View>
          <Text style={[styles.targetProgressText, isCompactHeight && { fontSize: 13 }]}>
            Adunate: {collectedCount} / {currentLevel.goalCount}
          </Text>
        </View>

        {/* Fruit Grid */}
        <View style={[styles.gridContainer, { maxWidth: isLandscape ? 600 : 360 }]}>
          {items.map((item, idx) => {
            if (item.isCollected) {
              return (
                <View
                  key={item.id}
                  style={[styles.itemPlaceholder, { width: itemWidth, height: itemWidth + 10 }]}
                />
              );
            }

            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.itemWrapper,
                  {
                    width: itemWidth,
                    height: itemWidth + 10,
                    transform: [
                      { scale: item.scaleAnim },
                      { translateX: item.shakeAnim },
                      { translateY: item.flyAnim.y },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.fruitCard, { borderColor: item.fruit.color }]}
                  activeOpacity={0.8}
                  onPress={() => handleItemTap(idx)}
                >
                  <Text style={[styles.fruitEmoji, { fontSize: itemWidth * 0.42 }]}>
                    {item.fruit.emoji}
                  </Text>
                  <View style={[styles.numberPill, { backgroundColor: item.fruit.color }]}>
                    <Text style={styles.numberText}>{item.number}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* 3. MASCOT CORNER (Ollo with mouth chomp) */}
        <Animated.View
          style={[
            styles.mascotContainer,
            {
              transform: [
                { translateY: mascotBounceAnim },
                { scale: mascotChompAnim },
              ],
            },
          ]}
        >
          {/* Thought bubble */}
          <View style={styles.thoughtBubble}>
            <Text style={styles.thoughtText}>
              Dă-mi mere cu <Text style={styles.thoughtTarget}>{currentLevel.targetNumber}</Text>! 😋
            </Text>
          </View>

          {/* Ollo Avatar SVG */}
          <Svg width="110" height="90" viewBox="0 0 120 100">
            {/* Soft shadow */}
            <Ellipse cx="60" cy="94" rx="46" ry="6" fill="rgba(0,0,0,0.15)" />
            {/* Body */}
            <Ellipse cx="60" cy="55" rx="45" ry="38" fill="#3B7A57" />
            {/* Tummy */}
            <Ellipse cx="60" cy="62" rx="30" ry="24" fill="#A8D5BA" />
            {/* Ears */}
            <Circle cx="28" cy="24" r="14" fill="#2E6245" />
            <Circle cx="28" cy="24" r="8" fill="#F8BBD0" />
            <Circle cx="92" cy="24" r="14" fill="#2E6245" />
            <Circle cx="92" cy="24" r="8" fill="#F8BBD0" />
            {/* Eyes */}
            <Circle cx="44" cy="46" r="7" fill="#1C3829" />
            <Circle cx="42" cy="44" r="2.5" fill="#FFFFFF" />
            <Circle cx="76" cy="46" r="7" fill="#1C3829" />
            <Circle cx="74" cy="44" r="2.5" fill="#FFFFFF" />
            {/* Cheeks */}
            <Circle cx="32" cy="56" r="6" fill="#F48FB1" opacity="0.6" />
            <Circle cx="88" cy="56" r="6" fill="#F48FB1" opacity="0.6" />
            {/* Mouth / Smile */}
            <Path
              d="M 50 62 Q 60 74 70 62"
              fill="#FFFFFF"
              stroke="#1C3829"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
      </ScrollView>

      {/* 4. VICTORY MODAL */}
      {showVictoryModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTrophy}>🌟</Text>
            <Text style={styles.modalTitle}>Incredibil de Bun!</Text>
            <Text style={styles.modalSubtitle}>
              L-ai hrănit pe Ollo cu toate numerele delicioase cerute!
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
              <Text style={styles.modalCtaText}>Prinde Recompensa! 🎁</Text>
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
    backgroundColor: '#FEF9E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#FAD7A0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FDF2E9',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D35400',
  },
  titleWrap: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D35400',
  },
  subtitleText: {
    fontSize: 13,
    color: '#873600',
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  targetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#F39C12',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  targetBannerLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7E5109',
    marginRight: 8,
  },
  targetNumberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E67E22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    elevation: 3,
  },
  targetNumberText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  targetProgressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  itemWrapper: {
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPlaceholder: {
    margin: 6,
  },
  fruitCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderWidth: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  fruitEmoji: {
    textAlign: 'center',
  },
  numberPill: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  thoughtBubble: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#A8D5BA',
    marginBottom: 4,
    elevation: 2,
  },
  thoughtText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E6245',
  },
  thoughtTarget: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E67E22',
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
    borderColor: '#F39C12',
  },
  modalTrophy: {
    fontSize: 64,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D35400',
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
    backgroundColor: '#E67E22',
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

export default FindTheNumberFallGame;
