import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { audioMixer } from '../audio/index.js';

const { width } = Dimensions.get('window');

export const CartoonIntroCutscene = ({ onFinish }) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Play splash chime
    try {
      audioMixer.playSFX(require('../../assets/audio/splash_in.mp3'), 0.8);
    } catch (e) {}

    // Fallback timer in case video doesn't trigger onEnded
    const fallbackTimer = setTimeout(() => {
      setVideoEnded(true);
    }, 6000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleComplete = () => {
    try {
      audioMixer.playVoice(require('../../assets/audio/kodi_welcome_ro.mp3'));
    } catch (e) {}
    onFinish?.();
  };

  return (
    <View style={styles.container}>
      {/* Cartoon Sunburst Background */}
      <View style={styles.sunburstBg} />

      {/* Playful Television / Cinema Frame */}
      <View style={styles.cinemaFrame}>
        <View style={styles.frameHeader}>
          <Text style={styles.frameTitle}>🎬 Desene Animate: Orășelul Copilăriei</Text>
          <TouchableOpacity style={styles.skipBtn} onPress={handleComplete}>
            <Text style={styles.skipBtnText}>Sari Peste ⏩</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.videoStage}>
          {Platform.OS === 'web' ? (
            <video
              ref={videoRef}
              src={require('../../assets/videos/SplashVideo.mp4')}
              autoPlay
              playsInline
              onEnded={() => {
                setVideoEnded(true);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: 16,
                backgroundColor: '#000000',
              }}
            />
          ) : (
            <View style={styles.fallbackBox}>
              <Text style={styles.fallbackEmoji}>🐻🐘🐦</Text>
              <Text style={styles.fallbackText}>Bun venit alături de Kodi și prietenii săi!</Text>
            </View>
          )}
        </View>

        <View style={styles.frameFooter}>
          <TouchableOpacity style={styles.enterBtn} onPress={handleComplete}>
            <Text style={styles.enterBtnText}>
              {videoEnded ? '✨ Intră în Aventură! ✨' : 'Continuă spre Jocuri ➡️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303F9F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  sunburstBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3949AB',
    opacity: 0.9,
  },
  cinemaFrame: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 6,
    borderColor: '#FFD54F',
    padding: 16,
    alignItems: 'center',
    elevation: 10,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  frameHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  frameTitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
  },
  skipBtn: {
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CFD8DC',
  },
  skipBtnText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 13,
    fontWeight: '700',
    color: '#455A64',
  },
  videoStage: {
    width: '100%',
    height: 340,
    backgroundColor: '#000000',
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackEmoji: {
    fontSize: 64,
  },
  fallbackText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
  },
  frameFooter: {
    marginTop: 14,
    width: '100%',
    alignItems: 'center',
  },
  enterBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  enterBtnText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default CartoonIntroCutscene;
