import asyncio
import edge_tts
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

VOICE = "ro-RO-AlinaNeural"
AUDIO_DIR = r"C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\assets\audio"

PROMPTS = {
    # Mascot / Learning Path Intro
    "kak_welcome": "Bine ai venit la Grădinița Fermecată! Eu sunt Martinel, ghidul tău prietenos. Hai să rezolvăm fișele magice pe traseul învățării!",
    
    # 1. Ten-Frame Counting (Numărătoare pe Grilă)
    "kak_tenframe_intro": "Grila de Zece! Pune exact patru morcovi în căsuțe pentru iepurașul pofticios! Atinge morcovii din coș!",
    "kak_tenframe_step": "Așa! Încă unul!",
    "kak_tenframe_win": "Minunat! Ai așezat exact patru morcovi în grilă! Iepurașul îți mulțumește!",
    
    # 2. Pattern Completion (Continuă Modelul / Șirul Logic)
    "kak_pattern_intro": "Descoperă modelul secret! Privește șirul: Măr, Banană, Măr, Banană. Ce fruct urmează la finalul șirului?",
    "kak_pattern_win": "Exact! Urmează un măr roșu! Ai descoperit ritmul modelului!",
    "kak_pattern_wrong": "Privește cu atenție ritmul: Măr, Banană, Măr, Banană! Ce vine acum?",
    
    # 3. Phonics Sound Hunt (Găsește Sunetul Inițial)
    "kak_phonics_intro": "Vânătoarea de sunete! Cu ce sunet începe cuvântul SOARE? Sss! Alege litera care cântă Sss!",
    "kak_phonics_win": "Bravo! Sss ca în Soare! Știi sunetele ca un adevărat școlar!",
    
    # 4. Clubhouse Sticker Reward (Recompensa de colecție)
    "kak_reward_win": "Felicitări! Ai finalizat traseul de învățare! Alege un abțibild magic pentru camera ta de joacă!",
}

async def generate():
    for name, text in PROMPTS.items():
        out_path = os.path.join(AUDIO_DIR, f"{name}.mp3")
        print(f"Generating KAK Voice: {name}")
        communicate = edge_tts.Communicate(text, VOICE, rate="+3%", pitch="+12Hz")
        await communicate.save(out_path)
    print("ALL_KAK_VOICES_GENERATED")

if __name__ == "__main__":
    asyncio.run(generate())
