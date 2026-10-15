import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { audioMixer } from '../audio/index.js';
import confetti from '../utils/confetti';

const { width } = Dimensions.get('window');

const BLOCK_SIZE = Math.min(48, Math.floor((width - 64) / 11));

export const BaseTenRodsGame = ({ onComplete, onBack }) => {
  const [cubesInRod, setCubesInRod] = useState([]);
  const [remainingCubes, setRemainingCubes] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [isCompleted, setIsCompleted] = useState(false);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const rodScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Play intro teacher prompt
    try {
      audioMixer.playVoice(require('../../assets/audio/base_ten_intro.mp3'));
    } catch (e) {}
  }, []);

  // When all 10 cubes are placed
  useEffect(() => {
    if (cubesInRod.length === 10 && !isCompleted) {
      setIsCompleted(true);

      // Play iconic Khan Kids audio & Romanian praise
      try {
        audioMixer.playSFX(require('../../assets/audio/ten_blocks_make_one_rod.mp3'), 0.95);
      } catch (e) {}

      setTimeout(() => {
        try {
          audioMixer.playVoice(require('../../assets/audio/base_ten_win.mp3'));
        } catch (e) {}
      }, 1800);

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.55 },
      });

      // Rod pulse animation
      Animated.sequence([
        Animated.spring(rodScaleAnim, {
          toValue: 1.12,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(rodScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous golden glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [cubesInRod, isCompleted, glowAnim, rodScaleAnim]);

  // Handle adding cube to rod
  const handleAddCube = (cubeId) => {
    if (cubesInRod.length >= 10) return;

    audioMixer.playSFX(require('../../assets/audio/SFX_pop.mp3'), 0.8);
    setRemainingCubes((prev) => prev.filter((id) => id !== cubeId));
    setCubesInRod((prev) => [...prev, cubeId]);
  };

  // Reset to try again
  const handleReset = () => {
    setCubesInRod([]);
    setRemainingCubes([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    setIsCompleted(false);
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>⬅️ Înapoi</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>🧱 Bastonul celor 10 Cuburi (Base-Ten)</Text>
          <Text style={styles.headerSubtitle}>
            {cubesInRod.length} / 10 cuburi așezate
          </Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>🔄 Reia</Text>
        </TouchableOpacity>
      </View>

      {/* Main Playing Area */}
      <View style={styles.stage}>
        {/* Instruction Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {isCompleted
              ? '🎉 10 cuburi unite formează o bară de 10!'
              : '👉 Atinge sau trage cuburile galbene în bară pentru a forma o zece!'}
          </Text>
        </View>

        {/* The 10-Slot Base-Ten Rod Frame */}
        <Animated.View
          style={[
            styles.rodFrameWrapper,
            {
              transform: [{ scale: rodScaleAnim }],
            },
          ]}
        >
          <View style={[styles.rodFrame, isCompleted && styles.rodFrameCompleted]}>
            {[...Array(10)].map((_, index) => {
              const isFilled = index < cubesInRod.length;
              return (
                <View
                  key={`slot_${index}`}
                  style={[
                    styles.slot,
                    isFilled && styles.slotFilled,
                    isCompleted && styles.slotUnified,
                  ]}
                >
                  {isFilled && (
                    <View style={styles.unitCube}>
                      <View style={styles.cubeTopHighlight} />
                      <Text style={styles.slotNumber}>{index + 1}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <Text style={styles.rodLabel}>
            {isCompleted ? '⭐ 1 BARĂ = 10 UNITĂȚI ⭐' : 'Cadru pentru 10 cuburi'}
          </Text>
        </Animated.View>

        {/* Source Pool of Available Unit Cubes */}
        <View style={styles.poolSection}>
          <Text style={styles.poolTitle}>Cuburi disponibile ({remainingCubes.length}):</Text>
          <View style={styles.cubesGrid}>
            {remainingCubes.map((cubeId) => (
              <TouchableOpacity
                key={`avail_${cubeId}`}
                activeOpacity={0.7}
                onPress={() => handleAddCube(cubeId)}
                style={styles.unitCubeTouchable}
              >
                <View style={[styles.unitCube, styles.unitCubeInPool]}>
                  <View style={styles.cubeTopHighlight} />
                  <Text style={styles.poolCubeIcon}>🟡</Text>
                </View>
              </TouchableOpacity>
            ))}
            {remainingCubes.length === 0 && !isCompleted && (
              <Text style={styles.emptyPoolText}>Toate cuburile sunt în bară!</Text>
            )}
          </View>
        </View>

        {/* Win Action Bar */}
        {isCompleted && (
          <View style={styles.winBar}>
            <TouchableOpacity style={styles.winActionBtn} onPress={onComplete}>
              <Text style={styles.winActionText}>🎁 Deschide Cutia Cadou! 🎁</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 44 : 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
  },
  backBtnText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },
  resetBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#FFCCBC',
  },
  resetBtnText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#D84315',
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
  },
  headerSubtitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 14,
    color: '#388E3C',
    fontWeight: '600',
  },
  stage: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  banner: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#A5D6A7',
    elevation: 2,
    marginBottom: 10,
  },
  bannerText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
  },
  rodFrameWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  rodFrame: {
    flexDirection: 'row',
    backgroundColor: '#CFD8DC',
    padding: 6,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#90A4AE',
    elevation: 4,
  },
  rodFrameCompleted: {
    backgroundColor: '#FFF9C4',
    borderColor: '#FBC02D',
  },
  slot: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE * 1.6,
    borderWidth: 2,
    borderColor: '#B0BEC5',
    borderStyle: 'dashed',
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECEFF1',
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: '#FFA000',
    backgroundColor: '#FFE082',
  },
  slotUnified: {
    borderColor: '#FF8F00',
    backgroundColor: '#FFCA28',
    marginHorizontal: 0,
    borderRadius: 0,
  },
  unitCube: {
    width: BLOCK_SIZE - 6,
    height: BLOCK_SIZE * 1.5,
    backgroundColor: '#FFD54F',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFA000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 3,
  },
  unitCubeInPool: {
    elevation: 5,
  },
  cubeTopHighlight: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2,
  },
  slotNumber: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 16,
    fontWeight: '800',
    color: '#795548',
  },
  rodLabel: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  poolSection: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    alignItems: 'center',
    elevation: 3,
  },
  poolTitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#388E3C',
    marginBottom: 10,
  },
  cubesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  unitCubeTouchable: {
    padding: 4,
  },
  poolCubeIcon: {
    fontSize: 18,
  },
  emptyPoolText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '700',
    paddingVertical: 10,
  },
  winBar: {
    marginTop: 14,
    width: '100%',
    alignItems: 'center',
  },
  winActionBtn: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  winActionText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default BaseTenRodsGame;
