import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useDragDrop } from './DragDropContext.js';

export const DropZone = ({
  id,
  accepts = ['*'],
  onDrop,
  onHoverEnter,
  onHoverLeave,
  collisionBuffer = 35, // Forgiving radius buffer in dp/px
  disabled = false,
  style,
  activeStyle,
  children,
}) => {
  const { registerDropZone, unregisterDropZone, updateDropZoneLayout, activeHoverZone } = useDragDrop();
  const zoneRef = useRef(null);
  const isHovered = activeHoverZone === id;

  const measureZone = useCallback(() => {
    if (!zoneRef.current) return;

    if (Platform.OS === 'web') {
      // In web, use getBoundingClientRect for absolute client coordinates
      const node = zoneRef.current;
      if (node?.getBoundingClientRect) {
        const rect = node.getBoundingClientRect();
        updateDropZoneLayout(id, {
          x: rect.left + (window.scrollX || 0),
          y: rect.top + (window.scrollY || 0),
          width: rect.width,
          height: rect.height,
          collisionBuffer,
        });
      }
    } else {
      // Native measure in window
      zoneRef.current.measureInWindow((x, y, width, height) => {
        updateDropZoneLayout(id, {
          x,
          y,
          width,
          height,
          collisionBuffer,
        });
      });
    }
  }, [id, collisionBuffer, updateDropZoneLayout]);

  useEffect(() => {
    registerDropZone({
      id,
      accepts: Array.isArray(accepts) ? accepts : [accepts],
      onDrop,
      onHoverEnter,
      onHoverLeave,
      disabled,
      bounds: null,
    });

    // Small delay to ensure render layout is populated
    const timer = setTimeout(measureZone, 150);

    return () => {
      clearTimeout(timer);
      unregisterDropZone(id);
    };
  }, [id, accepts, onDrop, onHoverEnter, onHoverLeave, disabled, registerDropZone, unregisterDropZone, measureZone]);

  return (
    <View
      ref={zoneRef}
      collapsable={false}
      onLayout={measureZone}
      style={[styles.zoneDefault, style, isHovered && (activeStyle || styles.zoneHovered)]}
    >
      {typeof children === 'function' ? children({ isHovered }) : children}
    </View>
  );
};

const styles = StyleSheet.create({
  zoneDefault: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneHovered: {
    transform: [{ scale: 1.05 }],
  },
});
