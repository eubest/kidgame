import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

const DragDropContext = createContext(null);

export const DragDropProvider = ({ children }) => {
  const dropZonesRef = useRef(new Map());
  const [activeHoverZone, setActiveHoverZone] = useState(null);
  const [draggingItem, setDraggingItem] = useState(null);

  const registerDropZone = useCallback((zone) => {
    dropZonesRef.current.set(zone.id, zone);
  }, []);

  const unregisterDropZone = useCallback((zoneId) => {
    dropZonesRef.current.delete(zoneId);
  }, []);

  const updateDropZoneLayout = useCallback((zoneId, bounds) => {
    const existing = dropZonesRef.current.get(zoneId);
    if (existing) {
      dropZonesRef.current.set(zoneId, {
        ...existing,
        bounds: {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          centerX: bounds.x + bounds.width / 2,
          centerY: bounds.y + bounds.height / 2,
          radius: Math.max(bounds.width, bounds.height) / 2 + (bounds.collisionBuffer || 25),
        },
      });
    }
  }, []);

  /**
   * Forgiving child-friendly hit-testing
   * Checks both circular radius and expanded rectangular bounds
   */
  const findCollidingZone = useCallback((touchX, touchY, payloadType = null) => {
    let closestZone = null;
    let minDistance = Infinity;

    for (const [id, zone] of dropZonesRef.current.entries()) {
      if (!zone.bounds) continue;
      if (zone.disabled) continue;

      // Type acceptance check
      if (payloadType && zone.accepts && zone.accepts.length > 0) {
        if (!zone.accepts.includes(payloadType) && !zone.accepts.includes('*')) {
          continue;
        }
      }

      const { x, y, width, height, centerX, centerY, radius } = zone.bounds;
      const buffer = zone.bounds.collisionBuffer || 30; // 30px forgiving slop for small fingers

      // Rectangular bounding box with buffer
      const inRect =
        touchX >= x - buffer &&
        touchX <= x + width + buffer &&
        touchY >= y - buffer &&
        touchY <= y + height + buffer;

      // Distance check
      const dist = Math.hypot(touchX - centerX, touchY - centerY);
      const inCircle = dist <= radius;

      if (inRect || inCircle) {
        if (dist < minDistance) {
          minDistance = dist;
          closestZone = zone;
        }
      }
    }

    return closestZone;
  }, []);

  const onDragMove = useCallback((touchX, touchY, payloadType = null) => {
    const zone = findCollidingZone(touchX, touchY, payloadType);
    const newZoneId = zone ? zone.id : null;

    if (newZoneId !== activeHoverZone) {
      if (activeHoverZone) {
        const oldZone = dropZonesRef.current.get(activeHoverZone);
        if (oldZone?.onHoverLeave) oldZone.onHoverLeave();
      }
      if (zone?.onHoverEnter) {
        zone.onHoverEnter();
      }
      setActiveHoverZone(newZoneId);
    }
    return zone;
  }, [activeHoverZone, findCollidingZone]);

  const onDragEnd = useCallback((touchX, touchY, payload) => {
    const zone = findCollidingZone(touchX, touchY, payload?.type);
    let handled = false;

    if (activeHoverZone) {
      const oldZone = dropZonesRef.current.get(activeHoverZone);
      if (oldZone?.onHoverLeave) oldZone.onHoverLeave();
      setActiveHoverZone(null);
    }

    if (zone && zone.onDrop) {
      zone.onDrop(payload);
      handled = true;
    }

    setDraggingItem(null);
    return { handled, zone };
  }, [activeHoverZone, findCollidingZone]);

  return (
    <DragDropContext.Provider
      value={{
        registerDropZone,
        unregisterDropZone,
        updateDropZoneLayout,
        findCollidingZone,
        onDragMove,
        onDragEnd,
        activeHoverZone,
        draggingItem,
        setDraggingItem,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};
