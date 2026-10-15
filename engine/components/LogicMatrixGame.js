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

const MATRIX_LEVELS = [
  {
    id: 1,
    title: 'Nivelul 1: Forme și Culori (2x2)',
    prompt: 'Ce figură completează tabelul magic?',
    gridSize: 2,
    reason: 'Excelent! În rândul de jos sunt triunghiuri, iar în a doua coloană toate sunt albastre!',
    grid: [
      { id: 'c0_0', emoji: '🔴', label: 'Cerc Roșu' },
      { id: 'c0_1', emoji: '🔵', label: 'Cerc Albastru' },
      { id: 'c1_0', emoji: '🔺', label: 'Triunghi Roșu' },
      { id: 'c1_1', isTarget: true, targetEmoji: '🔷', targetLabel: 'Triunghi Albastru' },
    ],
    choices: [
      { id: 'ch1', emoji: '🔷', label: 'Triunghi Albastru', isCorrect: true },
      { id: 'ch2', emoji: '🔴', label: 'Cerc Roșu', isCorrect: false },
      { id: 'ch3', emoji: '🟩', label: 'Pătrat Verde', isCorrect: false },
    ],
  },
  {
    id: 2,
    title: 'Nivelul 2: Prieteni și Mâncăruri (2x2)',
    prompt: 'Ce mănâncă maimuțica veselă?',
    gridSize: 2,
    reason: 'Bravo! Iepurașul mănâncă morcovi, iar maimuțica mănâncă banane delicioase!',
    grid: [
      { id: 'c0_0', emoji: '🐰', label: 'Iepuraș' },
      { id: 'c0_1', emoji: '🥕', label: 'Morcov' },
      { id: 'c1_0', emoji: '🐵', label: 'Maimuță' },
      { id: 'c1_1', isTarget: true, targetEmoji: '🍌', targetLabel: 'Banană' },
    ],
    choices: [
      { id: 'ch1', emoji: '🧀', label: 'Brânzică', isCorrect: false },
      { id: 'ch2', emoji: '🍌', label: 'Banană', isCorrect: true },
      { id: 'ch3', emoji: '🥩', label: 'Friptură', isCorrect: false },
    ],
  },
  {
    id: 3,
    title: 'Nivelul 3: Călătorii pe Apă și Uscat (2x2)',
    prompt: 'Unde călătorește bărcuța cu pânze?',
    gridSize: 2,
    reason: 'Minunat! Mașina merge pe șosea, iar barca plutește pe valurile apei!',
    grid: [
      { id: 'c0_0', emoji: '🚗', label: 'Mașină' },
      { id: 'c0_1', emoji: '🛣️', label: 'Șosea' },
      { id: 'c1_0', emoji: '⛵', label: 'Bărcuță' },
      { id: 'c1_1', isTarget: true, targetEmoji: '🌊', targetLabel: 'Valuri / Apă' },
    ],
    choices: [
      { id: 'ch1', emoji: '🌊', label: 'Apă & Valuri', isCorrect: true },
      { id: 'ch2', emoji: '☁️', label: 'Norișor', isCorrect: false },
      { id: 'ch3', emoji: '🛤️', label: 'Cale Ferată', isCorrect: false },
    ],
  },
  {
    id: 4,
    title: 'Nivelul 4: Culorile Curcubeului (2x2)',
    prompt: 'Descoperă floarea galbenă lipsă!',
    gridSize: 2,
    reason: 'Super! Primul rând are inimioare, al doilea are floricele, iar coloana 2 este galbenă!',
    grid: [
      { id: 'c0_0', emoji: '❤️', label: 'Inimă Roșie' },
      { id: 'c0_1', emoji: '💛', label: 'Inimă Galbenă' },
      { id: 'c1_0', emoji: '🌹', label: 'Trandafir Roșu' },
      { id: 'c1_1', isTarget: true, targetEmoji: '🌻', targetLabel: 'Floare Galbenă' },
    ],
    choices: [
      { id: 'ch1', emoji: '💜', label: 'Inimă Violet', isCorrect: false },
      { id: 'ch2', emoji: '🌻', label: 'Floare Galbenă', isCorrect: true },
      { id: 'ch3', emoji: '🍃', label: 'Frunzuliță', isCorrect: false },
    ],
  },
  {
    id: 5,
    title: 'Nivelul 5: Matricea Fermecată 3x3',
    prompt: 'Care prieten încheie ultimul rând?',
    gridSize: 3,
    reason: 'Fabulos! Fiecare rând conține un cățeluș, o pisicuță și un mic șoricel!',
    grid: [
      { id: 'c0_0', emoji: '🐶', label: 'Cățel' },
      { id: 'c0_1', emoji: '🐱', label: 'Pisică' },
      { id: 'c0_2', emoji: '🐭', label: 'Șoricel' },
      { id: 'c1_0', emoji: '🐶', label: 'Cățel' },
      { id: 'c1_1', emoji: '🐱', label: 'Pisică' },
      { id: 'c1_2', emoji: '🐭', label: 'Șoricel' },
      { id: 'c2_0', emoji: '🐶', label: 'Cățel' },
      { id: 'c2_1', emoji: '🐱', label: 'Pisică' },
      { id: 'c2_2', isTarget: true, targetEmoji: '🐭', targetLabel: 'Șoricel' },
    ],
    choices: [
      { id: 'ch1', emoji: '🐭', label: 'Șoricel', isCorrect: true },
      { id: 'ch2', emoji: '🐶', label: 'Cățeluș', isCorrect: false },
      { id: 'ch3', emoji: '🐱', label: 'Pisicuță', isCorrect: false },
    ],
  },
];

export const LogicMatrixGame = ({ audio, onBack, onComplete }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = MATRIX_LEVELS[levelIndex];

  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [scoreStars, setScoreStars] = useState(0);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bannerScale = useRef(new Animated.Value(0)).current;
  const choiceWobbles = useRef(
    MATRIX_LEVELS[0].choices.reduce((acc, ch) => {
      acc[ch.id] = new Animated.Value(0);
      return acc;
    }, {})
  ).current;

  useEffect(() => {
    try {
      if (audio?.patternPrompt) audioMixer.playVoice(audio.patternPrompt);
    } catch (e) {}
  }, []);

  useEffect(() => {
    setSelectedChoiceId(null);
    setIsSolved(false);
    bannerScale.setValue(0);

    currentLevel.choices.forEach((ch) => {
      if (!choiceWobbles[ch.id]) choiceWobbles[ch.id] = new Animated.Value(0);
      choiceWobbles[ch.id].setValue(0);
    });
  }, [levelIndex]);

  // Target pulse animation
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  const handleSelectChoice = (choice) => {
    if (isSolved) return;

    if (Platform.OS === 'android') {
      Vibration.vibrate(30);
    }

    if (choice.isCorrect) {
      // CORRECT
      setIsSolved(true);
      setSelectedChoiceId(choice.id);
      setScoreStars((s) => s + 1);

      try {
        if (audio?.sfxChime) audioMixer.playSFX(audio.sfxChime);
        setTimeout(() => {
          if (audio?.kodiAwesome) audioMixer.playVoice(audio.kodiAwesome);
        }, 300);
      } catch (e) {}

      Animated.spring(bannerScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();

      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } else {
      // INCORRECT
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 40, 30, 40]);
      }

      try {
        if (audio?.sfxIncorrect) audioMixer.playSFX(audio.sfxIncorrect);
        if (audio?.ws_try_again) audioMixer.playVoice(audio.ws_try_again);
      } catch (e) {}

      const wobble = choiceWobbles[choice.id] || new Animated.Value(0);
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

    if (levelIndex < MATRIX_LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else {
      confetti({ particleCount: 150, spread: 90 });
      try {
        if (audio?.sfxRoyal) audioMixer.playSFX(audio.sfxRoyal);
      } catch (e) {}
      if (onComplete) onComplete();
    }
  };

  const is3x3 = currentLevel.gridSize === 3;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>◀ Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Tabelul Fermecat</Text>
          <Text style={styles.headerSubtitle}>
            Nivelul {levelIndex + 1} din {MATRIX_LEVELS.length}
          </Text>
        </View>

        <View style={styles.starsPill}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.starText}>{scoreStars}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PROMPT BANNER */}
        <View style={styles.promptCard}>
          <Text style={styles.promptIcon}>🧩</Text>
          <View style={styles.promptTextWrap}>
            <Text style={styles.promptTitle}>{currentLevel.prompt}</Text>
            <Text style={styles.promptSub}>
              Privește relația dintre rânduri și coloane pentru a găsi elementul!
            </Text>
          </View>
        </View>

        {/* LOGIC MATRIX GRID */}
        <View
          style={[
            styles.matrixGrid,
            is3x3 ? styles.matrixGrid3x3 : styles.matrixGrid2x2,
          ]}
        >
          {currentLevel.grid.map((cell, idx) => {
            if (cell.isTarget) {
              return (
                <Animated.View
                  key={cell.id}
                  style={[
                    styles.matrixCell,
                    styles.targetCell,
                    is3x3 && styles.matrixCell3x3,
                    isSolved && styles.targetCellSolved,
                    !isSolved && { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Text style={[styles.cellEmoji, is3x3 && styles.cellEmoji3x3]}>
                    {isSolved ? cell.targetEmoji : '❓'}
                  </Text>
                  <Text style={styles.targetCellLabel}>
                    {isSolved ? cell.targetLabel : 'Alege'}
                  </Text>
                </Animated.View>
              );
            }

            return (
              <View
                key={cell.id}
                style={[
                  styles.matrixCell,
                  is3x3 && styles.matrixCell3x3,
                ]}
              >
                <Text style={[styles.cellEmoji, is3x3 && styles.cellEmoji3x3]}>
                  {cell.emoji}
                </Text>
                <Text style={styles.cellLabel}>{cell.label}</Text>
              </View>
            );
          })}
        </View>

        {/* CHOICES ROW */}
        <Text style={styles.choicesTitle}>Alege Răspunsul Corect:</Text>
        <View style={styles.choicesRow}>
          {currentLevel.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            const wobble = choiceWobbles[choice.id] || 0;

            return (
              <Animated.View
                key={choice.id}
                style={[
                  styles.choiceWrapper,
                  { transform: [{ translateX: wobble }] },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.choiceCard,
                    isSelected && styles.choiceCardWinning,
                    isSolved && !choice.isCorrect && styles.choiceCardDimmed,
                  ]}
                  onPress={() => handleSelectChoice(choice)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
                  <Text style={[styles.choiceLabel, isSelected && styles.choiceLabelWinning]}>
                    {choice.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* WIN BANNER */}
        {isSolved && (
          <Animated.View style={[styles.winBanner, { transform: [{ scale: bannerScale }] }]}>
            <View style={styles.winHeader}>
              <Text style={styles.winEmoji}>🎉</Text>
              <Text style={styles.winTitle}>Excelent Deductiv!</Text>
            </View>
            <Text style={styles.winReasonText}>{currentLevel.reason}</Text>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNextLevel} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>
                {levelIndex < MATRIX_LEVELS.length - 1 ? 'Următorul Tabel ▶' : 'Misiune Încheiată! 🏆'}
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
    marginBottom: 24,
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
  matrixGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    borderWidth: 2.5,
    borderColor: '#CBD5E0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  matrixGrid2x2: {
    width: 260,
  },
  matrixGrid3x3: {
    width: 320,
  },
  matrixCell: {
    width: 108,
    height: 108,
    backgroundColor: '#EDF2F7',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E0',
  },
  matrixCell3x3: {
    width: 88,
    height: 88,
    borderRadius: 14,
  },
  targetCell: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
    borderStyle: 'dashed',
    borderWidth: 2.5,
  },
  targetCellSolved: {
    backgroundColor: '#F0FFF4',
    borderColor: '#48BB78',
    borderStyle: 'solid',
  },
  cellEmoji: {
    fontSize: 44,
    marginBottom: 4,
  },
  cellEmoji3x3: {
    fontSize: 34,
    marginBottom: 2,
  },
  cellLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A5568',
    textAlign: 'center',
  },
  targetCellLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E53E3E',
  },
  choicesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 12,
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 480,
    marginBottom: 24,
  },
  choiceWrapper: {
    flex: 1,
    maxWidth: 135,
  },
  choiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  choiceCardWinning: {
    borderColor: '#48BB78',
    backgroundColor: '#F0FFF4',
    borderWidth: 3,
  },
  choiceCardDimmed: {
    opacity: 0.45,
  },
  choiceEmoji: {
    fontSize: 44,
    marginBottom: 6,
  },
  choiceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5568',
    textAlign: 'center',
  },
  choiceLabelWinning: {
    color: '#22543D',
    fontWeight: '800',
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
