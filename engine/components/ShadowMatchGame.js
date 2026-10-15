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
    title: 'Nivelul 1: Prietenul Patruped',
    subject: { emoji: '🐶', label: 'Cățelușul Jucăuș' },
    prompt: 'Care este umbra adevărată a cățelușului?',
    reason: 'Bravo! Umbra are exact aceeași formă cu urechiușele și codița cățelușului!',
    options: [
      { id: 'opt1', emoji: '🐱', label: 'Pisicuță (Urechi ascuțite)', isCorrect: false },
      { id: 'opt2', emoji: '🐶', label: 'Umbra Cățelușului', isCorrect: true },
      { id: 'opt3', emoji: '🐰', label: 'Iepuraș (Urechi lungi)', isCorrect: false },
    ],
  },
  {
    id: 2,
    title: 'Nivelul 2: Regele Savanei',
    subject: { emoji: '🦁', label: 'Leul Curajos' },
    prompt: 'Găsește umbra leului cu coamă bogată!',
    reason: 'Excelent! Coama mare și rotundă a leului se vede perfect în umbra corectă!',
    options: [
      { id: 'opt1', emoji: '🦁', label: 'Umbra Leului', isCorrect: true },
      { id: 'opt2', emoji: '🐯', label: 'Tigru (Fără coamă)', isCorrect: false },
      { id: 'opt3', emoji: '🐻', label: 'Ursuleț (Urechi rotunde mici)', isCorrect: false },
    ],
  },
  {
    id: 3,
    title: 'Nivelul 3: Zbor spre Stele',
    subject: { emoji: '🚀', label: 'Racheta Cosmică' },
    prompt: 'Care este silueta rachetei noastre?',
    reason: 'Superb! Vârful ascuțit și aripioarele rachetei se potrivesc la fix!',
    options: [
      { id: 'opt1', emoji: '✈️', label: 'Avion (Aripi late)', isCorrect: false },
      { id: 'opt2', emoji: '🚁', label: 'Elicopter (Elice)', isCorrect: false },
      { id: 'opt3', emoji: '🚀', label: 'Umbra Rachetei', isCorrect: true },
    ],
  },
  {
    id: 4,
    title: 'Nivelul 4: Fluturele Fermecat',
    subject: { emoji: '🦋', label: 'Fluturele Colorat' },
    prompt: 'Privește aripile fluturelui! Unde este umbra lui?',
    reason: 'Minunat! Antenuțele delicate și aripile duble confirmă umbra corectă!',
    options: [
      { id: 'opt1', emoji: '🐝', label: 'Albinuță', isCorrect: false },
      { id: 'opt2', emoji: '🦋', label: 'Umbra Fluturelui', isCorrect: true },
      { id: 'opt3', emoji: '🐞', label: 'Gărgăriță', isCorrect: false },
    ],
  },
  {
    id: 5,
    title: 'Nivelul 5: Gigantul Pădurii',
    subject: { emoji: '🐘', label: 'Elefănțelul Blând' },
    prompt: 'Unde se ascunde umbra cu trompă lungă?',
    reason: 'Extraordinar! Trompa lungă și urechile mari sunt inconfundabile!',
    options: [
      { id: 'opt1', emoji: '🦏', label: 'Rinocer (Corn)', isCorrect: false },
      { id: 'opt2', emoji: '🦛', label: 'Hipopotam', isCorrect: false },
      { id: 'opt3', emoji: '🐘', label: 'Umbra Elefantului', isCorrect: true },
    ],
  },
];

export const ShadowMatchGame = ({ audio, onBack, onComplete }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = LEVELS[levelIndex];

  const [selectedId, setSelectedId] = useState(null);
  const [solved, setSolved] = useState(false);
  const [scoreStars, setScoreStars] = useState(0);

  // Animations
  const subjectBounce = useRef(new Animated.Value(1)).current;
  const bannerScale = useRef(new Animated.Value(0)).current;
  const optWobbles = useRef({
    opt1: new Animated.Value(0),
    opt2: new Animated.Value(0),
    opt3: new Animated.Value(0),
  }).current;
  const optScales = useRef({
    opt1: new Animated.Value(1),
    opt2: new Animated.Value(1),
    opt3: new Animated.Value(1),
  }).current;

  useEffect(() => {
    // Play intro voice
    try {
      if (audio?.ws_shadow_intro) {
        audioMixer.playVoice(audio.ws_shadow_intro);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    // Reset state for new level
    setSelectedId(null);
    setSolved(false);
    bannerScale.setValue(0);
    Object.values(optWobbles).forEach((v) => v.setValue(0));
    Object.values(optScales).forEach((v) => v.setValue(1));

    // Gentle entrance bounce for the subject
    Animated.sequence([
      Animated.timing(subjectBounce, { toValue: 1.15, duration: 250, useNativeDriver: true }),
      Animated.spring(subjectBounce, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  }, [levelIndex]);

  const handleSelectOption = (opt) => {
    if (solved) return;

    if (Platform.OS === 'android') {
      Vibration.vibrate(30);
    }

    if (opt.isCorrect) {
      setSolved(true);
      setSelectedId(opt.id);
      setScoreStars((s) => s + 1);

      try {
        if (audio?.sfxChime) audioMixer.playSFX(audio.sfxChime);
        setTimeout(() => {
          if (audio?.ws_shadow_win) {
            audioMixer.playVoice(audio.ws_shadow_win);
          } else if (audio?.kodiAwesome) {
            audioMixer.playVoice(audio.kodiAwesome);
          }
        }, 300);
      } catch (e) {}

      // Spring winning option
      Animated.spring(optScales[opt.id], {
        toValue: 1.15,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Show win explanation banner
      Animated.spring(bannerScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();

      confetti({ particleCount: 85, spread: 75, origin: { y: 0.6 } });
    } else {
      // Incorrect
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 40, 30, 40]);
      }

      try {
        if (audio?.sfxIncorrect) audioMixer.playSFX(audio.sfxIncorrect);
        if (audio?.ws_try_again) audioMixer.playVoice(audio.ws_try_again);
      } catch (e) {}

      // Wobble incorrect card
      const wobble = optWobbles[opt.id] || new Animated.Value(0);
      Animated.sequence([
        Animated.timing(wobble, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 6, duration: 60, useNativeDriver: true }),
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
      if (audio?.ws_shadow_intro) audioMixer.playVoice(audio.ws_shadow_intro);
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
          <Text style={styles.headerTitle}>Găsește Umbra</Text>
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
          <Text style={styles.promptIcon}>👥</Text>
          <View style={styles.promptTextWrap}>
            <Text style={styles.promptTitle}>{currentLevel.prompt}</Text>
            <Text style={styles.promptSub}>
              Privește conturul personajului și găsește silueta identică!
            </Text>
          </View>
        </View>

        {/* FULL COLOR SUBJECT CARD */}
        <Animated.View style={[styles.subjectCard, { transform: [{ scale: subjectBounce }] }]}>
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectBadgeText}>MODEL ORIGINAL</Text>
          </View>
          <Text style={styles.subjectEmoji}>{currentLevel.subject.emoji}</Text>
          <Text style={styles.subjectLabel}>{currentLevel.subject.label}</Text>
        </Animated.View>

        {/* SHADOW OPTIONS ROW */}
        <Text style={styles.optionsTitle}>Alege Umbra Corectă:</Text>
        <View style={styles.optionsRow}>
          {currentLevel.options.map((opt) => {
            const isSelected = selectedId === opt.id;
            const wobble = optWobbles[opt.id] || 0;
            const scale = optScales[opt.id] || 1;

            return (
              <Animated.View
                key={opt.id}
                style={[
                  styles.optionWrapper,
                  { transform: [{ scale }, { translateX: wobble }] },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardWinning,
                    solved && !opt.isCorrect && styles.optionCardDimmed,
                  ]}
                  onPress={() => handleSelectOption(opt)}
                  activeOpacity={0.85}
                >
                  {/* Shadow silhouette: monochromatic dark gray with brightness drop */}
                  <View style={[styles.shadowSilhouetteWrap, isSelected && styles.shadowSilhouetteRevealed]}>
                    <Text
                      style={[
                        styles.silhouetteEmoji,
                        !isSelected && styles.silhouetteDarkened,
                      ]}
                    >
                      {opt.emoji}
                    </Text>
                  </View>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelWinning]}>
                    {isSelected ? '✓ Potrivire!' : 'Siluetă'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* REASON / WIN BANNER */}
        {solved && (
          <Animated.View style={[styles.winBanner, { transform: [{ scale: bannerScale }] }]}>
            <View style={styles.winHeader}>
              <Text style={styles.winEmoji}>🌟</Text>
              <Text style={styles.winTitle}>Formă Identificată!</Text>
            </View>
            <Text style={styles.winReasonText}>{currentLevel.reason}</Text>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNextLevel} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>
                {levelIndex < LEVELS.length - 1 ? 'Următoarea Siluetă ▶' : 'Misiune Încheiată! 🏆'}
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
  subjectCard: {
    width: '100%',
    maxWidth: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#63B3ED',
    shadowColor: '#3182CE',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  subjectBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  subjectBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2B6CB0',
  },
  subjectEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  subjectLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D3748',
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 480,
    marginBottom: 24,
  },
  optionWrapper: {
    flex: 1,
    maxWidth: 130,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  optionCardWinning: {
    borderColor: '#48BB78',
    backgroundColor: '#F0FFF4',
    borderWidth: 3,
  },
  optionCardDimmed: {
    opacity: 0.4,
  },
  shadowSilhouetteWrap: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shadowSilhouetteRevealed: {
    backgroundColor: '#EBF8FF',
  },
  silhouetteEmoji: {
    fontSize: 42,
  },
  silhouetteDarkened: {
    opacity: 0.25,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#718096',
    textAlign: 'center',
  },
  optionLabelWinning: {
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
