import asyncio
import edge_tts
import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

VOICE = "ro-RO-AlinaNeural"  # Voce caldă feminină românească
AUDIO_DIR = r"C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\assets\audio"

PROMPTS = {
    # Intro-uri
    "mar_intro": "Găsește mărul roșu și dulce!",
    "mar_win": "Minunat! Un măr crocant a apărut ca prin magie!",
    "urs_intro": "Unde se ascunde ursulețul Martinel?",
    "urs_win": "Bravo! Ursul cel pofticios mănâncă miere dulce!",
    "cal_intro": "Hai să aducem căluțul pe pajiște!",
    "cal_win": "I-ha-ha! Căluțul aleargă sprinten și vesel!",
    "soare_intro": "Să chemăm soarele cald pe cer!",
    "soare_win": "Super! Razele soarelui luminează întreaga lume!",
    "casa_intro": "Hai să construim o căsuță primitoare!",
    "casa_win": "Ce frumoasă este căsuța cu ferestre luminate!",
    "apa_intro": "Picătura de apă curată și răcoroasă!",
    "apa_win": "Clip-clop! Apa dă viață florilor și pădurii!",
    
    # Feedback
    "almost": "Aproape! Hai să încercăm din nou!",
    "cheer": "Excelent! Ai reușit!",

    # Fonetică litere
    "p_m": "Mmm",
    "p_a": "A",
    "p_a_br": "Ă",
    "p_r": "Rrr",
    "p_u": "U",
    "p_s": "Sss",
    "p_c": "Câ",
    "p_l": "Lâ",
    "p_o": "O",
    "p_e": "E",
    "p_p": "Pâ",
}

async def generate():
    for name, text in PROMPTS.items():
        out_path = os.path.join(AUDIO_DIR, f"{name}.mp3")
        print(f"Generating AI speech for: {name}")
        communicate = edge_tts.Communicate(text, VOICE, rate="+5%", pitch="+15Hz")
        await communicate.save(out_path)
    print("ALL_VOICES_GENERATED_SUCCESSFULLY")

if __name__ == "__main__":
    asyncio.run(generate())
