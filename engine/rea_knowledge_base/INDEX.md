# REA Knowledge Base (Reverse Engineering Anything) Master Index

This repository serves as the persistent, rapidly-accessible knowledge base of reverse-engineered mechanics, schemas, asset coordinates, and pedagogical algorithms extracted from:
1. **LogicLike** (`com.logicappkids` / Web.bundle)
2. **Khan Academy Kids** (`org.khankids.android` / DuckDuckMoose)
3. **Khan Academy Standard** (`org.khanacademy.android` / Perseus)

---

## 📂 Directory Layout

```
engine/rea_knowledge_base/
├── INDEX.md                         # Master index (this file)
├── LOGICLIKE_CATALOG.md             # LogicLike mechanics, physics, and state machines
├── KHAN_KIDS_CATALOG.md             # Khan Kids tracing, .tmk sync, rooms, and curriculum
├── KHAN_STANDARD_CATALOG.md         # Khan Standard hints, Perseus schema, and scratchpad
└── extracted_sources/               # Raw extracted decompiled source files
    ├── logiclike/                   # 654 files: count-and-select, count-in-order, one-line, find-the-number, trace-ui, draw-ui
    │   ├── count-and-select/
    │   ├── count-in-order/
    │   ├── find-the-number/
    │   ├── one-line/
    │   ├── trace-ui/
    │   └── draw-ui/
    ├── khankids/                    # 641 files: .tmk timestamp files, tracing plists, character rooms, rewards
    │   ├── tracing_summary.json
    │   └── ...
    └── khan_standard/               # Khan Standard Perseus menus and configs
```

---

## 🎮 Reconstructed React Native Game Engine Implementations

| REA Source Mechanic | Decompiled Origin | React Native Component | Status | Key Features |
|---|---|---|---|---|
| **Count & Select** | LogicLike `count-and-select/` | `CountAndSelectGame.js` | ✅ Production | Spherical bouncing physics, count target card selection, Romanian neural voice counting ("Unu!", "Doi!"), particle confetti, compact-height responsive scaling. |
| **Find the Number** | LogicLike `find-the-number/` | `FindTheNumberFallGame.js` | ✅ Production | Fruit gravity fall ($v_y += g$), Ollo mascot thought bubble, mouth eat animation, score tracker, responsive landscape/portrait layout. |
| **Count in Order** | LogicLike `count-in-order/` | `SteppingStonesPathGame.js` | ✅ Production | Stepping stones on lagoon pond, parabolic leap ($v_y += g$), connecting dashed lines (`DashLine`), 5s idle helper finger, golden trophy reward. |
| **One-Line Eulerian Path** | LogicLike `one-line/` | `OneLinePuzzleGame.js` | ✅ Production | Graph vertices/edges, single-stroke Euler traversal, dynamic aspect-ratio chalkboard scaling, node glow and trail. |
| **Balance Scale** | LogicLike deductive logic | `LogicBalanceScaleGame.js` | ✅ Production | Fulcrum torque comparison ($\tau = m \cdot d$), tilt animation, fruit weight deduction. |
| **DuckDuckMoose Path Tracing** | Khan Kids `TracingActivity` | `PathTracingGame.js` | ✅ Production | Waypoint tolerance radii ($R = 38\text{dp}$), directional guide arrows, live sparkle particle trail, completion check. |
| **Synchronized Storybook** | Khan Kids `.tmk` format | `InteractiveStorybookReader.js` | ✅ Production | Millisecond-accurate word highlighting spans, page flipping, Romanian narration. |
| **Interactive Character Rooms** | Khan Kids room plists | `MascotDecoratorRoom.js`, `OlloBathBubbleRoom.js` | ✅ Production | 5 mascots (Ollo, Sandy, Kodi, Peck, Reya), interactive bath bubbles, collectible hats/costumes. |
| **Pedagogical Scratchpad** | Khan Academy Standard | `ScratchpadOverlay.js`, `PedagogicalScratchpad.js` | ✅ Production | Full-screen transparent drawing canvas, color palette, eraser, zero-lag drawing overlay over any problem. |
| **Daily Quest & Rewards** | Khan Kids daily progression | `ExcursiaZileiQuest.js`, `GiftBoxUnboxer.js` | ✅ Production | 3-game adventure track, mystery gift unboxing with physics spring bounce and confetti. |

---

## ⚡ Rapid Access Cheatsheet

### 1. Parabolic Jump Formula (`CountInOrder.ts` / `SteppingStonesPathGame.js`)
```javascript
const xDiff = Math.abs(targetX - startX);
const yDiff = targetY - startY;
const speed = xDiff / 20;
const direction = targetX > startX ? 1 : -1;
const velocityX = direction * speed;
const velocityY = (yDiff - 1) / (xDiff / speed) - (gravity * (xDiff / speed - 1)) / 2;
```

### 2. Waypoint Distance Formula (`PathTracingGame.js`)
```javascript
const dist = Math.hypot(touchX - waypoint.x, touchY - waypoint.y);
if (dist <= TOLERANCE_RADIUS) {
  advanceToNextWaypoint();
}
```

### 3. Storybook `.tmk` Time Alignment (`InteractiveStorybookReader.js`)
```javascript
// .tmk files encode milliseconds since audio track start
const activeWordIndex = words.findIndex((w, i) => {
  const nextWord = words[i + 1];
  return currentTimeMs >= w.startMs && (!nextWord || currentTimeMs < nextWord.startMs);
});
```
