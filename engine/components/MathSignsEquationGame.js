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
    title: 'Nivelul 1: Adunare Simplă',
    prompt: 'Ce semn lipsește între numere?',
    equation: [
      { type: 'number', value: 3 },
      { type: 'slot', id: 's1', target: '+' },
      { type: 'number', value: 2 },
      { type: 'equals', value: '=' },
      { type: 'number', value: 5 },
    ],
    explanation: '3 + 2 = 5 (Trei plus doi fac cinci)',
  },
  {
    id: 2,
    title: 'Nivelul 2: Scădere Isteață',
    prompt: 'Plus sau minus? Alege semnul potrivit!',
    equation: [
      { type: 'number', value: 6 },
      { type: 'slot', id: 's1', target: '-' },
      { type: 'number', value: 2 },
      { type: 'equals', value: '=' },
      { type: 'number', value: 4 },
    ],
    explanation: '6 - 2 = 4 (Șase minus doi fac patru)',
  },
  {
    id: 3,
    title: 'Nivelul 3: Adunare Până la 7',
    prompt: 'Completează ecuația magică:',
    equation: [
      { type: 'number', value: 4 },
      { type: 'slot', id: 's1', target: '+' },
      { type: 'number', value: 3 },
      { type: 'equals', value: '=' },
      { type: 'number', value: 7 },
    ],
    explanation: '4 + 3 = 7 (Patru plus trei fac șapte)',
  },
  {
    id: 4,
    title: 'Nivelul 4: Formula LogicLike (3 Numere)',
    prompt: 'Pune semnele magice în ambele căsuțe:',
    equation: [
      { type: 'number', value: 5 },
      { type: 'slot', id: 's1', target: '+' },
      { type: 'number', value: 2 },
      { type: 'slot', id: 's2', target: '-' },
      { type: 'number', value: 1 },
      { type: 'equals', value: '=' },
      { type: 'number', value: 6 },
    ],
    explanation: '5 + 2 - 1 = 6 (Cinci plus doi fac șapte, minus unu fac șase!)',
  },
  {
    id: 5,
    title: 'Nivelul 5: Calcul Mixt',
    prompt: 'Descoperă operațiile secrete:',
    equation: [
      { type: 'number', value: 8 },
      { type: 'slot', id: 's1', target: '-' },
      { type: 'number', value: 3 },
      { type: 'slot', id: 's2', target: '+' },
      { type: 'number', value: 2 },
      { type: 'equals', value: '=' },
      { type: 'number', value: 7 },
    ],
    explanation: '8 - 3 + 2 = 7 (Opt minus trei fac cinci, plus doi fac șapte!)',
  },
  {
    id: 6,
    title: 'Nivelul 6: Scădere Dublă',
    prompt: 'Nivelul de Maestru în Matematică!',
    equation: [
      { type: 'number', value: 9 },
      { type: 'slot', id: 's1', target: '-' },
      { type: 'number', value: 4 },
      { type: 'slot', id: 's2', target: '-' },
      { type: 'number', value: 1 },
      { type: 'equals', value: '=' },
      { type: 'number', value: 4 },
    ],
    explanation: '9 - 4 - 1 = 4 (Nouă minus patru fac cinci, minus unu fac patru!)',
  },
];

export const MathSignsEquationGame = ({ audio, onBack, onComplete }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = LEVELS[levelIndex];

  // Map of slotId -> chosen sign ('+' | '-')
  const [slotValues, setSlotValues] = useState({});
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreStars, setScoreStars] = useState(0);

  // Animation values
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bannerScale = useRef(new Animated.Value(0)).current;

  // Find all slots in current equation
  const slots = currentLevel.equation.filter((item) => item.type === 'slot');

  useEffect(() => {
    // Reset state on level change
    setSlotValues({});
    setIsEvaluated(false);
    setIsCorrect(false);
    bannerScale.setValue(0);
    setActiveSlotId(slots[0]?.id || null);

    // Play intro audio
    try {
      if (audio?.addIntro) audioMixer.playVoice(audio.addIntro);
    } catch (e) {}
  }, [levelIndex]);

  // Pulsing animation for the active slot
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  const handleSelectSign = (sign) => {
    if (isCorrect) return;

    if (Platform.OS === 'android') {
      Vibration.vibrate(25);
    }

    try {
      if (audio?.sfxPop) audioMixer.playSFX(audio.sfxPop);
    } catch (e) {}

    // Find target slot (either activeSlotId or first unfilled slot)
    let targetSlot = activeSlotId;
    if (!targetSlot || slotValues[targetSlot]) {
      const nextUnfilled = slots.find((s) => !slotValues[s.id]);
      if (nextUnfilled) targetSlot = nextUnfilled.id;
      else targetSlot = slots[0]?.id;
    }

    const nextValues = { ...slotValues, [targetSlot]: sign };
    setSlotValues(nextValues);

    // If another slot remains unfilled, make it active
    const remainingSlot = slots.find((s) => s.id !== targetSlot && !nextValues[s.id]);
    if (remainingSlot) {
      setActiveSlotId(remainingSlot.id);
    } else {
      // All slots filled! Evaluate the equation!
      evaluateEquation(nextValues);
    }
  };

  const evaluateEquation = (values) => {
    const allCorrect = slots.every((s) => values[s.id] === s.target);
    setIsEvaluated(true);

    if (allCorrect) {
      setIsCorrect(true);
      setScoreStars((s) => s + 1);

      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 50, 40, 50]);
      }

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

      confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
    } else {
      setIsCorrect(false);

      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 60, 40, 60]);
      }

      try {
        if (audio?.sfxIncorrect) audioMixer.playSFX(audio.sfxIncorrect);
        if (audio?.ws_try_again) audioMixer.playVoice(audio.ws_try_again);
      } catch (e) {}

      // Wobble animation
      Animated.sequence([
        Animated.timing(wobbleAnim, { toValue: -14, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 14, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => {
        // Clear wrong values after 900ms
        setTimeout(() => {
          setSlotValues({});
          setIsEvaluated(false);
          setActiveSlotId(slots[0]?.id || null);
        }, 700);
      });
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

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>◀ Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Semnele Magice</Text>
          <Text style={styles.headerSubtitle}>
            Nivelul {levelIndex + 1} din {LEVELS.length}
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
          <Text style={styles.promptIcon}>✨</Text>
          <View style={styles.promptTextWrap}>
            <Text style={styles.promptTitle}>{currentLevel.prompt}</Text>
            <Text style={styles.promptSub}>
              Alege semnul de plus (+) sau minus (-) pentru a rezolva calculul!
            </Text>
          </View>
        </View>

        {/* EQUATION ROW */}
        <Animated.View
          style={[
            styles.equationRow,
            { transform: [{ translateX: wobbleAnim }] },
            isCorrect && styles.equationRowCorrect,
          ]}
        >
          {currentLevel.equation.map((item, index) => {
            if (item.type === 'number') {
              return (
                <View key={index} style={styles.numberItem}>
                  <View style={styles.numberTile}>
                    <Text style={styles.numberText}>{item.value}</Text>
                  </View>
                  {/* Visual counting dots below number for pedagogical support */}
                  <View style={styles.dotsRow}>
                    {Array.from({ length: item.value }).map((_, dIdx) => (
                      <View key={dIdx} style={styles.countingDot} />
                    ))}
                  </View>
                </View>
              );
            }

            if (item.type === 'equals') {
              return (
                <View key={index} style={styles.equalsTile}>
                  <Text style={styles.equalsText}>=</Text>
                </View>
              );
            }

            if (item.type === 'slot') {
              const val = slotValues[item.id];
              const isActive = activeSlotId === item.id;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setActiveSlotId(item.id);
                    if (Platform.OS === 'android') Vibration.vibrate(15);
                  }}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      styles.slotTile,
                      isActive && !isCorrect && { transform: [{ scale: pulseAnim }] },
                      isActive && styles.slotTileActive,
                      val && styles.slotTileFilled,
                      isCorrect && styles.slotTileCorrect,
                    ]}
                  >
                    <Text style={[styles.slotText, val && styles.slotTextFilled]}>
                      {val || '?'}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            }

            return null;
          })}
        </Animated.View>

        {/* OPERATOR BUTTONS (+ and -) */}
        <View style={styles.operatorContainer}>
          <Text style={styles.operatorTitle}>Alege Semnul:</Text>
          <View style={styles.operatorButtonsRow}>
            <TouchableOpacity
              style={[styles.opBtn, styles.opBtnPlus]}
              onPress={() => handleSelectSign('+')}
              activeOpacity={0.8}
            >
              <Text style={styles.opBtnIcon}>+</Text>
              <Text style={styles.opBtnLabel}>Plus (Adunare)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.opBtn, styles.opBtnMinus]}
              onPress={() => handleSelectSign('-')}
              activeOpacity={0.8}
            >
              <Text style={styles.opBtnIcon}>−</Text>
              <Text style={styles.opBtnLabel}>Minus (Scădere)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WIN BANNER */}
        {isCorrect && (
          <Animated.View style={[styles.winBanner, { transform: [{ scale: bannerScale }] }]}>
            <Text style={styles.winBannerEmoji}>🎉 Excelent!</Text>
            <Text style={styles.winBannerText}>{currentLevel.explanation}</Text>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNextLevel} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>
                {levelIndex < LEVELS.length - 1 ? 'Următorul Calcul ▶' : 'Misiune Încheiată! 🏆'}
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
    backgroundColor: '#F7FAFC',
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
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 14,
    width: '100%',
    maxWidth: 480,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 8,
    marginBottom: 28,
  },
  equationRowCorrect: {
    borderColor: '#48BB78',
    backgroundColor: '#F0FFF4',
  },
  numberItem: {
    alignItems: 'center',
  },
  numberTile: {
    width: 48,
    height: 58,
    backgroundColor: '#EDF2F7',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E0',
  },
  numberText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2D3748',
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 48,
    gap: 3,
    marginTop: 6,
  },
  countingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4A5568',
  },
  equalsTile: {
    width: 32,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equalsText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#718096',
  },
  slotTile: {
    width: 52,
    height: 58,
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#FEB2B2',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTileActive: {
    borderColor: '#3182CE',
    backgroundColor: '#EBF8FF',
    borderStyle: 'solid',
  },
  slotTileFilled: {
    borderStyle: 'solid',
    backgroundColor: '#EBF8FF',
    borderColor: '#3182CE',
  },
  slotTileCorrect: {
    backgroundColor: '#C6F6D5',
    borderColor: '#38A169',
  },
  slotText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#E53E3E',
  },
  slotTextFilled: {
    color: '#2B6CB0',
  },
  operatorContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    marginBottom: 20,
  },
  operatorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 12,
  },
  operatorButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    justifyContent: 'center',
  },
  opBtn: {
    flex: 1,
    maxWidth: 190,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  opBtnPlus: {
    backgroundColor: '#3182CE',
  },
  opBtnMinus: {
    backgroundColor: '#E53E3E',
  },
  opBtnIcon: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  opBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
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
    marginTop: 8,
  },
  winBannerEmoji: {
    fontSize: 20,
    fontWeight: '800',
    color: '#22543D',
    marginBottom: 6,
  },
  winBannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 16,
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
