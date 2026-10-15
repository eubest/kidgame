import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { DragDropProvider, DropZone, Draggable } from '../dragdrop/index.js';
import { audioMixer } from '../audio/index.js';
import { GIFT_PRIZES } from './GiftBoxUnboxer.js';

const { width } = Dimensions.get('window');

export const MascotDecoratorRoom = ({
  images,
  audio,
  unlockedGifts = [],
  onOpenGiftBox,
  onBack,
}) => {
  // Room state: which mascot room is active ('kodi' | 'ollo')
  const [roomMascot, setRoomMascot] = useState('kodi'); // 'kodi' | 'ollo'

  // Items placed in room slots: { [slotId]: item }
  const [placedItems, setPlacedItems] = useState({
    head: null,
    back: null,
    shelf1: GIFT_PRIZES.find((p) => p.id === 'prize_toy_rocket'),
    shelf2: GIFT_PRIZES.find((p) => p.id === 'prize_magic_wand'),
    bed: GIFT_PRIZES.find((p) => p.id === 'prize_teddy_bear'),
  });

  // Mascot speech reaction
  const [reactionBubble, setReactionBubble] = useState('Bine ai venit în căsuța mea! 🎈');

  // Mascot bounce animation
  const mascotBounce = useRef(new Animated.Value(1)).current;

  // Combine unlocked gifts with default collection
  const allInventory = [
    ...GIFT_PRIZES,
    ...unlockedGifts.filter((g) => !GIFT_PRIZES.some((p) => p.id === g.id)),
  ];

  const triggerMascotReaction = (text, soundKey = 'sfxPop') => {
    setReactionBubble(text);
    audioMixer.playSFX(audio?.[soundKey] || audio?.sfxPop || null, 0.9);

    Animated.sequence([
      Animated.timing(mascotBounce, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.spring(mascotBounce, { toValue: 1, friction: 3, tension: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleDropOnSlot = (slotKey, item) => {
    setPlacedItems((prev) => ({
      ...prev,
      [slotKey]: item,
    }));

    if (slotKey === 'head') {
      triggerMascotReaction(`Iau uite ce pălărie frumoasă! 🥳`, 'sfxRoyal');
    } else if (slotKey === 'bed') {
      triggerMascotReaction(`Ursulețul stă confortabil în pătuț! 💤`, 'sfxSquish');
    } else {
      triggerMascotReaction(`Superb! Am așezat ${item.name} pe raft! ✨`, 'sfxChime');
    }
  };

  return (
    <DragDropProvider>
      <View style={styles.container}>
        {/* Room Header Controls */}
        <View style={styles.roomHeader}>
          <View style={styles.mascotSwitchTabs}>
            <TouchableOpacity
              style={[styles.switchTab, roomMascot === 'kodi' && styles.switchTabActive]}
              onPress={() => {
                audioMixer.playSFX(audio?.sfxButton || null);
                setRoomMascot('kodi');
                triggerMascotReaction('Sunt Kodi! Hai să ne jucăm! 🐻', 'kodiAwesome');
              }}
            >
              <Text style={styles.switchTabIcon}>🐻</Text>
              <Text style={[styles.switchTabText, roomMascot === 'kodi' && styles.switchTabTextActive]}>
                Camera lui Kodi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchTab, roomMascot === 'ollo' && styles.switchTabActive]}
              onPress={() => {
                audioMixer.playSFX(audio?.sfxButton || null);
                setRoomMascot('ollo');
                triggerMascotReaction('Sunt Ollo! Îmi place apa călduță! 🐘', 'sfxSquish');
              }}
            >
              <Text style={styles.switchTabIcon}>🐘</Text>
              <Text style={[styles.switchTabText, roomMascot === 'ollo' && styles.switchTabTextActive]}>
                Cădița lui Ollo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Open Gift Box CTA Button */}
          {onOpenGiftBox && (
            <TouchableOpacity
              style={styles.openGiftBoxBtn}
              onPress={() => {
                audioMixer.playSFX(audio?.sfxButton || null);
                onOpenGiftBox();
              }}
            >
              <Text style={styles.openGiftBoxIcon}>🎁</Text>
              <Text style={styles.openGiftBoxText}>Deschide un Cadou!</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* The Interactive Room Area */}
        <ImageBackground
          source={images?.roomBg || null}
          style={styles.roomStage}
          resizeMode="cover"
        >
          <View style={styles.roomOverlay}>
            {/* Speech Bubble */}
            {reactionBubble && (
              <View style={styles.mascotSpeechWrap}>
                <Text style={styles.mascotSpeechText}>{reactionBubble}</Text>
                <View style={styles.speechArrow} />
              </View>
            )}

            {/* Central Mascot with Headwear & Cape DropZones */}
            <View style={styles.mascotStageArea}>
              {/* Headwear Drop Zone (Hat/Helmet/Crown) */}
              <DropZone
                id="headwear-zone"
                accepts={['wearable', 'headwear']}
                onDrop={(payload) => handleDropOnSlot('head', payload.data)}
                collisionBuffer={40}
                style={styles.headwearDropZone}
              >
                {({ isHovered }) => (
                  <TouchableOpacity
                    style={[styles.headwearSlot, isHovered && styles.slotHovered]}
                    onPress={() => {
                      if (placedItems.head) {
                        triggerMascotReaction(`Ador această ${placedItems.head.name}! 👑`, 'sfxChime');
                      }
                    }}
                  >
                    {placedItems.head ? (
                      <Text style={styles.placedHeadEmoji}>{placedItems.head.emoji}</Text>
                    ) : (
                      <View style={styles.emptySlotGuide}>
                        <Text style={styles.emptySlotEmoji}>🎩</Text>
                        <Text style={styles.emptySlotLabel}>Pălărie</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </DropZone>

              {/* Mascot Character Image */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  triggerMascotReaction('Gâdilici! Haha! Ce distractiv! 🎈', 'sfxSquish');
                }}
              >
                <Animated.View
                  style={[
                    styles.mascotWrap,
                    { transform: [{ scale: mascotBounce }] },
                  ]}
                >
                  <Image
                    source={
                      roomMascot === 'kodi'
                        ? images?.kodiMascot || images?.kodiPlatform
                        : images?.olloMascot || images?.olloBody
                    }
                    style={styles.mascotImg}
                    resizeMode="contain"
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Left Toy Shelf Drop Zones */}
            <View style={styles.shelfContainer}>
              <Text style={styles.shelfTitle}>Raftul cu Jucării</Text>
              <View style={styles.shelfSlotsRow}>
                {['shelf1', 'shelf2'].map((shelfKey, idx) => (
                  <DropZone
                    key={shelfKey}
                    id={`shelf-zone-${shelfKey}`}
                    accepts={['toy', 'wearable', '*']}
                    onDrop={(payload) => handleDropOnSlot(shelfKey, payload.data)}
                    collisionBuffer={30}
                    style={styles.shelfDropZone}
                  >
                    {({ isHovered }) => (
                      <TouchableOpacity
                        style={[styles.shelfSlot, isHovered && styles.slotHovered]}
                        onPress={() => {
                          if (placedItems[shelfKey]) {
                            triggerMascotReaction(`Jucăria face sunete! 🚀`, 'sfxWhoosh');
                          }
                        }}
                      >
                        {placedItems[shelfKey] ? (
                          <Text style={styles.placedShelfEmoji}>{placedItems[shelfKey].emoji}</Text>
                        ) : (
                          <Text style={styles.emptyShelfText}>Raft {idx + 1}</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </DropZone>
                ))}
              </View>
              <View style={styles.shelfPlank} />
            </View>

            {/* Right Bed / Bath Area Drop Zone */}
            <View style={styles.bedBathContainer}>
              <Text style={styles.bedBathTitle}>
                {roomMascot === 'kodi' ? 'Pătuțul Moale' : 'Cădița cu Bule'}
              </Text>
              <DropZone
                id="bed-bath-zone"
                accepts={['toy', '*']}
                onDrop={(payload) => handleDropOnSlot('bed', payload.data)}
                collisionBuffer={35}
                style={styles.bedDropZone}
              >
                {({ isHovered }) => (
                  <TouchableOpacity
                    style={[styles.bedSlot, isHovered && styles.slotHovered]}
                    onPress={() => {
                      if (placedItems.bed) {
                        triggerMascotReaction(`Iată prietenul pufos! 🧸`, 'sfxSquish');
                      }
                    }}
                  >
                    {placedItems.bed ? (
                      <Text style={styles.placedBedEmoji}>{placedItems.bed.emoji}</Text>
                    ) : (
                      <Text style={styles.emptyBedText}>
                        {roomMascot === 'kodi' ? '🛏️ Pune un pluș aici' : '🛁 Pune rățușca aici'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </DropZone>
            </View>
          </View>
        </ImageBackground>

        {/* Bottom Unlocked Toys / Gifts Inventory Tray */}
        <View style={styles.trayContainer}>
          <View style={styles.trayHeader}>
            <Text style={styles.trayTitle}>🎁 Dulăpiorul tău de Cadouri</Text>
            <Text style={styles.trayHint}>
              Trage o jucărie direct pe Kodi sau pe rafturi!
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trayScrollList}
          >
            {allInventory.map((item) => (
              <Draggable
                key={item.id}
                id={`inventory-${item.id}`}
                type={item.category || 'toy'}
                data={item}
                onDragStart={() => {
                  audioMixer.playSFX(audio?.sfxPop || null, 0.5);
                }}
                style={styles.draggableTrayItem}
              >
                {({ isDragging }) => (
                  <View style={[styles.trayItemCard, isDragging && styles.trayItemDragging]}>
                    <Text style={styles.trayItemEmoji}>{item.emoji}</Text>
                    <Text style={styles.trayItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                )}
              </Draggable>
            ))}
          </ScrollView>
        </View>
      </View>
    </DragDropProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    overflow: 'hidden',
  },
  roomHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#DFE4EA',
  },
  mascotSwitchTabs: {
    flexDirection: 'row',
    gap: 10,
  },
  switchTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F1F2F6',
    gap: 6,
  },
  switchTabActive: {
    backgroundColor: '#6C5CE7',
  },
  switchTabIcon: {
    fontSize: 18,
  },
  switchTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#57606F',
  },
  switchTabTextActive: {
    color: '#FFFFFF',
  },
  openGiftBoxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA502',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    boxShadow: '0 4px 10px rgba(255, 165, 2, 0.35)',
  },
  openGiftBoxIcon: {
    fontSize: 18,
  },
  openGiftBoxText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  roomStage: {
    width: '100%',
    height: 400,
    position: 'relative',
    backgroundColor: '#EBF2FA',
  },
  roomOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  mascotSpeechWrap: {
    position: 'absolute',
    top: 25,
    left: '32%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFA502',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    zIndex: 50,
  },
  mascotSpeechText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2F3542',
  },
  speechArrow: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFA502',
  },
  mascotStageArea: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  headwearDropZone: {
    marginBottom: -25,
    zIndex: 35,
  },
  headwearSlot: {
    width: 72,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 2,
    borderColor: '#FFA502',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placedHeadEmoji: {
    fontSize: 42,
  },
  emptySlotGuide: {
    alignItems: 'center',
  },
  emptySlotEmoji: {
    fontSize: 20,
    opacity: 0.5,
  },
  emptySlotLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFA502',
  },
  mascotWrap: {
    alignItems: 'center',
  },
  mascotImg: {
    width: 220,
    height: 220,
  },
  shelfContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 12,
    borderRadius: 18,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  shelfTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#57606F',
    marginBottom: 8,
  },
  shelfSlotsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shelfDropZone: {
    width: 60,
    height: 60,
  },
  shelfSlot: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#74B9FF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  placedShelfEmoji: {
    fontSize: 32,
  },
  emptyShelfText: {
    fontSize: 11,
    color: '#0984E3',
    fontWeight: '700',
  },
  shelfPlank: {
    width: 150,
    height: 8,
    backgroundColor: '#A29BFE',
    borderRadius: 4,
    marginTop: 6,
  },
  bedBathContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 12,
    borderRadius: 18,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  bedBathTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#57606F',
    marginBottom: 8,
  },
  bedDropZone: {
    width: 120,
    height: 70,
  },
  bedSlot: {
    width: 120,
    height: 70,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FD79A8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  placedBedEmoji: {
    fontSize: 38,
  },
  emptyBedText: {
    fontSize: 11,
    color: '#E84393',
    fontWeight: '700',
    textAlign: 'center',
  },
  slotHovered: {
    borderColor: '#2ED573',
    backgroundColor: '#EAFAF1',
    transform: [{ scale: 1.08 }],
  },
  trayContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderTopColor: '#DFE4EA',
  },
  trayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2F3542',
  },
  trayHint: {
    fontSize: 13,
    color: '#747D8C',
  },
  trayScrollList: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 6,
  },
  draggableTrayItem: {
    zIndex: 10,
  },
  trayItemCard: {
    width: 74,
    height: 74,
    borderRadius: 18,
    backgroundColor: '#F1F2F6',
    borderWidth: 2,
    borderColor: '#DFE4EA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
  },
  trayItemDragging: {
    backgroundColor: '#FFEAA7',
    borderColor: '#FFA502',
    transform: [{ scale: 1.15 }],
    boxShadow: '0 8px 18px rgba(255, 165, 2, 0.4)',
  },
  trayItemEmoji: {
    fontSize: 32,
  },
  trayItemName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2F3542',
    marginTop: 2,
  },
});
