import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { audioMixer } from '../audio/index.js';
import confetti from '../utils/confetti';

const { width, height } = Dimensions.get('window');

const TARGET_ROUNDS = [
  { target: 'M', pool: ['M', 'A', 'M', 'O', 'M', 'E', 'M', 'U', 'M'], desc: 'Sparge bulele cu litera M' },
  { target: 'B', pool: ['B', 'P', 'B', 'D', 'B', 'A', 'B', 'E', 'B'], desc: 'Sparge bulele cu litera B' },
  { target: 'R', pool: ['R', 'P', 'R', 'B', 'R', 'I', 'R', 'O', 'R'], desc: 'Sparge bulele cu litera R' },
];

export const PhonicsBubblePopperGame = ({ onComplete, onBack }) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const currentRound = TARGET_ROUNDS[roundIdx];

  const [bubbles, setBubbles] = useState([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize bubbles
  useEffect(() => {
    try {
      audioMixer.playVoice(require('../../assets/audio/bubble_intro.mp3'));
    } catch (e) {}

    const initialBubbles = currentRound.pool.map((char, index) => {
      const isTarget = char === currentRound.target;
      return {
        id: `b_${roundIdx}_${index}_${char}`,
        char,
        isTarget,
        popped: false,
        x: 40 + (index % 3) * ((width - 80) / 3) + (Math.random() * 20 - 10),
        y: 60 + Math.floor(index / 3) * 110,
        size: 75 + (index % 3) * 6,
        color: isTarget ? '#4FC3F7' : '#81D4FA',
      };
    });
    setBubbles(initialBubbles);
    setPoppedCount(0);
    setIsCompleted(false);
  }, [roundIdx]);

  // Handle bubble tap
  const handleTapBubble = (bubble) => {
    if (bubble.popped) return;

    if (bubble.isTarget) {
      // Pop the bubble!
      try {
        audioMixer.playSFX(require('../../assets/audio/bubble_break.mp3'), 0.95);
      } catch (e) {
        audioMixer.playSFX(require('../../assets/audio/SFX_pop.mp3'), 0.9);
      }

      setBubbles((prev) =>
        prev.map((b) => (b.id === bubble.id ? { ...b, popped: true } : b))
      );

      const nextPopped = poppedCount + 1;
      setPoppedCount(nextPopped);

      // Check if all targets are popped (5 targets per round)
      const totalTargets = currentRound.pool.filter((c) => c === currentRound.target).length;
      if (nextPopped >= totalTargets) {
        setIsCompleted(true);
        try {
          audioMixer.playVoice(require('../../assets/audio/bubble_win.mp3'));
        } catch (e) {}

        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    } else {
      // Distractor clicked
      audioMixer.playSFX(require('../../assets/audio/SFX_whoosh.mp3'), 0.6);
    }
  };

  const handleNextRound = () => {
    if (roundIdx < TARGET_ROUNDS.length - 1) {
      setRoundIdx((prev) => prev + 1);
    } else {
      onComplete?.();
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>⬅️ Înapoi</Text>
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text style={styles.titleText}>🫧 Acvariul cu Bule Fonetice</Text>
          <Text style={styles.subtitleText}>{currentRound.desc}</Text>
        </View>
        <View style={styles.targetBadge}>
          <Text style={styles.targetBadgeLabel}>Ținta:</Text>
          <Text style={styles.targetBadgeChar}>{currentRound.target}</Text>
        </View>
      </View>

      {/* Underwater / Bubble Lagoon Stage */}
      <View style={styles.stage}>
        {/* Floating Soap Bubbles */}
        {bubbles.map((bubble) => {
          if (bubble.popped) {
            return (
              <View
                key={bubble.id}
                style={[
                  styles.poppedPlaceholder,
                  {
                    left: bubble.x,
                    top: bubble.y,
                    width: bubble.size,
                    height: bubble.size,
                  },
                ]}
              >
                <Text style={styles.poppedSparkle}>✨</Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={bubble.id}
              activeOpacity={0.8}
              onPress={() => handleTapBubble(bubble)}
              style={[
                styles.bubbleTouchable,
                {
                  left: bubble.x,
                  top: bubble.y,
                  width: bubble.size,
                  height: bubble.size,
                },
              ]}
            >
              <View
                style={[
                  styles.soapBubble,
                  {
                    width: bubble.size,
                    height: bubble.size,
                    borderRadius: bubble.size / 2,
                  },
                ]}
              >
                {/* Shiny Specular Bubble Highlight */}
                <View style={styles.bubbleHighlight} />
                <View style={styles.bubbleSmallHighlight} />
                <Text style={styles.bubbleChar}>{bubble.char}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Win Banner Overlay */}
        {isCompleted && (
          <View style={styles.winOverlay}>
            <View style={styles.winCard}>
              <Text style={styles.winEmoji}>🫧🎉</Text>
              <Text style={styles.winTitle}>Bravo! Toate bulele au pocnit!</Text>
              <Text style={styles.winSubtitle}>
                Ai recunoscut excelent sunetul și litera „{currentRound.target}”!
              </Text>
              <TouchableOpacity style={styles.nextBtn} onPress={handleNextRound}>
                <Text style={styles.nextBtnText}>
                  {roundIdx < TARGET_ROUNDS.length - 1
                    ? 'Următoarea Runda ➡️'
                    : '🎁 Deschide Cutia Cadou!'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#B2EBF2',
  },
  backBtnText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#00838F',
  },
  titleBox: {
    alignItems: 'center',
  },
  titleText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#006064',
  },
  subtitleText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 14,
    color: '#00838F',
    fontWeight: '600',
  },
  targetBadge: {
    backgroundColor: '#FFEB3B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FBC02D',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  targetBadgeLabel: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 13,
    fontWeight: '700',
    color: '#F57F17',
  },
  targetBadgeChar: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 22,
    fontWeight: '800',
    color: '#E65100',
  },
  stage: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#B2EBF2',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#4DD0E1',
    position: 'relative',
    overflow: 'hidden',
  },
  bubbleTouchable: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soapBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 4,
    boxShadow: '0 4px 12px rgba(0, 151, 167, 0.25)',
  },
  bubbleHighlight: {
    position: 'absolute',
    top: '12%',
    left: '16%',
    width: '28%',
    height: '24%',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    transform: [{ rotate: '-35deg' }],
  },
  bubbleSmallHighlight: {
    position: 'absolute',
    bottom: '16%',
    right: '18%',
    width: '12%',
    height: '12%',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  bubbleChar: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 34,
    fontWeight: '800',
    color: '#004D40',
  },
  poppedPlaceholder: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poppedSparkle: {
    fontSize: 26,
  },
  winOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 77, 64, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 99,
  },
  winCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4DD0E1',
    elevation: 8,
    maxWidth: 380,
  },
  winEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  winTitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 22,
    fontWeight: '700',
    color: '#006064',
    textAlign: 'center',
    marginBottom: 6,
  },
  winSubtitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 15,
    color: '#00838F',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '500',
  },
  nextBtn: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
  },
  nextBtnText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
