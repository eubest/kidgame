import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  PanResponder,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Line, Circle, G, Text as SvgText, Path } from 'react-native-svg';
import confetti from '../utils/confetti';
import { audioMixer } from '../audio';
import { AndroidHaptics } from '../native/AndroidHaptics';

const PUZZLE_LEVELS = [
  {
    id: 1,
    name: 'Căsuța Fermecată',
    icon: '🏠',
    description: 'Unește toate liniile căsuței dintr-o singură trăsătură continuă!',
    // Classic Euler House with roof:
    // Vertices: 1 (bottom left), 2 (bottom right), 3 (top right), 4 (top left), 5 (roof peak)
    // Degrees: 1: 3, 2: 3, 3: 4, 4: 4, 5: 2 -> Euler path starts at 1 or 2!
    nodes: [
      { id: 1, x: 100, y: 340, label: 'A' },
      { id: 2, x: 260, y: 340, label: 'B' },
      { id: 3, x: 260, y: 190, label: 'C' },
      { id: 4, x: 100, y: 190, label: 'D' },
      { id: 5, x: 180, y: 100, label: 'E' },
    ],
    edges: [
      { id: '1-2', from: 1, to: 2 },
      { id: '2-3', from: 2, to: 3 },
      { id: '3-4', from: 3, to: 4 },
      { id: '4-1', from: 4, to: 1 },
      { id: '1-3', from: 1, to: 3 },
      { id: '2-4', from: 2, to: 4 },
      { id: '4-5', from: 4, to: 5 },
      { id: '5-3', from: 5, to: 3 },
    ],
  },
  {
    id: 2,
    name: 'Plicul Secret',
    icon: '✉️',
    description: 'Desenează plicul poștal fără să ridici degetul!',
    nodes: [
      { id: 1, x: 80, y: 320, label: '1' },
      { id: 2, x: 280, y: 320, label: '2' },
      { id: 3, x: 280, y: 170, label: '3' },
      { id: 4, x: 80, y: 170, label: '4' },
      { id: 5, x: 180, y: 240, label: '5' },
    ],
    edges: [
      { id: '1-2', from: 1, to: 2 },
      { id: '2-3', from: 2, to: 3 },
      { id: '3-4', from: 3, to: 4 },
      { id: '4-1', from: 4, to: 1 },
      { id: '4-5', from: 4, to: 5 },
      { id: '5-3', from: 5, to: 3 },
    ],
  },
  {
    id: 3,
    name: 'Steaua Aurie',
    icon: '⭐',
    description: 'Conturează steaua magică într-o singură mișcare lină!',
    nodes: [
      { id: 1, x: 180, y: 80, label: '★' },
      { id: 2, x: 280, y: 330, label: '★' },
      { id: 3, x: 80, y: 170, label: '★' },
      { id: 4, x: 280, y: 170, label: '★' },
      { id: 5, x: 80, y: 330, label: '★' },
    ],
    edges: [
      { id: '1-2', from: 1, to: 2 },
      { id: '2-3', from: 2, to: 3 },
      { id: '3-4', from: 3, to: 4 },
      { id: '4-5', from: 4, to: 5 },
      { id: '5-1', from: 5, to: 1 },
    ],
  },
  {
    id: 4,
    name: 'Bărcuța pe Valuri',
    icon: '⛵',
    description: 'Trasează catargul și corabia dintr-o singură trăsătură continuă!',
    nodes: [
      { id: 1, x: 70, y: 320, label: 'B1' },
      { id: 2, x: 290, y: 320, label: 'B2' },
      { id: 3, x: 240, y: 370, label: 'B3' },
      { id: 4, x: 120, y: 370, label: 'B4' },
      { id: 5, x: 180, y: 320, label: 'C1' },
      { id: 6, x: 180, y: 120, label: 'C2' },
      { id: 7, x: 280, y: 220, label: 'V' },
    ],
    edges: [
      { id: '1-2', from: 1, to: 2 },
      { id: '2-3', from: 2, to: 3 },
      { id: '3-4', from: 3, to: 4 },
      { id: '4-1', from: 4, to: 1 },
      { id: '5-6', from: 5, to: 6 },
      { id: '6-7', from: 6, to: 7 },
      { id: '7-5', from: 7, to: 5 },
    ],
  },
];

// Dynamically center and scale Eulerian graphs to fill chalkboard proportionally on any mobile screen
const getScaledPuzzle = (puzzle, canvasW, canvasH) => {
  if (!puzzle?.nodes?.length) return puzzle;

  const xs = puzzle.nodes.map((n) => n.x);
  const ys = puzzle.nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const origW = Math.max(10, maxX - minX);
  const origH = Math.max(10, maxY - minY);

  const paddingH = 45;
  const paddingV = 45;
  const availW = Math.max(100, canvasW - paddingH * 2);
  const availH = Math.max(100, canvasH - paddingV * 2);

  const scale = Math.min(availW / origW, availH / origH, 1.4);

  const centerOrigX = (minX + maxX) / 2;
  const centerOrigY = (minY + maxY) / 2;
  const centerTargetX = canvasW / 2;
  const centerTargetY = canvasH / 2;

  const scaledNodes = puzzle.nodes.map((n) => ({
    ...n,
    x: Math.round(centerTargetX + (n.x - centerOrigX) * scale),
    y: Math.round(centerTargetY + (n.y - centerOrigY) * scale),
  }));

  return {
    ...puzzle,
    nodes: scaledNodes,
  };
};

export const OneLinePuzzleGame = ({ audio, images, onBack, onComplete }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const rawPuzzle = PUZZLE_LEVELS[levelIdx];

  const winDim = Dimensions.get('window');
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: winDim.width,
    height: Math.max(340, winDim.height - 180),
  });

  const currentPuzzle = getScaledPuzzle(rawPuzzle, canvasDimensions.width, canvasDimensions.height);

  const [activeNodeId, setActiveNodeId] = useState(null);
  const [visitedEdgeIds, setVisitedEdgeIds] = useState([]);
  const [visitedNodesOrder, setVisitedNodesOrder] = useState([]);
  const [currentDragPos, setCurrentDragPos] = useState(null);
  const [isVictory, setIsVictory] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const containerRef = useRef(null);
  const containerLayout = useRef({ x: 0, y: 0, width: winDim.width, height: 440 }).current;
  const victoryScale = useRef(new Animated.Value(0)).current;

  // Reset when level changes
  useEffect(() => {
    setActiveNodeId(null);
    setVisitedEdgeIds([]);
    setVisitedNodesOrder([]);
    setCurrentDragPos(null);
    setIsVictory(false);
    setIsDrawing(false);
    victoryScale.setValue(0);

    if (audio?.oneLineIntro) {
      audioMixer.playVoice(audio.oneLineIntro, 0.95);
    }
  }, [levelIdx]);

  // Find edge between two nodes
  const findEdge = (u, v) => {
    return currentPuzzle.edges.find(
      (e) => (e.from === u && e.to === v) || (e.from === v && e.to === u)
    );
  };

  const startTouchPos = useRef({ x: 0, y: 0 }).current;

  const getRelativeTouch = (e, gestureState, isStart = false) => {
    if (isStart) {
      const locX = e.nativeEvent?.locationX ?? ((e.nativeEvent?.pageX || 0) - containerLayout.x);
      const locY = e.nativeEvent?.locationY ?? ((e.nativeEvent?.pageY || 0) - containerLayout.y);
      startTouchPos.x = locX;
      startTouchPos.y = locY;
      return { x: locX, y: locY };
    }

    if (e.nativeEvent?.locationX !== undefined && e.nativeEvent?.locationX !== null) {
      return { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
    }

    return {
      x: startTouchPos.x + (gestureState?.dx || 0),
      y: startTouchPos.y + (gestureState?.dy || 0),
    };
  };

  const findNearestNode = (relX, relY, radiusTolerance = 55) => {
    for (const node of currentPuzzle.nodes) {
      const dist = Math.hypot(node.x - relX, node.y - relY);
      if (dist <= radiusTolerance) {
        return node;
      }
    }
    return null;
  };

  const handleDirectNodePress = (hitNode) => {
    if (isVictory || !hitNode) return;
    if (!activeNodeId) {
      AndroidHaptics.light();
      setActiveNodeId(hitNode.id);
      setVisitedNodesOrder([hitNode.id]);
      setVisitedEdgeIds([]);
      if (audio?.sfxPop) audioMixer.playSFX(audio.sfxPop, 0.7);
    } else {
      if (hitNode.id === activeNodeId) return;
      const edge = findEdge(activeNodeId, hitNode.id);
      if (edge && !visitedEdgeIds.includes(edge.id)) {
        AndroidHaptics.tap();
        const newEdges = [...visitedEdgeIds, edge.id];
        const newNodes = [...visitedNodesOrder, hitNode.id];
        setVisitedEdgeIds(newEdges);
        setVisitedNodesOrder(newNodes);
        setActiveNodeId(hitNode.id);
        if (audio?.sfxChime) audioMixer.playSFX(audio.sfxChime, 0.85);
        if (newEdges.length === currentPuzzle.edges.length) {
          handleVictory();
        }
      } else if (
        visitedNodesOrder.length >= 2 &&
        hitNode.id === visitedNodesOrder[visitedNodesOrder.length - 2]
      ) {
        setVisitedEdgeIds(visitedEdgeIds.slice(0, -1));
        setVisitedNodesOrder(visitedNodesOrder.slice(0, -1));
        setActiveNodeId(hitNode.id);
        if (audio?.sfxSquish) audioMixer.playSFX(audio.sfxSquish, 0.6);
      } else {
        AndroidHaptics.warning();
      }
    }
  };

  const handleTouchStart = (e, gs) => {
    if (isVictory) return;
    const { x, y } = getRelativeTouch(e, gs, true);
    const hitNode = findNearestNode(x, y, 55);

    if (hitNode) {
      handleDirectNodePress(hitNode);
      setIsDrawing(true);
      setCurrentDragPos({ x, y });
    }
  };

  const handleTouchMove = (e, gs) => {
    if (!isDrawing || isVictory || !activeNodeId) return;

    const { x, y } = getRelativeTouch(e, gs);
    setCurrentDragPos({ x, y });

    // Check if dragging near an adjacent vertex
    const nearNode = findNearestNode(x, y, 42);

    if (nearNode && nearNode.id !== activeNodeId) {
      // Check if there is an edge between activeNodeId and nearNode.id
      const edge = findEdge(activeNodeId, nearNode.id);

      if (edge && !visitedEdgeIds.includes(edge.id)) {
        // Valid forward step along unvisited edge!
        AndroidHaptics.tap();
        const newEdges = [...visitedEdgeIds, edge.id];
        const newNodes = [...visitedNodesOrder, nearNode.id];

        setVisitedEdgeIds(newEdges);
        setVisitedNodesOrder(newNodes);
        setActiveNodeId(nearNode.id);

        if (audio?.sfxChime) {
          audioMixer.playSFX(audio.sfxChime, 0.85);
        }

        // Check if all edges are now completed!
        if (newEdges.length === currentPuzzle.edges.length) {
          handleVictory();
        }
      } else if (
        visitedNodesOrder.length >= 2 &&
        nearNode.id === visitedNodesOrder[visitedNodesOrder.length - 2]
      ) {
        // Child is backtracking to undo previous step!
        setVisitedEdgeIds(visitedEdgeIds.slice(0, -1));
        setVisitedNodesOrder(visitedNodesOrder.slice(0, -1));
        setActiveNodeId(nearNode.id);

        if (audio?.sfxSquish) {
          audioMixer.playSFX(audio.sfxSquish, 0.6);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isVictory) {
      setCurrentDragPos(null);
      setIsDrawing(false);
    }
  };

  const handleVictory = () => {
    setIsVictory(true);
    setIsDrawing(false);
    setCurrentDragPos(null);
    AndroidHaptics.victoryFanfare();

    if (audio?.oneLineWin) {
      audioMixer.playVoice(audio.oneLineWin, 1.0);
    }
    if (audio?.sfxBingo) {
      audioMixer.playSFX(audio.sfxBingo, 0.9);
    }

    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#2ED573', '#FF4757', '#1E90FF', '#FFA502', '#9B59B6'],
      });
    } catch (e) {}

    Animated.spring(victoryScale, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gs) => handleTouchStart(e, gs),
      onPanResponderMove: (e, gs) => handleTouchMove(e, gs),
      onPanResponderRelease: () => handleTouchEnd(),
      onPanResponderTerminate: () => handleTouchEnd(),
    })
  ).current;

  const nextPuzzle = () => {
    setActiveNodeId(null);
    setVisitedEdgeIds([]);
    setVisitedNodesOrder([]);
    setCurrentDragPos(null);
    setIsDrawing(false);
    setIsVictory(false);
    victoryScale.setValue(0);
    if (levelIdx < PUZZLE_LEVELS.length - 1) {
      setLevelIdx(levelIdx + 1);
    } else {
      setLevelIdx(0);
      if (onComplete) onComplete();
    }
  };

  const activeNode = currentPuzzle.nodes.find((n) => n.id === activeNodeId);

  return (
    <View style={styles.container}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>⬅ Înapoi</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>✨ Trasează dintr-o Mișcare</Text>
          <Text style={styles.subtitleText}>
            {currentPuzzle.icon} {currentPuzzle.name}
          </Text>
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            Linii: {visitedEdgeIds.length} / {currentPuzzle.edges.length}
          </Text>
        </View>
      </View>

      {/* 2. Instruction Banner */}
      <View style={styles.instructionBanner}>
        <Text style={styles.instructionText}>
          {isDrawing
            ? 'Ține degetul pe ecran și unește toate liniile fără să-l ridici!'
            : 'Atinge un punct strălucitor și trasează forma dintr-o singură mișcare continuă!'}
        </Text>
      </View>

      {/* 3. Puzzle Drawing Canvas Area */}
      <View
        ref={containerRef}
        style={styles.canvasArea}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          if (w > 0 && h > 0 && (Math.abs(w - canvasDimensions.width) > 5 || Math.abs(h - canvasDimensions.height) > 5)) {
            setCanvasDimensions({ width: Math.round(w), height: Math.round(h) });
          }
          if (containerRef.current?.measureInWindow) {
            containerRef.current.measureInWindow((x, y, cw, ch) => {
              if (cw > 0 && ch > 0) {
                containerLayout.x = x;
                containerLayout.y = y;
                containerLayout.width = cw;
                containerLayout.height = ch;
              }
            });
          }
        }}
        {...panResponder.panHandlers}
      >
        <Svg width="100%" height="100%">
          {/* Base Unvisited Edges (Light Slate Gray Outline) */}
          {currentPuzzle.edges.map((edge) => {
            const u = currentPuzzle.nodes.find((n) => n.id === edge.from);
            const v = currentPuzzle.nodes.find((n) => n.id === edge.to);
            const isVisited = visitedEdgeIds.includes(edge.id);

            return (
              <Line
                key={`base-${edge.id}`}
                x1={u.x}
                y1={u.y}
                x2={v.x}
                y2={v.y}
                stroke={isVisited ? '#2ED573' : 'rgba(255, 255, 255, 0.25)'}
                strokeWidth={isVisited ? 12 : 8}
                strokeLinecap="round"
              />
            );
          })}

          {/* Glowing Green Traced Edges */}
          {visitedEdgeIds.map((edgeId) => {
            const edge = currentPuzzle.edges.find((e) => e.id === edgeId);
            if (!edge) return null;
            const u = currentPuzzle.nodes.find((n) => n.id === edge.from);
            const v = currentPuzzle.nodes.find((n) => n.id === edge.to);
            if (!u || !v) return null;

            return (
              <G key={`glow-${edge.id}`}>
                <Line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke="rgba(46, 213, 115, 0.4)"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                <Line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke="#2ED573"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </G>
            );
          })}

          {/* Active Live Elastic Rubberband Line from active node to touch pointer */}
          {isDrawing && activeNode && currentDragPos && (
            <Line
              x1={activeNode.x}
              y1={activeNode.y}
              x2={currentDragPos.x}
              y2={currentDragPos.y}
              stroke="#FFD32A"
              strokeWidth="7"
              strokeDasharray="6, 6"
              strokeLinecap="round"
            />
          )}

          {/* Graph Vertices (Nodes) */}
          {currentPuzzle.nodes.map((node) => {
            const isActive = activeNodeId === node.id;
            const isStartCandidate = !isDrawing;

            return (
              <G
                key={`node-${node.id}`}
                onPress={() => handleDirectNodePress(node)}
              >
                {/* Outer Glow on Active or Start Nodes */}
                {(isActive || isStartCandidate) && (
                  <Circle
                    cx={node.x}
                    cy={node.y}
                    r="26"
                    fill={isActive ? 'rgba(255, 211, 42, 0.4)' : 'rgba(255, 255, 255, 0.15)'}
                  />
                )}
                {/* Main Node Body */}
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r="18"
                  fill={isActive ? '#FFD32A' : '#FFFFFF'}
                  stroke="#2C3E50"
                  strokeWidth="3"
                />
                {/* Node Center Dot */}
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r="6"
                  fill={isActive ? '#FF4757' : '#2ED573'}
                />
              </G>
            );
          })}
        </Svg>
      </View>

      {/* 4. Bottom Controls */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setActiveNodeId(null);
            setVisitedEdgeIds([]);
            setVisitedNodesOrder([]);
            setCurrentDragPos(null);
            setIsDrawing(false);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>🔄 Resetează Traseul</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={nextPuzzle}
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>Următorul Puzzle ➔</Text>
        </TouchableOpacity>
      </View>

      {/* 5. Victory Celebration Modal */}
      {isVictory && (
        <Animated.View
          style={[
            styles.victoryOverlay,
            {
              transform: [{ scale: victoryScale }],
              opacity: victoryScale,
            },
          ]}
        >
          <View style={styles.victoryCard}>
            <Text style={{ fontSize: 68, textAlign: 'center' }}>🌟🏆🎨</Text>
            <Text style={styles.victoryTitle}>Capodoperă!</Text>
            <Text style={styles.victoryDesc}>
              Ai desenat toată forma magică fără să ridici degetul de pe ecran! Ești un adevărat maestru al liniilor!
            </Text>

            <TouchableOpacity
              style={styles.modalNextButton}
              onPress={nextPuzzle}
              activeOpacity={0.85}
            >
              <Text style={styles.modalNextButtonText}>Următoarea Provocare ➔</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E272E', // Deep charcoal chalkboard
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 44 : 14,
    paddingBottom: 10,
    backgroundColor: 'rgba(30, 39, 46, 0.95)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    backgroundColor: '#485460',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleText: {
    color: '#2ED573',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  subtitleText: {
    color: '#D2DAE2',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  badgeContainer: {
    backgroundColor: '#FFA502',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  instructionBanner: {
    backgroundColor: 'rgba(46, 213, 115, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 213, 115, 0.3)',
  },
  instructionText: {
    color: '#7BED9F',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  canvasArea: {
    flex: 1,
    position: 'relative',
    margin: 12,
    borderRadius: 24,
    backgroundColor: '#2F3640',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(30, 39, 46, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetButton: {
    backgroundColor: '#57606F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  skipButton: {
    backgroundColor: '#3742FA',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  victoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  victoryCard: {
    width: '85%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#2ED573',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  victoryTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2ED573',
    marginVertical: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  victoryDesc: {
    fontSize: 16,
    color: '#57606F',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
  modalNextButton: {
    backgroundColor: '#2ED573',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 22,
  },
  modalNextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'Fredoka, sans-serif' : 'System',
  },
});

export default OneLinePuzzleGame;
