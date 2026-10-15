import { Platform } from 'react-native';

const safeConfetti = (options = {}) => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    try {
      const confettiLib = require('canvas-confetti');
      const fire = confettiLib.default || confettiLib;
      if (typeof fire === 'function') {
        fire(options);
      }
    } catch (e) {
      // Gracefully silent on unsupported environments
    }
  }
};

export const triggerConfetti = safeConfetti;
export default safeConfetti;
