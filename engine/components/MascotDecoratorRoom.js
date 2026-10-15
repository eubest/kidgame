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
} from 'react-native';
import { audioMixer } from '../audio';
import confetti from '../utils/confetti';

const { width } = Dimensions.get('window');

const MASCOTS = [
  { id: 'ollo', name: 'Ollo Elefănțelul', img: require('../../assets/images/ollo_mascot.png'), color: '#4CD137' },
  { id: 'kodi', name: 'Kodi Ursulețul', img: require('../../assets/images/kodi_mascot.png'), color: '#FFA502' },
  { id: 'peck', name: 'Peck Ciocănitoarea', img: require('../../assets/images/peck_mascot.png'), color: '#FF4757' },
  { id: 'sandy', name: 'Sandy Dingo', img: require('../../assets/images/sandy_mascot.png'), color: '#3742FA' },
  { id: 'reya', name: 'Reya Ropitorul', img: require('../../assets/images/reya_mascot.png'), color: '#9B59B6' },
];

const ACCESSORIES = [
  { id: 'acc1', name: 'Pălărie Petrecere', img: require('../../assets/rewards/characterrewards_ollo1.png'), top: -20, left: 25, size: 90 },
  { id: 'acc2', name: 'Joben Elegant', img: require('../../assets/rewards/characterrewards_ollo2.png'), top: -30, left: 20, size: 95 },
  { id: 'acc3', name: 'Ochelari Soare', img: require('../../assets/rewards/characterrewards_ollo3.png'), top: 40, left: 35, size: 80 },
  { id: 'acc4', name: 'Coroană de Aur', img: require('../../assets/rewards/characterrewards_ollo10.png'), top: -25, left: 25, size: 90 },
  { id: 'acc5', name: 'Cască Aviator', img: require('../../assets/rewards/characterrewards_ollo12.png'), top: -25, left: 15, size: 105 },
  { id: 'acc6', name: 'Fundiță Roz', img: require('../../assets/rewards/characterrewards_ollo15.png'), top: 85, left: 45, size: 70 },
  { id: 'acc7', name: 'Fular Călduros', img: require('../../assets/rewards/characterrewards_ollo18.png'), top: 110, left: 25, size: 100 },
  { id: 'acc8', name: 'Tichie Magică', img: require('../../assets/rewards/characterrewards_ollo20.png'), top: -25, left: 30, size: 85 },
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

  const handleToggleAccessory = (acc) => {
    audioMixer.playSFX(audio?.sfxPop || null, 0.8);

    const isEquipped = currentEquipped.some((item) => item.id === acc.id);
    let nextList;

    if (isEquipped) {
      nextList = currentEquipped.filter((item) => item.id !== acc.id);
    } else {
      nextList = [...currentEquipped, acc];
      // Celebrate joy bounce
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.15, duration: 150, useNativeDriver: false }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: false }),
      ]).start();
      audioMixer.playSFX(audio?.sfxSquish || null);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });
    }

    setEquippedItems({
      ...equippedItems,
      [selectedMascot.id]: nextList,
    });
  };

  const handleClear = () => {
    audioMixer.playSFX(audio?.sfxWhoosh || null);
    setEquippedItems({
      ...equippedItems,
      [selectedMascot.id]: [],
    });
  };

  return (
    <ImageBackground
      source={images?.roomBg || require('../../assets/images/room_bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>⬅️ Înapoi la Orășel</Text>
          </TouchableOpacity>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Salonul de Modă & Decorare</Text>
            <Text style={styles.subTitle}>Alege un prieten și îmbracă-l cu accesoriile câștigate!</Text>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>🧹 Șterge Hăinuțele</Text>
          </TouchableOpacity>
        </View>

        {/* Mascot Selector Bar */}
        <View style={styles.mascotBar}>
          {MASCOTS.map((m) => {
            const isSelected = selectedMascot.id === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.mascotTab,
                  isSelected && { borderColor: m.color, backgroundColor: '#FFFFFF', transform: [{ scale: 1.08 }] },
                ]}
                onPress={() => {
                  audioMixer.playSFX(audio?.sfxButton || null);
                  setSelectedMascot(m);
                }}
              >
                <Image source={m.img} style={styles.mascotTabImg} resizeMode="contain" />
                <Text style={[styles.mascotTabText, isSelected && { color: m.color, fontWeight: '800' }]}>
                  {m.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Center Presentation Stage */}
        <View style={styles.stage}>
          <Animated.View style={[styles.mascotPlatform, { transform: [{ scale: bounceAnim }] }]}>
            {/* Mascot Base Figure */}
            <Image
              source={selectedMascot.img}
              style={styles.mascotImg}
              resizeMode="contain"
            />

            {/* Overlaid Equipped Accessories */}
            {currentEquipped.map((acc) => (
              <Image
                key={acc.id}
                source={acc.img}
                style={[
                  styles.accessoryOverlay,
                  {
                    top: acc.top,
                    left: acc.left,
                    width: acc.size,
                    height: acc.size,
                  },
                ]}
                resizeMode="contain"
              />
            ))}
          </Animated.View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'space-between',
    padding: 16,
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
  mascotBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 6,
  },
  mascotTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    elevation: 2,
    gap: 8,
  },
  mascotTabImg: {
    width: 38,
    height: 38,
  },
  mascotTabText: {
    fontSize: 15,
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mascotImg: {
    width: 220,
    height: 220,
  },
  accessoryOverlay: {
    position: 'absolute',
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
