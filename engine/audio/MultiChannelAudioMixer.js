import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { NativeAudioBridge } from '../native/NativeAudioBridge';
import { AndroidHaptics } from '../native/AndroidHaptics';

/**
 * MultiChannelAudioMixer
 * Channels:
 *  - MUSIC: Continuous looping background piano music with smooth ducking
 *  - VOICE: Romanian neural teacher prompts & feedback
 *  - SFX: Concurrent low-latency polyphonic sound effects with Android native haptic pairing
 */
class AudioMixerCore {
  constructor() {
    this.musicAudio = null;
    this.currentVoiceAudio = null;
    this.voiceQueue = [];
    this.isVoicePlaying = false;

    this.musicVolume = 0.65;
    this.duckedMusicVolume = 0.2;
    this.voiceVolume = 1.0;
    this.sfxVolume = 0.9;

    this.isMuted = false;
    this.isAudioUnlocked = false;

    this.duckingInterval = null;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      this.initWebUnlock();
    }
  }

  initWebUnlock() {
    const unlock = () => {
      this.isAudioUnlocked = true;
      // If music was paused waiting for user gesture, resume it
      if (this.musicAudio && this.musicAudio.paused) {
        this.musicAudio.play().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  resolveSource(src) {
    if (!src) return null;
    if (typeof src === 'string' || typeof src === 'number') return src;
    if (src.default) return src.default;
    if (src.uri) return src.uri;
    return src;
  }

  // ==================== BACKGROUND MUSIC CHANNEL ====================
  playMusic(src, loop = true) {
    const resolvedSrc = this.resolveSource(src);
    if (!resolvedSrc) return;

    try {
      if (this.musicAudio) {
        if (this.musicAudio.src === resolvedSrc && !this.musicAudio.paused) {
          return; // Already playing this track
        }
        if (this.musicAudio.pause) this.musicAudio.pause();
        if (this.musicAudio.unload) this.musicAudio.unload();
        this.musicAudio = null;
      }

      const initialVolume = this.isMuted ? 0 : this.isVoicePlaying ? this.duckedMusicVolume : this.musicVolume;

      if (typeof Audio !== 'undefined' && Platform.OS === 'web') {
        const audio = new Audio(resolvedSrc);
        audio.loop = loop;
        audio.volume = initialVolume;
        this.musicAudio = audio;

        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {});
        }
      } else {
        // Native Android / iOS via NativeAudioBridge
        NativeAudioBridge.createAudioInstance(resolvedSrc, {
          loop,
          volume: initialVolume,
          shouldPlay: true,
        }).then((instance) => {
          this.musicAudio = instance;
        }).catch(() => {});
      }
    } catch (e) {
      // Audio fallback
    }
  }

  stopMusic() {
    if (this.musicAudio) {
      try {
        if (this.musicAudio.pause) this.musicAudio.pause();
        if (this.musicAudio.stop) this.musicAudio.stop();
        if (typeof this.musicAudio.currentTime !== 'undefined') this.musicAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  duckMusic(targetVolume, durationMs = 250) {
    if (!this.musicAudio || this.isMuted) return;

    if (this.duckingInterval) {
      clearInterval(this.duckingInterval);
      this.duckingInterval = null;
    }

    const steps = 15;
    const stepTime = durationMs / steps;
    const startVol = typeof this.musicAudio.volume === 'number' ? this.musicAudio.volume : this.musicVolume;
    const diff = targetVolume - startVol;
    let step = 0;

    this.duckingInterval = setInterval(() => {
      step++;
      const nextVol = Math.max(0, Math.min(1, startVol + (diff * (step / steps))));
      if (this.musicAudio) {
        if (this.musicAudio.setVolume) {
          this.musicAudio.setVolume(nextVol);
        } else {
          this.musicAudio.volume = nextVol;
        }
      }
      if (step >= steps) {
        clearInterval(this.duckingInterval);
        this.duckingInterval = null;
      }
    }, stepTime);
  }

  // ==================== TEACHER VOICE CHANNEL ====================
  playVoice(src, options = {}) {
    const { duck = true, queue = false, onEnd = null } = options;
    const resolvedSrc = this.resolveSource(src);
    if (!resolvedSrc) return;

    if (queue && this.isVoicePlaying) {
      this.voiceQueue.push({ src: resolvedSrc, options });
      return;
    }

    // Stop current voice if playing and not queuing
    if (this.currentVoiceAudio) {
      try {
        if (this.currentVoiceAudio.pause) this.currentVoiceAudio.pause();
        if (this.currentVoiceAudio.unload) this.currentVoiceAudio.unload();
      } catch (e) {}
      this.currentVoiceAudio = null;
    }

    const voiceVol = this.isMuted ? 0 : this.voiceVolume;

    const handleVoiceEnd = () => {
      this.isVoicePlaying = false;
      this.currentVoiceAudio = null;

      if (onEnd) onEnd();

      // Check if there are queued voice prompts
      if (this.voiceQueue.length > 0) {
        const next = this.voiceQueue.shift();
        this.playVoice(next.src, next.options);
      } else {
        // Restore background music smoothly
        if (duck) {
          this.duckMusic(this.musicVolume, 400);
        }
      }
    };

    try {
      if (duck) {
        this.duckMusic(this.duckedMusicVolume, 200);
      }

      if (typeof Audio !== 'undefined' && Platform.OS === 'web') {
        const audio = new Audio(resolvedSrc);
        audio.volume = voiceVol;
        this.currentVoiceAudio = audio;
        this.isVoicePlaying = true;

        audio.onended = handleVoiceEnd;
        audio.play().catch(() => {
          this.isVoicePlaying = false;
          if (duck) this.duckMusic(this.musicVolume, 200);
        });
      } else {
        // Native Android / iOS via NativeAudioBridge
        this.isVoicePlaying = true;
        NativeAudioBridge.createAudioInstance(resolvedSrc, {
          loop: false,
          volume: voiceVol,
          shouldPlay: true,
        }).then((instance) => {
          this.currentVoiceAudio = instance;
          if (instance) {
            instance.setOnPlaybackStatusUpdate((status) => {
              if (status.didJustFinish) {
                handleVoiceEnd();
              }
            });
          }
        }).catch(() => {
          this.isVoicePlaying = false;
          if (duck) this.duckMusic(this.musicVolume, 200);
        });
      }
    } catch (e) {
      this.isVoicePlaying = false;
    }
  }

  stopVoice() {
    if (this.currentVoiceAudio) {
      try {
        if (this.currentVoiceAudio.pause) this.currentVoiceAudio.pause();
        if (this.currentVoiceAudio.unload) this.currentVoiceAudio.unload();
      } catch (e) {}
      this.currentVoiceAudio = null;
      this.isVoicePlaying = false;
      this.duckMusic(this.musicVolume, 200);
    }
  }

  // ==================== CONCURRENT SFX CHANNEL ====================
  playSFX(src, volumeScale = 1.0, hapticFeedback = null) {
    const resolvedSrc = this.resolveSource(src);
    if (!resolvedSrc || this.isMuted) return;

    NativeAudioBridge.playSFX(resolvedSrc, volumeScale * this.sfxVolume, hapticFeedback);
  }

  // ==================== GLOBAL CONTROLS ====================
  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicAudio && !this.isVoicePlaying && !this.isMuted) {
      if (this.musicAudio.setVolume) {
        this.musicAudio.setVolume(this.musicVolume);
      } else {
        this.musicAudio.volume = this.musicVolume;
      }
    }
  }

  setVoiceVolume(vol) {
    this.voiceVolume = Math.max(0, Math.min(1, vol));
    if (this.currentVoiceAudio && !this.isMuted) {
      if (this.currentVoiceAudio.setVolume) {
        this.currentVoiceAudio.setVolume(this.voiceVolume);
      } else {
        this.currentVoiceAudio.volume = this.voiceVolume;
      }
    }
  }

  setSFXVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    NativeAudioBridge.setMuted(this.isMuted);
    if (this.musicAudio) {
      const vol = this.isMuted ? 0 : this.musicVolume;
      if (this.musicAudio.setVolume) {
        this.musicAudio.setVolume(vol);
      } else {
        this.musicAudio.volume = vol;
      }
    }
    if (this.currentVoiceAudio) {
      const vol = this.isMuted ? 0 : this.voiceVolume;
      if (this.currentVoiceAudio.setVolume) {
        this.currentVoiceAudio.setVolume(vol);
      } else {
        this.currentVoiceAudio.volume = vol;
      }
    }
    return this.isMuted;
  }
}

export const audioMixer = new AudioMixerCore();

const AudioMixerContext = createContext(null);

export const AudioMixerProvider = ({ children, initialBgMusic }) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (initialBgMusic) {
      audioMixer.playMusic(initialBgMusic);
    }
    return () => {
      audioMixer.stopMusic();
      audioMixer.stopVoice();
    };
  }, [initialBgMusic]);

  const toggleMute = useCallback(() => {
    const muted = audioMixer.toggleMute();
    setIsMuted(muted);
  }, []);

  const playMusic = useCallback((src, loop = true) => {
    audioMixer.playMusic(src, loop);
  }, []);

  const stopMusic = useCallback(() => {
    audioMixer.stopMusic();
  }, []);

  const playVoice = useCallback((src, options) => {
    audioMixer.playVoice(src, options);
  }, []);

  const playSFX = useCallback((src, vol, haptic) => {
    audioMixer.playSFX(src, vol, haptic);
  }, []);

  return (
    <AudioMixerContext.Provider
      value={{
        audioMixer,
        playMusic,
        stopMusic,
        playVoice,
        playSFX,
        toggleMute,
        isMuted,
        setMusicVolume: (v) => audioMixer.setMusicVolume(v),
        setVoiceVolume: (v) => audioMixer.setVoiceVolume(v),
        setSFXVolume: (v) => audioMixer.setSFXVolume(v),
      }}
    >
      {children}
    </AudioMixerContext.Provider>
  );
};

export const useAudioMixer = () => {
  const context = useContext(AudioMixerContext);
  if (!context) {
    return {
      audioMixer,
      playMusic: (src, loop) => audioMixer.playMusic(src, loop),
      stopMusic: () => audioMixer.stopMusic(),
      playVoice: (src, opts) => audioMixer.playVoice(src, opts),
      playSFX: (src, vol, haptic) => audioMixer.playSFX(src, vol, haptic),
      toggleMute: () => audioMixer.toggleMute(),
      isMuted: audioMixer.isMuted,
      setMusicVolume: (v) => audioMixer.setMusicVolume(v),
      setVoiceVolume: (v) => audioMixer.setVoiceVolume(v),
      setSFXVolume: (v) => audioMixer.setSFXVolume(v),
    };
  }
  return context;
};
