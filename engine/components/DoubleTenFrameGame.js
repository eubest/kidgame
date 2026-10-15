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

// 5 Progressive Bridge-to-10 and Base-20 Levels
const DOUBLE_TEN_LEVELS = [
  {
    id: 'dt_1',
    title: 'Adunare cu Zece: 10 + 4',
    baseA: 10,
    addB: 4,
    targetSum: 14,
    initialCounters1: 10,
    initialCounters2: 0,
    requiredAdds: 4,
    colorA: '#EF4444', // Red
    colorB: '#F59E0B', // Amber / Gold
    ruleNote: 'Prima grilă are deja 10 jetoane roșii. Adaugă încă 4 jetoane aurii!',
  },
  {
    id: 'dt_2',
    title: 'Trecerea peste Zece: 8 + 5',
    baseA: 8,
    addB: 5,
    targetSum: 13,
    initialCounters1: 8,
    initialCounters2: 0,
    requiredAdds: 5,
    colorA: '#3B82F6', // Blue
    colorB: '#10B981', // Emerald
    ruleNote: 'Avem 8 jetoane. Completează prima grilă până la 10, apoi pune restul în a doua grilă!',
  },
  {
    id: 'dt_3',
    title: 'Trecerea peste Zece: 9 + 7',
    baseA: 9,
    addB: 7,
    targetSum: 16,
    initialCounters1: 9,
    initialCounters2: 0,
    requiredAdds: 7,
    colorA: '#8B5CF6', // Purple
    colorB: '#EC4899', // Pink
    ruleNote: 'Avem 9 jetoane. Mai e nevoie doar de 1 jeton pentru a face 10 plin!',
  },
  {
    id: 'dt_4',
    title: 'Trecerea peste Zece: 7 + 6',
    baseA: 7,
    addB: 6,
    targetSum: 13,
    initialCounters1: 7,
    initialCounters2: 0,
    requiredAdds: 6,
    colorA: '#F97316', // Orange
    colorB: '#06B6D4', // Cyan
    ruleNote: 'Pune 3 jetoane pentru a umple zecele, apoi încă 3 în grila de jos!',
  },
  {
    id: 'dt_5',
    title: 'Marea Numărătoare: 10 + 9',
    baseA: 10,
    addB: 9,
    targetSum: 19,
    initialCounters1: 10,
    initialCounters2: 0,
    requiredAdds: 9,
    colorA: '#10B981', // Emerald
    colorB: '#F59E0B', // Amber
    ruleNote: '10 plus 9 fac 19! Aproape am umplut ambele grile!',
  },
];

export function DoubleTenFrameGame({ onBack, onComplete }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = DOUBLE_TEN_LEVELS[levelIndex];

  // Placed counters count in frame 1 and frame 2
  const [addedCount, setAddedCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tenMadeAnnounced, setTenMadeAnnounced] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animations
  const glowFrame1 = useRef(new Animated.Value(0)).current;
  const equationScale = useRef(new Animated.Value(1)).current;
  const buttonBounce = useRef(new Animated.Value(1)).current;

  // Total in Frame 1 and Frame 2
  const totalInFrame1 = Math.min(10, currentLevel.initialCounters1 + addedCount);
  const totalInFrame2 = Math.max(0, currentLevel.initialCounters1 + addedCount - 10);
  const totalCount = totalInFrame1 + totalInFrame2;

  // Level initialization
  useEffect(() => {
    setAddedCount(0);
    setIsSuccess(false);
    setShowCelebration(false);
    glowFrame1.setValue(0);

    // Initial 10 check
    if (currentLevel.initialCounters1 === 10) {
      setTenMadeAnnounced(true);
      glowFrame1.setValue(1);
    } else {
      setTenMadeAnnounced(false);
    }

    // Audio cue
    audioMixer.playVoice(require('../../assets/audio/double_ten_intro.mp3'), { volume: 1.0 });
  }, [levelIndex]);

  // Check for "Ten Made" milestone (bridge to 10)
  useEffect(() => {
    if (!tenMadeAnnounced && totalInFrame1 === 10) {
      setTenMadeAnnounced(true);

      // Play glorious ten made fanfare
      AndroidHaptics.impactHeavy();
      audioMixer.playVoice(require('../../assets/audio/double_ten_ten_made.mp3'), { volume: 1.0 });
      audioMixer.playSFX(require('../../assets/audio/SFX_royal.mp3'), 0.8);

      // Frame 1 glow animation
      Animated.sequence([
        Animated.timing(glowFrame1, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.timing(glowFrame1, { toValue: 0.4, duration: 300, useNativeDriver: false }),
        Animated.timing(glowFrame1, { toValue: 1, duration: 400, useNativeDriver: false }),
      ]).start();
    }
  }, [totalInFrame1, tenMadeAnnounced]);

  // Check for Level Completion
  useEffect(() => {
    if (addedCount === currentLevel.requiredAdds && !isSuccess) {
      setIsSuccess(true);

      // Success Haptics & Fanfare
      AndroidHaptics.notificationSuccess();
      audioMixer.playSFX(require('../../assets/audio/BingoSuccessfulLineFIll.mp3'), 0.9);
      audioMixer.playVoice(require('../../assets/audio/double_ten_synthesis.mp3'), { volume: 1.0 });

      // Equation pulse
      Animated.sequence([
        Animated.spring(equationScale, { toValue: 1.3, tension: 80, friction: 5, useNativeDriver: true }),
        Animated.spring(equationScale, { toValue: 1.0, tension: 80, friction: 6, useNativeDriver: true }),
      ]).start();

      // Confetti burst
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.5 },
      });

      // Win voice after brief synthesis
      setTimeout(() => {
        audioMixer.playVoice(require('../../assets/audio/double_ten_win.mp3'), { volume: 1.0 });
      }, 1400);
    }
  }, [addedCount, isSuccess]);

  const handleAddCounter = () => {
    if (addedCount >= currentLevel.requiredAdds || isSuccess) return;

    const nextCount = addedCount + 1;
    setAddedCount(nextCount);

    // Tactile vibration
    AndroidHaptics.impactLight();

    // Ascending note SFX
    audioMixer.playSFX(require('../../assets/audio/correct_chime.mp3'), 0.7);

    // Button pulse
    Animated.sequence([
      Animated.timing(buttonBounce, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(buttonBounce, { toValue: 1, tension: 70, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const handleRemoveCounter = () => {
    if (addedCount <= 0 || isSuccess) return;

    setAddedCount(addedCount - 1);
    AndroidHaptics.selectionClick();
    audioMixer.playSFX(require('../../assets/audio/SFX_squish.mp3'), 0.5);
  };

  const handleNextLevel = () => {
    if (levelIndex < DOUBLE_TEN_LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else {
      setShowCelebration(true);
      AndroidHaptics.victoryFanfare();
    }
  };

  // Helper to render a 10-frame grid (2 rows of 5)
  const renderTenFrame = (frameNum, filledCount, totalBaseCount, colorA, colorB) => {
    const isFull = filledCount === 10;
    return (
      <View style={[styles.tenFrameWrapper, isFull && styles.tenFrameWrapperFull]}>
        <View style={styles.frameHeaderRow}>
          <Text style={styles.frameNumberLabel}>Grila #{frameNum} {frameNum === 1 ? '(Primul 10)' : '(Al Doilea 10)'}</Text>
          <View style={[styles.frameCounterBadge, isFull && styles.frameCounterBadgeFull]}>
            <Text style={styles.frameCounterBadgeText}>{filledCount} / 10</Text>
          </View>
        </View>

        <View style={styles.tenFrameGrid}>
          {Array.from({ length: 10 }).map((_, cellIdx) => {
            const isFilled = cellIdx < filledCount;
            // Determine if this cell is from baseA or addedB
            const isFromBase = frameNum === 1 && cellIdx < currentLevel.initialCounters1;
            const counterColor = isFromBase ? colorA : colorB;

            return (
              <View key={cellIdx} style={styles.tenFrameCell}>
                {isFilled ? (
                  <View style={[styles.counterDisc, { backgroundColor: counterColor }]}>
                    <View style={styles.counterInnerRing} />
                    <Text style={styles.counterNumber}>
                      {frameNum === 1 ? cellIdx + 1 : 10 + cellIdx + 1}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyCellHole} />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
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
          <Text style={styles.headerTitle}>🔟 Grila Dublă de 10</Text>
          <Text style={styles.headerSubtitle}>
            Nivelul {levelIndex + 1} / {DOUBLE_TEN_LEVELS.length} • {currentLevel.title}
          </Text>
        </View>

        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>⭐ {levelIndex * 3}</Text>
        </View>
      </View>

      {/* 2. EQUATION DISPLAY */}
      <View style={styles.equationCard}>
        <Animated.View style={{ transform: [{ scale: equationScale }] }}>
          <Text style={styles.equationText}>
            {currentLevel.baseA} + {addedCount} = {totalCount}
            <Text style={styles.targetIndicator}> (Țintă: {currentLevel.targetSum})</Text>
          </Text>
        </Animated.View>
        <Text style={styles.ruleNoteText}>{currentLevel.ruleNote}</Text>
      </View>

      {/* 3. DUAL 10-FRAMES CONTAINER */}
      <View style={styles.framesContainer}>
        {/* Frame 1 */}
        {renderTenFrame(
          1,
          totalInFrame1,
          currentLevel.initialCounters1,
          currentLevel.colorA,
          currentLevel.colorB
        )}

        {/* Frame 2 */}
        {renderTenFrame(
          2,
          totalInFrame2,
          0,
          currentLevel.colorA,
          currentLevel.colorB
        )}
      </View>

      {/* 4. CONTROLS TRAY */}
      <View style={styles.controlsTray}>
        <View style={styles.remainingWrap}>
          <Text style={styles.remainingText}>
            Jetoane de adăugat: {currentLevel.requiredAdds - addedCount}
          </Text>
        </View>

        <View style={styles.actionButtonsRow}>
          {/* Remove button */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.removeBtn,
              addedCount === 0 && styles.disabledBtn,
            ]}
            onPress={handleRemoveCounter}
            disabled={addedCount === 0 || isSuccess}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnText}>➖ Scoate</Text>
          </TouchableOpacity>

          {/* Add Counter Disc Button */}
          <Animated.View style={{ transform: [{ scale: buttonBounce }] }}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.addBtn,
                { backgroundColor: currentLevel.colorB },
                addedCount === currentLevel.requiredAdds && styles.disabledBtn,
              ]}
              onPress={handleAddCounter}
              disabled={addedCount === currentLevel.requiredAdds || isSuccess}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnEmoji}>🟡</Text>
              <Text style={styles.addBtnText}>+ Pune Jeton</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Next Level Button on Success */}
        {isSuccess && (
          <TouchableOpacity
            style={styles.nextLevelBtn}
            onPress={handleNextLevel}
            activeOpacity={0.8}
          >
            <Text style={styles.nextLevelBtnText}>
              {levelIndex < DOUBLE_TEN_LEVELS.length - 1
                ? 'Următorul Nivel ➔'
                : 'Finalizează Jocul ➔'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 5. CELEBRATION MODAL */}
      {showCelebration && (
        <View style={styles.modalOverlay}>
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉🔟🌟</Text>
            <Text style={styles.celebrationTitle}>Maestru al Numerelor până la 20!</Text>
            <Text style={styles.celebrationDesc}>
              Ai stăpânit trecerea peste zece și adunarea cu grile duble de 10!
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
    backgroundColor: '#F8FAFC',
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
    borderBottomColor: '#E2E8F0',
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
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
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

  // EQUATION
  equationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  equationText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  targetIndicator: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  ruleNoteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
  },

  // FRAMES
  framesContainer: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  tenFrameWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    borderWidth: 3,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  tenFrameWrapperFull: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  frameHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  frameNumberLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  frameCounterBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frameCounterBadgeFull: {
    backgroundColor: '#FEF3C7',
  },
  frameCounterBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  tenFrameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  tenFrameCell: {
    width: '18.5%',
    aspectRatio: 1,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  emptyCellHole: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  counterDisc: {
    width: '88%',
    height: '88%',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    position: 'relative',
  },
  counterInnerRing: {
    position: 'absolute',
    width: '74%',
    height: '74%',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  counterNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  // CONTROLS TRAY
  controlsTray: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 28 : 20,
    paddingHorizontal: 16,
    borderTopWidth: 4,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  remainingWrap: {
    marginBottom: 10,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  removeBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  addBtn: {
    minWidth: 160,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
  addBtnEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nextLevelBtn: {
    marginTop: 12,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
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
    borderColor: '#F59E0B',
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#B45309',
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
