import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { audioMixer } from '../audio/index.js';

const PALETTE = [
  { id: 'yellow', color: '#FFD32A', label: 'Galben' },
  { id: 'blue', color: '#1E90FF', label: 'Albastru' },
  { id: 'red', color: '#FF4757', label: 'Roșu' },
  { id: 'green', color: '#2ED573', label: 'Verde' },
  { id: 'white', color: '#FFFFFF', label: 'Alb' },
];

const STROKE_WIDTHS = [
  { id: 'thin', size: 4, label: 'Subțire' },
  { id: 'medium', size: 8, label: 'Mediu' },
  { id: 'thick', size: 16, label: 'Gros' },
];

export const ScratchpadOverlay = ({ audio, isVisible, onClose }) => {
  const [paths, setPaths] = useState([]);
  const [currentPathPoints, setCurrentPathPoints] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#FFD32A');
  const [selectedWidth, setSelectedWidth] = useState(8);
  const [isEraser, setIsEraser] = useState(false);

  const containerRef = useRef(null);
  const containerLayout = useRef({ x: 0, y: 0 }).current;

  const getCoordinates = (e, gestureState) => {
    let clientX = gestureState.moveX;
    let clientY = gestureState.moveY;

    if ((!clientX || clientX === 0) && e.nativeEvent) {
      clientX = e.nativeEvent.pageX || e.nativeEvent.clientX || 0;
      clientY = e.nativeEvent.pageY || e.nativeEvent.clientY || 0;
    }

    if (Platform.OS === 'web' && containerRef.current?.getBoundingClientRect) {
      const rect = containerRef.current.getBoundingClientRect();
      containerLayout.x = rect.left + (window.scrollX || 0);
      containerLayout.y = rect.top + (window.scrollY || 0);
    }

    const relX = clientX - containerLayout.x;
    const relY = clientY - containerLayout.y;
    return { x: relX, y: relY };
  };

  const handleGrant = (e, gs) => {
    const { x, y } = getCoordinates(e, gs);
    setCurrentPathPoints([{ x, y }]);
  };

  const handleMove = (e, gs) => {
    const { x, y } = getCoordinates(e, gs);
    setCurrentPathPoints((prev) => [...prev, { x, y }]);
  };

  const handleRelease = () => {
    if (currentPathPoints.length > 0) {
      const pathData = {
        id: Date.now(),
        points: currentPathPoints,
        color: isEraser ? 'rgba(0, 0, 0, 0.85)' : selectedColor,
        width: isEraser ? 28 : selectedWidth,
        isEraser,
      };
      setPaths((prev) => [...prev, pathData]);
      setCurrentPathPoints([]);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gs) => handleGrant(e, gs),
      onPanResponderMove: (e, gs) => handleMove(e, gs),
      onPanResponderRelease: () => handleRelease(),
      onPanResponderTerminate: () => handleRelease(),
    })
  ).current;

  const pointsToSvgPath = (points) => {
    if (!points || points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  };

  const clearAll = () => {
    setPaths([]);
    setCurrentPathPoints([]);
    if (audio?.sfxWhoosh) {
      audioMixer.playSFX(audio.sfxWhoosh, 0.7);
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      {/* 1. Frosted Drawing Canvas Area */}
      <View
        ref={containerRef}
        style={styles.canvasArea}
        {...panResponder.panHandlers}
      >
        <Svg style={StyleSheet.absoluteFill}>
          {/* Committed paths */}
          {paths.map((p) => (
            <Path
              key={`path-${p.id}`}
              d={pointsToSvgPath(p.points)}
              stroke={p.color}
              strokeWidth={p.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}

          {/* Active live path */}
          {currentPathPoints.length > 0 && (
            <Path
              d={pointsToSvgPath(currentPathPoints)}
              stroke={isEraser ? 'rgba(0, 0, 0, 0.85)' : selectedColor}
              strokeWidth={isEraser ? 28 : selectedWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>
      </View>

      {/* 2. Top Floating Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <Text style={styles.toolbarTitle}>✏️ Ciornă de Lucru</Text>
        </View>

        {/* Color Palette */}
        <View style={styles.paletteRow}>
          {PALETTE.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.colorCircle,
                { backgroundColor: item.color },
                selectedColor === item.color && !isEraser && styles.colorCircleActive,
              ]}
              onPress={() => {
                setSelectedColor(item.color);
                setIsEraser(false);
              }}
              activeOpacity={0.8}
            />
          ))}
        </View>

        {/* Brush Sizes */}
        <View style={styles.sizeRow}>
          {STROKE_WIDTHS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.sizeButton,
                selectedWidth === item.size && !isEraser && styles.sizeButtonActive,
              ]}
              onPress={() => {
                setSelectedWidth(item.size);
                setIsEraser(false);
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.sizeDot,
                  { width: item.size, height: item.size, borderRadius: item.size / 2 },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions: Eraser, Clear, Close */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.toolButton, isEraser && styles.toolButtonActive]}
            onPress={() => setIsEraser(!isEraser)}
            activeOpacity={0.8}
          >
            <Text style={styles.toolButtonText}>🧹 Radieră</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, styles.clearButton]}
            onPress={clearAll}
            activeOpacity={0.8}
          >
            <Text style={styles.toolButtonText}>🗑️ Șterge</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, styles.closeButton]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>✖ Închide</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  canvasArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24, 30, 42, 0.45)', // Translucent chalkboard overlay
  },
  toolbar: {
    position: 'absolute',
    top: 14,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 39, 46, 0.95)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  toolbarLeft: {
    marginRight: 10,
  },
  toolbarTitle: {
    color: '#FFD32A',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.2 }],
    shadowColor: '#FFF',
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  sizeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3742FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonActive: {
    backgroundColor: '#FF4757',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sizeDot: {
    backgroundColor: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  toolButton: {
    backgroundColor: '#57606F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  toolButtonActive: {
    backgroundColor: '#FFA502',
  },
  toolButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  clearButton: {
    backgroundColor: '#FF4757',
  },
  closeButton: {
    backgroundColor: '#2F3542',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  closeButtonText: {
    color: '#FF6B81',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
});
