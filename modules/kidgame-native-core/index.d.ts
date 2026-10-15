export interface MemoryMetrics {
  usedMemoryMb: number;
  freeMemoryMb: number;
  maxMemoryMb: number;
  lowMemoryThresholdMb: number;
}

export interface KidgameNativeCoreInterface {
  vibratePredefined(effectType: 'click' | 'heavy_click' | 'tick' | 'double_click'): boolean;
  vibratePattern(pattern: number[], repeatIndex: number): boolean;
  cancelVibration(): void;
  loadSound(assetPath: string): number;
  playSound(soundId: number, volume: number, rate: number): number;
  stopSound(streamId: number): void;
  getDisplayRefreshRate(): number;
  getMemoryMetrics(): MemoryMetrics;
}

export declare const KidgameNativeCore: KidgameNativeCoreInterface;
export default KidgameNativeCore;
