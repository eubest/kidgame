import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  Vibration,
  ScrollView,
} from 'react-native';
import { audioMixer } from '../audio/index.js';
import confetti from '../utils/confetti';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 1. THEMED CARD DECKS
const THEMES = [
  {
    id: 'animals',
    label: '🐾 Animăluțe',
    color: '#10AC84',
    bg: '#EAF8F4',
    items: [
      { id: 'bear', emoji: '🐻', name: 'Ursuleț' },
      { id: 'fox', emoji: '🦊', name: 'Vulpiță' },
      { id: 'bunny', emoji: '🐰', name: 'Iepuraș' },
      { id: 'penguin', emoji: '🐧', name: 'Pinguin' },
      { id: 'dog', emoji: '🐶', name: 'Cățeluș' },
      { id: 'cat', emoji: '🐱', name: 'Pisicuță' },
      { id: 'lion', emoji: '🦁', name: 'Leul Rege' },
      { id: 'koala', emoji: '🐨', name: 'Koala' },
    ],
  },
  {
    id: 'fruits',
    label: '🍓 Fructe',
    color: '#FF6B6B',
    bg: '#FFE8E8',
    items: [
      { id: 'strawberry', emoji: '🍓', name: 'Căpșună' },
      { id: 'banana', emoji: '🍌', name: 'Banană' },
      { id: 'watermelon', emoji: '🍉', name: 'Pepene' },
      { id: 'apple', emoji: '🍎', name: 'Măr Dulce' },
      { id: 'orange', emoji: '🍊', name: 'Portocală' },
      { id: 'cherries', emoji: '🍒', name: 'Cireșe' },
      { id: 'pineapple', emoji: '🍍', name: 'Ananas' },
      { id: 'grapes', emoji: '🍇', name: 'Strugure' },
    ],
  },
  {
    id: 'vehicles',
    label: '🚀 Vehicule',
    color: '#0984E3',
    bg: '#EBF5FB',
    items: [
      { id: 'rocket', emoji: '🚀', name: 'Rachetă' },
      { id: 'train', emoji: '🚂', name: 'Trenuleț' },
      { id: 'helicopter', emoji: '🚁', name: 'Elicopter' },
      { id: 'car', emoji: '🚗', name: 'Mașinuță' },
      { id: 'airplane', emoji: '✈️', name: 'Avion' },
      { id: 'ship', emoji: '🚢', name: 'Vaporaș' },
      { id: 'tractor', emoji: '🚜', name: 'Tractor' },
      { id: 'bike', emoji: '🚲', name: 'Bicicletă' },
    ],
  },
];

const DIFFICULTY_LEVELS = [
  { id: 2, label: '2 Perechi', pairs: 2, cols: 2, cardWidthRatio: 0.4 },
  { id: 3, label: '3 Perechi', pairs: 3, cols: 3, cardWidthRatio: 0.28 },
  { id: 4, label: '4 Perechi', pairs: 4, cols: 4, cardWidthRatio: 0.21 },
  { id: 6, label: '6 Perechi', pairs: 6, cols: 4, cardWidthRatio: 0.21 },
];

export const MemoryPairsGame = ({ onComplete, onBack }) => {
  const [themeIdx, setThemeIdx] = useState(0);
  const [diffIdx, setDiffIdx] = useState(1); // default 3 pairs (6 cards)
  const currentTheme = THEMES[themeIdx];
  const currentDiff = DIFFICULTY_LEVELS[diffIdx];

  const [cards, setCards] = useState([]);
  const [flippedUids, setFlippedUids] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);

  // Card Flip Animations state
  const flipAnims = useRef({}).current;
  const scaleAnims = useRef({}).current;

  // Initialize deck
  const initGame = (theme = currentTheme, diff = currentDiff) => {
    // Select required number of items
    const selectedItems = [...theme.items].sort(() => 0.5 - Math.random()).slice(0, diff.pairs);

    // Duplicate each item to create pairs
    const deck = [];
    selectedItems.forEach((item) => {
      deck.push({ ...item, uid: `${item.id}_a_${Date.now()}_${Math.random()}` });
      deck.push({ ...item, uid: `${item.id}_b_${Date.now()}_${Math.random()}` });
    });

    // Shuffle deck
    deck.sort(() => 0.5 - Math.random());

    // Reset animations
    deck.forEach((c) => {
      flipAnims[c.uid] = new Animated.Value(0);
      scaleAnims[c.uid] = new Animated.Value(1);
    });

    setCards(deck);
    setFlippedUids([]);
    setMatchedIds([]);
    setAttempts(0);
    setIsLocked(false);
    setIsGameWon(false);

    try {
      audioMixer.playSFX(require('../../assets/audio/SFX_whoosh.mp3'), 0.5);
    } catch (e) {}
  };

  useEffect(() => {
    initGame(currentTheme, currentDiff);
  }, [themeIdx, diffIdx]);

  // Card Tap Handler
  const handleCardPress = (card) => {
    if (isLocked) return;
    if (flippedUids.includes(card.uid)) return;
    if (matchedIds.includes(card.id)) return;

    // Haptic feedback
    try {
      if (Platform.OS === 'android') Vibration.vibrate(15);
      audioMixer.playSFX(require('../../assets/audio/SFX_pop.mp3'), 0.7);
    } catch (e) {}

    // Animate flip open (0 -> 180)
    if (flipAnims[card.uid]) {
      Animated.timing(flipAnims[card.uid], {
        toValue: 180,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }

    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    // If 2 cards are now open
    if (nextFlipped.length === 2) {
      setIsLocked(true);
      setAttempts((prev) => prev + 1);

      const firstCard = cards.find((c) => c.uid === nextFlipped[0]);
      const secondCard = card;

      if (firstCard.id === secondCard.id) {
        // MATCH!
        setTimeout(() => {
          try {
            if (Platform.OS === 'android') Vibration.vibrate([0, 30, 40, 30]);
            audioMixer.playSFX(require('../../assets/audio/correct_chime.mp3'), 0.85);
            audioMixer.playSFX(require('../../assets/audio/BingoSuccessfulLineFIll.mp3'), 0.7);
          } catch (e) {}

          // Bounce both cards
          Animated.parallel([
            Animated.sequence([
              Animated.spring(scaleAnims[firstCard.uid], { toValue: 1.15, friction: 4, useNativeDriver: true }),
              Animated.spring(scaleAnims[firstCard.uid], { toValue: 1, friction: 5, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.spring(scaleAnims[secondCard.uid], { toValue: 1.15, friction: 4, useNativeDriver: true }),
              Animated.spring(scaleAnims[secondCard.uid], { toValue: 1, friction: 5, useNativeDriver: true }),
            ]),
          ]).start();

          const newMatches = [...matchedIds, firstCard.id];
          setMatchedIds(newMatches);
          setFlippedUids([]);
          setIsLocked(false);

          // Check if all pairs are found
          if (newMatches.length === currentDiff.pairs) {
            setIsGameWon(true);
            try {
              if (Platform.OS === 'android') Vibration.vibrate([0, 60, 50, 80]);
              audioMixer.playSFX(require('../../assets/audio/SFX_royal.mp3'), 0.9);
              audioMixer.playVoice(require('../../assets/audio/ws_super.mp3'));
            } catch (e) {}
            confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
          }
        }, 300);
      } else {
        // MISMATCH
        setTimeout(() => {
          try {
            if (Platform.OS === 'android') Vibration.vibrate(40);
            audioMixer.playSFX(require('../../assets/audio/SFX_squish.mp3'), 0.5);
          } catch (e) {}

          // Animate both back to 0
          Animated.parallel([
            Animated.timing(flipAnims[firstCard.uid], {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(flipAnims[secondCard.uid], {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setFlippedUids([]);
            setIsLocked(false);
          });
        }, 850);
      }
    }
  };

  // Card dimensions based on screen width
  const cardWidth = Math.min((SCREEN_WIDTH - 48) / currentDiff.cols - 12, 120);
  const cardHeight = cardWidth * 1.25;

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>← Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={styles.gameTitle}>🃏 Cartonașele Magice (Perechi)</Text>
          <Text style={styles.gameSubtitle}>
            Găsite: {matchedIds.length} / {currentDiff.pairs} perechi • Încercări: {attempts}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => initGame(currentTheme, currentDiff)}
          activeOpacity={0.8}
        >
          <Text style={styles.refreshBtnText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. THEME & DIFFICULTY SELECTOR */}
        <View style={styles.controlRow}>
          {/* Themes */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {THEMES.map((theme, idx) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.chipBtn,
                  themeIdx === idx && { backgroundColor: theme.color, borderColor: theme.color },
                ]}
                onPress={() => setThemeIdx(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, themeIdx === idx && { color: '#FFFFFF', fontWeight: '800' }]}>
                  {theme.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Difficulty pills */}
        <View style={styles.diffRow}>
          {DIFFICULTY_LEVELS.map((diff, idx) => (
            <TouchableOpacity
              key={diff.id}
              style={[
                styles.diffBtn,
                diffIdx === idx && styles.diffBtnActive,
              ]}
              onPress={() => setDiffIdx(idx)}
              activeOpacity={0.8}
            >
              <Text style={[styles.diffBtnText, diffIdx === idx && styles.diffBtnTextActive]}>
                {diff.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. CARD GRID ARENA */}
        <View style={[styles.gridContainer, { maxWidth: SCREEN_WIDTH - 24 }]}>
          {cards.map((card) => {
            const isFlipped = flippedUids.includes(card.uid) || matchedIds.includes(card.id);
            const isMatched = matchedIds.includes(card.id);

            const animVal = flipAnims[card.uid] || new Animated.Value(0);
            const scaleVal = scaleAnims[card.uid] || new Animated.Value(1);

            // Interpolate rotation
            const frontRotate = animVal.interpolate({
              inputRange: [0, 180],
              outputRange: ['180deg', '360deg'],
            });
            const backRotate = animVal.interpolate({
              inputRange: [0, 180],
              outputRange: ['0deg', '180deg'],
            });

            return (
              <TouchableOpacity
                key={card.uid}
                onPress={() => handleCardPress(card)}
                activeOpacity={0.9}
                style={[styles.cardWrapper, { width: cardWidth, height: cardHeight }]}
              >
                <Animated.View
                  style={[
                    styles.cardContainer,
                    {
                      width: cardWidth,
                      height: cardHeight,
                      transform: [{ scale: scaleVal }],
                    },
                  ]}
                >
                  {/* CARD BACK (Shown when not flipped) */}
                  <Animated.View
                    style={[
                      styles.cardBack,
                      {
                        width: cardWidth,
                        height: cardHeight,
                        transform: [{ rotateY: backRotate }],
                        opacity: animVal.interpolate({
                          inputRange: [0, 89, 90, 180],
                          outputRange: [1, 1, 0, 0],
                        }),
                      },
                    ]}
                  >
                    <View style={styles.cardBackPattern}>
                      <Text style={styles.cardBackStar}>⭐</Text>
                      <Text style={styles.cardBackQuestion}>?</Text>
                    </View>
                  </Animated.View>

                  {/* CARD FRONT (Shown when flipped) */}
                  <Animated.View
                    style={[
                      styles.cardFront,
                      isMatched && styles.cardFrontMatched,
                      {
                        width: cardWidth,
                        height: cardHeight,
                        transform: [{ rotateY: frontRotate }],
                        opacity: animVal.interpolate({
                          inputRange: [0, 90, 91, 180],
                          outputRange: [0, 0, 1, 1],
                        }),
                      },
                    ]}
                  >
                    <Text style={[styles.cardEmoji, { fontSize: cardWidth * 0.38 }]}>{card.emoji}</Text>
                    <Text
                      style={[styles.cardName, { fontSize: Math.max(11, cardWidth * 0.13) }]}
                      numberOfLines={1}
                    >
                      {card.name}
                    </Text>
                    {isMatched && (
                      <View style={styles.checkPill}>
                        <Text style={styles.checkPillText}>✓</Text>
                      </View>
                    )}
                  </Animated.View>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. VICTORY CARD */}
        {isGameWon && (
          <View style={styles.winCard}>
            <Text style={styles.winBadge}>🎉 REZOLVAT CU SUCCES!</Text>
            <Text style={styles.winTitle}>Toate Perechile Găsite!</Text>
            <Text style={styles.winSubtitle}>
              Ai găsit toate cele {currentDiff.pairs} perechi în doar {attempts} încercări!
            </Text>

            <View style={styles.starsRow}>
              <Text style={styles.starBig}>⭐</Text>
              <Text style={styles.starBig}>⭐</Text>
              <Text style={styles.starBig}>⭐</Text>
            </View>

            <View style={styles.winActionsRow}>
              <TouchableOpacity
                style={styles.nextLevelBtn}
                onPress={() => {
                  if (diffIdx < DIFFICULTY_LEVELS.length - 1) {
                    setDiffIdx(diffIdx + 1);
                  } else {
                    initGame(currentTheme, currentDiff);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.nextLevelBtnText}>
                  {diffIdx < DIFFICULTY_LEVELS.length - 1 ? 'Nivelul Următor ➔' : 'Joacă din Nou 🔄'}
                </Text>
              </TouchableOpacity>

              {onComplete && (
                <TouchableOpacity
                  style={styles.claimRewardBtn}
                  onPress={onComplete}
                  activeOpacity={0.8}
                >
                  <Text style={styles.claimRewardBtnText}>🎁 Comoară</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#DFE4EA',
    zIndex: 100,
  },
  backBtn: {
    backgroundColor: '#F1F2F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  backBtnText: {
    color: '#2F3542',
    fontSize: 14,
    fontWeight: '700',
  },
  titleWrap: {
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2F3542',
  },
  gameSubtitle: {
    fontSize: 12,
    color: '#747D8C',
    marginTop: 2,
    fontWeight: '600',
  },
  refreshBtn: {
    backgroundColor: '#EAF8F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#10AC84',
  },
  refreshBtnText: {
    color: '#10AC84',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  controlRow: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  chipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFE4EA',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#57606F',
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  diffBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFE4EA',
  },
  diffBtnActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  diffBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#747D8C',
  },
  diffBtnTextActive: {
    color: '#FFFFFF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    marginVertical: 8,
  },
  cardWrapper: {
    margin: 4,
  },
  cardContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 16,
    backgroundColor: '#6C5CE7',
    borderWidth: 3,
    borderColor: '#5B4BC4',
    borderBottomWidth: 6,
    borderBottomColor: '#4834D4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  cardBackPattern: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackStar: {
    fontSize: 22,
    marginBottom: -4,
  },
  cardBackQuestion: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardFront: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#DFE4EA',
    borderBottomWidth: 5,
    borderBottomColor: '#CED6E0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardFrontMatched: {
    borderColor: '#2ED573',
    borderBottomColor: '#26AF5F',
    backgroundColor: '#F7FFF9',
  },
  cardEmoji: {
    marginBottom: 4,
  },
  cardName: {
    fontWeight: '800',
    color: '#2F3542',
    textAlign: 'center',
  },
  checkPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#2ED573',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  winCard: {
    marginTop: 20,
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2ED573',
    shadowColor: '#2ED573',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  winBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2ED573',
    letterSpacing: 1,
    marginBottom: 6,
  },
  winTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2F3542',
    marginBottom: 6,
  },
  winSubtitle: {
    fontSize: 14,
    color: '#747D8C',
    textAlign: 'center',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  starBig: {
    fontSize: 36,
  },
  winActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  nextLevelBtn: {
    flex: 2,
    backgroundColor: '#2ED573',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#26AF5F',
  },
  nextLevelBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  claimRewardBtn: {
    flex: 1,
    backgroundColor: '#FFA502',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#E67E22',
  },
  claimRewardBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
