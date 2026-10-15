import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  LogBox,
} from 'react-native';

LogBox.ignoreAllLogs(true);
import confetti from './engine/utils/confetti';
import {
  audioMixer,
  OlloFeedingEngineGame,
  PathTracingGame,
  InteractiveStorybookReader,
  GiftBoxUnboxer,
  MascotDecoratorRoom,
  ExcursiaZileiQuest,
  AmbientWorldOverlay,
  LivingMascot,
  BaseTenRodsGame,
  PhonicsBubblePopperGame,
  OlloBathBubbleRoom,
  CartoonIntroCutscene,
  SteppingStonesPathGame,
  OneLinePuzzleGame,
  PedagogicalScratchpad,
  ScratchpadOverlay,
  PhonicsFishingGame,
  LogicBalanceScaleGame,
} from './engine/index.js';
import { CountAndSelectGame } from './engine/components/CountAndSelectGame.js';
import { FindTheNumberFallGame } from './engine/components/FindTheNumberFallGame.js';

const { width } = Dimensions.get('window');

// Inject Fredoka & Dosis Google Fonts for genuine Khan Kids typography
if (typeof document !== 'undefined') {
  const fontId = 'khankids-fonts';
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Dosis:wght@600;700;800&display=swap';
    document.head.appendChild(link);
  }
}

// 1. ASSET-URI VIZUALE KHAN ACADEMY KIDS
const IMAGES = {
  hubBg: require('./assets/images/hub_bg.png'),
  canvasBg: require('./assets/images/canvas_bg.png'),
  roomBg: require('./assets/images/room_bg.png'),
  tenFrame: require('./assets/images/tenframe_frame.png'),
  kodiMascot: require('./assets/images/kodi_mascot.png'),
  kodiPlatform: require('./assets/images/kodi_platform.png'),
  olloMascot: require('./assets/images/ollo_mascot.png'),
  olloBody: require('./assets/images/ollo_body.png'),
  olloOpenMouth: require('./assets/images/ollo_open_mouth.png'),
  reyaMascot: require('./assets/images/reya_mascot.png'),
  peckMascot: require('./assets/images/peck_mascot.png'),
  sandyMascot: require('./assets/images/sandy_mascot.png'),
  drawMascot: require('./assets/images/draw_mascot.png'),
  wordCarrot: require('./assets/images/word_carrot.png'),
  wordDog: require('./assets/images/word_dog.png'),
  wordFrog: require('./assets/images/word_frog.png'),
  wordMonkey: require('./assets/images/word_monkey.png'),
  sheetA: require('./assets/images/sheet_A.png'),
  sheetB: require('./assets/images/sheet_B.png'),
  sheetM: require('./assets/images/sheet_M.png'),
  sheetR: require('./assets/images/sheet_R.png'),
  sheetNum1: require('./assets/images/sheet_num_1.png'),
  sheetNum2: require('./assets/images/sheet_num_2.png'),
  sheetNum3: require('./assets/images/sheet_num_3.png'),
  sheetNum5: require('./assets/images/sheet_num_5.png'),
  sheetShapeCerc: require('./assets/images/sheet_shape_cerc.png'),
  sheetShapePatrat: require('./assets/images/sheet_shape_patrat.png'),
  sheetShapeTriunghi: require('./assets/images/sheet_shape_triunghi.png'),
};

// 2. ASSET-URI AUDIO (MUZICĂ, SFX ȘI VOCE NEURALĂ ROMÂNĂ)
const AUDIO = {
  bgMusic: require('./assets/audio/kodipiano.mp3'),
  kodiGoodJob: require('./assets/audio/kodi_goodjob.mp3'),
  kodiGreatJob: require('./assets/audio/kodi_greatjob.mp3'),
  kodiAwesome: require('./assets/audio/kodi_awesome.mp3'),
  welcome: require('./assets/audio/full_welcome.mp3'),
  drawIntro: require('./assets/audio/draw_intro.mp3'),
  drawWin: require('./assets/audio/draw_win.mp3'),
  addIntro: require('./assets/audio/add_intro.mp3'),
  addWin: require('./assets/audio/add_win.mp3'),
  subIntro: require('./assets/audio/sub_intro.mp3'),
  memoIntro: require('./assets/audio/memo_intro.mp3'),
  memoWin: require('./assets/audio/memo_win.mp3'),
  feedIntro: require('./assets/audio/kk_feed_intro.mp3'),
  feedWin: require('./assets/audio/kk_feed_win.mp3'),
  feedWrong: require('./assets/audio/kk_feed_wrong.mp3'),
  roomIntro: require('./assets/audio/room_intro.mp3'),
  generatorIntro: require('./assets/audio/generator_intro.mp3'),
  patternPrompt: require('./assets/audio/pattern_prompt.mp3'),
  patternWin: require('./assets/audio/pattern_win.mp3'),
  sfxPop: require('./assets/audio/SFX_pop.mp3'),
  sfxButton: require('./assets/audio/SFX_button.mp3'),
  sfxSquish: require('./assets/audio/SFX_squish.mp3'),
  sfxWhoosh: require('./assets/audio/SFX_whoosh.mp3'),
  sfxRoyal: require('./assets/audio/SFX_royal.mp3'),
  sfxCorrect: require('./assets/audio/correct.mp3'),
  sfxChime: require('./assets/audio/correct_chime.mp3'),
  sfxIncorrect: require('./assets/audio/incorrect.mp3'),
  sfxBingo: require('./assets/audio/BingoSuccessfulLineFIll.mp3'),
  sfxReward: require('./assets/audio/RewardChosen.mp3'),
  instPiano: require('./assets/audio/instrument13_piano_sfx.mp3'),
  instXylophone: require('./assets/audio/instrument31_xylophone_sfx.mp3'),
  instDrum: require('./assets/audio/instrument43_drum_sfx.mp3'),
  instTrumpet: require('./assets/audio/instrument25_trumpet_sfx.mp3'),
  instCowbell: require('./assets/audio/instrument40_cowbell_sfx.mp3'),
  pB: require('./assets/audio/p_b.mp3'),
  pM: require('./assets/audio/p_m.mp3'),
  pR: require('./assets/audio/p_r.mp3'),
  pS: require('./assets/audio/p_s.mp3'),
  pT: require('./assets/audio/p_t.mp3'),
  pA: require('./assets/audio/p_a.mp3'),
  pE: require('./assets/audio/p_e.mp3'),
  pI: require('./assets/audio/p_i.mp3'),
  caine: require('./assets/audio/caine.mp3'),
  broasca: require('./assets/audio/broasca.mp3'),
  maimuta: require('./assets/audio/maimuta.mp3'),
  iepuras: require('./assets/audio/iepuras.mp3'),
  steppingStonesIntro: require('./assets/audio/stepping_stones_intro.mp3'),
  steppingStonesWin: require('./assets/audio/stepping_stones_win.mp3'),
  oneLineIntro: require('./assets/audio/one_line_intro.mp3'),
  oneLineWin: require('./assets/audio/one_line_win.mp3'),
  scratchpadIntro: require('./assets/audio/scratchpad_intro.mp3'),
  count1: require('./assets/audio/count_1.mp3'),
  count2: require('./assets/audio/count_2.mp3'),
  count3: require('./assets/audio/count_3.mp3'),
  count4: require('./assets/audio/count_4.mp3'),
  count5: require('./assets/audio/count_5.mp3'),
  countSelectIntro: require('./assets/audio/count_select_intro.mp3'),
  countSelectWin: require('./assets/audio/count_select_win.mp3'),
  findNumberIntro: require('./assets/audio/find_number_intro.mp3'),
  findNumberWin: require('./assets/audio/find_number_win.mp3'),
  findNumberWrong: require('./assets/audio/find_number_wrong.mp3'),
};

const playVoice = (audioSrc, options) => {
  audioMixer.playVoice(audioSrc, options);
};

const playSound = (audioSrc, volumeScale) => {
  audioMixer.playSFX(audioSrc, volumeScale);
};

// 3. CURRICULUM & CATALOG DE FIȘE EXTENSIBILE (KHAN KIDS LIBRARY)
const CURRICULUM_LIBRARY = {
  math: [
    { id: 'rods', title: '🧱 Bastonul celor 10 Cuburi (Base-Ten)', desc: 'Unește 10 cuburi galbene pentru a forma o bară magnetică', isEngine: 'rods' },
    { id: 'stones', title: '🐸 Săritura pe Nuferi (1-5)', desc: 'Ghidează broscuța de la 1 la 5 sărind pe nuferi cu stropi de apă', isEngine: 'stepping_stones' },
    { id: 'scale', title: '⚖️ Cântarul Echilibrat (Balanța LogicLike)', desc: 'Echilibrează fructele și animăluțele pe cele două talere', isEngine: 'scale' },
    { id: 'm1', title: 'Adunare: 3 + 2', a: 3, b: 2, op: '+', desc: 'Pune morcovi în grila de 10 căsuțe' },
    { id: 'm2', title: 'Adunare: 4 + 1', a: 4, b: 1, op: '+', desc: 'Calculează suma pe rândul de sus' },
    { id: 'm3', title: 'Adunare: 2 + 3', a: 2, b: 3, op: '+', desc: 'Completează primul rând de 5 căsuțe' },
    { id: 'm4', title: 'Adunare: 5 + 3', a: 5, b: 3, op: '+', desc: 'Treci pe al doilea rând al grilei' },
    { id: 'm5', title: 'Scădere: 5 - 2', a: 5, b: 2, op: '-', desc: 'Culege 2 morcovi din cele 5 căsuțe' },
  ],
  phonics: [
    { id: 'bubbles', title: '🫧 Acvariul cu Bule Fonetice', desc: 'Sparge bulele de clăbuci cu litera cerută', isEngine: 'bubbles' },
    { id: 'fishing', title: '🎣 Pescuitul Fonetic cu Undița', desc: 'Prinde peștișorii cu litera căutată din adâncuri', isEngine: 'fishing' },
    { id: 'p1', title: 'Consoanele B, M, R', targets: ['B', 'M', 'R'], pool: ['B', 'A', 'M', 'E', 'R'], desc: 'Hrănește-l pe Ollo cu litere delicioase' },
    { id: 'p2', title: 'Consoanele S, T, M', targets: ['S', 'T', 'M'], pool: ['S', 'I', 'T', 'A', 'M'], desc: 'Distinge sunetele /s/, /t/ și /m/' },
    { id: 'p3', title: 'Consoanele B, R, S', targets: ['B', 'R', 'S'], pool: ['B', 'E', 'R', 'O', 'S'], desc: 'Fii atent la vocalele capcană' },
  ],
  tracing: [
    { id: 't1', title: 'Trasare Litera A', desc: 'Urmează ghidul cu steluțe strălucitoare', preset: 'letterA' },
    { id: 't2', title: 'Trasare Litera B', desc: 'Desenează cele două burtici rotunde', preset: 'letterB' },
    { id: 't3', title: 'Trasare Litera M', desc: 'Urcă și coboară pe munții literei M', preset: 'letterM' },
    { id: 't4', title: 'Trasare Cifra 1 & 2', desc: 'Învață să scrii primele tale cifre', preset: 'number1' },
    { id: 't5', title: 'Trasare Stea Magică', desc: 'Unește punctele pentru a aprinde steaua', preset: 'shapeStar' },
  ],
  books: [
    {
      id: 'b1',
      title: 'Ce Surpriză! — Khan Kids',
      author: 'Cynthia Platt',
      desc: 'Peck întâlnește un nou prieten în căsuța copiilor. Sincronizare audio cuvânt-cu-cuvânt!',
      img: require('./assets/books/whatasurprise/p1.png'),
    },
  ],
  memory: [
    { id: 'mem1', title: 'Prietenii Neîndemânatici (4 perechi)', pairCount: 4, desc: 'Câine, Broscuță, Maimuță, Iepuraș' },
    { id: 'mem2', title: 'Perechi Rapide (3 perechi)', pairCount: 3, desc: 'Găsește repede animăluțele gemene' },
    { id: 'mem3', title: 'Micul Explorator (2 perechi)', pairCount: 2, desc: 'Începe cu un nivel simplu și distractiv' },
  ],
  patterns: [
    { id: 'oneline', title: '⚡ Puzzle Dintr-o Linie (Eulerian)', desc: 'Unește toate punctele fără să ridici degetul', isEngine: 'oneline' },
    { id: 'pat1', title: 'Model Alternant: A - B', pattern: ['🐶', '🐸', '🐶', '🐸'], target: '🐶', options: ['🐶', '🥕', '🐵'], desc: 'Ce animăluț urmează în șir?' },
    { id: 'pat2', title: 'Model Dublu: A - A - B', pattern: ['🥕', '🥕', '🐵', '🥕', '🥕'], target: '🐵', options: ['🐸', '🐵', '🐶'], desc: 'Descoperă regula morcovilor și maimuțicii' },
    { id: 'pat3', title: 'Model Triplu: A - B - C', pattern: ['🐶', '🐸', '🐵', '🐶', '🐸'], target: '🐵', options: ['🐵', '🐶', '🥕'], desc: 'Găsește al treilea prieten din echipă' },
  ],
  coloring: [
    { id: 'A', title: 'Litera A', img: IMAGES.sheetA, letter: '🅰️', category: 'Litere' },
    { id: 'B', title: 'Litera B', img: IMAGES.sheetB, letter: '🅱️', category: 'Litere' },
    { id: 'M', title: 'Litera M', img: IMAGES.sheetM, letter: 'Ⓜ️', category: 'Litere' },
    { id: 'R', title: 'Litera R', img: IMAGES.sheetR, letter: '🇷', category: 'Litere' },
    { id: 'num1', title: 'Monstrul Numărul 1', img: IMAGES.sheetNum1, letter: '1️⃣', category: 'Numere' },
    { id: 'num2', title: 'Monstrul Numărul 2', img: IMAGES.sheetNum2, letter: '2️⃣', category: 'Numere' },
    { id: 'num3', title: 'Monstrul Numărul 3', img: IMAGES.sheetNum3, letter: '3️⃣', category: 'Numere' },
    { id: 'num5', title: 'Monstrul Numărul 5', img: IMAGES.sheetNum5, letter: '5️⃣', category: 'Numere' },
    { id: 'cerc', title: 'Cercul Rotund', img: IMAGES.sheetShapeCerc, letter: '🔴', category: 'Forme' },
    { id: 'patrat', title: 'Pătratul Echilibrat', img: IMAGES.sheetShapePatrat, letter: '🟦', category: 'Forme' },
    { id: 'triunghi', title: 'Triunghiul Ascuțit', img: IMAGES.sheetShapeTriunghi, letter: '🔺', category: 'Forme' },
    { id: 'free', title: 'Pânză Albă Liberă', img: null, letter: '🎨', category: 'Creativ' },
  ],
};

// 4. CREIOANE CERATE KHAN KIDS
const CRAYONS = [
  { id: 'c_red', hex: '#FF4757', label: 'Roșu' },
  { id: 'c_orange', hex: '#FF7F50', label: 'Portocaliu' },
  { id: 'c_yellow', hex: '#FFA502', label: 'Galben' },
  { id: 'c_green', hex: '#2ED573', label: 'Verde' },
  { id: 'c_blue', hex: '#1E90FF', label: 'Albastru' },
  { id: 'c_purple', hex: '#845EC2', label: 'Mov' },
  { id: 'c_pink', hex: '#FF6B81', label: 'Roz' },
  { id: 'c_eraser', hex: '#FFFFFF', isEraser: true, label: 'Radieră' },
];

export default function App() {
  console.log('[DEBUG APP] CountAndSelectGame is:', typeof CountAndSelectGame);
  console.log('[DEBUG APP] FindTheNumberFallGame is:', typeof FindTheNumberFallGame);
  const [appMode, setAppMode] = useState('hub'); // 'hub' | 'library' | 'activity'
  const [libraryTab, setLibraryTab] = useState('math');
  const [stars, setStars] = useState(18);
  const [musicPlaying, setMusicPlaying] = useState(false);

  // ACTIVITATE ACTIVĂ & CONFIGURAȚIE FIȘĂ
  const [activeActivityType, setActiveActivityType] = useState('math'); // 'math' | 'phonics' | 'memory' | 'patterns' | 'coloring' | 'clubhouse'
  const [activeConfig, setActiveConfig] = useState(CURRICULUM_LIBRARY.math.find(m => !m.isEngine) || CURRICULUM_LIBRARY.math[0]);

  // STĂRI MATEMATICĂ (TEN-FRAME)
  const [mathState, setMathState] = useState({ a: 3, b: 2, op: '+', progress: 0, isDone: false });

  // STĂRI OLLO PHONICS
  const [olloMouthOpen, setOlloMouthOpen] = useState(false);
  const [fedLetters, setFedLetters] = useState([]);
  const [isOlloFull, setIsOlloFull] = useState(false);

  // STĂRI MEMORY MATCH
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);

  // STĂRI MODELE LOGICE (PATTERNS)
  const [isPatternSolved, setIsPatternSolved] = useState(false);

  // STĂRI ATELIER PICTURĂ
  const [activeSheet, setActiveSheet] = useState(CURRICULUM_LIBRARY.coloring[0]);
  const [activeCrayon, setActiveCrayon] = useState(CRAYONS[0].hex);
  const [isPainting, setIsPainting] = useState(false);

  // STĂRI GENERATOR DE FIȘE PERSONALIZATE
  const [genType, setGenType] = useState('math');
  const [genNumA, setGenNumA] = useState(3);
  const [genNumB, setGenNumB] = useState(2);
  const [genOp, setGenOp] = useState('+');

  // STĂRI JUCĂRII CAMERA COPILULUI
  const [toyReaction, setToyReaction] = useState(null);
  const [showGiftUnboxer, setShowGiftUnboxer] = useState(false);
  const [unlockedGifts, setUnlockedGifts] = useState([]);
  const [showScratchpad, setShowScratchpad] = useState(false);

  const starBounce = useRef(new Animated.Value(1)).current;

  const triggerStarBonus = (count = 1) => {
    setStars((s) => s + count);
    Animated.sequence([
      Animated.timing(starBounce, { toValue: 1.45, duration: 150, useNativeDriver: false }),
      Animated.spring(starBounce, { toValue: 1, friction: 3, tension: 40, useNativeDriver: false }),
    ]).start();
  };

  useEffect(() => {
    // Start continuous looping background piano music via audioMixer
    audioMixer.playMusic(AUDIO.bgMusic);
    setMusicPlaying(true);

    // Kodi welcome voice with automatic music ducking
    const welcomeTimer = setTimeout(() => {
      playVoice(AUDIO.welcome, { duck: true });
    }, 700);

    return () => clearTimeout(welcomeTimer);
  }, []);

  const toggleMusic = () => {
    playSound(AUDIO.sfxButton);
    const muted = audioMixer.toggleMute();
    setMusicPlaying(!muted);
  };

  // LANSARE FIȘĂ DIN LIBRĂRIE SAU GENERATOR
  const launchWorksheet = (type, config) => {
    playSound(AUDIO.sfxButton);
    if (type === 'rods') {
      setAppMode('rods');
      return;
    }
    if (type === 'bubbles') {
      setAppMode('bubbles');
      return;
    }
    if (type === 'bath') {
      setAppMode('bath');
      return;
    }
    if (type === 'cutscene') {
      setAppMode('cutscene');
      return;
    }
    if (type === 'stepping_stones') {
      setAppMode('stepping_stones');
      return;
    }
    if (type === 'oneline') {
      setAppMode('oneline');
      return;
    }
    if (type === 'fishing') {
      setAppMode('fishing');
      return;
    }
    if (type === 'scale') {
      setAppMode('scale');
      return;
    }
    if (type === 'count_select') {
      setAppMode('count_select');
      return;
    }
    if (type === 'find_number') {
      setAppMode('find_number');
      return;
    }

    setActiveActivityType(type);
    setActiveConfig(config);
    setAppMode('activity');

    if (type === 'math') {
      setMathState({ a: config.a, b: config.b, op: config.op || '+', progress: 0, isDone: false });
      setTimeout(() => playVoice(config.op === '-' ? AUDIO.subIntro : AUDIO.addIntro), 300);
    } else if (type === 'phonics') {
      setFedLetters([]);
      setIsOlloFull(false);
      setOlloMouthOpen(false);
      setTimeout(() => playVoice(AUDIO.feedIntro), 300);
    } else if (type === 'tracing') {
      setTimeout(() => playVoice(AUDIO.drawIntro || AUDIO.kodiAwesome), 300);
    } else if (type === 'memory') {
      initMemoryGame(config.pairCount || 4);
      setTimeout(() => playVoice(AUDIO.memoIntro), 300);
    } else if (type === 'patterns') {
      setIsPatternSolved(false);
      setTimeout(() => playVoice(AUDIO.patternPrompt), 300);
    } else if (type === 'coloring') {
      setActiveSheet(config);
      setTimeout(() => {
        playVoice(AUDIO.drawIntro);
        loadWorksheetOnCanvas(config);
      }, 350);
    } else if (type === 'clubhouse') {
      setTimeout(() => playVoice(AUDIO.roomIntro), 300);
    }
  };

  // 1. ENGINE MATEMATICĂ: TEN-FRAME (ADUNARE & SCĂDERE)
  const handleTenFrameClick = (idx) => {
    if (mathState.isDone) return;
    const { a, b, op, progress } = mathState;

    if (op === '+') {
      // Adunare: atinge căsuțele libere de la 'a' încolo
      if (idx === a + progress && progress < b) {
        const newProg = progress + 1;
        playSound(AUDIO.sfxPop);

        if (newProg === b) {
          setMathState((s) => ({ ...s, progress: newProg, isDone: true }));
          playSound(AUDIO.sfxRoyal);
          triggerStarBonus(2);
          confetti({ particleCount: 110, spread: 85, origin: { y: 0.6 } });
          playVoice(AUDIO.kodiAwesome);
          setTimeout(() => playVoice(AUDIO.addWin), 1200);
        } else {
          setMathState((s) => ({ ...s, progress: newProg }));
        }
      }
    } else {
      // Scădere: atinge morcovii plasați pentru a-i culege
      if (idx < a - progress && progress < b) {
        const newProg = progress + 1;
        playSound(AUDIO.sfxPop);

        if (newProg === b) {
          setMathState((s) => ({ ...s, progress: newProg, isDone: true }));
          playSound(AUDIO.sfxRoyal);
          triggerStarBonus(2);
          confetti({ particleCount: 110, spread: 85 });
          playVoice(AUDIO.kodiGreatJob);
        } else {
          setMathState((s) => ({ ...s, progress: newProg }));
        }
      }
    }
  };

  // 2. ENGINE OLLO PHONICS
  const feedOllo = (char, isTarget) => {
    if (fedLetters.includes(char)) return;

    if (isTarget) {
      setOlloMouthOpen(true);
      playSound(AUDIO.sfxSquish);
      const next = [...fedLetters, char];
      setFedLetters(next);

      setTimeout(() => {
        setOlloMouthOpen(false);
        const map = { B: AUDIO.pB, M: AUDIO.pM, R: AUDIO.pR, S: AUDIO.pS, T: AUDIO.pT };
        if (map[char]) playVoice(map[char]);
      }, 400);

      if (next.length === (activeConfig.targets?.length || 3)) {
        setIsOlloFull(true);
        setTimeout(() => {
          playSound(AUDIO.sfxBingo);
          triggerStarBonus(2);
          confetti({ particleCount: 120, spread: 90 });
          playVoice(AUDIO.kodiGreatJob);
          setTimeout(() => playVoice(AUDIO.feedWin), 1100);
        }, 1400);
      }
    } else {
      playSound(AUDIO.sfxIncorrect);
      playVoice(AUDIO.feedWrong);
    }
  };

  // 3. ENGINE MODELE LOGICE (PATTERNS)
  const onPatternOptionSelect = (opt) => {
    if (isPatternSolved) return;
    if (opt === activeConfig.target) {
      setIsPatternSolved(true);
      playSound(AUDIO.sfxCorrect);
      playSound(AUDIO.sfxRoyal);
      triggerStarBonus(2);
      confetti({ particleCount: 120, spread: 80 });
      playVoice(AUDIO.kodiAwesome);
      setTimeout(() => playVoice(AUDIO.patternWin), 1000);
    } else {
      playSound(AUDIO.sfxIncorrect);
    }
  };

  // 4. ENGINE MEMORY MATCH
  const initMemoryGame = (pairs = 4) => {
    const pool = [
      { id: 'dog', name: 'Câine', img: IMAGES.wordDog, voice: AUDIO.caine },
      { id: 'frog', name: 'Broscuță', img: IMAGES.wordFrog, voice: AUDIO.broasca },
      { id: 'monkey', name: 'Maimuță', img: IMAGES.wordMonkey, voice: AUDIO.maimuta },
      { id: 'carrot', name: 'Morcov', img: IMAGES.wordCarrot, voice: AUDIO.iepuras },
    ].slice(0, pairs);

    const deck = [];
    pool.forEach((item) => {
      deck.push({ uid: `${item.id}_1`, pairKey: item.id, ...item });
      deck.push({ uid: `${item.id}_2`, pairKey: item.id, ...item });
    });
    setCards(deck.sort(() => Math.random() - 0.5));
    setSelectedCards([]);
    setMatchedPairs([]);
  };

  const onCardTap = (card) => {
    if (selectedCards.length >= 2) return;
    if (selectedCards.some((c) => c.uid === card.uid)) return;
    if (matchedPairs.includes(card.pairKey)) return;

    playSound(AUDIO.sfxWhoosh);
    const newSel = [...selectedCards, card];
    setSelectedCards(newSel);

    if (newSel.length === 2) {
      const [c1, c2] = newSel;
      if (c1.pairKey === c2.pairKey) {
        playSound(AUDIO.sfxChime);
        const newMatched = [...matchedPairs, c1.pairKey];
        setMatchedPairs(newMatched);
        setSelectedCards([]);
        setTimeout(() => playVoice(c1.voice), 300);

        if (newMatched.length === cards.length / 2) {
          setTimeout(() => {
            playSound(AUDIO.sfxRoyal);
            triggerStarBonus(3);
            confetti({ particleCount: 140, spread: 90 });
            playVoice(AUDIO.kodiAwesome);
            setTimeout(() => playVoice(AUDIO.memoWin), 1100);
          }, 1200);
        }
      } else {
        setTimeout(() => setSelectedCards([]), 850);
      }
    }
  };

  // 5. ENGINE ATELIER PICTURĂ
  const loadWorksheetOnCanvas = (sheet) => {
    const cvs = document.getElementById('paintCanvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    if (sheet?.img) {
      const img = new window.Image();
      const src = typeof sheet.img === 'string' ? sheet.img : sheet.img?.default || sheet.img;
      img.src = src;
      img.onload = () => {
        const scale = Math.min((cvs.width - 40) / img.width, (cvs.height - 40) / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (cvs.width - w) / 2, (cvs.height - h) / 2, w, h);
      };
    }
  };

  const handleDraw = (e) => {
    if (!isPainting && e.type !== 'mousedown') return;
    const cvs = document.getElementById('paintCanvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const rect = cvs.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = activeCrayon;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // 6. GENERATOR INSTANTANEU DE FIȘE PERSONALIZATE
  const generateCustomWorksheet = () => {
    playSound(AUDIO.sfxPop);
    if (genType === 'math') {
      const customSheet = {
        id: `custom_math_${Date.now()}`,
        title: `Adunare: ${genNumA} ${genOp} ${genNumB}`,
        a: genNumA,
        b: genNumB,
        op: genOp,
        desc: `Fișă generată special pentru tine!`,
      };
      launchWorksheet('math', customSheet);
    } else if (genType === 'patterns') {
      const customPat = {
        id: `custom_pat_${Date.now()}`,
        title: 'Model Logic Generat',
        pattern: ['🐶', '🐸', '🐶', '🐸'],
        target: '🐶',
        options: ['🐶', '🥕', '🐵'],
        desc: 'Model generat dinamic',
      };
      launchWorksheet('patterns', customPat);
    } else if (genType === 'memory') {
      const customMem = {
        id: `custom_mem_${Date.now()}`,
        title: 'Memorie cu Animale',
        pairCount: 3,
        desc: 'Găsește perechile de carduri',
      };
      launchWorksheet('memory', customMem);
    }
  };

  const generateSurpriseWorksheet = () => {
    playSound(AUDIO.sfxReward);
    const randA = Math.floor(Math.random() * 4) + 1;
    const randB = Math.floor(Math.random() * 4) + 1;
    const surpriseSheet = {
      id: `surprise_${Date.now()}`,
      title: `Surpriză Matematică: ${randA} + ${randB}`,
      a: randA,
      b: randB,
      op: '+',
      desc: 'Fișă surpriză generată aleator!',
    };
    launchWorksheet('math', surpriseSheet);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* TOP BAR / BARA SUPERIOARĂ KHAN KIDS */}
      {!['stepping_stones', 'oneline', 'fishing', 'scale', 'count_select', 'find_number', 'bath', 'dressup', 'quest', 'cutscene', 'rods', 'bubbles'].includes(appMode) && (
        <View style={styles.topBar}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topBarScrollContent}
          >
          <View style={styles.topLeftWrap}>
            {appMode !== 'hub' ? (
              <TouchableOpacity
                style={styles.navBackBtn}
                onPress={() => {
                  playSound(AUDIO.sfxButton);
                  setAppMode(appMode === 'activity' ? 'library' : 'hub');
                }}
              >
                <Text style={styles.navBackIcon}>◀</Text>
                <Text style={styles.navBackText}>
                  {appMode === 'activity' ? 'Biblioteca' : 'Orășelul'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.hubTitleWrap}>
                <Image source={IMAGES.kodiMascot} style={styles.hubMascotThumb} resizeMode="contain" />
                <Text style={styles.brandTitle}>Orășelul</Text>
              </View>
            )}

            {/* BUTON DE SCHIMBARE ÎNTRE ORĂȘEL ȘI BIBLIOTECĂ */}
            <View style={styles.modeSwitchWrap}>
              <TouchableOpacity
                style={[styles.modeSwitchBtn, appMode === 'hub' && styles.modeSwitchBtnActive]}
                onPress={() => {
                  playSound(AUDIO.sfxButton);
                  setAppMode('hub');
                }}
              >
                <Text style={styles.modeSwitchIcon}>🗺️</Text>
                <Text style={[styles.modeSwitchText, appMode === 'hub' && styles.modeSwitchTextActive]}>
                  Hartă
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeSwitchBtn, (appMode === 'library' || appMode === 'activity') && styles.modeSwitchBtnActive]}
                onPress={() => {
                  playSound(AUDIO.sfxButton);
                  setAppMode('library');
                }}
              >
                <Text style={styles.modeSwitchIcon}>📚</Text>
                <Text style={[styles.modeSwitchText, (appMode === 'library' || appMode === 'activity') && styles.modeSwitchTextActive]}>
                  Fișe
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.topRightControls}>
            <TouchableOpacity
              style={styles.scratchpadTopBtn}
              onPress={() => {
                playSound(AUDIO.sfxButton);
                setShowScratchpad(!showScratchpad);
                if (!showScratchpad && AUDIO.scratchpadIntro) {
                  playVoice(AUDIO.scratchpadIntro);
                }
              }}
            >
              <Text style={styles.scratchpadTopIcon}>✏️</Text>
              <Text style={styles.scratchpadTopText}>Ciornă</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.giftBoxTopBtn}
              onPress={() => {
                playSound(AUDIO.sfxButton);
                setShowGiftUnboxer(true);
              }}
            >
              <Text style={styles.giftBoxTopIcon}>🎁</Text>
              <Text style={styles.giftBoxTopText}>Cadou!</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.musicBtn} onPress={toggleMusic}>
              <Text style={styles.musicIcon}>{musicPlaying ? '🎵' : '🔇'}</Text>
            </TouchableOpacity>

            <Animated.View style={[styles.starsPill, { transform: [{ scale: starBounce }] }]}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.starText}>{stars}</Text>
            </Animated.View>
          </View>
        </ScrollView>
      </View>
      )}

      {/* MODAL POPUP: GIFT BOX UNBOXER */}
      {showGiftUnboxer && (
        <View style={styles.giftModalOverlay}>
          <View style={styles.giftModalCard}>
            <TouchableOpacity
              style={styles.giftModalCloseBtn}
              onPress={() => setShowGiftUnboxer(false)}
            >
              <Text style={styles.giftModalCloseText}>✕ Închide</Text>
            </TouchableOpacity>
            <GiftBoxUnboxer
              audio={AUDIO}
              onClaim={(prize) => {
                setUnlockedGifts((prev) => [...prev, prize]);
                setShowGiftUnboxer(false);
                triggerStarBonus(3);
              }}
              onClose={() => setShowGiftUnboxer(false)}
            />
          </View>
        </View>
      )}

      {/* 1. MODUL: ORĂȘELUL VESEL (HERO ADVENTURE MAP) */}
      {appMode === 'hub' && (
        <AmbientWorldOverlay audio={AUDIO}>
          <ImageBackground source={IMAGES.hubBg} style={styles.screenBg} resizeMode="cover">
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, alignItems: 'center' }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.welcomeBanner}>
                <LivingMascot mascot="kodi" size={110} showPlatform={true} />
                <View style={styles.welcomeTextWrap}>
                  <Text style={styles.welcomeHeader}>Salutare, Micul Meu Explorator!</Text>
                  <Text style={styles.welcomeSub}>
                    Atinge-mă să chicotesc, pornește în Excursia Zilei sau vizionează Desenele Animate!
                  </Text>
                </View>
                <View style={styles.hubHeaderButtons}>
                  <TouchableOpacity
                    style={styles.questCtaBtn}
                    onPress={() => {
                      playSound(AUDIO.sfxButton);
                      setAppMode('quest');
                    }}
                  >
                    <Text style={styles.questCtaText}>🚀 Excursia Zilei</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cartoonCtaBtn}
                    onPress={() => {
                      playSound(AUDIO.sfxButton);
                      setAppMode('cutscene');
                    }}
                  >
                    <Text style={styles.cartoonCtaText}>🎬 Desene</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.bathCtaBtn}
                    onPress={() => {
                      playSound(AUDIO.sfxButton);
                      setAppMode('bath');
                    }}
                  >
                    <Text style={styles.bathCtaText}>🛁 Cădița</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.openLibCta} onPress={() => setAppMode('library')}>
                    <Text style={styles.openLibCtaText}>Biblioteca 📚</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dressUpCta}
                    onPress={() => {
                      playSound(AUDIO.sfxButton);
                      setAppMode('dressup');
                    }}
                  >
                    <Text style={styles.dressUpCtaText}>Salon 👗</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.moduleGrid}>
              {[
                { id: 'count_select', title: 'Numără și Alege', subtitle: 'Mingiuțe Magice & Animăluțe (LogicLike)', badge: 'NUMĂRĂTOARE & FIZICĂ', color: '#00B4D8', mascot: IMAGES.kodiMascot, accent: '#E0F7FA' },
                { id: 'find_number', title: 'Mâncăciosul de Numere', subtitle: 'Fructe Căzătoare & Cifre Țintă (LogicLike)', badge: 'RECUNOAȘTERE CIFRE', color: '#E67E22', mascot: IMAGES.olloMascot, accent: '#FEF9E7' },
                { id: 'fishing', title: 'Pescuitul Sunetelor', subtitle: 'Undița Magnetică cu Peștișori (Khan Kids)', badge: 'PESCUIT & CITIRE', color: '#0984E3', mascot: IMAGES.peckMascot, accent: '#EBF5FB' },
                { id: 'scale', title: 'Cântarul Echilibrat', subtitle: 'Balanța Deductivă cu Fructe (LogicLike)', badge: 'LOGICĂ & MĂSURĂ', color: '#FF9F43', mascot: IMAGES.kodiMascot, accent: '#FFF3E0' },
                { id: 'stepping_stones', title: 'Broscuța Săltăreață', subtitle: 'Numărătoare & Salturi pe Nuferi (LogicLike)', badge: 'NUMĂRĂTOARE & FIZICĂ', color: '#2ED573', mascot: IMAGES.peckMascot, accent: '#E8F8F5' },
                { id: 'oneline', title: 'Trasează dintr-o Mișcare', subtitle: 'Puzzle-uri Euleriene fără ridicarea degetului', badge: 'TOPOLOGIE & GRAFURI', color: '#9B59B6', mascot: IMAGES.drawMascot, accent: '#F4ECF7' },
                { id: 'rods', title: 'Bastonul celor 10 Cuburi', subtitle: 'Base-Ten: Unește 10 cuburi într-o bară', badge: 'MATEMATICĂ FIZICĂ', color: '#FF9800', mascot: IMAGES.kodiMascot, accent: '#FFF3E0' },
                { id: 'bubbles', title: 'Acvariul cu Bule Fonetice', subtitle: 'Sparge bulele cu literele corecte', badge: 'FONETICĂ & BULE', color: '#00BCD4', mascot: IMAGES.peckMascot, accent: '#E0F7FA' },
                { id: 'bath', title: 'Cădița cu Bule a lui Ollo', subtitle: 'Baloane de săpun, rățuște și valuri', badge: 'JOACĂ INTERACTIVĂ', color: '#0288D1', mascot: IMAGES.olloMascot, accent: '#E1F5FE' },
                { id: 'cutscene', title: 'Desene Animate: Bun Venit', subtitle: 'Filmulețul animat oficial cu toți prietenii', badge: 'CINEMA COPILĂRIE', color: '#E91E63', mascot: IMAGES.sandyMascot, accent: '#FCE4EC' },
                { id: 'math', title: 'Grila Matematică', subtitle: 'Adunare & Scădere pe 10 Căsuțe', badge: '10 CĂSUȚE & CALCUL', color: '#FF5E57', mascot: IMAGES.peckMascot, accent: '#FFF0F0' },
                { id: 'phonics', title: 'Hrănește-l pe Ollo', subtitle: 'Consoanele Românești (B, M, R)', badge: 'CITIRE & FONETICĂ', color: '#3B7A57', mascot: IMAGES.olloMascot, accent: '#EBF7EE' },
                { id: 'tracing', title: 'Trasare Vectorială', subtitle: 'Litere & Cifre cu Ghidaj și Steluțe', badge: 'GRAFOMOTRICITATE', color: '#FF4757', mascot: IMAGES.drawMascot, accent: '#FFF0F3' },
                { id: 'books', title: 'Cărți & Povești', subtitle: 'Citire Sincronizată cu Voce Română', badge: 'LECTURĂ INTERACTIVĂ', color: '#0984E3', mascot: IMAGES.kodiMascot, accent: '#EBF5FB' },
                { id: 'patterns', title: 'Modele Logice', subtitle: 'Găsește regula și completează șirul', badge: 'LOGICĂ & RITM', color: '#6C5CE7', mascot: IMAGES.sandyMascot, accent: '#F0EFFE' },
                { id: 'memory', title: 'Cartonașele Magice', subtitle: 'Găsește Animăluțele Gemene', badge: 'MEMORIE VIZUALĂ', color: '#10AC84', mascot: IMAGES.reyaMascot, accent: '#EAF8F4' },
                { id: 'coloring', title: 'Atelierul de Pictură', subtitle: 'Litere, Numere & Forme de Colorat', badge: 'ARTĂ & CREATIVITATE', color: '#FFA502', mascot: IMAGES.drawMascot, accent: '#FFFDF0' },
                { id: 'clubhouse', title: 'Căsuța cu Jucării', subtitle: 'Instrumente Muzicale Interactive', badge: 'SALA CU SURPRIZE', color: '#845EC2', mascot: IMAGES.sandyMascot, accent: '#F7F3FC' },
              ].map((mod) => (
                <TouchableOpacity
                  key={mod.id}
                  style={[styles.moduleCard, { borderBottomColor: mod.color }]}
                  onPress={() => {
                    if (['rods', 'bubbles', 'bath', 'cutscene', 'stepping_stones', 'oneline', 'fishing', 'scale', 'count_select', 'find_number'].includes(mod.id)) {
                      launchWorksheet(mod.id, {});
                    } else if (mod.id === 'math') {
                      launchWorksheet('math', CURRICULUM_LIBRARY.math.find(m => !m.isEngine) || {});
                    } else if (mod.id === 'patterns') {
                      launchWorksheet('patterns', CURRICULUM_LIBRARY.patterns.find(m => !m.isEngine) || {});
                    } else {
                      launchWorksheet(mod.id, CURRICULUM_LIBRARY[mod.id]?.[0] || {});
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.mascotHolder, { backgroundColor: mod.accent }]}>
                    <Image source={mod.mascot} style={styles.moduleMascotImg} resizeMode="contain" />
                  </View>
                  <View style={styles.moduleCardBody}>
                    <View style={[styles.badgePill, { backgroundColor: mod.accent }]}>
                      <Text style={[styles.badgeText, { color: mod.color }]}>{mod.badge}</Text>
                    </View>
                    <Text style={styles.cardTitle}>{mod.title}</Text>
                    <Text style={styles.cardSubtitle}>{mod.subtitle}</Text>
                  </View>
                  <View style={[styles.arrowPill, { backgroundColor: mod.color }]}>
                    <Text style={styles.arrowText}>▶</Text>
                  </View>
                </TouchableOpacity>
              ))}
              </View>
            </ScrollView>
          </ImageBackground>
        </AmbientWorldOverlay>
      )}

      {/* 2. MODUL: BIBLIOTECA DE FIȘE DE LUCRU (KHAN KIDS LIBRARY VIEW) */}
      {appMode === 'library' && (
        <View style={styles.libraryContainer}>
          {/* TAB-URI CATEGORII LIBRĂRIE */}
          <View style={styles.libraryTabBar}>
            {[
              { id: 'math', label: 'Matematică', icon: '🔢' },
              { id: 'phonics', label: 'Litere & Citire', icon: '🔤' },
              { id: 'tracing', label: 'Trasare Vectorială', icon: '✏️' },
              { id: 'books', label: 'Cărți & Povești', icon: '📖' },
              { id: 'patterns', label: 'Modele Logice', icon: '🧩' },
              { id: 'memory', label: 'Memorie', icon: '🎴' },
              { id: 'coloring', label: 'Fișe de Colorat', icon: '🎨' },
              { id: 'generator', label: '➕ Creează o Fișă Nouă', icon: '✨' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.libTabBtn, libraryTab === tab.id && styles.libTabBtnActive]}
                onPress={() => {
                  playSound(AUDIO.sfxButton);
                  setLibraryTab(tab.id);
                  if (tab.id === 'generator') playVoice(AUDIO.generatorIntro);
                }}
              >
                <Text style={styles.libTabIcon}>{tab.icon}</Text>
                <Text style={[styles.libTabText, libraryTab === tab.id && styles.libTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CONȚINUT BIBLIOTECĂ: CATALOGUL DE FIȘE */}
          {libraryTab !== 'generator' ? (
            <ScrollView contentContainerStyle={styles.sheetsGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.sheetsGridHeader}>
                <Text style={styles.sheetsGridTitle}>Fișe de Lucru Recomandate</Text>
                <TouchableOpacity style={styles.surpriseBtn} onPress={generateSurpriseWorksheet}>
                  <Text style={styles.surpriseBtnText}>🎲 Fișă Surpriză!</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sheetsList}>
                {(CURRICULUM_LIBRARY[libraryTab] || []).map((sheet, index) => (
                  <TouchableOpacity
                    key={sheet.id || index}
                    style={styles.sheetItemCard}
                    onPress={() => {
                      if (sheet.isEngine) {
                        launchWorksheet(sheet.isEngine, sheet);
                      } else {
                        launchWorksheet(libraryTab, sheet);
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={styles.sheetItemPreview}>
                      <Text style={styles.sheetItemThumbIcon}>
                        {libraryTab === 'math' ? '🥕' : libraryTab === 'phonics' ? '🅰️' : libraryTab === 'tracing' ? '✏️' : libraryTab === 'books' ? '📖' : libraryTab === 'patterns' ? '🧩' : libraryTab === 'memory' ? '🎴' : '🎨'}
                      </Text>
                      {sheet.img && <Image source={sheet.img} style={styles.sheetItemImg} resizeMode="contain" />}
                    </View>
                    <View style={styles.sheetItemContent}>
                      <Text style={styles.sheetItemTitle}>{sheet.title}</Text>
                      <Text style={styles.sheetItemDesc}>{sheet.desc || 'Atinge pentru a juca'}</Text>
                      <View style={styles.sheetStarsRow}>
                        <Text style={styles.sheetStarsText}>⭐⭐⭐ Recompensă: 2 stele</Text>
                      </View>
                    </View>
                    <View style={styles.sheetPlayPill}>
                      <Text style={styles.sheetPlayText}>START ▶</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            /* TAB: GENERATOR DE FIȘE NOI INTERACTIVE */
            <ScrollView contentContainerStyle={styles.generatorContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.genBanner}>
                <Text style={styles.genBannerTitle}>🎨 Creează-ți Propria Fișă de Lucru!</Text>
                <Text style={styles.genBannerSub}>
                  Alege tema, numerele sau literele dorite și generează instantaneu un joc nou pe placul tău!
                </Text>
              </View>

              {/* ALEGERE TIP ACTIVITATE */}
              <View style={styles.genSection}>
                <Text style={styles.genSectionLabel}>1. Alege Tipul de Activitate:</Text>
                <View style={styles.genTypeRow}>
                  {[
                    { id: 'math', label: 'Adunare pe Grilă', icon: '🥕' },
                    { id: 'patterns', label: 'Modele Logice', icon: '🧩' },
                    { id: 'memory', label: 'Joc de Memorie', icon: '🎴' },
                  ].map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.genTypeCard, genType === t.id && styles.genTypeCardActive]}
                      onPress={() => {
                        playSound(AUDIO.sfxPop);
                        setGenType(t.id);
                      }}
                    >
                      <Text style={styles.genTypeIcon}>{t.icon}</Text>
                      <Text style={[styles.genTypeText, genType === t.id && styles.genTypeTextActive]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* CONFIGURATOR PARAMETRI */}
              {genType === 'math' && (
                <View style={styles.genSection}>
                  <Text style={styles.genSectionLabel}>2. Configurează Ecuația:</Text>
                  <View style={styles.mathConfigRow}>
                    <View style={styles.numPicker}>
                      <Text style={styles.numPickerLabel}>Primul Termen</Text>
                      <View style={styles.pickerBtns}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <TouchableOpacity
                            key={n}
                            style={[styles.pickerBtn, genNumA === n && styles.pickerBtnActive]}
                            onPress={() => setGenNumA(n)}
                          >
                            <Text style={[styles.pickerBtnText, genNumA === n && styles.pickerBtnTextActive]}>{n}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <Text style={styles.mathOpSymbol}>+</Text>

                    <View style={styles.numPicker}>
                      <Text style={styles.numPickerLabel}>Al Doilea Termen</Text>
                      <View style={styles.pickerBtns}>
                        {[1, 2, 3, 4].map((n) => (
                          <TouchableOpacity
                            key={n}
                            style={[styles.pickerBtn, genNumB === n && styles.pickerBtnActive]}
                            onPress={() => setGenNumB(n)}
                          >
                            <Text style={[styles.pickerBtnText, genNumB === n && styles.pickerBtnTextActive]}>{n}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* BUTOANE DE LANSARE FIȘĂ GENERATĂ */}
              <View style={styles.genActions}>
                <TouchableOpacity style={styles.launchGenBtn} onPress={generateCustomWorksheet}>
                  <Text style={styles.launchGenBtnText}>Generează și Deschide Fișa! 🚀</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.launchSurpriseBtn} onPress={generateSurpriseWorksheet}>
                  <Text style={styles.launchSurpriseBtnText}>Fișă Surpriză Random 🎲</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* 3. MODUL: ENGINE JOC ACTIVITATE (CÂND SE JOACĂ O FIȘĂ) */}
      {appMode === 'activity' && (
        <View style={styles.activityScreen}>
          {/* A. ACTIVITATE: GRILA MATEMATICĂ (TEN-FRAME) */}
          {activeActivityType === 'math' && (
            <PedagogicalScratchpad>
              <View style={styles.screenContainer}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>{activeConfig.title}</Text>
                  <Text style={styles.activityHint}>
                    {mathState.op === '+'
                      ? `Avem ${mathState.a} morcovi. Atinge căsuțele libere pentru a adăuga încă ${mathState.b} morcovi!`
                      : `Avem ${mathState.a} morcovi. Atinge ${mathState.b} morcovi pentru a-i scădea!`}
                  </Text>
                </View>

                <View style={styles.tenFrameWrapper}>
                  <View style={styles.tenFrameGrid}>
                    {[...Array(10)].map((_, idx) => {
                      const isInitial = idx < mathState.a;
                      const isAdded = mathState.op === '+' && idx >= mathState.a && idx < mathState.a + mathState.progress;
                      const isTargetSlot = mathState.op === '+' && idx === mathState.a + mathState.progress && !mathState.isDone;
                      const isRemoved = mathState.op === '-' && idx >= mathState.a - mathState.progress && idx < mathState.a;

                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.tenFrameSlot,
                            isTargetSlot && styles.tenFrameSlotHighlight,
                            (isInitial || isAdded) && !isRemoved && styles.tenFrameSlotFilled,
                            isRemoved && { opacity: 0.25 },
                          ]}
                          onPress={() => handleTenFrameClick(idx)}
                          activeOpacity={0.8}
                        >
                          {(isInitial || isAdded) && !isRemoved && (
                            <Image source={IMAGES.wordCarrot} style={styles.carrotImg} resizeMode="contain" />
                          )}
                          {isTargetSlot && <Text style={styles.plusGuide}>➕</Text>}
                          <Text style={styles.slotNumber}>{idx + 1}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.mathEquationBox}>
                  <Text style={styles.equationText}>
                    <Text style={{ color: '#FF5E57' }}>{mathState.a} </Text>
                    {mathState.op}
                    <Text style={{ color: '#2ED573' }}> {mathState.progress} </Text>
                    =
                    <Text style={{ color: mathState.isDone ? '#FFA502' : '#747D8C' }}>
                      {' '}
                      {mathState.isDone
                        ? mathState.op === '+'
                          ? mathState.a + mathState.b
                          : mathState.a - mathState.b
                        : '?'}
                    </Text>
                  </Text>
                </View>

                {mathState.isDone && (
                  <View style={styles.winBanner}>
                    <Text style={styles.winBannerText}>🎉 Bravo! Ai rezolvat corect fișa de calcul!</Text>
                    <TouchableOpacity
                      style={styles.replayBtn}
                      onPress={() => launchWorksheet('math', activeConfig)}
                    >
                      <Text style={styles.replayBtnText}>Joacă din Nou 🔄</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </PedagogicalScratchpad>
          )}

          {/* B. ACTIVITATE: OLLO PHONICS CU DRAG-AND-DROP CONTINUU 60FPS */}
          {activeActivityType === 'phonics' && (
            <OlloFeedingEngineGame
              targets={activeConfig.targets || ['B', 'M', 'R']}
              pool={activeConfig.pool || ['B', 'A', 'M', 'E', 'R']}
              images={IMAGES}
              audio={AUDIO}
              onComplete={() => triggerStarBonus(3)}
            />
          )}

          {/* C. ACTIVITATE: TRASARE VECTORIALĂ CU ANIMATED GUIDE ARROWS & STELUȚE */}
          {activeActivityType === 'tracing' && (
            <PathTracingGame
              audio={AUDIO}
              onBack={() => setAppMode('library')}
            />
          )}

          {/* D. ACTIVITATE: CĂRȚI & POVEȘTI CU SINCRONIZARE CUVÂNT-CU-CUVÂNT */}
          {(activeActivityType === 'books' || activeActivityType === 'storybook') && (
            <InteractiveStorybookReader
              audio={AUDIO}
              onBack={() => setAppMode('library')}
              onComplete={() => triggerStarBonus(5)}
            />
          )}

          {/* C. ACTIVITATE: MODELE LOGICE (PATTERNS) */}
          {activeActivityType === 'patterns' && (
            <View style={styles.screenContainer}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>{activeConfig.title}</Text>
                <Text style={styles.activityHint}>Observă cu atenție șirul! Ce element urmează?</Text>
              </View>

              <View style={styles.patternSequenceBox}>
                {(activeConfig.pattern || ['🐶', '🐸', '🐶', '🐸']).map((item, idx) => (
                  <View key={idx} style={styles.patternItem}>
                    <Text style={styles.patternItemText}>{item}</Text>
                  </View>
                ))}
                <View style={[styles.patternItem, styles.patternItemTarget]}>
                  <Text style={styles.patternTargetText}>{isPatternSolved ? activeConfig.target : '❓'}</Text>
                </View>
              </View>

              <Text style={styles.patternPromptSub}>Alege răspunsul corect:</Text>
              <View style={styles.patternOptionsRow}>
                {(activeConfig.options || ['🐶', '🥕', '🐵']).map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.patternOptBtn}
                    onPress={() => onPatternOptionSelect(opt)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.patternOptEmoji}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {isPatternSolved && (
                <View style={styles.winBanner}>
                  <Text style={styles.winBannerText}>🎉 Excelent! Ai completat modelul logic!</Text>
                </View>
              )}
            </View>
          )}

          {/* D. ACTIVITATE: MEMORY MATCH */}
          {activeActivityType === 'memory' && (
            <View style={styles.screenContainer}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>{activeConfig.title}</Text>
                <Text style={styles.activityHint}>Găsește toate perechile de animăluțe gemene!</Text>
              </View>

              <View style={styles.memoryGrid}>
                {cards.map((card) => {
                  const isFlipped = selectedCards.some((c) => c.uid === card.uid) || matchedPairs.includes(card.pairKey);

                  return (
                    <TouchableOpacity
                      key={card.uid}
                      style={[styles.memoryCard, isFlipped && styles.memoryCardFlipped]}
                      onPress={() => onCardTap(card)}
                      activeOpacity={0.85}
                    >
                      {isFlipped ? (
                        <View style={styles.cardFront}>
                          <Image source={card.img} style={styles.memoryImg} resizeMode="contain" />
                          <Text style={styles.memoryCardLabel}>{card.name}</Text>
                        </View>
                      ) : (
                        <View style={styles.cardBack}>
                          <Text style={styles.cardBackStar}>⭐</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {matchedPairs.length === cards.length / 2 && cards.length > 0 && (
                <View style={styles.winBanner}>
                  <Text style={styles.winBannerText}>🏆 Felicitări! Ai găsit toate perechile!</Text>
                </View>
              )}
            </View>
          )}

          {/* E. ACTIVITATE: ATELIER PICTURĂ */}
          {activeActivityType === 'coloring' && (
            <View style={styles.screenContainer}>
              <View style={styles.canvasWrapper}>
                {Platform.OS === 'web' ? (
                  <canvas
                    id="paintCanvas"
                    width={640}
                    height={400}
                    style={{
                      borderRadius: 20,
                      border: '4px solid #DFE4EA',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      cursor: 'crosshair',
                      backgroundColor: '#FFFFFF',
                      touchAction: 'none',
                    }}
                    onMouseDown={() => setIsPainting(true)}
                    onMouseMove={handleDraw}
                    onMouseUp={() => setIsPainting(false)}
                    onTouchStart={() => setIsPainting(true)}
                    onTouchMove={handleDraw}
                    onTouchEnd={() => setIsPainting(false)}
                  />
                ) : (
                  <View style={{ width: 640, height: 400, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 4, borderColor: '#DFE4EA' }} />
                )}
                <View style={styles.kodiArtistWrap}>
                  <Image source={IMAGES.kodiPlatform} style={styles.kodiArtistImg} resizeMode="contain" />
                </View>
              </View>

              <View style={styles.crayonBox}>
                <View style={styles.crayonsRow}>
                  {CRAYONS.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.crayonBtn, { backgroundColor: c.hex }, activeCrayon === c.hex && styles.crayonBtnActive]}
                      onPress={() => {
                        playSound(AUDIO.sfxPop);
                        setActiveCrayon(c.hex);
                      }}
                    >
                      {c.isEraser && <Text style={{ fontSize: 16 }}>🧹</Text>}
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.canvasActions}>
                  <TouchableOpacity
                    style={styles.canvasActionBtn}
                    onPress={() => loadWorksheetOnCanvas(activeSheet)}
                  >
                    <Text style={styles.canvasActionText}>Curăță 🧹</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.canvasActionBtn, { backgroundColor: '#FFA502' }]}
                    onPress={() => {
                      playSound(AUDIO.sfxReward);
                      triggerStarBonus(2);
                      confetti({ particleCount: 130, spread: 85 });
                      playVoice(AUDIO.kodiGreatJob);
                      setTimeout(() => playVoice(AUDIO.drawWin), 1000);
                    }}
                  >
                    <Text style={[styles.canvasActionText, { color: '#FFFFFF' }]}>Salvează ⭐</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* F. ACTIVITATE: CĂSUȚA CU JUCĂRII & DECORATOR ROOM */}
          {activeActivityType === 'clubhouse' && (
            <MascotDecoratorRoom
              images={IMAGES}
              audio={AUDIO}
              onBack={() => setAppMode('hub')}
            />
          )}
        </View>
      )}

      {/* 4. MODUL: EXCURSIA ZILEI (DAILY LEARNING QUEST) */}
      {appMode === 'quest' && (
        <ExcursiaZileiQuest
          images={IMAGES}
          audio={AUDIO}
          onExit={() => setAppMode('hub')}
          onDressUp={() => setAppMode('dressup')}
        />
      )}

      {/* 5. MODUL: SALONUL DE MODĂ & DECORARE MASCOTE */}
      {appMode === 'dressup' && (
        <MascotDecoratorRoom
          images={IMAGES}
          audio={AUDIO}
          onBack={() => setAppMode('hub')}
        />
      )}

      {/* 6. MODUL: DESENE ANIMATE (CARTOON INTRO CUTSCENE) */}
      {appMode === 'cutscene' && (
        <CartoonIntroCutscene onFinish={() => setAppMode('hub')} />
      )}

      {/* 7. MODUL: BASTONUL CELOR 10 CUBURI (BASE-TEN RODS) */}
      {appMode === 'rods' && (
        <BaseTenRodsGame
          onBack={() => setAppMode('hub')}
          onComplete={() => {
            triggerStarBonus(4);
            setShowGiftUnboxer(true);
          }}
        />
      )}

      {/* 8. MODUL: BULE FONETICE (PHONICS BUBBLE POPPER) */}
      {appMode === 'bubbles' && (
        <PhonicsBubblePopperGame
          onBack={() => setAppMode('hub')}
          onComplete={() => {
            triggerStarBonus(4);
            setShowGiftUnboxer(true);
          }}
        />
      )}

      {/* 9. MODUL: CĂDIȚA CU CLĂBUCI A LUI OLLO (BATHROOM TOYBOX) */}
      {appMode === 'bath' && (
        <OlloBathBubbleRoom onBack={() => setAppMode('hub')} />
      )}

      {/* 10. MODUL: BROSCUȚA SĂLTĂREAȚĂ (STEPPING STONES PATH) */}
      {appMode === 'stepping_stones' && (
        <SteppingStonesPathGame
          audio={AUDIO}
          images={IMAGES}
          onBack={() => setAppMode('hub')}
          onComplete={() => {
            triggerStarBonus(5);
            setShowGiftUnboxer(true);
          }}
        />
      )}

      {/* 11. MODUL: TRASEAZĂ DINTR-O MIȘCARE (ONE-LINE PUZZLE) */}
      {appMode === 'oneline' && (
        <OneLinePuzzleGame
          audio={AUDIO}
          images={IMAGES}
          onBack={() => setAppMode('hub')}
          onComplete={() => {
            triggerStarBonus(5);
            setShowGiftUnboxer(true);
          }}
        />
      )}

      {/* 12. MODUL: PESCUITUL SUNETELOR (PHONICS FISHING) */}
      {appMode === 'fishing' && (
        <PhonicsFishingGame
          audio={AUDIO}
          images={IMAGES}
          onBack={() => setAppMode('hub')}
          onComplete={() => {
            triggerStarBonus(5);
            setShowGiftUnboxer(true);
          }}
        />
      )}

      {/* 13. MODUL: CÂNTARUL ECHILIBRAT (LOGIC BALANCE SCALE) */}
      {appMode === 'scale' && (
        <LogicBalanceScaleGame
          onBack={() => setAppMode('hub')}
          onComplete={() => {
            triggerStarBonus(5);
            setShowGiftUnboxer(true);
          }}
        />
      )}

      {/* 14. MODUL: NUMĂRĂ ȘI ALEGE (LOGICLIKE COUNT & SELECT) */}
      {appMode === 'count_select' && (
        <CountAndSelectGame
          audio={AUDIO}
          onBack={() => setAppMode('hub')}
          onComplete={() => {
            triggerStarBonus(5);
            setShowGiftUnboxer(true);
          }}
        />
      )}

      {/* 15. MODUL: MÂNCĂCIOSUL DE NUMERE (LOGICLIKE FIND THE NUMBER) */}
      {appMode === 'find_number' && (
        <FindTheNumberFallGame
          audio={AUDIO}
          onBack={() => setAppMode('hub')}
          onComplete={() => {
            triggerStarBonus(5);
            setShowGiftUnboxer(true);
          }}
        />
      )}

      {/* 12. OVERLAY UNIVERSAL: CIORNĂ PEDAGOGICĂ (KHAN STANDARD SCRATCHPAD) */}
      <ScratchpadOverlay
        audio={AUDIO}
        isVisible={showScratchpad}
        onClose={() => setShowScratchpad(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    fontFamily: 'Fredoka, sans-serif',
  },
  screenBg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#E2E8F0',
    zIndex: 100,
  },
  topBarScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: '100%',
  },
  topLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hubTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  hubMascotThumb: {
    width: 44,
    height: 44,
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    fontFamily: 'Fredoka, sans-serif',
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderBottomWidth: 3,
    borderBottomColor: '#CED6E0',
    marginRight: 16,
  },
  navBackIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#2F3542',
  },
  navBackText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F3542',
    fontFamily: 'Fredoka, sans-serif',
  },
  modeSwitchWrap: {
    flexDirection: 'row',
    backgroundColor: '#F1F2F6',
    borderRadius: 20,
    padding: 3,
  },
  modeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modeSwitchBtnActive: {
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  modeSwitchIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  modeSwitchText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#747D8C',
    fontFamily: 'Fredoka, sans-serif',
  },
  modeSwitchTextActive: {
    color: '#2F3542',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scratchpadTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3742FA',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#2F3542',
    boxShadow: '0 4px 10px rgba(55, 66, 250, 0.35)',
  },
  scratchpadTopIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  scratchpadTopText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Fredoka, sans-serif',
  },
  giftBoxTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA502',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#E67E22',
    boxShadow: '0 4px 10px rgba(255, 165, 2, 0.35)',
    gap: 4,
  },
  giftBoxTopIcon: {
    fontSize: 16,
  },
  giftBoxTopText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  giftModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  giftModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 16,
    width: '94%',
    maxWidth: 580,
    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25)',
    position: 'relative',
    alignItems: 'center',
  },
  giftModalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    backgroundColor: '#F1F2F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    zIndex: 20,
  },
  giftModalCloseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#747D8C',
  },
  musicBtn: {
    backgroundColor: '#F1F2F6',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#CED6E0',
  },
  musicIcon: {
    fontSize: 20,
  },
  starsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFA502',
    borderBottomWidth: 4,
  },
  starIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  starText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D35400',
    fontFamily: 'Fredoka, sans-serif',
  },

  // HUB OVERLAY & BANNER
  hubOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    padding: 20,
  },
  welcomeBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 24,
    marginBottom: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#E2E8F0',
    width: '100%',
    maxWidth: 960,
  },
  kodiWelcomeImg: {
    width: 68,
    height: 68,
    marginRight: 16,
  },
  welcomeTextWrap: {
    flex: 1,
    minWidth: 240,
    paddingHorizontal: 8,
  },
  welcomeHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2F3542',
    fontFamily: 'Fredoka, sans-serif',
  },
  welcomeSub: {
    fontSize: 14,
    color: '#747D8C',
    marginTop: 2,
    fontFamily: 'Fredoka, sans-serif',
  },
  hubHeaderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  questCtaBtn: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#C0392B',
    elevation: 3,
  },
  questCtaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Fredoka, sans-serif',
  },
  dressUpCta: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#7D3C98',
  },
  dressUpCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Fredoka, sans-serif',
  },
  openLibCta: {
    backgroundColor: '#FFA502',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#CC8400',
  },
  openLibCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Fredoka, sans-serif',
  },
  cartoonCtaBtn: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#AD1457',
  },
  cartoonCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Fredoka, sans-serif',
  },
  bathCtaBtn: {
    backgroundColor: '#0288D1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#01579B',
  },
  bathCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Fredoka, sans-serif',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 40,
  },
  moduleCard: {
    width: 330,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
    borderBottomWidth: 5,
  },
  mascotHolder: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  moduleMascotImg: {
    width: 60,
    height: 60,
  },
  moduleCardBody: {
    flex: 1,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F3542',
    fontFamily: 'Fredoka, sans-serif',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#747D8C',
    marginTop: 2,
    fontFamily: 'Fredoka, sans-serif',
  },
  arrowPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // LIBRARY STYLES
  libraryContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  libraryTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    gap: 8,
    overflow: 'scroll',
  },
  libTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F1F2F6',
  },
  libTabBtnActive: {
    backgroundColor: '#2E86DE',
  },
  libTabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  libTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#57606F',
    fontFamily: 'Fredoka, sans-serif',
  },
  libTabTextActive: {
    color: '#FFFFFF',
  },
  sheetsGrid: {
    padding: 20,
    paddingBottom: 60,
  },
  sheetsGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetsGridTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2F3542',
    fontFamily: 'Fredoka, sans-serif',
  },
  surpriseBtn: {
    backgroundColor: '#FFA502',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#CC8400',
  },
  surpriseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Fredoka, sans-serif',
  },
  sheetsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  sheetItemCard: {
    width: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
    borderBottomWidth: 4,
    borderBottomColor: '#E2E8F0',
  },
  sheetItemPreview: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F1F2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  sheetItemThumbIcon: {
    fontSize: 28,
  },
  sheetItemImg: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  sheetItemContent: {
    flex: 1,
  },
  sheetItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F3542',
    fontFamily: 'Fredoka, sans-serif',
  },
  sheetItemDesc: {
    fontSize: 12,
    color: '#747D8C',
    marginTop: 2,
    fontFamily: 'Fredoka, sans-serif',
  },
  sheetStarsRow: {
    marginTop: 4,
  },
  sheetStarsText: {
    fontSize: 11,
    color: '#FFA502',
    fontWeight: '700',
  },
  sheetPlayPill: {
    backgroundColor: '#2ED573',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  sheetPlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // GENERATOR STYLES
  generatorContainer: {
    padding: 24,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  genBanner: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    borderBottomWidth: 4,
    borderBottomColor: '#E2E8F0',
    marginBottom: 20,
  },
  genBannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2F3542',
    fontFamily: 'Fredoka, sans-serif',
  },
  genBannerSub: {
    fontSize: 15,
    color: '#747D8C',
    marginTop: 4,
    fontFamily: 'Fredoka, sans-serif',
  },
  genSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  genSectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F3542',
    marginBottom: 12,
    fontFamily: 'Fredoka, sans-serif',
  },
  genTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genTypeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#DFE4EA',
  },
  genTypeCardActive: {
    borderColor: '#2E86DE',
    backgroundColor: '#F0F5FF',
  },
  genTypeIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  genTypeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#57606F',
    fontFamily: 'Fredoka, sans-serif',
  },
  genTypeTextActive: {
    color: '#2E86DE',
  },
  mathConfigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  numPicker: {
    alignItems: 'center',
  },
  numPickerLabel: {
    fontSize: 13,
    color: '#747D8C',
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  pickerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerBtnActive: {
    backgroundColor: '#2ED573',
  },
  pickerBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F3542',
  },
  pickerBtnTextActive: {
    color: '#FFFFFF',
  },
  mathOpSymbol: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2F3542',
  },
  genActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  launchGenBtn: {
    flex: 2,
    backgroundColor: '#2ED573',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#26af5f',
  },
  launchGenBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Fredoka, sans-serif',
  },
  launchSurpriseBtn: {
    flex: 1,
    backgroundColor: '#FFA502',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#CC8400',
  },
  launchSurpriseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Fredoka, sans-serif',
  },

  // COMMON ACTIVITY STYLES
  activityScreen: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  activityHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2F3542',
    fontFamily: 'Fredoka, sans-serif',
  },
  activityHint: {
    fontSize: 16,
    color: '#57606F',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 600,
    fontFamily: 'Fredoka, sans-serif',
  },

  // TEN-FRAME STYLES
  tenFrameWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#CED6E0',
    borderBottomWidth: 8,
    boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
  },
  tenFrameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 520,
    gap: 10,
    justifyContent: 'center',
  },
  tenFrameSlot: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#DFE4EA',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tenFrameSlotHighlight: {
    borderColor: '#2ED573',
    backgroundColor: '#EBF7EE',
  },
  tenFrameSlotFilled: {
    borderStyle: 'solid',
    borderColor: '#FFA502',
    backgroundColor: '#FFFDF0',
  },
  slotNumber: {
    position: 'absolute',
    top: 4,
    left: 8,
    fontSize: 12,
    color: '#A4B0BE',
    fontWeight: '700',
  },
  plusGuide: {
    fontSize: 28,
  },
  carrotImg: {
    width: 64,
    height: 64,
  },
  mathEquationBox: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#DFE4EA',
    borderBottomWidth: 6,
  },
  equationText: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Fredoka, sans-serif',
  },
  winBanner: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFA502',
  },
  winBannerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D35400',
    fontFamily: 'Fredoka, sans-serif',
  },
  replayBtn: {
    marginTop: 10,
    backgroundColor: '#FFA502',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#CC8400',
  },
  replayBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Fredoka, sans-serif',
  },

  // OLLO PHONICS STYLES
  olloStage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 220,
  },
  olloBigImg: {
    width: 220,
    height: 220,
  },
  mouthYumBubble: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFA502',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mouthYumText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  stomachTray: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  stomachLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#747D8C',
    marginBottom: 8,
  },
  stomachSlots: {
    flexDirection: 'row',
    gap: 12,
  },
  stomachSlot: {
    width: 64,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DFE4EA',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  stomachSlotFilled: {
    borderStyle: 'solid',
    borderColor: '#2ED573',
    backgroundColor: '#EBF7EE',
  },
  stomachSlotText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2ED573',
  },
  lettersRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  letterCookie: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    borderBottomWidth: 5,
    borderBottomColor: '#CED6E0',
  },
  letterCookieFed: {
    backgroundColor: '#F1F2F6',
    borderBottomColor: '#DFE4EA',
  },
  letterCookieText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#2F3542',
    fontFamily: 'Fredoka, sans-serif',
  },

  // LOGIC PATTERNS STYLES
  patternSequenceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    gap: 14,
    marginBottom: 20,
  },
  patternItem: {
    width: 74,
    height: 74,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#DFE4EA',
  },
  patternItemTarget: {
    borderColor: '#6C5CE7',
    borderStyle: 'dashed',
    backgroundColor: '#F0EFFE',
  },
  patternItemText: {
    fontSize: 36,
  },
  patternTargetText: {
    fontSize: 32,
    color: '#6C5CE7',
  },
  patternPromptSub: {
    fontSize: 16,
    fontWeight: '700',
    color: '#747D8C',
    marginBottom: 12,
  },
  patternOptionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  patternOptBtn: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    borderBottomWidth: 5,
    borderBottomColor: '#CED6E0',
  },
  patternOptEmoji: {
    fontSize: 40,
  },

  // MEMORY MATCH STYLES
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 520,
    gap: 14,
    justifyContent: 'center',
  },
  memoryCard: {
    width: 110,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    borderBottomWidth: 5,
    borderBottomColor: '#CED6E0',
  },
  memoryCardFlipped: {
    borderBottomColor: '#2ED573',
    backgroundColor: '#F7FFF9',
  },
  cardFront: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryImg: {
    width: 60,
    height: 60,
  },
  memoryCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F3542',
    marginTop: 4,
  },
  cardBack: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#2E86DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackStar: {
    fontSize: 32,
  },

  // ATELIER PICTURĂ STYLES
  canvasContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  kodiArtistWrap: {
    position: 'absolute',
    top: -20,
    right: -40,
    width: 80,
    height: 80,
  },
  kodiArtistImg: {
    width: '100%',
    height: '100%',
  },
  crayonBox: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  crayonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  crayonBtn: {
    width: 36,
    height: 48,
    borderRadius: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  crayonBtnActive: {
    transform: [{ translateY: -6 }],
    borderColor: '#2F3542',
  },
  canvasActions: {
    flexDirection: 'row',
    gap: 12,
  },
  canvasActionBtn: {
    backgroundColor: '#F1F2F6',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#CED6E0',
  },
  canvasActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F3542',
  },

  // CĂSUȚA CU JUCĂRII STYLES
  roomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    padding: 20,
  },
  toysShowcase: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 520,
    gap: 16,
    justifyContent: 'center',
  },
  toyCard: {
    width: 150,
    height: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    borderBottomWidth: 4,
    borderBottomColor: '#CED6E0',
  },
  toyEmoji: {
    fontSize: 40,
  },
  toyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F3542',
    marginTop: 6,
    fontFamily: 'Fredoka, sans-serif',
  },
});
