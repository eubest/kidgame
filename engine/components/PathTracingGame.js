import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { VectorPathTracingEngine, PATH_PRESETS } from '../tracing/index.js';
import { audioMixer } from '../audio/index.js';
import confetti from '../utils/confetti';

export const PathTracingGame = ({ audio, onBack }) => {
  const [selectedPresetKey, setSelectedPresetKey] = useState('letterA');
  const [stars, setStars] = useState(0);

  const activePreset = PATH_PRESETS[selectedPresetKey] || PATH_PRESETS.letterA;

  useEffect(() => {
    // Play trace intro audio
    if (audio?.traceIntro) {
      audioMixer.playVoice(audio.traceIntro, { duck: true });
    }
  }, []);

  const handleWaypointHit = (strokeIndex, waypointIndex) => {
    audioMixer.playSFX(audio?.sfxPop || null, 0.4);
  };

  const handleStrokeComplete = (strokeIndex) => {
    audioMixer.playSFX(audio?.sfxChime || null, 0.8);
  };

  const handlePathComplete = () => {
    setStars((s) => s + 3);
    audioMixer.playSFX(audio?.sfxRoyal || audio?.sfxBingo || null);
    audioMixer.playVoice(audio?.traceWin || audio?.kodiAwesome || null, { duck: true });
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  };

  const presetList = [
    { key: 'letterA', label: '🅰️ Litera A' },
    { key: 'letterB', label: '🅱️ Litera B' },
    { key: 'letterM', label: 'Ⓜ️ Litera M' },
    { key: 'letterO', label: '🅾️ Litera O' },
    { key: 'letterR', label: '🇷 Litera R' },
    { key: 'number1', label: '1️⃣ Cifra 1' },
    { key: 'number2', label: '2️⃣ Cifra 2' },
    { key: 'shapeCircle', label: '⭕ Cerc' },
    { key: 'shapeTriangle', label: '🔺 Triunghi' },
    { key: 'shapeStar', label: '⭐ Stea' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Atelier de Trasare Vectorială</Text>
          <View style={styles.starPill}>
            <Text style={styles.starText}>⭐ {stars}</Text>
          </View>
        </View>
        <Text style={styles.hint}>
          Urmează săgețile galbene și atinge punctele în ordine pentru a desena conturul!
        </Text>
      </View>

      {/* Preset Selector */}
      <View style={styles.selectorWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorList}>
          {presetList.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.presetTab, selectedPresetKey === item.key && styles.presetTabActive]}
              onPress={() => {
                audioMixer.playSFX(audio?.sfxButton || null);
                setSelectedPresetKey(item.key);
              }}
            >
              <Text style={[styles.presetTabText, selectedPresetKey === item.key && styles.presetTabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tracing Canvas */}
      <View style={styles.canvasWrapper}>
        <VectorPathTracingEngine
          key={selectedPresetKey}
          pathData={activePreset}
          width={340}
          height={340}
          waypointRadius={38}
          trackWidth={34}
          onWaypointHit={handleWaypointHit}
          onStrokeComplete={handleStrokeComplete}
          onPathComplete={handlePathComplete}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2F3542',
  },
  starPill: {
    backgroundColor: '#FFF2CC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFA502',
  },
  starText: {
    fontWeight: '800',
    color: '#D48806',
    fontSize: 14,
  },
  hint: {
    fontSize: 14,
    color: '#747D8C',
    marginTop: 4,
    textAlign: 'center',
  },
  selectorWrapper: {
    width: '100%',
    marginVertical: 12,
  },
  selectorList: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  presetTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DFE4EA',
  },
  presetTabActive: {
    backgroundColor: '#FFA502',
    borderColor: '#FFA502',
  },
  presetTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#57606F',
  },
  presetTabTextActive: {
    color: '#FFFFFF',
  },
  canvasWrapper: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
