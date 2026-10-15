import React, { useState, useRef } from 'react';
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
import { AndroidHaptics } from '../native/AndroidHaptics.js';
import { RainbowPianoGradient } from './GameGradients.js';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NOTES = [
  { id: 'do1', name: 'DO', pitch: 'C', color: '#FF4757', emoji: '🔴' },
  { id: 're', name: 'RE', pitch: 'D', color: '#FF7F50', emoji: '🟠' },
  { id: 'mi', name: 'MI', pitch: 'E', color: '#FFA502', emoji: '🟡' },
  { id: 'fa', name: 'FA', pitch: 'F', color: '#2ED573', emoji: '🟢' },
  { id: 'sol', name: 'SOL', pitch: 'G', color: '#1E90FF', emoji: '🔵' },
  { id: 'la', name: 'LA', pitch: 'A', color: '#5352ED', emoji: '🟣' },
  { id: 'si', name: 'SI', pitch: 'B', color: '#845EC2', emoji: '🟪' },
  { id: 'do2', name: 'DO²', pitch: 'C5', color: '#FF6B81', emoji: '🔴' },
];

const INSTRUMENTS = [
  { id: 'xylophone', name: 'Xilofon', icon: '🎶', soundKey: 'instXylophone', color: '#FFA502' },
  { id: 'piano', name: 'Pian', icon: '🎹', soundKey: 'instPiano', color: '#3182CE' },
  { id: 'drum', name: 'Tobă', icon: '🥁', soundKey: 'instDrum', color: '#E53E3E' },
  { id: 'trumpet', name: 'Trompetă', icon: '🎺', soundKey: 'instTrumpet', color: '#805AD5' },
  { id: 'cowbell', name: 'Clopoțel', icon: '🔔', soundKey: 'instCowbell', color: '#38A169' },
];

export const MusicalSoundboxStudio = ({ audio, onBack, onComplete }) => {
  const [selectedInst, setSelectedInst] = useState(INSTRUMENTS[0]);
  const [activeKeyId, setActiveKeyId] = useState(null);
  const [songMode, setSongMode] = useState(false);
  const [songStep, setSongStep] = useState(0);
  const [scoreStars, setScoreStars] = useState(0);

  // Target song: DO - MI - SOL - DO²
  const TARGET_SONG = ['do1', 'mi', 'sol', 'do2'];

  // Animations for key presses
  const keyScales = useRef(
    NOTES.reduce((acc, n) => {
      acc[n.id] = new Animated.Value(1);
      return acc;
    }, {})
  ).current;

  const handleKeyPress = (note) => {
    // Native Android haptic feedback tuned to pitch
    const noteIndex = NOTES.findIndex((n) => n.id === note.id);
    AndroidHaptics.pianoKey(noteIndex >= 0 ? noteIndex : 0);

    setActiveKeyId(note.id);

    // Play selected instrument audio
    try {
      const soundSrc = audio?.[selectedInst.soundKey] || audio?.instXylophone;
      if (soundSrc) audioMixer.playSFX(soundSrc);
    } catch (e) {}

    // Bounce key animation
    Animated.sequence([
      Animated.timing(keyScales[note.id], { toValue: 0.9, duration: 60, useNativeDriver: true }),
      Animated.spring(keyScales[note.id], { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start(() => setActiveKeyId(null));

    // Handle song mode step matching
    if (songMode) {
      if (note.id === TARGET_SONG[songStep]) {
        const nextStep = songStep + 1;
        setSongStep(nextStep);

        if (nextStep === TARGET_SONG.length) {
          // Song completed!
          AndroidHaptics.celebration();
          setScoreStars((s) => s + 2);
          confetti({ particleCount: 100, spread: 85, origin: { y: 0.6 } });
          try {
            if (audio?.kodiAwesome) audioMixer.playVoice(audio.kodiAwesome);
            if (audio?.sfxRoyal) audioMixer.playSFX(audio.sfxRoyal);
          } catch (e) {}
          setTimeout(() => {
            setSongMode(false);
            setSongStep(0);
          }, 1800);
        } else {
          AndroidHaptics.success();
        }
      } else {
        // Wrong note in song mode: restart melody
        AndroidHaptics.warning();
        setSongStep(0);
        try {
          if (audio?.sfxIncorrect) audioMixer.playSFX(audio.sfxIncorrect);
        } catch (e) {}
      }
    }
  };

  const startSongChallenge = () => {
    AndroidHaptics.tap();
    setSongMode(true);
    setSongStep(0);
    try {
      if (audio?.sfxButton) audioMixer.playSFX(audio.sfxButton);
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
          <Text style={styles.headerTitle}>Studioul Muzical</Text>
          <Text style={styles.headerSubtitle}>
            {songMode ? 'Cântă după Sandy: Pasul ' + (songStep + 1) + '/4' : 'Joacă Liberă cu Sunete'}
          </Text>
        </View>

        <View style={styles.starsPill}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.starText}>{scoreStars}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* MASCOT INTRO BANNER */}
        <View style={styles.mascotBanner}>
          <Text style={styles.mascotIcon}>🦊</Text>
          <View style={styles.mascotTextWrap}>
            <Text style={styles.mascotTitle}>Bun venit în Studioul lui Sandy!</Text>
            <Text style={styles.mascotSub}>
              Alege instrumentul preferat și compune melodii vesele pe clapele colorate!
            </Text>
          </View>
        </View>

        {/* INSTRUMENT SWITCHER ROW */}
        <Text style={styles.sectionTitle}>Alege Instrumentul:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.instrumentsRow}
        >
          {INSTRUMENTS.map((inst) => {
            const isSelected = selectedInst.id === inst.id;
            return (
              <TouchableOpacity
                key={inst.id}
                style={[
                  styles.instrumentBtn,
                  isSelected && { backgroundColor: inst.color, borderColor: inst.color },
                ]}
                onPress={() => {
                  AndroidHaptics.selectionClick();
                  setSelectedInst(inst);
                  try {
                    const soundSrc = audio?.[inst.soundKey];
                    if (soundSrc) audioMixer.playSFX(soundSrc);
                  } catch (e) {}
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.instrumentIcon}>{inst.icon}</Text>
                <Text style={[styles.instrumentLabel, isSelected && styles.instrumentLabelActive]}>
                  {inst.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SONG CHALLENGE CTA */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeLeft}>
            <Text style={styles.challengeBadge}>PROVOCARE</Text>
            <Text style={styles.challengeTitle}>
              {songMode
                ? 'Apasă nota: ' + NOTES.find((n) => n.id === TARGET_SONG[songStep])?.name
                : 'Cântă după Sandy: 4 Note Magice'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.challengeBtn, songMode && styles.challengeBtnActive]}
            onPress={startSongChallenge}
            activeOpacity={0.8}
          >
            <Text style={styles.challengeBtnText}>{songMode ? '🔄 Reia' : '🎵 Start'}</Text>
          </TouchableOpacity>
        </View>

        {/* 8 COLORFUL KEYBOARD BARS (XYLOPHONE / PIANO KEYS) */}
        <Text style={styles.sectionTitle}>Clapele Muzicale:</Text>
        <View style={styles.keysContainer}>
          {NOTES.map((note, index) => {
            const isHighlighted = songMode && TARGET_SONG[songStep] === note.id;
            const keyHeight = 130 + index * 10; // Stepped xylophone bar lengths

            return (
              <Animated.View
                key={note.id}
                style={[
                  styles.keyWrapper,
                  { transform: [{ scale: keyScales[note.id] || 1 }] },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleKeyPress(note)}
                  activeOpacity={0.85}
                >
                  <RainbowPianoGradient
                    noteIndex={index}
                    style={[
                      styles.keyBar,
                      { height: keyHeight },
                      isHighlighted && styles.keyBarHighlighted,
                    ]}
                  >
                    <View style={styles.keyPeg} />
                    <Text style={styles.keyNoteName}>{note.name}</Text>
                    <Text style={styles.keyPitch}>{note.pitch}</Text>
                    <View style={styles.keyPeg} />
                  </RainbowPianoGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
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
    paddingTop: Platform.OS === 'android' ? 44 : 12,
    paddingBottom: 12,
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
  mascotBanner: {
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
  mascotIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  mascotTextWrap: {
    flex: 1,
  },
  mascotTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
  },
  mascotSub: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 10,
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 480,
  },
  instrumentsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 6,
    marginBottom: 16,
  },
  instrumentBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minWidth: 80,
  },
  instrumentIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  instrumentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5568',
  },
  instrumentLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF8FF',
    borderRadius: 20,
    padding: 14,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1.5,
    borderColor: '#90CDF4',
    marginBottom: 20,
  },
  challengeLeft: {
    flex: 1,
  },
  challengeBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2B6CB0',
    marginBottom: 2,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2B6CB0',
  },
  challengeBtn: {
    backgroundColor: '#3182CE',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
  },
  challengeBtnActive: {
    backgroundColor: '#E53E3E',
  },
  challengeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  keysContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 480,
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  keyWrapper: {
    flex: 1,
  },
  keyBar: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  keyBarHighlighted: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#ECC94B',
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  keyPeg: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  keyNoteName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  keyPitch: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
