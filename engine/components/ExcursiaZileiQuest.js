import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { PathTracingGame } from './PathTracingGame';
import { OlloFeedingEngineGame } from './OlloFeedingEngineGame';
import { InteractiveStorybookReader } from './InteractiveStorybookReader';
import { GiftBoxUnboxer } from './GiftBoxUnboxer';
import { audioMixer } from '../audio';
import confetti from '../utils/confetti';

const { width } = Dimensions.get('window');

const QUEST_STAGES = [
  { id: 'step_tracing', title: 'Pasul 1: Trasare Litera A', icon: '✏️', desc: 'Urmează steluțele strălucitoare' },
  { id: 'step_phonics', title: 'Pasul 2: Hrănește-l pe Ollo', icon: '🔤', desc: 'Alege consoanele B, M, R' },
  { id: 'step_math', title: 'Pasul 3: Grila de Calcul', icon: '🔢', desc: 'Calculează 3 + 2 pe cele 10 căsuțe' },
  { id: 'step_story', title: 'Pasul 4: Povestea Zilei', icon: '📖', desc: 'Citește Ce Surpriză! cu Peck' },
];

export const ExcursiaZileiQuest = ({ images, audio, onExit, onDressUp }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showGiftUnboxer, setShowGiftUnboxer] = useState(false);

  // Ten frame state for step 3
  const [tenFrameCount, setTenFrameCount] = useState(3);
  const [mathFinished, setMathFinished] = useState(false);

  const advanceQuest = () => {
    audioMixer.playSFX(audio?.sfxChime || null);
    confetti({ particleCount: 80, spread: 70 });

    if (currentStepIndex < QUEST_STAGES.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Completed all 4 quest steps! Reveal the golden gift box!
      setShowGiftUnboxer(true);
    }
  };

  if (showGiftUnboxer) {
    return (
      <GiftBoxUnboxer
        audio={audio}
        onDressUp={(reward) => {
          if (onDressUp) onDressUp(reward);
        }}
        onContinue={() => {
          if (onExit) onExit();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Persistent Quest Trail Bar */}
      <View style={styles.trailBar}>
        <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
          <Text style={styles.exitBtnText}>✕ Ieșire</Text>
        </TouchableOpacity>

        {/* 4 Checkpoint Stations */}
        <View style={styles.checkpointsRow}>
          {QUEST_STAGES.map((stg, idx) => {
            const isCurrent = currentStepIndex === idx;
            const isDone = idx < currentStepIndex;

            return (
              <React.Fragment key={stg.id}>
                <View style={styles.stationWrap}>
                  <View
                    style={[
                      styles.stationNode,
                      isDone && styles.stationNodeDone,
                      isCurrent && styles.stationNodeCurrent,
                    ]}
                  >
                    <Text style={styles.stationNodeText}>
                      {isDone ? '✓' : stg.icon}
                    </Text>
                  </View>
                  <Text style={[styles.stationTitle, isCurrent && styles.stationTitleCurrent]}>
                    {stg.title.split(':')[0]}
                  </Text>
                </View>

                {idx < QUEST_STAGES.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      idx < currentStepIndex && styles.connectorLineDone,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Golden Gift at the finish line */}
          <View style={styles.connectorLine} />
          <View style={styles.stationWrap}>
            <View style={[styles.stationNode, styles.stationNodeGift]}>
              <Text style={styles.stationNodeText}>🎁</Text>
            </View>
            <Text style={styles.stationTitle}>Cadou</Text>
          </View>
        </View>
      </View>

      {/* Main Educational Activity Content */}
      <View style={styles.activityBody}>
        {/* Step 1: Tracing */}
        {currentStepIndex === 0 && (
          <PathTracingGame
            audio={audio}
            onPathComplete={advanceQuest}
          />
        )}

        {/* Step 2: Ollo Phonics */}
        {currentStepIndex === 1 && (
          <OlloFeedingEngineGame
            targets={['B', 'M', 'R']}
            pool={['B', 'A', 'M', 'E', 'R']}
            images={images}
            audio={audio}
            onComplete={advanceQuest}
          />
        )}

        {/* Step 3: Math Ten-Frame */}
        {currentStepIndex === 2 && (
          <View style={styles.mathQuestContainer}>
            <Text style={styles.mathQuestTitle}>Adunare pe Grila de 10: 3 + 2 = ?</Text>
            <Text style={styles.mathQuestHint}>
              Adaugă încă 2 morcovi delicioși în grilă pentru a completa adunarea!
            </Text>

            <View style={styles.tenFrameGrid}>
              {[...Array(10)].map((_, i) => (
                <TouchableOpacity
                  key={`cell_${i}`}
                  style={[styles.tenFrameCell, i < tenFrameCount && styles.tenFrameCellFilled]}
                  onPress={() => {
                    if (tenFrameCount < 5) {
                      const next = tenFrameCount + 1;
                      setTenFrameCount(next);
                      audioMixer.playSFX(audio?.sfxPop || null, 0.7);
                      if (next === 5) {
                        setMathFinished(true);
                        audioMixer.playSFX(audio?.sfxRoyal || null);
                        setTimeout(advanceQuest, 1200);
                      }
                    }
                  }}
                >
                  {i < tenFrameCount ? (
                    <Text style={styles.carrotEmoji}>🥕</Text>
                  ) : (
                    <Text style={styles.cellIndex}>{i + 1}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.mathSumFormula}>
              3 + {Math.max(0, tenFrameCount - 3)} = {tenFrameCount} {mathFinished && '🎉 CORECT!'}
            </Text>
          </View>
        )}

        {/* Step 4: Storybook Reader */}
        {currentStepIndex === 3 && (
          <InteractiveStorybookReader
            audio={audio}
            onComplete={advanceQuest}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
    height: '100%',
  },
  trailBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderColor: '#E2E8F0',
    elevation: 3,
  },
  exitBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 16,
  },
  exitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  checkpointsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationWrap: {
    alignItems: 'center',
  },
  stationNode: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationNodeCurrent: {
    backgroundColor: '#FFA502',
    transform: [{ scale: 1.15 }],
    elevation: 4,
  },
  stationNodeDone: {
    backgroundColor: '#2ED573',
  },
  stationNodeGift: {
    backgroundColor: '#FFD700',
    elevation: 3,
  },
  stationNodeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stationTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 4,
  },
  stationTitleCurrent: {
    color: '#D97706',
    fontWeight: '800',
  },
  connectorLine: {
    width: 24,
    height: 4,
    backgroundColor: '#CBD5E1',
    marginBottom: 16,
  },
  connectorLineDone: {
    backgroundColor: '#2ED573',
  },
  activityBody: {
    flex: 1,
  },
  mathQuestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mathQuestTitle: {
    fontSize: 26,
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  mathQuestHint: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 24,
  },
  tenFrameGrid: {
    width: 340,
    height: 140,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#0284C7',
    borderRadius: 18,
    padding: 6,
    elevation: 4,
  },
  tenFrameCell: {
    width: '20%',
    height: '50%',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenFrameCellFilled: {
    backgroundColor: '#FEF3C7',
  },
  carrotEmoji: {
    fontSize: 28,
  },
  cellIndex: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  mathSumFormula: {
    fontSize: 24,
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: '800',
    color: '#0369A1',
    marginTop: 24,
  },
});
