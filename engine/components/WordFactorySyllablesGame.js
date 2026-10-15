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
} from 'react-native';
import confetti from '../utils/confetti';
import { AndroidHaptics } from '../native/AndroidHaptics';
import { audioMixer } from '../audio/index.js';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 5 Curricular Romanian Syllable Blending Puzzles
const SYLLABLE_LEVELS = [
  {
    id: 'syl_1',
    word: 'CASĂ',
    emoji: '🏠',
    desc: 'Căsuța călduroasă a familiei',
    syllables: [
      { id: 'c1', text: 'CA', audio: require('../../assets/audio/syl_ca.mp3') },
      { id: 'c2', text: 'SĂ', audio: require('../../assets/audio/syl_sa.mp3') },
    ],
    pool: [
      { id: 'p1', text: 'CA', audio: require('../../assets/audio/syl_ca.mp3') },
      { id: 'p2', text: 'MA', audio: require('../../assets/audio/syl_ma.mp3') },
      { id: 'p3', text: 'SĂ', audio: require('../../assets/audio/syl_sa.mp3') },
    ],
    fullWordAudio: require('../../assets/audio/word_casa.mp3'),
  },
  {
    id: 'syl_2',
    word: 'MAMA',
    emoji: '❤️',
    desc: 'Cea mai dragă ființă din lume',
    syllables: [
      { id: 'm1', text: 'MA', audio: require('../../assets/audio/syl_ma.mp3') },
      { id: 'm2', text: 'MA', audio: require('../../assets/audio/syl_ma.mp3') },
    ],
    pool: [
      { id: 'p1', text: 'MA', audio: require('../../assets/audio/syl_ma.mp3') },
      { id: 'p2', text: 'RE', audio: require('../../assets/audio/syl_re.mp3') },
      { id: 'p3', text: 'MA', audio: require('../../assets/audio/syl_ma.mp3') },
      { id: 'p4', text: 'CA', audio: require('../../assets/audio/syl_ca.mp3') },
    ],
    fullWordAudio: null, // plays syllables sequentially
  },
  {
    id: 'syl_3',
    word: 'SOARE',
    emoji: '☀️',
    desc: 'Lumina caldă a dimineților senine',
    syllables: [
      { id: 's1', text: 'SOAR', audio: require('../../assets/audio/syl_soar.mp3') },
      { id: 's2', text: 'E', audio: require('../../assets/audio/syl_re.mp3') },
    ],
    pool: [
      { id: 'p1', text: 'SI', audio: require('../../assets/audio/syl_si.mp3') },
      { id: 'p2', text: 'SOAR', audio: require('../../assets/audio/syl_soar.mp3') },
      { id: 'p3', text: 'E', audio: require('../../assets/audio/syl_re.mp3') },
    ],
    fullWordAudio: require('../../assets/audio/word_soare.mp3'),
  },
  {
    id: 'syl_4',
    word: 'FLOARE',
    emoji: '🌸',
    desc: 'Mirosul dulce al primăverii',
    syllables: [
      { id: 'f1', text: 'FLOA', audio: require('../../assets/audio/syl_floa.mp3') },
      { id: 'f2', text: 'RE', audio: require('../../assets/audio/syl_re.mp3') },
    ],
    pool: [
      { id: 'p1', text: 'FLOA', audio: require('../../assets/audio/syl_floa.mp3') },
      { id: 'p2', text: 'CA', audio: require('../../assets/audio/syl_ca.mp3') },
      { id: 'p3', text: 'RE', audio: require('../../assets/audio/syl_re.mp3') },
    ],
    fullWordAudio: require('../../assets/audio/word_floare.mp3'),
  },
  {
    id: 'syl_5',
    word: 'PISICĂ',
    emoji: '🐱',
    desc: 'Prietenul pufos care toarce vesel',
    syllables: [
      { id: 'pi1', text: 'PI', audio: require('../../assets/audio/syl_pi.mp3') },
      { id: 'pi2', text: 'SI', audio: require('../../assets/audio/syl_si.mp3') },
      { id: 'pi3', text: 'CĂ', audio: require('../../assets/audio/syl_ca.mp3') },
    ],
    pool: [
      { id: 'p1', text: 'PI', audio: require('../../assets/audio/syl_pi.mp3') },
      { id: 'p2', text: 'MA', audio: require('../../assets/audio/syl_ma.mp3') },
      { id: 'p3', text: 'SI', audio: require('../../assets/audio/syl_si.mp3') },
      { id: 'p4', text: 'CĂ', audio: require('../../assets/audio/syl_ca.mp3') },
    ],
    fullWordAudio: null,
  },
];

export function WordFactorySyllablesGame({ onBack, onComplete }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = SYLLABLE_LEVELS[levelIndex];

  const [placedSyllables, setPlacedSyllables] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animations
  const conveyorAnim = useRef(new Animated.Value(0)).current;
  const wordMergeScale = useRef(new Animated.Value(1)).current;
  const emojiPop = useRef(new Animated.Value(0)).current;

  // Background conveyor belt movement
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(conveyorAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Level reset
  useEffect(() => {
    setPlacedSyllables([]);
    setIsSuccess(false);
    setShowCelebration(false);
    emojiPop.setValue(0);
    wordMergeScale.setValue(1);

    // Audio cue
    audioMixer.playVoice(require('../../assets/audio/word_factory_intro.mp3'), { volume: 1.0 });
  }, [levelIndex]);

  const handleSelectPoolItem = (item, poolIdx) => {
    if (isSuccess) return;

    const nextIndex = placedSyllables.length;
    const expectedSyllable = currentLevel.syllables[nextIndex];

    if (!expectedSyllable) return;

    // Check syllable match
    if (item.text === expectedSyllable.text) {
      // Correct Syllable!
      const newPlaced = [...placedSyllables, item];
      setPlacedSyllables(newPlaced);

      // Play syllable pronunciation
      AndroidHaptics.impactLight();
      if (item.audio) {
        audioMixer.playVoice(item.audio, { volume: 1.0 });
      }

      // Check if word is complete
      if (newPlaced.length === currentLevel.syllables.length) {
        setIsSuccess(true);
        AndroidHaptics.notificationSuccess();

        // Animate word merge & emoji celebration
        Animated.parallel([
          Animated.sequence([
            Animated.timing(wordMergeScale, { toValue: 1.25, duration: 250, useNativeDriver: true }),
            Animated.spring(wordMergeScale, { toValue: 1.0, tension: 70, friction: 6, useNativeDriver: true }),
          ]),
          Animated.spring(emojiPop, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
        ]).start();

        // Confetti burst
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.4 },
        });

        // Play full word audio
        setTimeout(() => {
          if (currentLevel.fullWordAudio) {
            audioMixer.playVoice(currentLevel.fullWordAudio, { volume: 1.0 });
          } else {
            audioMixer.playSFX(require('../../assets/audio/correct_chime.mp3'), 0.9);
          }
        }, 600);

        // Win encouragement
        setTimeout(() => {
          audioMixer.playVoice(require('../../assets/audio/word_factory_win.mp3'), { volume: 1.0 });
        }, 1800);
      }
    } else {
      // Mismatch
      AndroidHaptics.notificationWarning();
      audioMixer.playSFX(require('../../assets/audio/SFX_squish.mp3'), 0.6);
    }
  };

  const handleResetSlots = () => {
    if (isSuccess) return;
    setPlacedSyllables([]);
    AndroidHaptics.selectionClick();
  };

  const handleNextLevel = () => {
    if (levelIndex < SYLLABLE_LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else {
      setShowCelebration(true);
      AndroidHaptics.victoryFanfare();
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
          <Text style={styles.headerTitle}>🏭 Fabrica de Cuvinte</Text>
          <Text style={styles.headerSubtitle}>
            Nivelul {levelIndex + 1} / {SYLLABLE_LEVELS.length} • Îmbină Silabele
          </Text>
        </View>

        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>⭐ {levelIndex * 2}</Text>
        </View>
      </View>

      {/* 2. INSTRUCTION & TARGET WORD CLUE */}
      <View style={styles.clueCard}>
        <Text style={styles.clueDesc}>{currentLevel.desc}</Text>
        <Text style={styles.targetHint}>
          Formează cuvântul: <Text style={styles.targetHighlight}>{currentLevel.word}</Text>
        </Text>
      </View>

      {/* 3. CONVEYOR BELT & WORD WORKBENCH */}
      <View style={styles.workbenchScene}>
        {/* Conveyor Belt Graphics */}
        <View style={styles.conveyorBelt}>
          <View style={styles.beltLine} />
          <View style={styles.rollersRow}>
            {Array.from({ length: 12 }).map((_, i) => (
              <View key={i} style={styles.roller} />
            ))}
          </View>
        </View>

        {/* Syllable Slots on Workbench */}
        <Animated.View
          style={[
            styles.slotsRow,
            { transform: [{ scale: wordMergeScale }] },
          ]}
        >
          {currentLevel.syllables.map((syl, idx) => {
            const placed = placedSyllables[idx];
            return (
              <View
                key={syl.id}
                style={[
                  styles.syllableSlot,
                  placed && styles.syllableSlotFilled,
                  isSuccess && styles.syllableSlotSuccess,
                ]}
              >
                {placed ? (
                  <Text style={styles.placedSyllableText}>{placed.text}</Text>
                ) : (
                  <Text style={styles.emptySlotIndicator}>_</Text>
                )}
              </View>
            );
          })}
        </Animated.View>

        {/* EMOJI REVEAL ON SUCCESS */}
        {isSuccess && (
          <Animated.View
            style={[
              styles.emojiRevealWrap,
              { transform: [{ scale: emojiPop }] },
            ]}
          >
            <Text style={styles.revealedEmoji}>{currentLevel.emoji}</Text>
            <Text style={styles.revealedWord}>{currentLevel.word}!</Text>
          </Animated.View>
        )}
      </View>

      {/* 4. SYLLABLES PALETTE / SELECTION */}
      <View style={styles.paletteDock}>
        <View style={styles.dockHeaderRow}>
          <Text style={styles.dockTitle}>📦 Alege Silaba Următoare:</Text>
          {placedSyllables.length > 0 && !isSuccess && (
            <TouchableOpacity
              onPress={handleResetSlots}
              style={styles.resetBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.resetBtnText}>↺ Șterge</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.poolRow}>
          {currentLevel.pool.map((pItem, pIdx) => (
            <TouchableOpacity
              key={`${pItem.id}_${pIdx}`}
              style={[
                styles.syllableCard,
                isSuccess && styles.syllableCardDisabled,
              ]}
              onPress={() => handleSelectPoolItem(pItem, pIdx)}
              activeOpacity={0.8}
              disabled={isSuccess}
            >
              <Text style={styles.syllableCardText}>{pItem.text}</Text>
              <View style={styles.audioHintDot} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Level Button */}
        {isSuccess && (
          <TouchableOpacity
            style={styles.nextLevelBtn}
            onPress={handleNextLevel}
            activeOpacity={0.8}
          >
            <Text style={styles.nextLevelBtnText}>
              {levelIndex < SYLLABLE_LEVELS.length - 1
                ? 'Următorul Cuvânt ➔'
                : 'Finalizează Jocul ➔'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 5. CELEBRATION MODAL */}
      {showCelebration && (
        <View style={styles.modalOverlay}>
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉📚✨</Text>
            <Text style={styles.celebrationTitle}>Micul Maestru al Silabelor!</Text>
            <Text style={styles.celebrationDesc}>
              Ai asamblat cu succes toate cuvintele magice în limba română!
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
    backgroundColor: '#F0FDF4',
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
    borderBottomColor: '#BBF7D0',
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
    color: '#166534',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
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

  // CLUE
  clueCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DCFCE7',
  },
  clueDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  targetHint: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  targetHighlight: {
    color: '#16A34A',
    fontWeight: '900',
    letterSpacing: 2,
  },

  // WORKBENCH
  workbenchScene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  conveyorBelt: {
    position: 'absolute',
    bottom: '36%',
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: '#475569',
    justifyContent: 'center',
  },
  beltLine: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#94A3B8',
  },
  rollersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  roller: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 5,
  },
  syllableSlot: {
    minWidth: 84,
    height: 84,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syllableSlotFilled: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
    borderStyle: 'solid',
  },
  syllableSlotSuccess: {
    backgroundColor: '#BBF7D0',
    borderColor: '#15803D',
  },
  placedSyllableText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#166534',
    letterSpacing: 1,
  },
  emptySlotIndicator: {
    fontSize: 28,
    fontWeight: '800',
    color: '#CBD5E1',
  },

  // EMOJI REVEAL
  emojiRevealWrap: {
    marginTop: 24,
    alignItems: 'center',
  },
  revealedEmoji: {
    fontSize: 54,
    marginBottom: 4,
  },
  revealedWord: {
    fontSize: 22,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 2,
  },

  // PALETTE DOCK
  paletteDock: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'android' ? 28 : 20,
    paddingHorizontal: 16,
    borderTopWidth: 4,
    borderTopColor: '#22C55E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  dockHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dockTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  resetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  poolRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  syllableCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#86EFAC',
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 78,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  syllableCardDisabled: {
    opacity: 0.5,
  },
  syllableCardText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 1,
  },
  audioHintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginTop: 4,
  },
  nextLevelBtn: {
    marginTop: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextLevelBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // CELEBRATION
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
    borderColor: '#22C55E',
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#166534',
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
    backgroundColor: '#16A34A',
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
