import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { audioMixer } from '../audio/index.js';

const { width } = Dimensions.get('window');

const BATH_IMAGES = {
  bg: require('../../assets/images/bath/ollo_bathtub_bg.png'),
  char: require('../../assets/images/bath/ollo_bathtub_char.png'),
  border: require('../../assets/images/bath/ollo_bathtub_border.png'),
  water: require('../../assets/images/bath/ollo_bathtub_watermask.png'),
  duck: require('../../assets/images/bath/behaviorstyles_bubble_bubble_1.png'),
  boat: require('../../assets/images/bath/usgk_library_canvas_editor_backgrounds_images_33writingshapeboat.png'),
};

export const OlloBathBubbleRoom = ({ onBack }) => {
  const [bubbles, setBubbles] = useState([
    { id: 1, x: 80, y: 120, size: 60 },
    { id: 2, x: 220, y: 90, size: 75 },
    { id: 3, x: 380, y: 150, size: 55 },
  ]);

  const duckX = useRef(new Animated.Value(120)).current;
  const duckY = useRef(new Animated.Value(240)).current;

  const olloBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    try {
      audioMixer.playVoice(require('../../assets/audio/bath_intro.mp3'));
    } catch (e) {}
  }, []);

  // Duck pan responder for dragging on water
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        duckX.setValue(120 + gestureState.dx);
        duckY.setValue(240 + Math.max(-40, Math.min(40, gestureState.dy)));
      },
      onPanResponderRelease: () => {
        audioMixer.playSFX(require('../../assets/audio/splash_out.mp3'), 0.7);
        Animated.spring(duckY, {
          toValue: 240,
          friction: 4,
          tension: 40,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // Blow new bubbles
  const handleBlowBubbles = () => {
    audioMixer.playSFX(require('../../assets/audio/SFX_whoosh.mp3'), 0.85);

    // Ollo joyful splash bounce
    Animated.sequence([
      Animated.timing(olloBounce, {
        toValue: -15,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(olloBounce, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const newBubbles = [
      { id: Date.now() + 1, x: 60 + Math.random() * 260, y: 60 + Math.random() * 120, size: 50 + Math.random() * 30 },
      { id: Date.now() + 2, x: 60 + Math.random() * 260, y: 60 + Math.random() * 120, size: 50 + Math.random() * 30 },
      { id: Date.now() + 3, x: 60 + Math.random() * 260, y: 60 + Math.random() * 120, size: 50 + Math.random() * 30 },
    ];
    setBubbles((prev) => [...prev, ...newBubbles]);
  };

  // Pop bubble
  const handlePopBubble = (id) => {
    try {
      audioMixer.playSFX(require('../../assets/audio/bubble_break.mp3'), 0.95);
    } catch (e) {
      audioMixer.playSFX(require('../../assets/audio/SFX_pop.mp3'), 0.8);
    }
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>⬅️ Înapoi la Club</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛁 Cădița cu Clăbuci a lui Ollo</Text>
        <TouchableOpacity style={styles.blowBtn} onPress={handleBlowBubbles}>
          <Text style={styles.blowBtnText}>🫧 Fă Bule!</Text>
        </TouchableOpacity>
      </View>

      {/* Main Bathtub Scene */}
      <View style={styles.bathStage}>
        {/* Bathtub Room Background */}
        <Image source={BATH_IMAGES.bg} style={styles.bathBg} resizeMode="cover" />

        {/* Ollo in Bathtub */}
        <Animated.View
          style={[
            styles.olloContainer,
            {
              transform: [{ translateY: olloBounce }],
            },
          ]}
        >
          <Image source={BATH_IMAGES.char} style={styles.olloChar} resizeMode="contain" />
        </Animated.View>

        {/* Translucent Animated Water Layer */}
        <View style={styles.waterSurface} />

        {/* Bathtub Ceramic Border */}
        <Image source={BATH_IMAGES.border} style={styles.bathBorder} resizeMode="stretch" />

        {/* Draggable Toy Boat / Ducky */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.draggableToy,
            {
              left: duckX,
              top: duckY,
            },
          ]}
        >
          <Image source={BATH_IMAGES.boat} style={styles.boatImg} resizeMode="contain" />
        </Animated.View>

        {/* Floating Specular Soap Bubbles */}
        {bubbles.map((b) => (
          <TouchableOpacity
            key={b.id}
            activeOpacity={0.8}
            onPress={() => handlePopBubble(b.id)}
            style={[
              styles.soapBubble,
              {
                left: b.x,
                top: b.y,
                width: b.size,
                height: b.size,
                borderRadius: b.size / 2,
              },
            ]}
          >
            <View style={styles.bubbleHighlight} />
            <View style={styles.bubbleSmallHighlight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Fun Banner */}
      <View style={styles.tipCard}>
        <Text style={styles.tipText}>
          👉 Trage bărcuța pe apă să faci valuri și atinge bulele de săpun să le spargi!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E1F5FE',
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
    borderColor: '#B3E5FC',
  },
  backBtnText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#0288D1',
  },
  headerTitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#01579B',
  },
  blowBtn: {
    backgroundColor: '#FF7043',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
  },
  blowBtnText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bathStage: {
    width: '100%',
    maxWidth: 680,
    height: 440,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#81D4FA',
    elevation: 6,
  },
  bathBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  olloContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    zIndex: 2,
  },
  olloChar: {
    width: 280,
    height: 280,
  },
  waterSurface: {
    position: 'absolute',
    bottom: 12,
    left: '12%',
    right: '12%',
    height: 100,
    backgroundColor: 'rgba(79, 195, 247, 0.72)',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    zIndex: 3,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  bathBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 140,
    zIndex: 4,
  },
  draggableToy: {
    position: 'absolute',
    zIndex: 5,
    padding: 8,
  },
  boatImg: {
    width: 90,
    height: 70,
  },
  soapBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 4,
    boxShadow: '0 4px 12px rgba(0, 151, 167, 0.3)',
    zIndex: 10,
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
  tipCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#B3E5FC',
  },
  tipText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 14,
    color: '#0277BD',
    fontWeight: '600',
    textAlign: 'center',
  },
});
