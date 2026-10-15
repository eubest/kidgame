import asyncio
import edge_tts
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

VOICE = "ro-RO-AlinaNeural"  # Voce caldă feminină de educatoare română
AUDIO_DIR = r"C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\assets\audio"

PROMPTS = {
    # Task 1: Găsește intrusul (Odd one out)
    "ws_odd_intro": "Privește cu atenție fișa! Trei dintre ele sunt fructe dulci, dar unul este un vehicul. Atinge intrusul care nu se mănâncă!",
    "ws_odd_win": "Bravo! Mașina nu este un fruct, este un vehicul! Ai o privire de detectiv!",
    "ws_odd_hint": "Mărul, banana și căpșuna se mănâncă. Cine nu se mănâncă?",

    # Task 2: Numără și potrivește (Count & Match)
    "ws_count_intro": "Câte ciupercuțe vesele vezi în pădure? Numără-le cu degetul și alege cifra corectă!",
    "ws_count_win": "Excelent! Sunt exact trei ciupercuțe! Știi să numeri grozav!",
    "ws_count_hint": "Una, două, trei! Alege cifra trei!",

    # Task 3: Pune în ordine de la mic la mare (Size Ordering)
    "ws_size_intro": "Ursuleții vor să stea la rând! Atinge ursulețul cel mai mic, apoi pe cel mijlociu, și la final pe cel uriaș!",
    "ws_size_win": "Ce frumos i-ai așezat! De la cel mai micuț până la cel mai mare urs!",

    # Task 4: Umbre și Forme (Shadow Matching)
    "ws_shadow_intro": "Cineva și-a pierdut umbra! Privește fluturele colorat și găsește umbra lui fermecată!",
    "ws_shadow_win": "Ai găsit umbra perfectă a fluturașului! Felicitări!",

    # Feedback general
    "ws_try_again": "Nu-i nimic, privește din nou cu atenție!",
    "ws_super": "Super tare! Ești gata pentru următoarea fișă!",
}

async def generate():
    for name, text in PROMPTS.items():
        out_path = os.path.join(AUDIO_DIR, f"{name}.mp3")
        print(f"Generating Worksheet Voice: {name}")
        communicate = edge_tts.Communicate(text, VOICE, rate="+3%", pitch="+10Hz")
        await communicate.save(out_path)
    print("ALL_WORKSHEET_VOICES_GENERATED")

if __name__ == "__main__":
    asyncio.run(generate())
