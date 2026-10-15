import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Text,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Line,
  G,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
} from 'react-native-svg';
import { SparkleParticle } from './SparkleParticle.js';

export const VectorPathTracingEngine = ({
  pathData,
  waypointRadius = 38, // Generous preschooler motor tolerance
  trackWidth = 34,
  tracedColor = '#FF4757',
  guideColor = '#E2E8F0',
  onWaypointHit,
  onStrokeComplete,
  onPathComplete,
  showGuideArrow = true,
  showWaypoints = true,
  width = 320,
  height = 320,
  style,
}) => {
  const [activeStrokeIndex, setActiveStrokeIndex] = useState(0);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState([]);
  const [activeTracedPoints, setActiveTracedPoints] = useState([]);
  const [particles, setParticles] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const containerRef = useRef(null);
  const containerLayout = useRef({ x: 0, y: 0, width, height }).current;

  // Pulsing animation for the active target waypoint beacon
  const pulseAnim = useRef(new Animated.Value(0)).current;
  // Moving guide arrow animation along the upcoming segment
  const guideProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Looping pulse for target waypoint
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ])
    );
    pulseLoop.start();

    // Looping guide arrow along the segment
    const guideLoop = Animated.loop(
      Animated.timing(guideProgress, {
        toValue: 1,
        duration: 1300,
        useNativeDriver: false,
      })
    );
    guideLoop.start();

    return () => {
      pulseLoop.stop();
      guideLoop.stop();
    };
  }, [pulseAnim, guideProgress]);

  // Reset state when pathData changes
  useEffect(() => {
    setActiveStrokeIndex(0);
    setActiveWaypointIndex(0);
    setCompletedStrokes([]);
    setActiveTracedPoints([]);
    setParticles([]);
    setIsCompleted(false);
  }, [pathData]);

  const strokes = pathData?.strokes || [];
  const currentStroke = strokes[activeStrokeIndex];
  const targetWaypoint = currentStroke?.points?.[activeWaypointIndex];
  const prevWaypoint = activeWaypointIndex > 0 ? currentStroke?.points?.[activeWaypointIndex - 1] : null;

  // Measure container layout
  const onContainerLayout = (e) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    containerLayout.width = w;
    containerLayout.height = h;

    if (containerRef.current?.measureInWindow) {
      containerRef.current.measureInWindow((x, y) => {
        containerLayout.x = x;
        containerLayout.y = y;
      });
    }
  };

  // Convert touch event to SVG coordinate space (300 x 300 viewBox)
  const getSvgCoordinates = useCallback(
    (e, gestureState) => {
      let clientX = gestureState.moveX;
      let clientY = gestureState.moveY;

      if ((!clientX || clientX === 0) && e.nativeEvent) {
        clientX = e.nativeEvent.pageX || e.nativeEvent.clientX || 0;
        clientY = e.nativeEvent.pageY || e.nativeEvent.clientY || 0;
      }

      // Web bounding rect fallback
      if (Platform.OS === 'web' && containerRef.current?.getBoundingClientRect) {
        const rect = containerRef.current.getBoundingClientRect();
        containerLayout.x = rect.left + (window.scrollX || 0);
        containerLayout.y = rect.top + (window.scrollY || 0);
        containerLayout.width = rect.width;
        containerLayout.height = rect.height;
      }

      const relX = clientX - containerLayout.x;
      const relY = clientY - containerLayout.y;

      const scaleX = (pathData?.width || 300) / (containerLayout.width || width);
      const scaleY = (pathData?.height || 300) / (containerLayout.height || height);

      return {
        svgX: relX * scaleX,
        svgY: relY * scaleY,
        pixelX: relX,
        pixelY: relY,
      };
    },
    [containerLayout, pathData, width, height]
  );

  const spawnSparkles = useCallback((pixelX, pixelY, count = 3) => {
    const newItems = [];
    const colors = ['#FFD700', '#FFA502', '#FF4757', '#2ED573', '#1E90FF'];
    for (let i = 0; i < count; i++) {
      newItems.push({
        id: `${Date.now()}_${Math.random()}`,
        x: pixelX + (Math.random() - 0.5) * 20,
        y: pixelY + (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles((prev) => [...prev.slice(-15), ...newItems]);
  }, []);

  const handlePointerInteraction = useCallback(
    (e, gestureState) => {
      if (isCompleted || !targetWaypoint) return;

      const { svgX, svgY, pixelX, pixelY } = getSvgCoordinates(e, gestureState);
      const dist = Math.hypot(svgX - targetWaypoint.x, svgY - targetWaypoint.y);

      // Check waypoint sequence collision with forgiving tolerance
      if (dist <= waypointRadius) {
        spawnSparkles(pixelX, pixelY, 4);

        if (onWaypointHit) {
          onWaypointHit(activeStrokeIndex, activeWaypointIndex);
        }

        // Add waypoint to active traced points
        const nextTraced = [...activeTracedPoints, targetWaypoint];
        setActiveTracedPoints(nextTraced);

        const nextWpIdx = activeWaypointIndex + 1;

        if (nextWpIdx >= currentStroke.points.length) {
          // Completed the current stroke
          const updatedCompleted = [
            ...completedStrokes,
            { strokeId: currentStroke.id, points: currentStroke.points },
          ];
          setCompletedStrokes(updatedCompleted);
          setActiveTracedPoints([]);

          if (onStrokeComplete) {
            onStrokeComplete(activeStrokeIndex);
          }

          const nextStrokeIdx = activeStrokeIndex + 1;
          if (nextStrokeIdx >= strokes.length) {
            // Whole path is completed!
            setIsCompleted(true);
            spawnSparkles(pixelX, pixelY, 12);
            if (onPathComplete) {
              onPathComplete();
            }
          } else {
            setActiveStrokeIndex(nextStrokeIdx);
            setActiveWaypointIndex(0);
          }
        } else {
          setActiveWaypointIndex(nextWpIdx);
        }
      }
    },
    [
      isCompleted,
      targetWaypoint,
      getSvgCoordinates,
      waypointRadius,
      spawnSparkles,
      onWaypointHit,
      activeStrokeIndex,
      activeWaypointIndex,
      activeTracedPoints,
      currentStroke,
      completedStrokes,
      onStrokeComplete,
      strokes.length,
      onPathComplete,
    ]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gs) => handlePointerInteraction(e, gs),
      onPanResponderMove: (e, gs) => handlePointerInteraction(e, gs),
    })
  ).current;

  // Helper to construct SVG Path string from an array of waypoints
  const buildSvgPath = (points) => {
    if (!points || points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  };

  // Calculate guide arrow coordinates along the active segment
  const getGuideArrowPosition = () => {
    if (!targetWaypoint) return null;
    const start = prevWaypoint || currentStroke?.points?.[0];
    if (!start || start === targetWaypoint) return targetWaypoint;

    // We can evaluate progress using animated value or static midpoint
    const dx = targetWaypoint.x - start.x;
    const dy = targetWaypoint.y - start.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return {
      x: start.x + dx * 0.55,
      y: start.y + dy * 0.55,
      angle,
    };
  };

  const arrowInfo = getGuideArrowPosition();

  // Active beacon scale/opacity interpolations
  const beaconScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  const beaconOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 0.2],
  });

  return (
    <View
      ref={containerRef}
      onLayout={onContainerLayout}
      {...panResponder.panHandlers}
      style={[styles.container, { width, height }, style]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={pathData?.viewBox || '0 0 300 300'}
        style={styles.svgOverlay}
      >
        <Defs>
          <LinearGradient id="tracedGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FF4757" stopOpacity="1" />
            <Stop offset="50%" stopColor="#FFA502" stopOpacity="1" />
            <Stop offset="100%" stopColor="#2ED573" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="guideGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* 1. BACKGROUND GUIDE TRACKS (All strokes) */}
        {strokes.map((stroke, sIdx) => {
          const d = buildSvgPath(stroke.points);
          return (
            <G key={`guide_stroke_${stroke.id || sIdx}`}>
              {/* Outer soft outline */}
              <Path
                d={d}
                stroke={guideColor}
                strokeWidth={trackWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Center dashed trajectory guide */}
              <Path
                d={d}
                stroke="#94A3B8"
                strokeWidth={3}
                strokeDasharray="6, 8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.65}
              />
            </G>
          );
        })}

        {/* 2. COMPLETED STROKES */}
        {completedStrokes.map((cStroke, idx) => (
          <Path
            key={`completed_${idx}`}
            d={buildSvgPath(cStroke.points)}
            stroke="url(#tracedGradient)"
            strokeWidth={trackWidth - 4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}

        {/* 3. CURRENTLY TRACED STROKE SEGMENT */}
        {activeTracedPoints.length > 0 && (
          <Path
            d={buildSvgPath(activeTracedPoints)}
            stroke="url(#tracedGradient)"
            strokeWidth={trackWidth - 4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* 4. ANIMATED GUIDE ARROW on current segment */}
        {showGuideArrow && arrowInfo && !isCompleted && (
          <G
            transform={`translate(${arrowInfo.x}, ${arrowInfo.y}) rotate(${arrowInfo.angle})`}
          >
            <Polygon
              points="-12,-8 6,0 -12,8 -6,0"
              fill="#FFA502"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          </G>
        )}

        {/* 5. WAYPOINT NODES */}
        {showWaypoints &&
          strokes.map((stroke, sIdx) =>
            stroke.points.map((pt, pIdx) => {
              const isPastStroke = sIdx < activeStrokeIndex;
              const isCurrentStroke = sIdx === activeStrokeIndex;
              const isReached = isPastStroke || (isCurrentStroke && pIdx < activeWaypointIndex);
              const isTarget = isCurrentStroke && pIdx === activeWaypointIndex && !isCompleted;

              return (
                <G key={`wp_${sIdx}_${pIdx}`}>
                  {/* Glowing beacon for active target waypoint */}
                  {isTarget && (
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={waypointRadius * 0.75}
                      fill="#FF4757"
                      opacity={0.35}
                    />
                  )}

                  {/* Waypoint circle */}
                  <Circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isTarget ? 18 : 13}
                    fill={isReached ? '#2ED573' : isTarget ? '#FFA502' : '#FFFFFF'}
                    stroke={isReached ? '#1B9CFC' : isTarget ? '#FF4757' : '#94A3B8'}
                    strokeWidth={isTarget ? 3.5 : 2.5}
                  />

                  {/* Waypoint number/symbol */}
                  <Circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isTarget ? 7 : 4}
                    fill={isReached ? '#FFFFFF' : isTarget ? '#FFFFFF' : '#64748B'}
                  />
                </G>
              );
            })
          )}
      </Svg>

      {/* 6. SPARKLE PARTICLES OVERLAY */}
      {particles.map((p) => (
        <SparkleParticle
          key={p.id}
          x={p.x}
          y={p.y}
          color={p.color}
          onFinish={() => setParticles((curr) => curr.filter((item) => item.id !== p.id))}
        />
      ))}

      {/* Completion Trophy Banner */}
      {isCompleted && (
        <View style={styles.celebrationBadge}>
          <Text style={styles.celebrationText}>🌟 Minunat! Ai trasat cu succes!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    borderWidth: 3,
    borderColor: '#F1F2F6',
    touchAction: 'none',
  },
  svgOverlay: {
    width: '100%',
    height: '100%',
  },
  celebrationBadge: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: '#2ED573',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    boxShadow: '0 4px 12px rgba(46, 213, 115, 0.4)',
  },
  celebrationText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
