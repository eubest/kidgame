import React, { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Platform,
} from 'react-native';
import { useDragDrop } from './DragDropContext.js';

export const Draggable = ({
  id,
  data,
  type = 'default',
  disabled = false,
  hitSlop = { top: 20, bottom: 20, left: 20, right: 20 },
  onDragStart,
  onDragMove,
  onDropSuccess,
  onDropFail,
  style,
  children,
}) => {
  const { onDragMove: notifyDragMove, onDragEnd: notifyDragEnd, setDraggingItem } = useDragDrop();

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const tilt = useRef(new Animated.Value(0)).current;

  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef(null);

  // Helper to extract absolute screen/page coordinates
  const getPointerCoords = (e, gestureState) => {
    let x = gestureState.moveX;
    let y = gestureState.moveY;

    // Fallbacks for web mouse events where moveX might be 0 initially
    if ((!x || x === 0) && e.nativeEvent) {
      x = e.nativeEvent.pageX || e.nativeEvent.clientX || 0;
      y = e.nativeEvent.pageY || e.nativeEvent.clientY || 0;
    }
    return { x, y };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (disabled) return false;
        // Require at least a slight movement before locking gesture
        return Math.hypot(gestureState.dx, gestureState.dy) > 3;
      },
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (e, gestureState) => {
        setIsDragging(true);
        setDraggingItem({ id, type, data });

        // Squishy pickup animation: scale up to 1.14x with slight spring
        Animated.spring(scale, {
          toValue: 1.14,
          friction: 4,
          tension: 100,
          useNativeDriver: false,
        }).start();

        if (onDragStart) {
          const coords = getPointerCoords(e, gestureState);
          onDragStart({ id, type, data, coords });
        }
      },

      onPanResponderMove: (e, gestureState) => {
        // Continuous 60 FPS translation
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });

        // Dynamic tilt based on horizontal velocity (squishy wobble)
        const targetTilt = Math.max(-0.25, Math.min(0.25, gestureState.vx * 0.15));
        tilt.setValue(targetTilt);

        const { x, y } = getPointerCoords(e, gestureState);
        notifyDragMove(x, y, type);

        if (onDragMove) {
          onDragMove({ x, y, dx: gestureState.dx, dy: gestureState.dy });
        }
      },

      onPanResponderRelease: (e, gestureState) => {
        const { x, y } = getPointerCoords(e, gestureState);
        const { handled, zone } = notifyDragEnd(x, y, { id, type, data });

        if (handled) {
          // Success: pop/absorb animation into target
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 0,
              duration: 220,
              useNativeDriver: false,
            }),
            Animated.timing(tilt, {
              toValue: 0,
              duration: 150,
              useNativeDriver: false,
            }),
          ]).start(() => {
            setIsDragging(false);
            if (onDropSuccess) onDropSuccess({ zone, id, data });
            // Reset position after absorption
            pan.setValue({ x: 0, y: 0 });
            scale.setValue(1);
          });
        } else {
          // Failed drop: spring bounce back to origin with squish
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              tension: 45,
              useNativeDriver: false,
            }),
            Animated.spring(scale, {
              toValue: 1,
              friction: 4,
              tension: 80,
              useNativeDriver: false,
            }),
            Animated.spring(tilt, {
              toValue: 0,
              friction: 6,
              tension: 60,
              useNativeDriver: false,
            }),
          ]).start(() => {
            setIsDragging(false);
            if (onDropFail) onDropFail({ id, data });
          });
        }
      },

      onPanResponderTerminate: () => {
        // Handle cancelled gesture
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            tension: 50,
            useNativeDriver: false,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.spring(tilt, {
            toValue: 0,
            useNativeDriver: false,
          }),
        ]).start(() => {
          setIsDragging(false);
          notifyDragEnd(0, 0, null);
        });
      },
    })
  ).current;

  const rotateInterpolation = tilt.interpolate({
    inputRange: [-0.3, 0.3],
    outputRange: ['-14deg', '14deg'],
  });

  return (
    <Animated.View
      ref={elementRef}
      hitSlop={hitSlop}
      {...panResponder.panHandlers}
      style={[
        style,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
            { rotate: rotateInterpolation },
          ],
          zIndex: isDragging ? 999 : 1,
          elevation: isDragging ? 12 : 2,
          opacity: disabled ? 0.4 : 1,
          cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        },
      ]}
    >
      {typeof children === 'function' ? children({ isDragging }) : children}
    </Animated.View>
  );
};
