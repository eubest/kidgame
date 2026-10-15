import asyncio
import edge_tts
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

VOICE = "ro-RO-AlinaNeural"
AUDIO_DIR = r"C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\assets\audio"

PROMPTS = {
    # 1. Hraneste personajul cu consoane (Feed Ollo the Consonants)
    "kk_feed_intro": "Hrănește elefănțelul Ollo! Trage cu degetul în gurița lui doar literele care sunt Consoane: B, M și R! Fii atent să nu-i dai vocale!",
    "kk_feed_win": "Mmm, delicios! Ollo a mâncat toate consoanele crocante! Are burtica plină!",
    "kk_feed_wrong": "Ups! Aceea este o vocală! Dă-i doar consoane: B, M sau R!",

    # 2. Forme Geometrice & Culori pentru Iepuraș (Drag Red Triangles to the Rabbit)
    "kk_shapes_intro": "Iepurașul colecționează comori! Trage în coșul iepurașului doar Triunghiurile Roșii! Nu pune cercuri sau pătrate!",
    "kk_shapes_win": "Excelent! Ai găsit toate triunghiurile roșii! Iepurașul sare de bucurie!",
    "kk_shapes_wrong": "Privește cu atenție: trebuie să aibă 3 colțuri și să fie Roșu!",

    # 3. Completează linia de numere (Complete the Line of Numbers)
    "kk_line_intro": "Completează linia numerelor! Privește șirul: 1, 2, căsuță liberă, 4, 5. Trage cifra care lipsește în căsuța goală!",
    "kk_line_win": "Bravo! 3 este cifra care lipsea! Acum linia este completă: 1, 2, 3, 4, 5!",
    "kk_line_wrong": "Numără pe degete: 1, 2... ce urmează înainte de 4?",

    # 4. Desenează pe contur (Can you draw a bus / letter tracing)
    "kk_draw_intro": "Laboratorul de Desen! Unește punctele luminoase pentru a desena autobuzul vesel de grădiniță! Pornește de la steluță!",
    "kk_draw_win": "Uraa! Ai desenat un autobuz minunat! Bip-bip, pornim la drum!",
}

async def generate():
    for name, text in PROMPTS.items():
        out_path = os.path.join(AUDIO_DIR, f"{name}.mp3")
        print(f"Generating Khan Kids Activity Voice: {name}")
        communicate = edge_tts.Communicate(text, VOICE, rate="+3%", pitch="+10Hz")
        await communicate.save(out_path)
    print("ALL_KHAN_KIDS_EXTRACTED_VOICES_READY")

if __name__ == "__main__":
    asyncio.run(generate())
