import asyncio
import edge_tts

VOICE = "ro-RO-AlinaNeural"

PROMPTS = {
    "assets/audio/fishing_intro.mp3": "Hai la pescuit cu prietenii! Ghidează undița și prinde peștișorii cu literele potrivite!",
    "assets/audio/fishing_win.mp3": "Victorie! Găletușa este plină cu peștișori aurii! Ești un pescar desăvârșit!",
    "assets/audio/fishing_catch_m.mp3": "Prinde peștișorul cu litera M!",
    "assets/audio/fishing_catch_b.mp3": "Prinde peștișorul cu litera B!",
    "assets/audio/fishing_catch_r.mp3": "Prinde peștișorul cu litera R!",
    "assets/audio/fishing_catch_a.mp3": "Prinde peștișorul cu litera A!",
    "assets/audio/balance_intro.mp3": "Așază greutățile pe cântar ca să echilibrezi cele două talere!",
    "assets/audio/balance_win.mp3": "Extraordinar! Balanța este perfect echilibrată!",
    "assets/audio/balance_almost.mp3": "Mai adaugă o mică greutate pe taler pentru echilibru!",
}

async def generate():
    for path, text in PROMPTS.items():
        print(f"Generating {path}...")
        communicate = edge_tts.Communicate(text, VOICE, rate="+4%", pitch="+2Hz")
        await communicate.save(path)
        print(f"Done {path}")

if __name__ == "__main__":
    asyncio.run(generate())
