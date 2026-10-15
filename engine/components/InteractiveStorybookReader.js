import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { audioMixer } from '../audio';
import confetti from '../utils/confetti';

const { width } = Dimensions.get('window');

// Genuine Khan Academy Kids Storybook Artwork
const STORY_IMAGES = {
  p1: require('../../assets/books/whatasurprise/p1.png'),
  p2: require('../../assets/books/whatasurprise/p2.png'),
  p3: require('../../assets/books/whatasurprise/p3.png'),
  p4: require('../../assets/books/whatasurprise/p4.png'),
  p5: require('../../assets/books/whatasurprise/p5.png'),
  p6: require('../../assets/books/whatasurprise/p6.png'),
};

const STORY_AUDIO = {
  p1: require('../../assets/books/whatasurprise/p1_ro.mp3'),
  p2: require('../../assets/books/whatasurprise/p2_ro.mp3'),
  p3: require('../../assets/books/whatasurprise/p3_ro.mp3'),
  p4: require('../../assets/books/whatasurprise/p4_ro.mp3'),
  p5: require('../../assets/books/whatasurprise/p5_ro.mp3'),
  p6: require('../../assets/books/whatasurprise/p6_ro.mp3'),
};

// Storybook pages with text, .tm timestamps, illustration mappings, and interactive hotspots
const STORY_PAGES = [
  {
    id: 'p1',
    pageNumber: 1,
    title: 'Ce Surpriză!',
    subtitle: 'O poveste Khan Kids cu prietenii din căsuță',
    image: STORY_IMAGES.p1,
    audio: STORY_AUDIO.p1,
    words: ['Ce', 'Surpriză!', 'O', 'poveste', 'cu', 'prietenii', 'din', 'căsuță.'],
    tm: [0.12, 0.37, 1.41, 1.66, 2.47, 2.72, 3.75, 4.1],
    hotspots: [
      { id: 'h1_tree', emoji: '🌳', label: 'Frunze', x: 110, y: 70, voice: require('../../assets/audio/hotspot_tree.mp3') },
      { id: 'h1_peck', emoji: '🐦', label: 'Peck', x: 280, y: 140, voice: require('../../assets/audio/hotspot_peck.mp3') },
    ],
  },
  {
    id: 'p2',
    pageNumber: 2,
    image: STORY_IMAGES.p2,
    audio: STORY_AUDIO.p2,
    words: [
      'Peck', 'a', 'zburat', 'în', 'căsuța', 'copiilor', 'să', 'ia', 'o', 'gustare',
      'de', 'după-amiază.', 'A', 'fost', 'tare', 'surprins', 'să', 'vadă', 'pe',
      'cineva', 'nou', 'acolo!'
    ],
    tm: [
      0.12, 0.47, 0.72, 1.25, 1.5, 1.95, 2.55, 2.8, 3.05, 3.3,
      3.8, 4.05, 5.0, 5.25, 5.55, 5.85, 6.45, 6.7, 7.05, 7.3, 7.8, 8.15
    ],
    hotspots: [
      { id: 'h2_peck', emoji: '🐦', label: 'Peck Curios', x: 130, y: 130, voice: require('../../assets/audio/hotspot_peck.mp3') },
      { id: 'h2_koala', emoji: '🐨', label: 'Micul Koala', x: 380, y: 140, voice: require('../../assets/audio/hotspot_koala.mp3') },
    ],
  },
  {
    id: 'p3',
    pageNumber: 3,
    image: STORY_IMAGES.p3,
    audio: STORY_AUDIO.p3,
    words: [
      'Lui', 'Peck', 'îi', 'plăcea', 'mult', 'să', 'se', 'joace', 'cu', 'prieteni',
      'noi.', 'Bună!', 'a', 'strigat', 'el', 'vesel.', 'Vrei', 'să', 'construim',
      'cu', 'cuburile', 'colorate?'
    ],
    tm: [
      0.12, 0.4, 0.75, 1.0, 1.45, 1.85, 2.1, 2.35, 2.8, 3.05,
      3.65, 4.05, 4.5, 4.75, 5.25, 5.5, 6.0, 6.35, 6.6, 7.35, 7.6, 8.25
    ],
    hotspots: [
      { id: 'h3_cubes', emoji: '🧱', label: 'Cuburi', x: 340, y: 180, voice: require('../../assets/audio/hotspot_tree.mp3') },
      { id: 'h3_koala', emoji: '🐨', label: 'Koala Tăcut', x: 420, y: 130, voice: require('../../assets/audio/hotspot_koala.mp3') },
    ],
  },
  {
    id: 'p4',
    pageNumber: 4,
    image: STORY_IMAGES.p4,
    audio: STORY_AUDIO.p4,
    words: [
      'Noul', 'prieten', 'nu', 'a', 'răspuns,', 'dar', 'a', 'fost', 'în', 'regulă.',
      'Peck', 'avea', 'și', 'alte', 'idei', 'minunate,', 'cum', 'ar', 'fi', 'jocul',
      'de', 'memorie.'
    ],
    tm: [
      0.12, 0.45, 0.95, 1.2, 1.45, 2.05, 2.35, 2.6, 2.95, 3.2,
      3.75, 4.15, 4.55, 4.8, 5.15, 5.5, 6.2, 6.5, 6.75, 7.0, 7.45, 7.7
    ],
    hotspots: [
      { id: 'h4_cards', emoji: '🃏', label: 'Cărți Memorie', x: 300, y: 170, voice: require('../../assets/audio/hotspot_tree.mp3') },
    ],
  },
  {
    id: 'p5',
    pageNumber: 5,
    image: STORY_IMAGES.p5,
    audio: STORY_AUDIO.p5,
    words: [
      'Hmm...', 'noul', 'prieten', 'se', 'pricepea', 'la', 'potrivit,', 'dar', 'era',
      'foarte', 'tăcut.', 'Oare', 'nu', 'voia', 'să', 'fie', 'prieteni', 'până',
      'la', 'urmă?'
    ],
    tm: [
      0.12, 0.65, 0.95, 1.45, 1.7, 2.35, 2.6, 3.2, 3.5, 3.8,
      4.3, 4.8, 5.2, 5.45, 5.8, 6.05, 6.35, 6.95, 7.3, 7.55
    ],
    hotspots: [
      { id: 'h5_peck', emoji: '🐦', label: 'Gânditor', x: 180, y: 150, voice: require('../../assets/audio/hotspot_peck.mp3') },
    ],
  },
  {
    id: 'p6',
    pageNumber: 6,
    image: STORY_IMAGES.p6,
    audio: STORY_AUDIO.p6,
    words: [
      'Surpriză!', 'a', 'râs', 'Sandy', 'fericită.', 'Sunt', 'eu!', 'Peck', 'a',
      'fost', 'uimit', 'și', 'bucuros.', 'Nimic', 'nu', 'e', 'mai', 'frumos',
      'ca', 'prietenii', 'vechi!'
    ],
    tm: [
      0.12, 0.75, 1.0, 1.3, 1.7, 2.3, 2.65, 3.0, 3.35, 3.6,
      3.95, 4.4, 4.65, 5.25, 5.65, 5.9, 6.15, 6.45, 6.95, 7.2, 7.85
    ],
    hotspots: [
      { id: 'h6_sandy', emoji: '🦊', label: 'Sandy!', x: 380, y: 140, voice: require('../../assets/audio/tickle_giggle_ro.mp3') },
      { id: 'h6_peck', emoji: '🐦', label: 'Peck Vesel', x: 160, y: 140, voice: require('../../assets/audio/hotspot_peck.mp3') },
    ],
  },
];

export const InteractiveStorybookReader = ({ audio, onBack, onComplete }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tappedWord, setTappedWord] = useState(null);
  const [activeHotspot, setActiveHotspot] = useState(null);

  const audioPlayerRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  const wordBounceAnim = useRef(new Animated.Value(1)).current;
  const hotspotAnim = useRef(new Animated.Value(1)).current;

  const currentPage = STORY_PAGES[currentPageIndex];

  // Stop playback when unmounting or switching pages
  const stopAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch (e) {}
      audioPlayerRef.current = null;
    }
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
    setIsPlaying(false);
    setActiveWordIndex(-1);
  }, []);

  const playCurrentPageAudio = useCallback(() => {
    stopAudio();

    const src = currentPage.audio?.default || currentPage.audio;
    if (!src) return;

    try {
      const sound = new Audio(src);
      audioPlayerRef.current = sound;

      sound.onended = () => {
        setIsPlaying(false);
        setActiveWordIndex(-1);

        // If on the last page, celebrate completion!
        if (currentPageIndex === STORY_PAGES.length - 1) {
          audioMixer.playSFX(audio?.sfxRoyal || audio?.sfxBingo || null);
          audioMixer.playVoice(audio?.kodiAwesome || null, { duck: true });
          confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
          if (onComplete) onComplete();
        }
      };

      sound.play().then(() => {
        setIsPlaying(true);

        // Poll audio currentTime at 30ms resolution for ultra-tight sync
        timeUpdateIntervalRef.current = setInterval(() => {
          if (!sound || sound.paused) return;
          const ct = sound.currentTime;
          const tmList = currentPage.tm;

          // Find current active word index based on .tm time markers
          let currentIdx = -1;
          for (let i = 0; i < tmList.length; i++) {
            const wordStart = tmList[i];
            const nextWordStart = i + 1 < tmList.length ? tmList[i + 1] : wordStart + 0.8;
            if (ct >= wordStart && ct < nextWordStart) {
              currentIdx = i;
              break;
            }
          }

          if (currentIdx !== -1) {
            setActiveWordIndex(currentIdx);
          }
        }, 30);
      }).catch(() => {
        setIsPlaying(false);
      });
    } catch (e) {
      setIsPlaying(false);
    }
  }, [currentPage, currentPageIndex, stopAudio, audio, onComplete]);

  // Autoplay page audio when changing pages
  useEffect(() => {
    const timer = setTimeout(() => {
      playCurrentPageAudio();
    }, 400);

    return () => {
      clearTimeout(timer);
      stopAudio();
    };
  }, [currentPageIndex]);

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      audioMixer.playSFX(audio?.sfxWhoosh || null);
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < STORY_PAGES.length - 1) {
      audioMixer.playSFX(audio?.sfxWhoosh || null);
      setCurrentPageIndex((prev) => prev + 1);
    } else {
      audioMixer.playSFX(audio?.sfxBingo || null);
      confetti({ particleCount: 120, spread: 80 });
      if (onComplete) onComplete();
    }
  };

  const handleWordTap = (word, index) => {
    setTappedWord(index);
    audioMixer.playSFX(audio?.sfxPop || null, 0.7);

    // Spring animation for child interaction
    Animated.sequence([
      Animated.timing(wordBounceAnim, { toValue: 1.35, duration: 120, useNativeDriver: false }),
      Animated.spring(wordBounceAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: false }),
    ]).start();

    // If audio is playing, seek audio to this word!
    if (audioPlayerRef.current && currentPage.tm[index] !== undefined) {
      try {
        audioPlayerRef.current.currentTime = currentPage.tm[index];
        setActiveWordIndex(index);
      } catch (e) {}
    }
  };

  // Handle tapping an interactive hotspot on the page illustration
  const handleHotspotTap = (hs) => {
    setActiveHotspot(hs.id);
    audioMixer.playSFX(require('../../assets/audio/SFX_squish.mp3'), 0.85);
    if (hs.voice) {
      setTimeout(() => {
        try {
          audioMixer.playVoice(hs.voice);
        } catch (e) {}
      }, 120);
    }
    Animated.sequence([
      Animated.spring(hotspotAnim, { toValue: 1.25, friction: 3, tension: 120, useNativeDriver: true }),
      Animated.spring(hotspotAnim, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setActiveHotspot(null), 3000);
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.bookTitle}>📖 Ce Surpriză! — Khan Kids</Text>
          <Text style={styles.pageIndicator}>
            Pagina {currentPage.pageNumber} din {STORY_PAGES.length}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.audioPillBtn, isPlaying && styles.audioPillBtnActive]}
            onPress={() => {
              if (isPlaying) {
                stopAudio();
              } else {
                playCurrentPageAudio();
              }
            }}
          >
            <Text style={styles.audioPillText}>
              {isPlaying ? '⏸️ Pauză Narator' : '🔊 Citește-mi Povestea'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Storybook Presentation Stage */}
      <View style={styles.stage}>
        {/* Genuine Illustration Frame with Interactive Hotspots */}
        <View style={styles.imageCard}>
          <Image
            source={currentPage.image}
            style={styles.illustration}
            resizeMode="contain"
          />

          {/* Interactive Living Hotspots on the Page */}
          {currentPage.hotspots?.map((hs) => (
            <TouchableOpacity
              key={hs.id}
              activeOpacity={0.8}
              onPress={() => handleHotspotTap(hs)}
              style={[
                styles.hotspotBtn,
                { left: hs.x, top: hs.y },
                activeHotspot === hs.id && styles.hotspotBtnActive,
              ]}
            >
              <Text style={styles.hotspotEmoji}>{hs.emoji}</Text>
              <View style={styles.hotspotPill}>
                <Text style={styles.hotspotLabel}>{hs.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Word-by-Word Synchronized Reading Box */}
        <View style={styles.textCard}>
          <ScrollView contentContainerStyle={styles.wordsContainer}>
            {currentPage.words.map((word, idx) => {
              const isHighlighted = activeWordIndex === idx;
              const isTapped = tappedWord === idx;

              return (
                <TouchableOpacity
                  key={`${currentPage.id}_w_${idx}`}
                  activeOpacity={0.7}
                  onPress={() => handleWordTap(word, idx)}
                  style={[
                    styles.wordBubble,
                    isHighlighted && styles.wordBubbleActive,
                    isTapped && styles.wordBubbleTapped,
                  ]}
                >
                  <Text
                    style={[
                      styles.wordText,
                      isHighlighted && styles.wordTextActive,
                    ]}
                  >
                    {word}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.tapTip}>
            👉 Atinge orice cuvânt pentru a-l auzi și a sări direct la el!
          </Text>
        </View>
      </View>

      {/* Bottom Page Flipping Navigation Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navBtn, currentPageIndex === 0 && styles.navBtnDisabled]}
          disabled={currentPageIndex === 0}
          onPress={handlePrevPage}
        >
          <Text style={styles.navBtnText}>⬅️ Pagina Anterioară</Text>
        </TouchableOpacity>

        {/* Page progress pips */}
        <View style={styles.pipRow}>
          {STORY_PAGES.map((_, idx) => (
            <View
              key={`pip_${idx}`}
              style={[
                styles.pip,
                currentPageIndex === idx && styles.pipActive,
                idx < currentPageIndex && styles.pipVisited,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnNext]}
          onPress={handleNextPage}
        >
          <Text style={styles.navBtnText}>
            {currentPageIndex === STORY_PAGES.length - 1 ? '🎉 Finalizează' : 'Pagina Următoare ➡️'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    width: '100%',
    maxWidth: 960,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  headerLeft: {
    flexDirection: 'column',
  },
  bookTitle: {
    fontSize: 19,
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: '700',
    color: '#2C3E50',
  },
  pageIndicator: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '600',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioPillBtn: {
    backgroundColor: '#4CD137',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  audioPillBtnActive: {
    backgroundColor: '#FFA502',
  },
  audioPillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stage: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 16,
  },
  imageCard: {
    flex: 1.1,
    height: '100%',
    maxHeight: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#70A1FF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  illustration: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  textCard: {
    flex: 0.9,
    height: '100%',
    maxHeight: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    borderWidth: 4,
    borderColor: '#FFA502',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: 10,
  },
  wordBubble: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginHorizontal: 3,
    marginVertical: 4,
    borderRadius: 10,
  },
  wordBubbleActive: {
    backgroundColor: '#FFE600', // Khan Academy Kids genuine canary yellow highlight
    transform: [{ scale: 1.12 }],
    shadowColor: '#FFA502',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  wordBubbleTapped: {
    backgroundColor: '#A29BFE',
  },
  wordText: {
    fontSize: 22,
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: '600',
    color: '#2F3542',
    letterSpacing: 0.3,
  },
  wordTextActive: {
    color: '#1E272E',
    fontWeight: '800',
  },
  tapTip: {
    fontSize: 12,
    color: '#A4B0BE',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 6,
  },
  bottomBar: {
    width: '100%',
    maxWidth: 960,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  navBtn: {
    backgroundColor: '#3742FA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    elevation: 3,
  },
  navBtnDisabled: {
    backgroundColor: '#CED6E0',
    elevation: 0,
  },
  navBtnNext: {
    backgroundColor: '#FF4757',
  },
  navBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  pipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pip: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DFE4EA',
  },
  pipVisited: {
    backgroundColor: '#70A1FF',
  },
  pipActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFA502',
    transform: [{ scale: 1.15 }],
  },
  hotspotBtn: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFA502',
    elevation: 5,
    zIndex: 20,
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  },
  hotspotBtnActive: {
    backgroundColor: '#FFE600',
    borderColor: '#FF4757',
    transform: [{ scale: 1.25 }],
  },
  hotspotEmoji: {
    fontSize: 22,
  },
  hotspotPill: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  hotspotLabel: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
