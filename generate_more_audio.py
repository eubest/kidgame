import asyncio, os, edge_tts

audio_dir = r'C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\assets\audio'
voice = 'ro-RO-AlinaNeural'

phrases = {
    'generator_intro.mp3': 'Bine ai venit la Generatorul de Fișe! Alege ce vrei să înveți și creează o fișă nouă!',
    'pattern_prompt.mp3': 'Observă cu atenție modelul! Ce urmează în șir?',
    'sub_intro.mp3': 'Scădere vizuală! Atinge morcovii pentru a-i culege din căsuțe!',
    'pattern_win.mp3': 'Minunat! Ai completat modelul logic corect!'
}

async def generate():
    for filename, text in phrases.items():
        path = os.path.join(audio_dir, filename)
        if not os.path.exists(path):
            communicate = edge_tts.Communicate(text, voice, rate='+3%', pitch='+12Hz')
            await communicate.save(path)
            print(f'Generated: {filename}')
        else:
            print(f'Already exists: {filename}')

asyncio.run(generate())
