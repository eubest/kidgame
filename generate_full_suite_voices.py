import asyncio
import edge_tts
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

VOICE = "ro-RO-AlinaNeural"
AUDIO_DIR = r"C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\assets\audio"

PROMPTS = {
    # Hub / Welcome
    "full_welcome": "Bine ai venit la Academia Micilor Campioni! Alege o insulă de învățare: Litere și Cuvinte, Matematică Distractivă, Forme și Culori, sau Atelierul de Desen și Pictură!",
    "nav_hub": "Ne întoarcem în orășelul jocurilor!",
    
    # 1. Atelier de Desen și Colorat (Freehand Drawing & Coloring)
    "draw_intro": "Atelierul de Creație! Alege o culoare din creioanele magice de jos și desenează liber sau colorează fluturașul fermecat! Când ai terminat, apasă pe steluța de salvare!",
    "draw_win": "Ce capodoperă plină de culoare ai realizat! Ești un adevărat mic artist!",
    "draw_clear": "Planșă curată! Hai să desenăm o nouă poveste!",

    # 2. Additive Ten-Frame (Matematică cu Adunare: 3 + 2)
    "add_intro": "Laboratorul de Adunare! Iepurașul are 3 morcovi portocalii și primește încă 2 morcovi aurii. Numără toți morcovii din grilă și alege totalul corect!",
    "add_win": "Excelent! Trei plus doi fac cinci morcovi delicioși! Ai calculat perfect!",
    "add_wrong": "Numără toți morcovii din căsuțe unul câte unul: 1, 2, 3, 4, 5!",

    # 3. Memory Match (Joc de Memorie Vizuală & Concentrare)
    "memo_intro": "Jocul Memoriei! Întoarce cartonașele și găsește perechile de animăluțe gemene! Fii atent unde se ascunde fiecare animăluț!",
    "memo_pair": "Ai găsit o pereche!",
    "memo_win": "Uraa! Ai descoperit toate perechile de animăluțe! Ai o memorie vizuală fantastică!",

    # 4. Tracing Letter A (Trasare Literă după Ghidaj)
    "trace_intro": "Învață să scrii litera A! Urmărește cu degetul traseul punctat de sus până jos pentru a construi marele A ca în Albinuță!",
    "trace_win": "Splendid! Ai scris litera A mare de tipar! Ești gata de școală!",

    # 5. Sticker Clubhouse (Camera Interactive cu Sunete pe Obiecte)
    "room_intro": "Camera ta secretă de joacă! Aici sunt toate jucăriile și abțibildurile tale câștigate! Atinge-le pe rând pentru a le auzi sunetele magice!",
}

async def generate():
    for name, text in PROMPTS.items():
        out_path = os.path.join(AUDIO_DIR, f"{name}.mp3")
        print(f"Generating Full Suite Voice: {name}")
        communicate = edge_tts.Communicate(text, VOICE, rate="+3%", pitch="+10Hz")
        await communicate.save(out_path)
    print("ALL_FULL_SUITE_VOICES_READY")

if __name__ == "__main__":
    asyncio.run(generate())
