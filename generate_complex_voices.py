import asyncio
import edge_tts
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

VOICE = "ro-RO-AlinaNeural"
AUDIO_DIR = r"C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\assets\audio"

PROMPTS = {
    # Match lines instruction
    "complex_match_intro": "Fișă de trasare! Trage o linie colorată cu degetul de la fiecare animăluț către mâncarea lui preferată! Iepurașul vrea morcov, maimuțica vrea banană, iar cățelul vrea os!",
    "complex_match_rabbit_carrot": "Bravo! Iepurașul rontzaie morcovul portocaliu!",
    "complex_match_monkey_banana": "Super! Maimuțica este tare fericită cu banana ei dulce!",
    "complex_match_dog_bone": "Minunat! Cățelul a primit osul delicios!",
    "complex_match_all_done": "Extraordinar! Ai unit toate animăluțele cu mâncarea lor! Ești un adevărat campion!",
    
    # Sorting baskets instruction
    "complex_sort_intro": "Laboratorul de sortare! Trage fiecare obiect cu degetul în coșul potrivit: alimentele merg în Coșul cu Mâncare, iar jucăriile merg în Cufărul cu Jucării!",
    "complex_sort_correct_food": "Foarte bine! Mâncarea merge la bucătărie!",
    "complex_sort_correct_toy": "Așa este! Jucăria merge în cufăr!",
    "complex_sort_wrong": "Hopaa! Acel obiect nu se potrivește acolo, pune-l în celălalt coș!",
    "complex_sort_all_done": "Uraaa! Ai făcut ordine desăvârșită în toată camera!",
}

async def generate():
    for name, text in PROMPTS.items():
        out_path = os.path.join(AUDIO_DIR, f"{name}.mp3")
        print(f"Generating complex audio: {name}")
        communicate = edge_tts.Communicate(text, VOICE, rate="+3%", pitch="+10Hz")
        await communicate.save(out_path)
    print("ALL_COMPLEX_VOICES_READY")

if __name__ == "__main__":
    asyncio.run(generate())
