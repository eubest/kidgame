import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { audioMixer } from '../audio';
import confetti from '../utils/confetti';
import { AndroidHaptics } from '../native/AndroidHaptics.js';
import { GoldenStarGradient } from './GameGradients.js';

const { width } = Dimensions.get('window');

const REWARD_ASSETS = {
  boxClosed: require('../../assets/rewards/eoereward_box1.png'),
  boxOpened: require('../../assets/rewards/eoereward_box2.png'),
  boxRays: require('../../assets/rewards/eoereward_rays.png'),
  sampleRewards: [
    { id: 'rw1', name: 'Pălărie de Petrecere', mascot: 'Ollo', img: require('../../assets/rewards/characterrewards_ollo1.png') },
    { id: 'rw2', name: 'Joben Elegant', mascot: 'Ollo', img: require('../../assets/rewards/characterrewards_ollo2.png') },
    { id: 'rw3', name: 'Ochelari de Soare Cool', mascot: 'Ollo', img: require('../../assets/rewards/characterrewards_ollo3.png') },
    { id: 'rw4', name: 'Coroană Regală', mascot: 'Peck', img: require('../../assets/rewards/characterrewards_ollo10.png') },
    { id: 'rw5', name: 'Cască de Aviator', mascot: 'Sandy', img: require('../../assets/rewards/characterrewards_ollo12.png') },
    { id: 'rw6', name: 'Fundiță Strălucitoare', mascot: 'Reya', img: require('../../assets/rewards/characterrewards_ollo15.png') },
  ],
};

export const GiftBoxUnboxer = ({ audio, onDressUp, onContinue }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [rewardItem, setRewardItem] = useState(REWARD_ASSETS.sampleRewards[0]);

  // Animation values
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rayRotation = useRef(new Animated.Value(0)).current;
  const prizeFlyAnim = useRef(new Animated.Value(0)).current;
  const prizeScaleAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Pick a random reward
    const rand = REWARD_ASSETS.sampleRewards[Math.floor(Math.random() * REWARD_ASSETS.sampleRewards.length)];
    setRewardItem(rand);

    // Continuous tempting wiggle/shake before opening
    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 80, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 80, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 80, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 120, useNativeDriver: false }),
        Animated.delay(1200),
      ])
    );
    shakeLoop.start();

    // Soft heart-beat pulsing
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.06, duration: 600, useNativeDriver: false }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 600, useNativeDriver: false }),
      ])
    );
    pulseLoop.start();

    return () => {
      shakeLoop.stop();
      pulseLoop.stop();
    };
  }, []);

  const handleOpenBox = () => {
    if (isOpened) return;
    setIsOpened(true);

    AndroidHaptics.celebration();

    audioMixer.playSFX(audio?.sfxPop || null, 0.9);
    audioMixer.playSFX(audio?.sfxReward || audio?.sfxRoyal || null, 1.0);
    audioMixer.playVoice(audio?.kodiAwesome || null, { duck: true });

    // Confetti explosion
    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.55 },
      colors: ['#FF4757', '#FFA502', '#2ED573', '#1E90FF', '#FFD700', '#9B59B6'],
    });

    // Spin rays continuously
    Animated.loop(
      Animated.timing(rayRotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Reward floats up and pops into view
    Animated.parallel([
      Animated.spring(prizeFlyAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: false,
      }),
      Animated.spring(prizeScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 35,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const raySpin = rayRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const prizeTranslateY = prizeFlyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, -80],
  });

  return (
    <View style={styles.container}>
      <View style={styles.cardModal}>
        {/* Header */}
        <Text style={styles.headerTitle}>
          {isOpened ? '🎉 Felicitări! Ai Deschis Cadoul!' : '🎁 Cadoul Tău Special de Aur!'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isOpened
            ? `Ai deblocat un accesoriu nou pentru prietenul tău, ${rewardItem.mascot}!`
            : 'Atinge cutia misterioasă pentru a descoperi surpriza!'}
        </Text>

        {/* Center Presentation Stage */}
        <View style={styles.boxStage}>
          {/* Rotating God Rays behind open box */}
          {isOpened && (
            <Animated.Image
              source={REWARD_ASSETS.boxRays}
              style={[styles.raysImg, { transform: [{ rotate: raySpin }] }]}
              resizeMode="contain"
            />
          )}

          {/* Opened / Closed Gift Box */}
          <TouchableOpacity activeOpacity={0.85} onPress={handleOpenBox}>
            <Animated.View
              style={[
                styles.boxWrapper,
                !isOpened && {
                  transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <Image
                source={isOpened ? REWARD_ASSETS.boxOpened : REWARD_ASSETS.boxClosed}
                style={styles.boxImg}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Floating Reward Item popping out */}
          {isOpened && (
            <Animated.View
              style={[
                styles.prizeWrapper,
                {
                  transform: [
                    { translateY: prizeTranslateY },
                    { scale: prizeScaleAnim },
                  ],
                },
              ]}
            >
              <View style={styles.prizeBubble}>
                <Image
                  source={rewardItem.img}
                  style={styles.prizeImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.prizeBadge}>
                <Text style={styles.prizeName}>{rewardItem.name}</Text>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          {!isOpened ? (
            <TouchableOpacity activeOpacity={0.85} onPress={handleOpenBox}>
              <GoldenStarGradient style={styles.tapCtaBtn}>
                <Text style={styles.tapCtaText}>✨ Atinge pentru a Deschide! ✨</Text>
              </GoldenStarGradient>
            </TouchableOpacity>
          ) : (
            <>
              {onDressUp && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.dressUpBtn]}
                  onPress={() => {
                    audioMixer.playSFX(audio?.sfxButton || null);
                    onDressUp(rewardItem);
                  }}
                >
                  <Text style={styles.actionBtnText}>👗 Probează în Salon</Text>
                </TouchableOpacity>
              )}
              {onContinue && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.continueBtn]}
                  onPress={() => {
                    audioMixer.playSFX(audio?.sfxButton || null);
                    onContinue();
                  }}
                >
                  <Text style={styles.actionBtnText}>🚀 Continuă Joaca</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardModal: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#FFA502',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: '800',
    color: '#2F3542',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#747D8C',
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 480,
    marginBottom: 20,
  },
  boxStage: {
    width: 320,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  raysImg: {
    position: 'absolute',
    width: 380,
    height: 380,
    opacity: 0.85,
  },
  boxWrapper: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  boxImg: {
    width: 200,
    height: 200,
  },
  prizeWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  prizeBubble: {
    width: 130,
    height: 130,
    backgroundColor: '#FFF9E6',
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#FFA502',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  prizeImg: {
    width: 100,
    height: 100,
  },
  prizeBadge: {
    marginTop: 8,
    backgroundColor: '#3742FA',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  prizeName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
    width: '100%',
  },
  tapCtaBtn: {
    backgroundColor: '#FFA502',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    elevation: 4,
  },
  tapCtaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    elevation: 3,
  },
  dressUpBtn: {
    backgroundColor: '#9B59B6',
  },
  continueBtn: {
    backgroundColor: '#2ED573',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default GiftBoxUnboxer;
