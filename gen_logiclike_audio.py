import asyncio
import edge_tts

VOICE = "ro-RO-AlinaNeural"

PROMPTS = {
    "assets/audio/stepping_stones_intro.mp3": "Ajută broscuța să sară pe nuferi în ordinea numerelor, de la unu până la cinci! Atinge fiecare nufăr pe rând!",
    "assets/audio/stepping_stones_win.mp3": "Oac-oac! Minunat! Broscuța a traversat lacul și a ajuns la premiu! Ești un campion al numerelor!",
    "assets/audio/one_line_intro.mp3": "Unește toate punctele dintr-o singură mișcare continuă, fără să ridici degetul!",
    "assets/audio/one_line_win.mp3": "Extraordinar! Ai desenat întreaga formă magică dintr-o singură trăsătură continuă!",
}

async def generate():
    for path, text in PROMPTS.items():
        print(f"Generating {path}...")
        communicate = edge_tts.Communicate(text, VOICE, rate="+5%", pitch="+2Hz")
        await communicate.save(path)
        print(f"Done {path}")

if __name__ == "__main__":
    asyncio.run(generate())
