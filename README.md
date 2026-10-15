# KidGame - Romanian Kindergarten Learning Suite 🚀🎮
*(Inspired by Khan Academy Kids & LogicLike)*

O suită completă de învățare interactivă pentru preșcolari (3–7 ani) în limba română, concepută după standardele pedagogice Khan Academy Kids și LogicLike, integrând mascote vii (Kodi, Ollo, Reya, Peck), ghidaj vocal neural în română, fizică vectorială și gesturi 60fps.

---

## 🌟 Experiența Pedagogică & Cele 15 Jocuri

### 1. 🐸 Broscuța Săltăreață (*LogicLike Stepping Stones*)
- Navigare secvențială peste nuferi pe râu către trofeul de aur.
- Fizică parabolică de salt cu stropi de apă și numărătoare vocală în română.

### 2. 🎨 Trasează dintr-o Mișcare (*LogicLike Eulerian Graph Puzzles*)
- Trasează continuu pe tablă figuri geometrice (Căsuța, Plicul, Steaua) fără a ridica degetul de pe ecran.
- Detectare de graf eulerian cu noduri și muchii, cretă colorată și sunet tactil.

### 3. ⚖️ Cântarul Echilibrat (*LogicLike Balance Scale*)
- Balanță fizică cu pârghie și greutăți/fructe. Deduce care grup de fructe este mai greu sau echilibrează cele două talere.

### 4. 🔵 Numără și Alege (*LogicLike Count & Select*)
- Mingiuțe 3D cu fizică de frecare și luciu sferic.
- Atingerea fiecărei mingi o sparge într-o explozie de artificii și dezvăluie un animăluț simpatic (veveriță, panda, pisicuță, koala).
- Numărătoare progresivă ro-RO („Unu!”, „Doi!”, „Trei!”) și alegerea cifrei corecte.

### 5. 🍎 Mâncăciosul de Numere (*LogicLike Find The Number*)
- Fructe și ghinde căzătoare din livadă; Ollo are un balon de gândire cu cifra căutată.
- Culege fructele cu cifra țintă pentru a declanșa animația de ronțăit fericit a lui Ollo!

### 6. 🎣 Pescuitul Sunetelor (*Khan Kids Magnetic Fishing*)
- Undiță magnetică în iazul cu peștișori fonetici. Copilul prinde peștii cu literele corecte pentru a forma cuvinte.

### 7. 🍪 Hrănește-l pe Ollo (*Khan Kids Drag-and-Drop Feeding*)
- Copilul trage biscuiți cu litere direct în gurița lui Ollo, cu fizică de respingere și reacții vocale.

### 8. 🔤 Trasare Vectorială (*Khan Kids Path Tracing*)
- Trasare asistată de litere și cifre cu puncte de control, săgeți animate de ghidaj și steluțe luminoase.

### 9. 🔟 Bastonul celor 10 Cuburi (*Khan Kids Base-Ten Rods*)
- Unirea cuburilor individuale de unitate într-o bară de zece (Base-Ten Rod) pentru consolidarea simțului numărului.

### 10. 🫧 Acvariul cu Bule Fonetice
- Bule de săpun plutitoare cu litere românești care pocnesc la atingere.

### 11. 🛁 Cădița cu Bule a lui Ollo
- Cameră de joacă interactivă cu spumă, rățuște plutitoare și chicoteli la gâdilat.

### 12. 🎬 Desene Animate: Bun Venit la Grădiniță
- Scurtmetraj animat introductiv cu melodia oficială de pian Khan Kids și prezentarea tuturor personajelor.

### 13. 📖 Cărți & Povești Audio-Sincronizate
- Citire interactivă cu evidențierea cuvânt cu cuvânt sincronizată cu vocea învățătoarei.

### 14. 🧩 Modele Logice & Ritm
- Recunoaștere de șabloane și continuarea șirurilor logice de fructe și forme.

### 15. 🧠 Cartonașele Magice de Memorie
- Găsirea perechilor de animăluțe gemene cu animații 3D de flip.

---

## 🛠️ Stack Tehnologic

- **React Native 0.86 / Expo SDK 57**: Rulează fluid pe Web, tablete și telefoane Android/iOS.
- **React Native SVG**: Grafică vectorială scalabilă fără pixelare pe ecrane Retina/AMOLED.
- **Audio Mixer Multi-Canal**: Redare concomitentă a fundalului de pian și a prompturilor vocale românești (Microsoft Azure Neural `ro-RO-AlinaNeural`).
- **EAS (Expo Application Services) & Expo Go**: Suport complet pentru dezvoltare live pe dispozitiv fizic și actualizări OTA instant.
- **GitHub Actions**: Pipeline CI/CD integrat pentru livrarea automată a actualizărilor în Expo Go la fiecare push pe `main`.

---

## 🚀 Rulare Locală

```bash
# Instalare dependințe
npm install

# Pornire server Expo
npx expo start

# Rulare direct pe dispozitivul Android conectat prin USB
adb reverse tcp:8081 tcp:8081
# Deschide aplicația Expo Go și accesează exp://127.0.0.1:8081
```

---

## 📲 Conectare GitHub & Expo Go

- **Proiect Expo**: `@eubest/kidgame` (Project ID: `0dd5d117-e9a6-48aa-89f3-1a7ef88e6f47`)
- **Repository GitHub**: `https://github.com/eubest/kidgame`
- La fiecare `git push origin main`, workflow-ul din `.github/workflows/eas-update.yml` publică automat actualizarea direct către dispozitivele care rulează aplicația în Expo Go.
