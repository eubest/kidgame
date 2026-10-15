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
  Vibration,
} from 'react-native';
import { audioMixer } from '../audio/index.js';
import confetti from '../utils/confetti';

const { width } = Dimensions.get('window');

const BALANCE_PUZZLES = [
  {
    id: 'p1',
    title: 'Echilibrează Pepenele Mare',
    desc: 'Un pepene verde cântărește cât 3 mere roșii. Pune merele pe taler!',
    leftItems: [{ id: 'w1', emoji: '🍉', name: 'Pepene Verde', weight: 3 }],
    rightInitial: [],
    targetWeight: 3,
    shelfItems: [
      { id: 's_apple', emoji: '🍎', name: 'Măr', weight: 1 },
      { id: 's_banana', emoji: '🍌', name: 'Banană', weight: 2 },
    ],
  },
  {
    id: 'p2',
    title: 'Ursulețul Kodi pe Cântar',
    desc: 'Ursulețul Kodi are greutatea a 2 iepurași isteți. Echilibrează balanța!',
    leftItems: [{ id: 'k1', emoji: '🐻', name: 'Ursulețul Kodi', weight: 4 }],
    rightInitial: [{ id: 'r_init', emoji: '🐰', name: 'Iepuraș', weight: 2 }],
    targetWeight: 4,
    shelfItems: [
      { id: 's_bunny', emoji: '🐰', name: 'Iepuraș', weight: 2 },
      { id: 's_carrot', emoji: '🥕', name: 'Morcov', weight: 1 },
    ],
  },
  {
    id: 'p3',
    title: 'Fructele Fermecate',
    desc: '2 Ananași aurii (greutate 3 fiecare = 6). Găsește combinația potrivită!',
    leftItems: [
      { id: 'an1', emoji: '🍍', name: 'Ananas', weight: 3 },
      { id: 'an2', emoji: '🍍', name: 'Ananas', weight: 3 },
    ],
    rightInitial: [],
    targetWeight: 6,
    shelfItems: [
      { id: 's_banana2', emoji: '🍌', name: 'Banană', weight: 2 },
      { id: 's_orange', emoji: '🍊', name: 'Portocală', weight: 1 },
      { id: 's_strawberry', emoji: '🍓', name: 'Căpșună', weight: 1 },
    ],
  },
  {
    id: 'p4',
    title: 'Misiunea Spațială a Rachetei',
    desc: 'Racheta cosmică are masa 5. Pune steluțe și sateliți pentru echilibru!',
    leftItems: [{ id: 'rk1', emoji: '🚀', name: 'Rachetă', weight: 5 }],
    rightInitial: [],
    targetWeight: 5,
    shelfItems: [
      { id: 's_star', emoji: '⭐', name: 'Steluță', weight: 2 },
      { id: 's_sat', emoji: '🛰️', name: 'Satelit', weight: 1 },
      { id: 's_planet', emoji: '🪐', name: 'Planetă', weight: 3 },
    ],
  },
  {
    id: 'p5',
    title: 'Ferma Veselă a Văcuței',
    desc: 'Văcuța Milka are masa 6! Pune oițe și purceluși pe celălalt taler!',
    leftItems: [{ id: 'cow1', emoji: '🐮', name: 'Văcuță', weight: 6 }],
    rightInitial: [{ id: 'pig_init', emoji: '🐷', name: 'Purceluș', weight: 2 }],
    targetWeight: 6,
    shelfItems: [
      { id: 's_sheep', emoji: '🐑', name: 'Oiță', weight: 2 },
      { id: 's_chick', emoji: '🐥', name: 'Puișor', weight: 1 },
      { id: 's_pig', emoji: '🐷', name: 'Purceluș', weight: 2 },
    ],
  },
];

export const LogicBalanceScaleGame = ({ onComplete, onBack }) => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const currentPuzzle = BALANCE_PUZZLES[puzzleIdx];

  const [rightPanItems, setRightPanItems] = useState(currentPuzzle.rightInitial);
  const [isBalanced, setIsBalanced] = useState(false);

  // Tilt animation value (-15 to +15 deg)
  const beamTilt = useRef(new Animated.Value(-12)).current;
  const needleTilt = useRef(new Animated.Value(-15)).current;

  // Calculate current weights
  const leftWeight = currentPuzzle.leftItems.reduce((sum, item) => sum + item.weight, 0);
  const rightWeight = rightPanItems.reduce((sum, item) => sum + item.weight, 0);

  useEffect(() => {
    // Reset on puzzle change
    setRightPanItems(currentPuzzle.rightInitial);
    setIsBalanced(false);

    try {
      if (puzzleIdx === 0) {
        audioMixer.playVoice(require('../../assets/audio/balance_intro.mp3'));
      }
    } catch (e) {}
  }, [puzzleIdx]);

  useEffect(() => {
    // Update beam tilt according to mass delta
    const delta = rightWeight - leftWeight; // negative if left is heavier, positive if right is heavier
    let targetAngle = 0;
    if (delta < 0) {
      targetAngle = Math.max(-14, delta * 4);
    } else if (delta > 0) {
      targetAngle = Math.min(14, delta * 4);
    } else {
      targetAngle = 0;
    }

    Animated.parallel([
      Animated.spring(beamTilt, {
        toValue: targetAngle,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(needleTilt, {
        toValue: targetAngle * 1.5,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Check balance
    if (rightWeight === leftWeight && rightPanItems.length > 0 && !isBalanced) {
      setIsBalanced(true);
      try {
        Vibration.vibrate([0, 50, 40, 50]);
        audioMixer.playSFX(require('../../assets/audio/correct_chime.mp3'), 0.85);
        audioMixer.playSFX(require('../../assets/audio/BingoSuccessfulLineFIll.mp3'), 0.9);
        audioMixer.playVoice(require('../../assets/audio/balance_win.mp3'));
      } catch (e) {}
      confetti({ particleCount: 120, spread: 85, origin: { y: 0.55 } });
    }
  }, [rightWeight, leftWeight]);

  // Add item to right pan
  const handleAddItem = (item) => {
    if (isBalanced) return;

    try {
      Vibration.vibrate(25);
      audioMixer.playSFX(require('../../assets/audio/SFX_pop.mp3'), 0.7);
    } catch (e) {}

    const newItem = { ...item, uid: `${item.id}_${Date.now()}` };
    setRightPanItems((prev) => [...prev, newItem]);
  };

  // Remove item from right pan
  const handleRemoveItem = (index) => {
    if (isBalanced) return;

    try {
      Vibration.vibrate(20);
      audioMixer.playSFX(require('../../assets/audio/SFX_squish.mp3'), 0.6);
    } catch (e) {}

    setRightPanItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNextPuzzle = () => {
    if (puzzleIdx < BALANCE_PUZZLES.length - 1) {
      setPuzzleIdx((prev) => prev + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>← Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={styles.gameTitle}>⚖️ Cântarul Echilibrat (Balanța LogicLike)</Text>
          <Text style={styles.gameSubtitle}>
            Nivelul {puzzleIdx + 1} / {BALANCE_PUZZLES.length}: {currentPuzzle.title}
          </Text>
        </View>

        <View style={styles.statusPill}>
          <Text style={[styles.statusText, isBalanced && { color: '#2ED573' }]}>
            {isBalanced ? '✓ Echilibrat!' : '⚖️ Cântărește'}
          </Text>
        </View>
      </View>

      {/* 2. SCALE VISUAL ARENA */}
      <View style={styles.scaleArena}>
        {/* Needle Gauge / Pointer */}
        <View style={styles.gaugeCenter}>
          <View style={styles.gaugeArc}>
            <View style={[styles.gaugeCenterDot, isBalanced && styles.gaugeCenterDotBalanced]} />
            <Animated.View
              style={[
                styles.gaugeNeedle,
                {
                  transform: [
                    {
                      rotate: needleTilt.interpolate({
                        inputRange: [-20, 20],
                        outputRange: ['-25deg', '25deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.needleTip, isBalanced && { backgroundColor: '#2ED573' }]} />
            </Animated.View>
          </View>
        </View>

        {/* Central Fulcrum Stand */}
        <View style={styles.fulcrumStand}>
          <View style={styles.fulcrumTriangle} />
          <View style={styles.fulcrumBase} />
        </View>

        {/* Tilting Balance Beam */}
        <Animated.View
          style={[
            styles.balanceBeam,
            {
              transform: [
                {
                  rotate: beamTilt.interpolate({
                    inputRange: [-15, 15],
                    outputRange: ['-15deg', '15deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Left Pan Assembly */}
          <View style={styles.panAssemblyLeft}>
            <View style={styles.panRopes} />
            <View style={styles.panPlate}>
              {currentPuzzle.leftItems.map((item, idx) => (
                <View key={idx} style={styles.panItemBadge}>
                  <Text style={styles.panItemEmoji}>{item.emoji}</Text>
                  <Text style={styles.weightBadge}>+{item.weight}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Right Pan Assembly */}
          <View style={styles.panAssemblyRight}>
            <View style={styles.panRopes} />
            <View style={[styles.panPlate, styles.panPlateInteractive]}>
              {rightPanItems.length === 0 ? (
                <Text style={styles.emptyPanHint}>Pune greutăți aici 👇</Text>
              ) : (
                rightPanItems.map((item, idx) => (
                  <TouchableOpacity
                    key={item.uid || idx}
                    style={styles.panItemBadge}
                    onPress={() => handleRemoveItem(idx)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.panItemEmoji}>{item.emoji}</Text>
                    <Text style={styles.weightBadge}>+{item.weight}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </Animated.View>
      </View>

      {/* 3. ITEM SHELF / INVENTORY */}
      <View style={styles.shelfContainer}>
        <View style={styles.shelfHeader}>
          <Text style={styles.shelfTitle}>Alege greutăți pentru a echilibra balanța:</Text>
          {rightPanItems.length > 0 && !isBalanced && (
            <TouchableOpacity
              style={styles.clearPanBtn}
              onPress={() => setRightPanItems([])}
            >
              <Text style={styles.clearPanText}>Golește Talerul 🧹</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.shelfItemsRow}>
          {currentPuzzle.shelfItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.shelfItemCard}
              onPress={() => handleAddItem(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.shelfItemEmoji}>{item.emoji}</Text>
              <Text style={styles.shelfItemName}>{item.name}</Text>
              <View style={styles.shelfWeightPill}>
                <Text style={styles.shelfWeightText}>Masa: {item.weight}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4. WIN MODAL */}
      {isBalanced && (
        <View style={styles.winOverlay}>
          <View style={styles.winCard}>
            <Text style={{ fontSize: 60, marginBottom: 12 }}>🎉</Text>
            <Text style={styles.winTitle}>Echilibru Perfect!</Text>
            <Text style={styles.winSubtitle}>
              Ai rezolvat puzzle-ul! Ambele talere au acum exact aceeași greutate ({leftWeight}).
            </Text>

            <TouchableOpacity style={styles.winBtn} onPress={handleNextPuzzle}>
              <Text style={styles.winBtnText}>
                {puzzleIdx < BALANCE_PUZZLES.length - 1 ? 'Următoarea Balanță ➔' : 'Revendică Comoara! 🎁'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F2F6',
    fontFamily: 'Fredoka, sans-serif',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 44 : 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#DFE4EA',
    zIndex: 100,
  },
  backBtn: {
    backgroundColor: '#F1F2F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  backBtnText: {
    color: '#2F3542',
    fontSize: 16,
    fontWeight: '700',
  },
  titleWrap: {
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2F3542',
  },
  gameSubtitle: {
    fontSize: 13,
    color: '#747D8C',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#F1F2F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#747D8C',
  },
  scaleArena: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeCenter: {
    position: 'absolute',
    top: 30,
    alignItems: 'center',
  },
  gaugeArc: {
    width: 90,
    height: 45,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    borderWidth: 4,
    borderColor: '#CED6E0',
    borderBottomWidth: 0,
    alignItems: 'center',
    position: 'relative',
  },
  gaugeCenterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF4757',
    position: 'absolute',
    bottom: -7,
  },
  gaugeCenterDotBalanced: {
    backgroundColor: '#2ED573',
  },
  gaugeNeedle: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 42,
    alignItems: 'center',
    transformOrigin: 'bottom center',
  },
  needleTip: {
    width: 4,
    height: 38,
    backgroundColor: '#FF4757',
    borderRadius: 2,
  },
  fulcrumStand: {
    position: 'absolute',
    bottom: 90,
    alignItems: 'center',
    zIndex: 10,
  },
  fulcrumTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 32,
    borderRightWidth: 32,
    borderBottomWidth: 100,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#747D8C',
  },
  fulcrumBase: {
    width: 130,
    height: 18,
    backgroundColor: '#2F3542',
    borderRadius: 9,
  },
  balanceBeam: {
    width: Math.min(width * 0.62, 480),
    height: 16,
    backgroundColor: '#FF9F43',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EE5253',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
    marginTop: -40,
  },
  panAssemblyLeft: {
    position: 'absolute',
    left: -15,
    top: 10,
    alignItems: 'center',
  },
  panAssemblyRight: {
    position: 'absolute',
    right: -15,
    top: 10,
    alignItems: 'center',
  },
  panRopes: {
    width: 2,
    height: 60,
    backgroundColor: '#747D8C',
  },
  panPlate: {
    width: Math.min(width * 0.36, 140),
    minHeight: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#CED6E0',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  panPlateInteractive: {
    borderColor: '#1E90FF',
    backgroundColor: '#F8FBFF',
  },
  emptyPanHint: {
    fontSize: 13,
    color: '#747D8C',
    fontWeight: '700',
  },
  panItemBadge: {
    alignItems: 'center',
    margin: 4,
  },
  panItemEmoji: {
    fontSize: 32,
  },
  weightBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#747D8C',
  },
  shelfContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: '#DFE4EA',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  shelfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shelfTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F3542',
  },
  clearPanBtn: {
    backgroundColor: '#FFEAA7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearPanText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D63031',
  },
  shelfItemsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shelfItemCard: {
    backgroundColor: '#F1F2F6',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    marginHorizontal: 12,
    borderWidth: 2,
    borderColor: '#DFE4EA',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  shelfItemEmoji: {
    fontSize: 38,
    marginBottom: 4,
  },
  shelfItemName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2F3542',
  },
  shelfWeightPill: {
    backgroundColor: '#E4E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  shelfWeightText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#57606F',
  },
  winOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  winCard: {
    backgroundColor: '#FFFFFF',
    width: Math.min(width * 0.85, 460),
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  winTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2F3542',
    marginBottom: 8,
  },
  winSubtitle: {
    fontSize: 16,
    color: '#57606F',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  winBtn: {
    backgroundColor: '#2ED573',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: '#2ED573',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  winBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default LogicBalanceScaleGame;
