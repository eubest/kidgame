import { Platform } from 'react-native';

let NativeModule = null;

try {
  // Try expo-modules-core native loader if available
  const { requireNativeModule, requireOptionalNativeModule } = require('expo-modules-core');
  if (typeof requireOptionalNativeModule === 'function') {
    NativeModule = requireOptionalNativeModule('KidgameNativeCore');
  } else if (typeof requireNativeModule === 'function') {
    try {
      NativeModule = requireNativeModule('KidgameNativeCore');
    } catch (e) {
      NativeModule = null;
    }
  }
} catch (err) {
  NativeModule = null;
}

// Fallback stub implementation for Web / Test / Unsupported platforms
const FallbackModule = {
  vibratePredefined: (effectType) => false,
  vibratePattern: (pattern, repeat) => false,
  cancelVibration: () => {},
  loadSound: (path) => -1,
  playSound: (soundId, volume, rate) => -1,
  stopSound: (streamId) => {},
  getDisplayRefreshRate: () => 60.0,
  getMemoryMetrics: () => ({
    usedMemoryMb: 64,
    freeMemoryMb: 256,
    maxMemoryMb: 512,
    lowMemoryThresholdMb: 76,
  }),
};

export const KidgameNativeCore = NativeModule || FallbackModule;
export default KidgameNativeCore;
