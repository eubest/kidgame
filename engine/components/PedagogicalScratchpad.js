import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

const PEN_COLORS = [
  { id: 'blue', hex: '#1E90FF', label: 'Albastru' },
  { id: 'yellow', hex: '#FFD700', label: 'Galben' },
  { id: 'pink', hex: '#FF4757', label: 'Roz' },
  { id: 'white', hex: '#FFFFFF', isEraser: true, label: 'Radieră' },
];

export const PedagogicalScratchpad = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInkVisible, setIsInkVisible] = useState(true);
  const [activeColor, setActiveColor] = useState(PEN_COLORS[0].hex);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isOpen]);

  const startDraw = (e) => {
    if (!isInkVisible || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || e.nativeEvent?.clientX || 0) - rect.left;
    const y = (e.clientY || e.nativeEvent?.clientY || 0) - rect.top;

    ctx.strokeStyle = activeColor;
    ctx.lineWidth = activeColor === '#FFFFFF' ? 24 : 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawMove = (e) => {
    if (!isDrawing || !isInkVisible || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || e.nativeEvent?.clientX || 0) - rect.left;
    const y = (e.clientY || e.nativeEvent?.clientY || 0) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <View style={styles.container}>
      {/* Underlying Exercise Screen */}
      {children}

      {/* Floating Scratchpad Toggle Button */}
      <TouchableOpacity
        style={[styles.floatingToggle, isOpen && styles.floatingToggleActive]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.85}
      >
        <Text style={styles.floatingToggleText}>
          {isOpen ? '✕ Închide Ciorna' : '✏️ Ciornă de Calcul'}
        </Text>
      </TouchableOpacity>

      {/* Semi-transparent Scratchpad Overlay */}
      {isOpen && (
        <View style={styles.scratchpadOverlay} pointerEvents="box-none">
          {/* Scratchpad Toolbar */}
          <View style={styles.toolbar}>
            <View style={styles.colorsRow}>
              {PEN_COLORS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c.hex },
                    activeColor === c.hex && styles.colorDotActive,
                  ]}
                  onPress={() => setActiveColor(c.hex)}
                >
                  {c.isEraser && <Text style={{ fontSize: 12 }}>🧹</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.toolBtn, !isInkVisible && styles.toolBtnActive]}
                onPress={() => setIsInkVisible(!isInkVisible)}
              >
                <Text style={styles.toolBtnText}>
                  {isInkVisible ? '👁️ Ascunde Tușul' : '👁️‍🗨️ Arată Tușul'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolBtn} onPress={clearCanvas}>
                <Text style={styles.toolBtnText}>🗑️ Șterge Tot</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* HTML5 Overlay Drawing Canvas */}
          {Platform.OS === 'web' && (
            <canvas
              ref={canvasRef}
              id="scratchpadCanvas"
              width={800}
              height={550}
              style={{
                display: isInkVisible ? 'block' : 'none',
                width: '100%',
                maxWidth: 800,
                height: 550,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 24,
                cursor: 'crosshair',
                border: '3px dashed rgba(59, 130, 246, 0.5)',
                touchAction: 'none',
              }}
              onPointerDown={startDraw}
              onPointerMove={drawMove}
              onPointerUp={endDraw}
              onPointerLeave={endDraw}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  floatingToggle: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 9999,
  },
  floatingToggleActive: {
    backgroundColor: '#EF4444',
  },
  floatingToggleText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Fredoka, sans-serif',
  },
  scratchpadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    zIndex: 8888,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 800,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 10,
    elevation: 4,
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotActive: {
    borderColor: '#0F172A',
    borderWidth: 4,
    transform: [{ scale: 1.15 }],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toolBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  toolBtnActive: {
    backgroundColor: '#FEF08A',
  },
  toolBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
