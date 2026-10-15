import asyncio
import os
import sys
import edge_tts

sys.stdout.reconfigure(encoding='utf-8')

AUDIO_ITEMS = {
    # Stepping Stones (Broasca Saltareata - LogicLike count-in-order)
    "frog_intro.mp3": ("ro-RO-AlinaNeural", "Ajută broscuța să sară pe nuferi în ordinea numerelor!"),
    "frog_almost.mp3": ("ro-RO-AlinaNeural", "Uită-te atent la următorul număr, micuțule explorator!"),
    "frog_win.mp3": ("ro-RO-AlinaNeural", "Minunat! Broscuța a ajuns cu bine la mal! Ai câștigat trei stele!"),
    "frog_oac1.mp3": ("ro-RO-AlinaNeural", "Oac! Foarte bine!"),
    "frog_oac2.mp3": ("ro-RO-AlinaNeural", "Oac, oac! Excelent!"),
    "num_1.mp3": ("ro-RO-AlinaNeural", "Unu!"),
    "num_2.mp3": ("ro-RO-AlinaNeural", "Doi!"),
    "num_3.mp3": ("ro-RO-AlinaNeural", "Trei!"),
    "num_4.mp3": ("ro-RO-AlinaNeural", "Patru!"),
    "num_5.mp3": ("ro-RO-AlinaNeural", "Cinci!"),
    "num_6.mp3": ("ro-RO-AlinaNeural", "Șase!"),
    "num_7.mp3": ("ro-RO-AlinaNeural", "Șapte!"),
    "num_8.mp3": ("ro-RO-AlinaNeural", "Opt!"),
    "num_9.mp3": ("ro-RO-AlinaNeural", "Nouă!"),
    "num_10.mp3": ("ro-RO-AlinaNeural", "Zece!"),

    # Clubhouse Wardrobe (Khan Kids Salon & Dress-up)
    "wardrobe_intro.mp3": ("ro-RO-AlinaNeural", "Bine ai venit în Salonul Poveștilor! Alege un prieten și probează cele mai haioase accesorii!"),
    "wardrobe_kodi.mp3": ("ro-RO-EmilNeural", "Salut! Sunt ursulețul Kodi! Ce pălărie îmi pui astăzi?"),
    "wardrobe_ollo.mp3": ("ro-RO-AlinaNeural", "Eu sunt Ollo elefănțelul! Îmi plac coronițele strălucitoare și ochelarii de soare!"),
    "wardrobe_peck.mp3": ("ro-RO-AlinaNeural", "Cirip! Sunt păsărica Peck! Vreau o fundiță elegantă!"),
    "wardrobe_cheer1.mp3": ("ro-RO-AlinaNeural", "Haha! Ce costum caraghios și frumos! Îmi place mult!"),
    "wardrobe_cheer2.mp3": ("ro-RO-EmilNeural", "Uau! Arăt ca un adevărat explorator curajos!"),
    "wardrobe_giggle.mp3": ("ro-RO-AlinaNeural", "Hihihi! Mă gâdili! Haha!"),
    "wardrobe_win.mp3": ("ro-RO-AlinaNeural", "Arăți fantastic! Ai creat un personaj minunat!"),

    # One Line Path Tracing (LogicLike one-line Eulerian path)
    "oneline_intro.mp3": ("ro-RO-AlinaNeural", "Unește toate stelele dintr-o singură mișcare, fără să ridici degetul de pe ecran!"),
    "oneline_hint.mp3": ("ro-RO-AlinaNeural", "Atenție, nu poți trece de două ori peste aceeași linie! Încearcă altă stea!"),
    "oneline_win.mp3": ("ro-RO-AlinaNeural", "Sclipitor! Ai luminat întreaga constelație! Ești un adevărat geniu!"),
}

async def generate_all():
    target_dir = os.path.abspath("assets/audio")
    os.makedirs(target_dir, exist_ok=True)
    
    for filename, (voice, text) in AUDIO_ITEMS.items():
        filepath = os.path.join(target_dir, filename)
        if not os.path.exists(filepath):
            print(f"Generating {filename} ({voice}): {text}")
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(filepath)
        else:
            print(f"Already exists: {filename}")

if __name__ == "__main__":
    asyncio.run(generate_all())
