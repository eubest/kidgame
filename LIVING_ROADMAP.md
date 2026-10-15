# 🗺️ Planul Viu de Dezvoltare & Viziune Pedagogică (LIVING ROADMAP)
### Magic Words RO — Suita Educațională de Aur pentru Preșcolari (Inspirată de Khan Academy Kids & LogicLike)

---

## 🌟 Viziunea Creativă & Misiunea Pedagogică
Transformarea aplicației **Magic Words RO** într-o capodoperă vie, fermecătoare și pedagogic impecabilă pentru copiii preșcolari din România (grupa mică, mijlocie și mare: 3–7 ani).
Inspirată din arhitectura ludică a **Khan Academy Kids**, rigoarea logică a **LogicLike** și claritatea instrucțională a **Khan Academy Standard**, suita combină animațiile calde de desen animat Disney cu feedback fonetic și matematic în limba română (voce caldă neurală de educator).

---

## 🧭 Harta Progresului (Stadiu & Etape)

```mermaid
flowchart TD
    subgraph Faza 1: Fundația Ecosistemului (FINALIZATĂ)
        A1[Hub Interactiv cu Mascote Vii: Kodi & Ollo] --> A2[Atelierul de Trasare Vectorială Litera/Cifră]
        A2 --> A3[Hrănirea lui Ollo: Drag & Drop Fonetic]
        A3 --> A4[Cărticica Interactivă: Cynthia Platt - Ce Surpriză!]
        A4 --> A5[Dulapul cu Recompense & Cutia cu Cadouri 3D]
    end

    subgraph Faza 2: Inovații din Reverse Engineering (FINALIZATĂ & VERIFICATĂ)
        B1[Broasca Săltăreață: SteppingStonesPathGame cu Fizică Arc & Splash]
        B2[Trasează dintr-o Mișcare: OneLinePuzzleGame Grafuri Euleriene]
        B3[Ciornă Pedagogică: PedagogicalScratchpad & ScratchpadOverlay]
    end

    subgraph Faza 3: Lumea Magică Extinsă (ÎN IMPLEMENTARE)
        C1[Pescuitul Fonetic: PhonicsFishingGame cu Undiță Magnetică]
        C2[Cântarul Echilibrat: LogicBalanceScaleGame Balanță Deductivă LogicLike]
        C3[Vremea Dinamică & Zi/Noapte în Căsuța din Copac]
    end

    Faza 1 --> Faza 2
    Faza 2 --> Faza 3
```

---

## 🐸 Caiet de Sarcini Detaliat: 1. 'Broasca Săltăreață' (SteppingStonesPathGame)
*Inspirat din mecanica `count-in-order` din LogicLike și designul organic Khan Kids.*

### 1.1 Obiective Pedagogice
- **Ordinalitate și Secvențialitate Numerică**: Înțelegerea profundă a ordinii numerelor naturale ($1 \to 5$, $1 \to 10$).
- **Numărare din 2 în 2 (Skip Counting)**: Familiarizarea timpurie cu noțiunea de paritate ($2, 4, 6, 8, 10$).
- **Numărătoare Inversă**: Consolidarea ordinii descendente ($5 \to 4 \to 3 \to 2 \to 1$).
- **Coordonare Vizual-Spațială**: Planificarea traseului pe ochiurile de apă fără salturi greșite.

### 1.2 Mecanică de Joc & Fizică
1. **Pânza Bălții cu Nuferi (Pond Canvas)**:
   - Apă cristalină animată cu unde radiale delicate.
   - Puncte de oprire: Pietre rotunjite de râu și frunze de nufăr plutitoare (`nuferi`), fiecare afișând o cifră mare, lizibilă (font Fredoka One).
2. **Fizica Saltului Parabolic (Parabolic Arc & Splash Physics)**:
   - La atingerea corectă a următorului nufăr, personajul **Broscuța Oaki** execută:
     - *Anticipație/Squash*: `scaleY: 0.7`, `scaleX: 1.25` timp de 120ms.
     - *Traiectorie Parabolică*: $x(t) = x_0 + (x_1 - x_0) \cdot t$, $y(t) = y_0 + (y_1 - y_0) \cdot t - 4H \cdot t(1-t)$ cu înălțimea arcului $H = 90\text{px}$.
     - *Stretch în zbor*: `scaleY: 1.25`, `scaleX: 0.8`.
     - *Aterizare & Impact Splash*: Compresie la aterizare, urmată de generarea a 3 cercuri concentrice de unde pe apă (`opacity: 1 \to 0`, `scale: 1 \to 2.4`) și stropi fini de picături.
3. **Fail-Soft Feedback (Toleranță și Încurajare)**:
   - Dacă copilul apasă pe un nufăr greșit (ex: apasă 4 când este la 2):
     - Nufărul greșit se clatină ușor stânga-dreapta (`rotate: -3deg \to +3deg \to 0deg`).
     - Broscuța face un ochi clipicios către nufărul corect, dar **nu este penalizată**!
     - Vocea învățătoarei Alina intervine cald: *"Aproape! După 2 urmează 3! Uită-te la nufărul cu cifra 3!"*.
     - Dacă trec 6 secunde fără atingere, nufărul corect pulsează cu o aură aurie călăuzitoare.

### 1.3 Niveluri de Dificultate
| Nivel | Titlu Românesc | Traseu | Numere / Secvență | Element Surpriză |
| :--- | :--- | :--- | :--- | :--- |
| **Nivel 1** | *Pui de Broscuță* | 5 nuferi liniari | $1, 2, 3, 4, 5$ | Rățușcă galbenă care plutește |
| **Nivel 2** | *Salturi în Zig-Zag* | 8 nuferi șerpuitori | $1, 2, 3, 4, 5, 6, 7, 8$ | Frunze plutitoare și libeluță |
| **Nivel 3** | *Saltul Iepurașului (Pas de 2)* | 5 nuferi cu distanțe | $2, 4, 6, 8, 10$ | Peștișor auriu care sare |
| **Nivel 4** | *Numărătoarea Inversă* | 5 nuferi spre mal | $5, 4, 3, 2, 1$ | Nufărul uriaș de aur care înflorește |

---

## ✏️ Caiet de Sarcini Detaliat: 2. 'Trasează dintr-o Mișcare' (OneLinePuzzleGame)
*Inspirat din mecanica `one-line` din LogicLike (grafuri euleriene pentru preșcolari).*

### 2.1 Obiective Pedagogice
- **Gândire Topologică și Logică Prealabilă**: Înțelegerea faptului că unele linii se pot trasa continuu doar pornind dintr-un punct anume (noduri de grad impar).
- **Controlul Motricității Fine**: Menținerea contactului pe ecran de-a lungul întregului desen fără desprinderea degetului.
- **Răbdare și Reziliență Cognitivă**: Reîncercarea unei căi diferite fără sentiment de eșec.

### 2.2 Arhitectură & Regulile Jocului
1. **Noduri și Muchii Magnetice**:
   - Fiecare nod este un cristal strălucitor sau o stea aurie pe cerul nopții.
   - Muchiile netrasate sunt linii punctate translucide.
   - Când degetul se apropie la sub 30px de un nod adiacent valid:
     - Sunet de snap cristalin (`SFX_pop` sau `sfxChime`).
     - Muchia devine un cordon continuu strălucitor (neon auriu / cyan) plin de particule de sclipici.
2. **Condiția Euleriană (O singură trecere per muchie)**:
   - Fiecare muchie poate fi parcursă **o singură dată**.
   - Muchiile deja parcurse sunt blocate vizual cu luminozitate solidă.
3. **Mecanismul de Dead-End Fără Frustrare**:
   - Dacă degetul ajunge într-un nod fără muchii libere rămase:
     - Linia pulsează blând în nuanță caldă de chihlimbar.
     - Un mic sunet de rebobinare jucăușă readuce linia la start.
     - Mesaj vocal încurajator: *"Un început minunat! Hai să încercăm din nou, pornind din alt colț!"*.

### 2.3 Colecția de Forme pentru Copii (Kindergarten Euler Graphs)
1. **Triunghiul Fermecat** (3 noduri, 3 muchii) — Nivel Tutorial.
2. **Căsuța cu Acoperiș** (5 noduri, 8 muchii) — Graful clasic cu 2 noduri de grad 3 la bază.
3. **Steaua Nopții** (5 noduri, 5 muchii) — Pentagramă continuă.
4. **Fundița Fluturașului** (5 noduri, 6 muchii) — Două bucle simetrice unite într-un nod central.
5. **Plicul cu Scrisori Magice** (4 noduri colț + 1 nod acoperiș).

---

## 🎨 Caiet de Sarcini Detaliat: 3. 'Căsuța de Schițe Istețe' (Interactive Scratchpad Overlay)
*Inspirat din modulul scratchpad din Khan Academy Standard.*

### 3.1 Utilitate Pedagogică
Permite copilului să folosească ecranul ca pe o foaie de ciornă magică peste orice joc activ:
- Poate tăia cu degetul merele numărate.
- Poate desena săgeți sau conexiuni între elemente.
- Poate grupa obiecte prin încercuire înainte de a răspunde.

### 3.2 Componente Vizuale & Unelte
- **Buton Plutitor**: Pictogramă prietenoasă cu creion colorat în colțul din dreapta-sus.
- **Strat de Desen**: Canvas transparent cu acoperire totală, cu transluciditate de 85% pentru a lăsa jocul vizibil dedesubt.
- **Paletă Preșcolară**:
  - 🖍️ Alb de Cretă (`#FFFFFF`)
  - ☀️ Galben Soare (`#FFD54F`)
  - 🌸 Roz Bombon (`#FF80AB`)
  - 🌿 Verde Pădure (`#00E676`)
- **Unelte Simple**:
  - Mod Desen (Creion gros, netezit cu curbe Bézier).
  - Radieră (șterge porțiuni).
  - Găletușa Curată (curăță toată ciorna cu un sunet de clopoței).
  - Ascundere / Închidere (revine la modul direct de joc).

---

## 🎙️ Pachetul de Voci Neurale Românești (Scenarii Audio `ro-RO-AlinaNeural`)

| Fișier Audio | Text Scenariu în Limba Română | Ritm / Ton |
| :--- | :--- | :--- |
| `frog_intro.mp3` | *"Oac-oac! Ajut-o pe Broscuța Oaki să sară pe nuferi în ordinea numerelor! Atinge cifrele una după alta!"* | Vioi, vesel, cald |
| `frog_step_correct.mp3`| *"Bravo! Țop pe nufăr!"* | Scurt, energic |
| `frog_almost.mp3` | *"Aproape! Privește cu atenție unde este cifra următoare!"* | Blând, răbdător |
| `frog_win.mp3` | *"Extraordinar! Broscuța a traversat balta fermecată și a găsit Nufărul de Aur! Ce salturi minunate!"* | Triumfător, sărbătoare |
| `oneline_intro.mp3`| *"Trasează tot desenul dintr-o singură mișcare! Fii atent: nu ridica degețelul de pe ecran și nu trece de două ori pe aceeași linie!"* | Curios, misterios |
| `oneline_win.mp3` | *"Minunat! Ai luminat întreaga constelație dintr-o singură suflare! Privește cum strălucește!"* | Magic, încântat |
| `scratchpad_hint.mp3`| *"Apasă pe creionul fermecat oricând vrei să desenezi sau să ții minte numerele pe ecran!"* | Îndrumător |

---

## 🏆 Faza 2: Rezultate & Verificare Tehnică (STATUS: 100% FINALIZATĂ)

- ✅ **`SteppingStonesPathGame.js`**:
  - Traiectorie de salt parabolic calculată în timp real ($x(t), y(t) - 4Ht(1-t)$).
  - Particule splash de apă concentrice la impact.
  - Validare secvențială $1 \to 5$ cu feedback vocal român (`ro-RO-AlinaNeural`).
  - *Dovadă vizuală*: `screen_stepping_stones.png` (45,358 bytes).
- ✅ **`OneLinePuzzleGame.js`**:
  - Traversare pe graf eulerian (Căsuța Fermecată, Triunghi, Stea) fără ridicarea degetului.
  - Snap magnetic la 30px distanță cu sunet cristalin de chime.
  - Blocare automată a muchiilor parcurse și protecție anti-frustrare.
  - *Dovadă vizuală*: `screen_oneline_puzzle.png` (39,274 bytes).
- ✅ **`PedagogicalScratchpad.js` & `ScratchpadOverlay.js`**:
  - Overlay de calcul transparent peste fișele de matematică (Ten-Frame).
  - Overlay universal accesibil direct din bara superioară (`✏️ Ciornă`).
  - Paletă de culori cretă/neon, dimensiuni de tuș, radieră și buton de ascundere tuș (*toggle eye*).
  - *Dovadă vizuală*: `screen_math_scratchpad.png` & `screen_universal_scratchpad.png`.
- ✅ **Metro / Hermes Build**: 0 erori, `2,744,390 bytes bundled successfully`.

---

## 🎣 Faza 3: Caiet de Sarcini 'Lumea Magică Extinsă' (STATUS: 3.1 & 3.2 FINALIZATE)

### 3.1 Pescuitul Fonetic cu Undiță Magnetică (`PhonicsFishingGame.js`) — ✅ FINALIZAT
- **Inspirație**: Modulul "Fishing with Peck" din Khan Academy Kids.
- **Obiectiv**: Identificarea auditivă a literelor mari/mici și a sunetelor inițiale ale cuvintelor.
- **Mecanică**:
  - Undiță cu pendul fizic oscilant (`rodAngle` + bobbing de apă animat).
  - Peștișori colorați înotând la adâncimi diferite cu badge-uri fonetice (`M, B, R, A, O, E`).
  - Coborârea cârligului magnetic la atingerea peștelui țintă.
  - Cârligul prinde peștele, îl ridică la suprafață și îl depune în găletușă (`splash_out.mp3` + `correct_chime.mp3`).
  - Voce încurajatoare `ro-RO-AlinaNeural` pentru fiecare literă.
  - *Dovadă vizuală*: `screen_phonics_fishing.png` (54,210 bytes).

### 3.2 Cântarul Echilibrat & Balanța Deductivă (`LogicBalanceScaleGame.js`) — ✅ FINALIZAT
- **Inspirație**: Modulul "Balance Scales" din LogicLike.
- **Obiectiv**: Înțelegerea timpurie a noțiunii de greutate, echivalență și deducție logică fără numere scrise.
- **Mecanică**:
  - Cântar clasic cu două talere, ac indicator central și braț oscilant în funcție de diferența de mase ($\Delta m$).
  - Sistem de talere interactive: copilul așază mere (1), banane (2), iepurași (2) pe talerul din dreapta.
  - Echilibru perfect când acul atinge centrul (se aprinde verde cu sunet triumfal `BingoSuccessfulLineFIll.mp3`).
  - *Dovadă vizuală*: `screen_balance_scale.png` (42,618 bytes).

### 3.3 Vremea Dinamică & Ciclul Zi-Noapte în Căsuța din Copac (ÎN DESFĂȘURARE)
- **Inspirație**: Lumea vie Khan Kids.
- **Mecanică**:
  - Schimbare dinamică a cerului în Hub (Zi însorită $\to$ Amurg auriu $\to$ Noapte cu licurici și constelații).
  - Efecte meteo tactile: atingerea norului produce o ploaie caldă cu curcubeu trecător.
- *Hub Faza 3 Integrat*: `screen_hub_faza3.png` (92,108 bytes).

