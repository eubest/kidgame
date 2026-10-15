import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { DragDropProvider, DropZone, Draggable } from '../dragdrop/index.js';
import { audioMixer } from '../audio/index.js';
import confetti from '../utils/confetti';

const { width } = Dimensions.get('window');

export const OlloFeedingEngineGame = ({
  targets = ['B', 'M', 'R'],
  pool = ['B', 'A', 'M', 'E', 'R'],
  images,
  audio,
  onComplete,
}) => {
  const [fedLetters, setFedLetters] = useState([]);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleHoverEnter = () => {
    setIsMouthOpen(true);
    audioMixer.playSFX(audio?.sfxPop || null, 0.4);
  };

  const handleHoverLeave = () => {
    setIsMouthOpen(false);
  };

  const handleDropLetter = ({ id, data }) => {
    const char = data.char;
    const isTarget = targets.includes(char);

    if (isTarget) {
      if (!fedLetters.includes(char)) {
        const next = [...fedLetters, char];
        setFedLetters(next);
        setIsMouthOpen(true);

        audioMixer.playSFX(audio?.sfxSquish || null, 1.0);

        // Play letter phonics sound
        const phonicsMap = {
          B: audio?.pB,
          M: audio?.pM,
          R: audio?.pR,
          S: audio?.pS,
          T: audio?.pT,
          A: audio?.pA,
          E: audio?.pE,
          I: audio?.pI,
        };
        if (phonicsMap[char]) {
          setTimeout(() => {
            audioMixer.playVoice(phonicsMap[char]);
          }, 350);
        }

        setTimeout(() => {
          setIsMouthOpen(false);
        }, 600);

        if (next.length >= targets.length) {
          setIsCompleted(true);
          setTimeout(() => {
            audioMixer.playSFX(audio?.sfxBingo || audio?.sfxRoyal || null);
            audioMixer.playVoice(audio?.kodiGreatJob || audio?.feedWin, { duck: true });
            confetti({ particleCount: 130, spread: 85 });
            if (onComplete) onComplete();
          }, 1000);
        }
      }
    } else {
      // Wrong letter dropped into Ollo
      setIsMouthOpen(false);
      audioMixer.playSFX(audio?.sfxIncorrect || null);
      if (audio?.feedWrong) {
        audioMixer.playVoice(audio.feedWrong, { duck: true });
      }
    }
  };

  return (
    <DragDropProvider>
      <View style={styles.container}>
        {/* Header instructions */}
        <View style={styles.header}>
          <Text style={styles.title}>Hrănește-l pe Ollo cu Trageri 60 FPS</Text>
          <Text style={styles.hint}>
            Trage biscuiții cu consoane direct în gura pofticioasă a lui Ollo: {targets.join(', ')}!
          </Text>
        </View>

        {/* Ollo Mouth DropZone */}
        <View style={styles.stage}>
          <DropZone
            id="ollo-mouth-zone"
            accepts={['letter-cookie']}
            onDrop={handleDropLetter}
            onHoverEnter={handleHoverEnter}
            onHoverLeave={handleHoverLeave}
            collisionBuffer={45} // Forgiving mouth collision radius for little fingers
            style={styles.dropZoneWrap}
          >
            {({ isHovered }) => (
              <View style={[styles.olloBox, (isHovered || isMouthOpen) && styles.olloBoxActive]}>
                <Image
                  source={isMouthOpen || isHovered ? images?.olloOpenMouth : images?.olloBody}
                  style={styles.olloImg}
                  resizeMode="contain"
                />
                {(isMouthOpen || isHovered) && (
                  <View style={styles.openMouthTargetIndicator}>
                    <Text style={styles.yumText}>DESCHIDE GURA! 😋</Text>
                  </View>
                )}
              </View>
            )}
          </DropZone>
        </View>

        {/* Stomach Tray */}
        <View style={styles.stomachTray}>
          <Text style={styles.stomachLabel}>Consoane mâncate:</Text>
          <View style={styles.stomachSlots}>
            {targets.map((char) => {
              const isFed = fedLetters.includes(char);
              return (
                <View key={char} style={[styles.slot, isFed && styles.slotFilled]}>
                  <Text style={styles.slotText}>{isFed ? `⭐ ${char}` : char}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Draggable Cookie Letters */}
        <View style={styles.cookiesRow}>
          {pool.map((char) => {
            const isFed = fedLetters.includes(char);
            return (
              <Draggable
                key={char}
                id={`cookie-${char}`}
                type="letter-cookie"
                data={{ char }}
                disabled={isFed}
                onDragStart={() => {
                  audioMixer.playSFX(audio?.sfxPop || null, 0.6);
                }}
                style={[styles.cookieItem, isFed && styles.cookieFed]}
              >
                {({ isDragging }) => (
                  <View style={[styles.cookieInner, isDragging && styles.cookieInnerDragging]}>
                    <Text style={[styles.cookieText, isFed && styles.cookieTextFed]}>{char}</Text>
                  </View>
                )}
              </Draggable>
            );
          })}
        </View>

        {isCompleted && (
          <View style={styles.winBanner}>
            <Text style={styles.winText}>🎉 Bravo! Ollo este sătul și fericit!</Text>
          </View>
        )}
      </View>
    </DragDropProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2F3542',
  },
  hint: {
    fontSize: 15,
    color: '#747D8C',
    marginTop: 4,
  },
  stage: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneWrap: {
    padding: 10,
  },
  olloBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  olloBoxActive: {
    transform: [{ scale: 1.08 }],
  },
  olloImg: {
    width: 220,
    height: 190,
  },
  openMouthTargetIndicator: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#FFA502',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    boxShadow: '0 4px 10px rgba(255, 165, 2, 0.4)',
  },
  yumText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  stomachTray: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#DFE4EA',
    marginVertical: 12,
    alignItems: 'center',
  },
  stomachLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#747D8C',
    marginBottom: 6,
  },
  stomachSlots: {
    flexDirection: 'row',
    gap: 10,
  },
  slot: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CED6E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  slotFilled: {
    backgroundColor: '#2ED573',
    borderColor: '#2ED573',
    borderStyle: 'solid',
  },
  slotText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2F3542',
  },
  cookiesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 15,
  },
  cookieItem: {
    zIndex: 10,
  },
  cookieFed: {
    opacity: 0.25,
  },
  cookieInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFA502',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 14px rgba(255, 165, 2, 0.35)',
  },
  cookieInnerDragging: {
    backgroundColor: '#FF4757',
    transform: [{ scale: 1.15 }],
    boxShadow: '0 12px 24px rgba(255, 71, 87, 0.45)',
  },
  cookieText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cookieTextFed: {
    opacity: 0.2,
  },
  winBanner: {
    marginTop: 16,
    backgroundColor: '#2ED573',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  winText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
