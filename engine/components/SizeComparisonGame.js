import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
  Platform,
  ScrollView,
} from 'react-native';
import confetti from '../utils/confetti';
import { audioMixer } from '../audio/index.js';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LEVELS = [
  {
    id: 1,
    title: 'Nivelul 1: Ursulețul Uriaș',
    prompt: 'Care este cel mai MARE ursuleț?',
    type: 'largest',
    reason: 'Bravo! Acest ursuleț este cel mai mare și mai voinic dintre toți!',
    items: [
      { id: 'u1', emoji: '🐻', label: 'Ursuleț Mic', scale: 0.65, isTarget: false },
      { id: 'u2', emoji: '🐻', label: 'Ursuleț Mare', scale: 1.35, isTarget: true },
      { id: 'u3', emoji: '🐻', label: 'Ursuleț Mijlociu', scale: 0.95, isTarget: false },
    ],
  },
  {
    id: 2,
    title: 'Nivelul 2: Mărul Mituțel',
    prompt: 'Alege mărul cel mai MIC!',
    type: 'smallest',
    reason: 'Minunat! Ai observat că acest măr este cel mai mititel!',
    items: [
      { id: 'm1', emoji: '🍎', label: 'Măr Mare', scale: 1.35, isTarget: false },
      { id: 'm2', emoji: '🍎', label: 'Măr Mijlociu', scale: 0.95, isTarget: false },
      { id: 'm3', emoji: '🍎', label: 'Măr Mic', scale: 0.6, isTarget: true },
    ],
  },
  {
    id: 3,
    title: 'Nivelul 3: Peștișorul din Acvariu',
    prompt: 'Care este cel mai MARE peștișor?',
    type: 'largest',
    reason: 'Superb! Acest peștișor auriu este uriașul adâncurilor!',
    items: [
      { id: 'p1', emoji: '🐠', label: 'Peștișor Mare', scale: 1.35, isTarget: true },
      { id: 'p2', emoji: '🐠', label: 'Peștișor Mic', scale: 0.65, isTarget: false },
      { id: 'p3', emoji: '🐠', label: 'Peștișor Mijlociu', scale: 0.95, isTarget: false },
    ],
  },
  {
    id: 4,
    title: 'Nivelul 4: Floricica Gingașă',
    prompt: 'Găsește floarea cea mai MICĂ!',
    type: 'smallest',
    reason: 'Excelent! Această floricică este cea mai gingașă și micuță!',
    items: [
      { id: 'f1', emoji: '🌸', label: 'Floare Mijlocie', scale: 0.95, isTarget: false },
      { id: 'f2', emoji: '🌸', label: 'Floare Mică', scale: 0.6, isTarget: true },
      { id: 'f3', emoji: '🌸', label: 'Floare Mare', scale: 1.35, isTarget: false },
    ],
  },
  {
    id: 5,
    title: 'Nivelul 5: Racheta Spațială',
    prompt: 'Care este racheta cea mai ÎNALTĂ și mare?',
    type: 'largest',
    reason: 'Extraordinar! Această rachetă uriașă va ajunge prima pe Lună!',
    items: [
      { id: 'r1', emoji: '🚀', label: 'Rachetă Mică', scale: 0.65, isTarget: false },
      { id: 'r2', emoji: '🚀', label: 'Rachetă Mijlocie', scale: 0.95, isTarget: false },
      { id: 'r3', emoji: '🚀', label: 'Rachetă Mare', scale: 1.35, isTarget: true },
    ],
  },
  {
    id: 6,
    title: 'Nivelul 6: Steaua Mijlocie (Gândire Avansată)',
    prompt: 'Alege steaua de mărime MIJLOCIE (nici prea mare, nici prea mică)!',
    type: 'medium',
    reason: 'Genial! Steaua mijlocie este exact între cea mare și cea mică!',
    items: [
      { id: 's1', emoji: '⭐', label: 'Stea Mare', scale: 1.35, isTarget: false },
      { id: 's2', emoji: '⭐', label: 'Stea Mijlocie', scale: 0.95, isTarget: true },
      { id: 's3', emoji: '⭐', label: 'Stea Mică', scale: 0.6, isTarget: false },
    ],
  },
];

export const SizeComparisonGame = ({ audio, onBack, onComplete }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = LEVELS[levelIndex];

  const [selectedId, setSelectedId] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [scoreStars, setScoreStars] = useState(0);

  // Animations
  const itemScales = useRef(
    LEVELS[0].items.reduce((acc, it) => {
      acc[it.id] = new Animated.Value(1);
      return acc;
    }, {})
  ).current;

  const itemWobbles = useRef(
    LEVELS[0].items.reduce((acc, it) => {
      acc[it.id] = new Animated.Value(0);
      return acc;
    }, {})
  ).current;

  const bannerScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    try {
      if (audio?.ws_size_intro) {
        audioMixer.playVoice(audio.ws_size_intro);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    setSelectedId(null);
    setIsSolved(false);
    bannerScale.setValue(0);

    currentLevel.items.forEach((it) => {
      if (!itemScales[it.id]) itemScales[it.id] = new Animated.Value(1);
      if (!itemWobbles[it.id]) itemWobbles[it.id] = new Animated.Value(0);
      itemScales[it.id].setValue(1);
      itemWobbles[it.id].setValue(0);
    });
  }, [levelIndex]);

  const handleSelectItem = (item) => {
    if (isSolved) return;

    if (Platform.OS === 'android') {
      Vibration.vibrate(30);
    }

    if (item.isTarget) {
      // CORRECT
      setIsSolved(true);
      setSelectedId(item.id);
      setScoreStars((s) => s + 1);

      try {
        if (audio?.sfxChime) audioMixer.playSFX(audio.sfxChime);
        setTimeout(() => {
          if (audio?.ws_size_win) {
            audioMixer.playVoice(audio.ws_size_win);
          } else if (audio?.kodiAwesome) {
            audioMixer.playVoice(audio.kodiAwesome);
          }
        }, 300);
      } catch (e) {}

      // Spring bounce
      Animated.sequence([
        Animated.spring(itemScales[item.id], {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(itemScales[item.id], {
          toValue: 1.1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.spring(bannerScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();

      confetti({ particleCount: 85, spread: 75, origin: { y: 0.6 } });
    } else {
      // INCORRECT
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 40, 30, 40]);
      }

      try {
        if (audio?.sfxIncorrect) audioMixer.playSFX(audio.sfxIncorrect);
        if (audio?.ws_try_again) audioMixer.playVoice(audio.ws_try_again);
      } catch (e) {}

      const wobble = itemWobbles[item.id] || new Animated.Value(0);
      Animated.sequence([
        Animated.timing(wobble, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNextLevel = () => {
    try {
      if (audio?.sfxButton) audioMixer.playSFX(audio.sfxButton);
    } catch (e) {}

    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else {
      confetti({ particleCount: 150, spread: 90 });
      try {
        if (audio?.sfxRoyal) audioMixer.playSFX(audio.sfxRoyal);
      } catch (e) {}
      if (onComplete) onComplete();
    }
  };

  const repeatPrompt = () => {
    try {
      if (audio?.ws_size_intro) audioMixer.playVoice(audio.ws_size_intro);
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>◀ Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Mărimi & Comparații</Text>
          <Text style={styles.headerSubtitle}>
            Nivelul {levelIndex + 1} din {LEVELS.length}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.speakerBtn} onPress={repeatPrompt} activeOpacity={0.8}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
          <View style={styles.starsPill}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.starText}>{scoreStars}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PROMPT BANNER */}
        <View style={styles.promptCard}>
          <Text style={styles.promptIcon}>📏</Text>
          <View style={styles.promptTextWrap}>
            <Text style={styles.promptTitle}>{currentLevel.prompt}</Text>
            <Text style={styles.promptSub}>
              Compară dimensiunile și atinge elementul cerut!
            </Text>
          </View>
        </View>

        {/* 3 COMPARISON CARDS */}
        <View style={styles.cardsRow}>
          {currentLevel.items.map((item) => {
            const isSelected = selectedId === item.id;
            const wobble = itemWobbles[item.id] || 0;
            const baseScale = itemScales[item.id] || 1;

            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.cardWrapper,
                  {
                    transform: [{ scale: baseScale }, { translateX: wobble }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.card,
                    isSelected && styles.cardWinning,
                    isSolved && !item.isTarget && styles.cardDimmed,
                  ]}
                  onPress={() => handleSelectItem(item)}
                  activeOpacity={0.85}
                >
                  <View style={styles.emojiContainer}>
                    <Text
                      style={[
                        styles.emoji,
                        { transform: [{ scale: item.scale }] },
                      ]}
                    >
                      {item.emoji}
                    </Text>
                  </View>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelWinning]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.winnerBadge}>
                      <Text style={styles.winnerBadgeText}>✓ CORECT</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* WIN EXPLANATION BANNER */}
        {isSolved && (
          <Animated.View style={[styles.winBanner, { transform: [{ scale: bannerScale }] }]}>
            <View style={styles.winHeader}>
              <Text style={styles.winEmoji}>🏆</Text>
              <Text style={styles.winTitle}>Bravo, Micul Explorator!</Text>
            </View>
            <Text style={styles.winReasonText}>{currentLevel.reason}</Text>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNextLevel} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>
                {levelIndex < LEVELS.length - 1 ? 'Următoarea Comparație ▶' : 'Misiune Încheiată! 🌟'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#EDF2F7',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speakerBtn: {
    padding: 8,
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
  },
  speakerIcon: {
    fontSize: 18,
  },
  starsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCBF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ECC94B',
  },
  starIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  starText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#744210',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
    flexGrow: 1,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    width: '100%',
    maxWidth: 480,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  promptIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  promptTextWrap: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
  },
  promptSub: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    maxWidth: 480,
    gap: 12,
    marginBottom: 28,
    minHeight: 180,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: 135,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    minHeight: 160,
  },
  cardWinning: {
    borderColor: '#48BB78',
    backgroundColor: '#F0FFF4',
    borderWidth: 3,
    shadowColor: '#48BB78',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardDimmed: {
    opacity: 0.45,
  },
  emojiContainer: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 52,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 6,
  },
  cardLabelWinning: {
    color: '#22543D',
    fontWeight: '800',
  },
  winnerBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#48BB78',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  winnerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  winBanner: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#48BB78',
    shadowColor: '#48BB78',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  winHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  winEmoji: {
    fontSize: 22,
    marginRight: 6,
  },
  winTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#22543D',
  },
  winReasonText: {
    fontSize: 14,
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '600',
  },
  nextBtn: {
    backgroundColor: '#38A169',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#38A169',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
