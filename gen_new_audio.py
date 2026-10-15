import asyncio
import edge_tts

VOICE = "ro-RO-AlinaNeural"

PROMPTS = {
    "assets/audio/base_ten_intro.mp3": "Trage cuburile galbene unul peste altul pentru a forma o bară de zece! Zece cuburi formează o bară completă!",
    "assets/audio/base_ten_win.mp3": "Extraordinar! Ai format o bară completă de zece! Zece unități fac o zece!",
    "assets/audio/bubble_intro.mp3": "Sparge bulele de săpun care conțin litera sau sunetul potrivit! Atinge bula pentru a o sparge cu un pocnet!",
    "assets/audio/bubble_win.mp3": "Uraaa! Ai spart toate bulele corecte! Ce baie minunată de clăbuci!",
    "assets/audio/bath_intro.mp3": "Bine ai venit în cădița cu clăbuci a lui Ollo! Atinge apa să faci valuri, joacă-te cu rățușca și sparge baloanele!",
    "assets/audio/tickle_giggle_ro.mp3": "Hihihi! Mă gâdili! Ce gâdilicios ești!",
    "assets/audio/kodi_welcome_ro.mp3": "Bun venit în Orășelul Copilăriei! Sunt Kodi! Hai să ne jucăm, să învățăm și să descoperim lumea împreună!",
    "assets/audio/hotspot_peck.mp3": "Cip-cirip! Sunt Peck, micuța pasăre curioasă!",
    "assets/audio/hotspot_koala.mp3": "Hei, sunt micul koala! Îmi place mult la soare!",
    "assets/audio/hotspot_tree.mp3": "Fâș-fâș! Frunzele copacului dansează în vânt!",
}

async def generate():
    for path, text in PROMPTS.items():
        print(f"Generating {path}...")
        communicate = edge_tts.Communicate(text, VOICE, rate="+5%", pitch="+2Hz")
        await communicate.save(path)
        print(f"Done {path}")

if __name__ == "__main__":
    asyncio.run(generate())
