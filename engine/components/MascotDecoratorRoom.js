import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { audioMixer } from '../audio';
import confetti from '../utils/confetti';
import { AndroidHaptics } from '../native/AndroidHaptics';

const { width } = Dimensions.get('window');

const MASCOTS = [
  {
    id: 'ollo',
    name: 'Ollo Elefănțelul',
    sprite: require('../../assets/images/mascots/ollo.png'),
    roomBg: require('../../assets/images/ollo_room_bg.png'),
    tabThumb: require('../../assets/images/ollo_mascot.png'),
    color: '#0284C7',
  },
  {
    id: 'kodi',
    name: 'Kodi Ursulețul',
    sprite: require('../../assets/images/mascots/kodi.png'),
    roomBg: require('../../assets/images/kodi_room_bg.png'),
    tabThumb: require('../../assets/images/kodi_mascot.png'),
    color: '#F59E0B',
  },
  {
    id: 'peck',
    name: 'Peck Ciocănitoarea',
    sprite: require('../../assets/images/mascots/peck.png'),
    roomBg: require('../../assets/images/peck_room_bg.png'),
    tabThumb: require('../../assets/images/peck_mascot.png'),
    color: '#EF4444',
  },
  {
    id: 'sandy',
    name: 'Sandy Dingo',
    sprite: require('../../assets/images/mascots/sandy.png'),
    roomBg: require('../../assets/images/sandy_room_bg.png'),
    tabThumb: require('../../assets/images/sandy_mascot.png'),
    color: '#EC4899',
  },
  {
    id: 'reya',
    name: 'Reya Roșcata',
    sprite: require('../../assets/images/mascots/reya.png'),
    roomBg: require('../../assets/images/ollo_room_bg.png'),
    tabThumb: require('../../assets/images/reya_mascot.png'),
    color: '#8B5CF6',
  },
];

const ACCESSORIES = [
  { id: 'hat_crown', name: 'Coroană Regală', img: require('../../assets/images/hats/kodihat4.png') },
  { id: 'hat_straw', name: 'Pălărie cu Flori', img: require('../../assets/images/hats/kodihat1.png') },
  { id: 'hat_pirate', name: 'Pălărie Pirați', img: require('../../assets/images/hats/kodihat3.png') },
  { id: 'hat_farmer', name: 'Pălărie de Paie', img: require('../../assets/images/hats/kodihat5.png') },
  { id: 'hat_chef', name: 'Tichie Bucătar', img: require('../../assets/images/hats/kodihat6.png') },
  { id: 'hat_fire', name: 'Cască Pompier', img: require('../../assets/images/hats/peckhat1.png') },
  { id: 'hat_party', name: 'Coif Petrecere', img: require('../../assets/images/hats/peckhat2.png') },
  { id: 'hat_aviator', name: 'Cască Aviator', img: require('../../assets/images/hats/peckhat4.png') },
];

export const MascotDecoratorRoom = ({ images, audio, onBack }) => {
  const [selectedMascot, setSelectedMascot] = useState(MASCOTS[0]);
  const [equippedItems, setEquippedItems] = useState({
    ollo: [ACCESSORIES[0]],
    kodi: [],
    peck: [],
    sandy: [],
    reya: [],
  });

  const bounceAnim = useRef(new Animated.Value(1)).current;

  const currentEquipped = equippedItems[selectedMascot.id] || [];

  const handleMascotSelect = (mascot) => {
    setSelectedMascot(mascot);
    AndroidHaptics.light();
    audioMixer.playSFX(audio?.sfxButton || null, 0.7);

    if (mascot.id === 'kodi' && audio?.wardrobeKodi) {
      audioMixer.playVoice(audio.wardrobeKodi, 1.0);
    } else if (mascot.id === 'ollo' && audio?.wardrobeOllo) {
      audioMixer.playVoice(audio.wardrobeOllo, 1.0);
    } else if (mascot.id === 'peck' && audio?.wardrobePeck) {
      audioMixer.playVoice(audio.wardrobePeck, 1.0);
    }
  };

  const handleMascotTickle = () => {
    AndroidHaptics.light();
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.2, duration: 120, useNativeDriver: false }),
      Animated.timing(bounceAnim, { toValue: 0.9, duration: 100, useNativeDriver: false }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 3, tension: 50, useNativeDriver: false }),
    ]).start();

    if (audio?.wardrobeGiggle) {
      audioMixer.playVoice(audio.wardrobeGiggle, 1.0);
    } else if (audio?.sfxSquish) {
      audioMixer.playSFX(audio.sfxSquish, 0.8);
    }
  };

  const handleToggleAccessory = (acc) => {
    const isEquipped = currentEquipped.some((item) => item.id === acc.id);
    let nextList;

    if (isEquipped) {
      AndroidHaptics.light();
      audioMixer.playSFX(audio?.sfxPop || null, 0.8);
      nextList = currentEquipped.filter((item) => item.id !== acc.id);
    } else {
      AndroidHaptics.success();
      nextList = [...currentEquipped, acc];
      // Celebrate joy bounce
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.18, duration: 150, useNativeDriver: false }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: false }),
      ]).start();

      audioMixer.playSFX(audio?.sfxSquish || null);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });

      // Play joyful cheer voice
      const cheer = Math.random() > 0.5 ? audio?.wardrobeCheer1 : audio?.wardrobeCheer2;
      if (cheer) {
        audioMixer.playVoice(cheer, 1.0);
      }
    }

    setEquippedItems({
      ...equippedItems,
      [selectedMascot.id]: nextList,
    });
  };

  const handleClear = () => {
    AndroidHaptics.light();
    audioMixer.playSFX(audio?.sfxWhoosh || null);
    setEquippedItems({
      ...equippedItems,
      [selectedMascot.id]: [],
    });
  };

  return (
    <ImageBackground
      source={selectedMascot.roomBg}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              AndroidHaptics.light();
              onBack();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>← Înapoi</Text>
          </TouchableOpacity>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>👗 Salonul de Modă</Text>
            <Text style={styles.subTitle}>Alege hăinuțe și accesorii haioase!</Text>
          </View>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>🧹 Curăță</Text>
          </TouchableOpacity>
        </View>

        {/* Mascot Selector Bar */}
        <View style={styles.mascotBarWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mascotBarScroll}
          >
            {MASCOTS.map((m) => {
              const isSelected = selectedMascot.id === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.mascotTab,
                    isSelected && { borderColor: m.color, backgroundColor: '#FFFFFF', transform: [{ scale: 1.05 }] },
                  ]}
                  onPress={() => handleMascotSelect(m)}
                  activeOpacity={0.75}
                >
                  <Image source={m.tabThumb} style={styles.mascotTabImg} resizeMode="contain" />
                  <Text style={[styles.mascotTabText, isSelected && { color: m.color, fontWeight: '800' }]}>
                    {m.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Center Presentation Stage */}
        <View style={styles.stage}>
          <TouchableOpacity activeOpacity={0.9} onPress={handleMascotTickle}>
            <Animated.View style={[styles.mascotPlatform, { transform: [{ scale: bounceAnim }] }]}>
              {/* Mascot Base Figure */}
              <Image
                source={selectedMascot.sprite}
                style={styles.mascotImg}
                resizeMode="contain"
              />

              {/* Overlaid Equipped Accessories */}
              {currentEquipped.map((acc) => (
                <Image
                  key={acc.id}
                  source={acc.img}
                  style={styles.accessoryOverlay}
                  resizeMode="contain"
                />
              ))}
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Bottom Wardrobe Drawer */}
        <View style={styles.wardrobeDrawer}>
          <Text style={styles.wardrobeTitle}>Garderoba cu Accesorii Deblocate ({ACCESSORIES.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wardrobeList}>
            {ACCESSORIES.map((acc) => {
              const isWorn = currentEquipped.some((item) => item.id === acc.id);
              return (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.accCard, isWorn && styles.accCardWorn]}
                  onPress={() => handleToggleAccessory(acc)}
                  activeOpacity={0.8}
                >
                  <Image source={acc.img} style={styles.accCardImg} resizeMode="contain" />
                  <Text style={styles.accCardName}>{acc.name}</Text>
                  {isWorn && (
                    <View style={styles.wornBadge}>
                      <Text style={styles.wornBadgeText}>✓ Echipat</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 3,
  },
  backBtn: {
    backgroundColor: '#3742FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  titleWrap: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: '800',
    color: '#2F3542',
  },
  subTitle: {
    fontSize: 12,
    color: '#747D8C',
    fontWeight: '600',
  },
  clearBtn: {
    backgroundColor: '#FF6B81',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  mascotBarWrap: {
    marginVertical: 6,
  },
  mascotBarScroll: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    gap: 8,
    alignItems: 'center',
  },
  mascotTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    elevation: 2,
    gap: 6,
  },
  mascotTabImg: {
    width: 34,
    height: 34,
  },
  mascotTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#57606F',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mascotPlatform: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 6,
  },
  mascotImg: {
    width: 220,
    height: 220,
  },
  accessoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  wardrobeDrawer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
  },
  wardrobeTitle: {
    fontSize: 15,
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: '700',
    color: '#2F3542',
    marginBottom: 8,
    paddingLeft: 4,
  },
  wardrobeList: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  accCard: {
    width: 105,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  accCardWorn: {
    borderColor: '#2ED573',
    backgroundColor: '#EBFBF2',
  },
  accCardImg: {
    width: 65,
    height: 65,
    marginBottom: 4,
  },
  accCardName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F3542',
    textAlign: 'center',
  },
  wornBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#2ED573',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  wornBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default MascotDecoratorRoom;
