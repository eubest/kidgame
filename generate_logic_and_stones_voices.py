import asyncio
import edge_tts

VOICE = "ro-RO-AlinaNeural"

PROMPTS = {
    "assets/audio/frog_intro.mp3": "Oac-oac! Ajut-o pe Broscuța Oaki să sară pe nuferi în ordinea numerelor! Atinge cifrele una după alta!",
    "assets/audio/frog_step_correct.mp3": "Bravo! Țop pe nufăr!",
    "assets/audio/frog_almost.mp3": "Aproape! Privește cu atenție unde este cifra următoare!",
    "assets/audio/frog_win.mp3": "Extraordinar! Broscuța a traversat balta fermecată și a găsit Nufărul de Aur! Ce salturi minunate!",
    "assets/audio/oneline_intro.mp3": "Trasează tot desenul dintr-o singură mișcare! Fii atent: nu ridica degețelul de pe ecran și nu trece de două ori pe aceeași linie!",
    "assets/audio/oneline_win.mp3": "Minunat! Ai luminat întreaga constelație dintr-o singură suflare! Privește cum strălucește!",
    "assets/audio/scratchpad_hint.mp3": "Apasă pe creionul fermecat oricând vrei să desenezi sau să ții minte numerele pe ecran!",
}

async def generate():
    for path, text in PROMPTS.items():
        print(f"Generating {path}...")
        communicate = edge_tts.Communicate(text, VOICE, rate="+4%", pitch="+2Hz")
        await communicate.save(path)
        print(f"Done {path}")

if __name__ == "__main__":
    asyncio.run(generate())
