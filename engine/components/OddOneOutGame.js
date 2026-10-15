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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LEVELS = [
  {
    id: 1,
    title: 'Nivelul 1: Fructe și Prieteni',
    question: 'Care element este diferit de celelalte?',
    reason: 'Cățelușul este un animal, iar celelalte 3 sunt fructe delicioase!',
    cards: [
      { id: 'c1', emoji: '🍎', label: 'Măr', category: 'fruct' },
      { id: 'c2', emoji: '🍌', label: 'Banană', category: 'fruct' },
      { id: 'c3', emoji: '🐶', label: 'Cățeluș', category: 'animal', isOdd: true },
      { id: 'c4', emoji: '🍇', label: 'Strugure', category: 'fruct' },
    ],
  },
  {
    id: 2,
    title: 'Nivelul 2: Vehicule Iuți',
    question: 'Găsește intrusul! Care nu se potrivește?',
    reason: 'Pizza este o gustare delicioasă, iar celelalte sunt vehicule de călătorit!',
    cards: [
      { id: 'c1', emoji: '🚗', label: 'Mașină', category: 'vehicul' },
      { id: 'c2', emoji: '🍕', label: 'Pizza', category: 'mancare', isOdd: true },
      { id: 'c3', emoji: '✈️', label: 'Avion', category: 'vehicul' },
      { id: 'c4', emoji: '🚀', label: 'Rachetă', category: 'vehicul' },
    ],
  },
  {
    id: 3,
    title: 'Nivelul 3: Culoarea Roșie',
    question: 'Care element are o culoare diferită?',
    reason: 'Rombul este albastru, iar toate celelalte sunt de culoare roșie!',
    cards: [
      { id: 'c1', emoji: '🍓', label: 'Căpșună', category: 'rosu' },
      { id: 'c2', emoji: '🚒', label: 'Pompieri', category: 'rosu' },
      { id: 'c3', emoji: '🔷', label: 'Romb Albastru', category: 'albastru', isOdd: true },
      { id: 'c4', emoji: '🎈', label: 'Balon Roșu', category: 'rosu' },
    ],
  },
  {
    id: 4,
    title: 'Nivelul 4: Lumea Animalelor',
    question: 'Care animăluț are doar două picioare și zboară?',
    reason: 'Rățușca este o pasăre cu două picioare, pe când leul, elefantul și girafa au 4 picioare!',
    cards: [
      { id: 'c1', emoji: '🦁', label: 'Leu', category: 'patru_picioare' },
      { id: 'c2', emoji: '🦆', label: 'Rățușcă', category: 'pasare', isOdd: true },
      { id: 'c3', emoji: '🐘', label: 'Elefant', category: 'patru_picioare' },
      { id: 'c4', emoji: '🦒', label: 'Girafă', category: 'patru_picioare' },
    ],
  },
  {
    id: 5,
    title: 'Nivelul 5: Natură Vie și Jucării',
    question: 'Care este un obiect creat de om?',
    reason: 'Mingea este o jucărie, iar floarea, copacul și fluturele sunt parte din natură!',
    cards: [
      { id: 'c1', emoji: '🌸', label: 'Floare', category: 'natura' },
      { id: 'c2', emoji: '🌳', label: 'Copac', category: 'natura' },
      { id: 'c3', emoji: '🦋', label: 'Fluture', category: 'natura' },
      { id: 'c4', emoji: '⚽', label: 'Minge', category: 'jucarie', isOdd: true },
    ],
  },
  {
    id: 6,
    title: 'Nivelul 6: Instrumente Muzicale',
    question: 'Care obiect nu scoate melodii?',
    reason: 'Creionul este pentru scris și desenat, iar celelalte sunt instrumente muzicale!',
    cards: [
      { id: 'c1', emoji: '🎸', label: 'Chitară', category: 'muzica' },
      { id: 'c2', emoji: '🎹', label: 'Pian', category: 'muzica' },
      { id: 'c3', emoji: '✏️', label: 'Creion', category: 'rechizita', isOdd: true },
      { id: 'c4', emoji: '🥁', label: 'Tobă', category: 'muzica' },
    ],
  },
];

export const OddOneOutGame = ({ audio, onBack, onComplete }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [selectedOddId, setSelectedOddId] = useState(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [scoreStars, setScoreStars] = useState(0);

  const currentLevel = LEVELS[levelIndex];

  // Animated values for cards (scale and wobble)
  const cardScales = useRef(
    LEVELS[0].cards.reduce((acc, c) => {
      acc[c.id] = new Animated.Value(1);
      return acc;
    }, {})
  ).current;

  const cardWobbles = useRef(
    LEVELS[0].cards.reduce((acc, c) => {
      acc[c.id] = new Animated.Value(0);
      return acc;
    }, {})
  ).current;

  const bannerScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Play intro sound on start
    try {
      if (audio?.ws_odd_intro) {
        audioMixer.playVoice(audio.ws_odd_intro);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    // Reset state on level advance
    setSolved(false);
    setSelectedOddId(null);
    setHintVisible(false);
    bannerScale.setValue(0);

    // Reset animations
    currentLevel.cards.forEach((c) => {
      if (!cardScales[c.id]) cardScales[c.id] = new Animated.Value(1);
      if (!cardWobbles[c.id]) cardWobbles[c.id] = new Animated.Value(0);
      cardScales[c.id].setValue(1);
      cardWobbles[c.id].setValue(0);
    });
  }, [levelIndex]);

  const handleCardTap = (card) => {
    if (solved) return;

    // Native haptic feedback
    if (Platform.OS === 'android') {
      Vibration.vibrate(30);
    }

    if (card.isOdd) {
      // CORRECT
      setSolved(true);
      setSelectedOddId(card.id);
      setScoreStars((s) => s + 1);

      // Play chime / win audio
      try {
        if (audio?.sfxChime) audioMixer.playSFX(audio.sfxChime);
        setTimeout(() => {
          if (audio?.ws_odd_win) {
            audioMixer.playVoice(audio.ws_odd_win);
          } else if (audio?.kodiAwesome) {
            audioMixer.playVoice(audio.kodiAwesome);
          }
        }, 300);
      } catch (e) {}

      // Native spring bounce on winning card
      Animated.sequence([
        Animated.spring(cardScales[card.id], {
          toValue: 1.18,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(cardScales[card.id], {
          toValue: 1.08,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();

      // Show win explanation banner
      Animated.spring(bannerScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } else {
      // INCORRECT: Gentle native wobble
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 40, 30, 40]);
      }

      try {
        if (audio?.sfxIncorrect) audioMixer.playSFX(audio.sfxIncorrect);
        if (audio?.ws_try_again) audioMixer.playVoice(audio.ws_try_again);
      } catch (e) {}

      setHintVisible(true);

      const wobbleAnim = cardWobbles[card.id] || new Animated.Value(0);
      Animated.sequence([
        Animated.timing(wobbleAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
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
      // Game completed!
      confetti({ particleCount: 150, spread: 90 });
      try {
        if (audio?.sfxRoyal) audioMixer.playSFX(audio.sfxRoyal);
      } catch (e) {}
      if (onComplete) onComplete();
    }
  };

  const repeatVoicePrompt = () => {
    try {
      if (audio?.ws_odd_intro) {
        audioMixer.playVoice(audio.ws_odd_intro);
      }
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      {/* HEADER NAV */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>◀ Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Intrusul Logic</Text>
          <Text style={styles.headerSubtitle}>
            Nivelul {levelIndex + 1} din {LEVELS.length}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.speakerBtn} onPress={repeatVoicePrompt} activeOpacity={0.8}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
          <View style={styles.starsPill}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.starText}>{scoreStars}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* QUESTION BANNER */}
        <View style={styles.promptCard}>
          <Text style={styles.promptEmoji}>🔍</Text>
          <View style={styles.promptTextWrap}>
            <Text style={styles.promptTitle}>{currentLevel.question}</Text>
            <Text style={styles.promptHint}>
              Atinge cartonașul care NU se potrivește cu celelalte!
            </Text>
          </View>
        </View>

        {/* 4 CARDS GRID (2x2) */}
        <View style={styles.cardsGrid}>
          {currentLevel.cards.map((card) => {
            const scale = cardScales[card.id] || 1;
            const wobble = cardWobbles[card.id] || 0;
            const isSelected = selectedOddId === card.id;

            return (
              <Animated.View
                key={card.id}
                style={[
                  styles.cardWrapper,
                  {
                    transform: [{ scale }, { translateX: wobble }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.card,
                    isSelected && styles.cardWinning,
                    solved && !card.isOdd && styles.cardDimmed,
                  ]}
                  onPress={() => handleCardTap(card)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cardEmoji}>{card.emoji}</Text>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelWinning]}>
                    {card.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.winnerBadge}>
                      <Text style={styles.winnerBadgeText}>✓ INTRUS</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* EXPLANATION / WIN REASON BANNER */}
        {solved && (
          <Animated.View style={[styles.reasonBanner, { transform: [{ scale: bannerScale }] }]}>
            <View style={styles.reasonHeader}>
              <Text style={styles.reasonCrown}>🎉</Text>
              <Text style={styles.reasonTitle}>Excelent Deductiv!</Text>
            </View>
            <Text style={styles.reasonText}>{currentLevel.reason}</Text>

            <TouchableOpacity style={styles.nextLevelBtn} onPress={handleNextLevel} activeOpacity={0.85}>
              <Text style={styles.nextLevelText}>
                {levelIndex < LEVELS.length - 1 ? 'Următorul Nivel ▶' : 'Finalizează Misiunea 🏆'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* HELPER HINT WHEN STUCK */}
        {hintVisible && !solved && (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              💡 Sfat: Privește cu atenție categoria fiecărui element (fructe, animale, culori, vehicule).
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
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
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  promptEmoji: {
    fontSize: 32,
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
  promptHint: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 420,
    gap: 14,
    marginBottom: 20,
  },
  cardWrapper: {
    width: '46%',
    aspectRatio: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  cardWinning: {
    borderColor: '#48BB78',
    backgroundColor: '#F0FFF4',
    borderWidth: 3,
    shadowColor: '#48BB78',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  cardDimmed: {
    opacity: 0.45,
  },
  cardEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A5568',
    textAlign: 'center',
  },
  cardLabelWinning: {
    color: '#22543D',
    fontWeight: '800',
  },
  winnerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#48BB78',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  winnerBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  reasonBanner: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#48BB78',
    shadowColor: '#48BB78',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasonCrown: {
    fontSize: 24,
    marginRight: 6,
  },
  reasonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#22543D',
  },
  reasonText: {
    fontSize: 14,
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '600',
  },
  nextLevelBtn: {
    backgroundColor: '#38A169',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#38A169',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  nextLevelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  hintBox: {
    backgroundColor: '#FEFCBF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F6E05E',
    width: '100%',
    maxWidth: 460,
  },
  hintText: {
    fontSize: 13,
    color: '#744210',
    fontWeight: '600',
    textAlign: 'center',
  },
});
