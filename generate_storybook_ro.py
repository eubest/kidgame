import asyncio, edge_tts, os, json, re

book_pages = [
    {
        'id': 'p1',
        'title': 'Coperta',
        'text': 'Ce Surpriză! O poveste cu prietenii din căsuță.',
        'audioFile': 'p1_ro.mp3'
    },
    {
        'id': 'p2',
        'title': 'Pagina 2',
        'text': 'Peck a zburat în căsuța copiilor să ia o gustare de după-amiază. A fost tare surprins să vadă pe cineva nou acolo!',
        'audioFile': 'p2_ro.mp3'
    },
    {
        'id': 'p3',
        'title': 'Pagina 3',
        'text': 'Lui Peck îi plăcea mult să se joace cu prieteni noi. Bună! a strigat el vesel. Vrei să construim cu cuburile colorate?',
        'audioFile': 'p3_ro.mp3'
    },
    {
        'id': 'p4',
        'title': 'Pagina 4',
        'text': 'Noul prieten nu a răspuns, dar a fost în regulă. Peck avea și alte idei minunate, cum ar fi jocul de memorie.',
        'audioFile': 'p4_ro.mp3'
    },
    {
        'id': 'p5',
        'title': 'Pagina 5',
        'text': 'Hmm... noul prieten se pricepea la potrivit, dar era foarte tăcut. Oare nu voia să fie prieteni până la urmă?',
        'audioFile': 'p5_ro.mp3'
    },
    {
        'id': 'p6',
        'title': 'Pagina 6',
        'text': 'Surpriză! a râs Sandy fericită. Sunt eu! Peck a fost uimit și bucuros. Nimic nu e mai frumos ca prietenii vechi!',
        'audioFile': 'p6_ro.mp3'
    }
]

out_dir = r'C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\assets\books\whatasurprise'
os.makedirs(out_dir, exist_ok=True)

async def main():
    metadata = []
    for page in book_pages:
        pid = page['id']
        txt = page['text']
        mp3_name = page['audioFile']
        mp3_path = os.path.join(out_dir, mp3_name)
        comm = edge_tts.Communicate(txt, 'ro-RO-AlinaNeural', rate='-5%')
        await comm.save(mp3_path)
        
        words = re.findall(r'\S+', txt)
        file_size = os.path.getsize(mp3_path)
        duration_est = file_size / 6000.0  # Approx MP3 duration in seconds
        total_chars = sum(len(w) for w in words)
        
        cur_time = 0.12
        tm_list = []
        for w in words:
            tm_list.append(round(cur_time, 2))
            w_dur = max(0.25, (len(w) / total_chars) * (duration_est - 0.4))
            cur_time += w_dur
            
        tm_path = os.path.join(out_dir, f'{pid}_ro.tm')
        with open(tm_path, 'w', encoding='utf-8') as f:
            f.write(','.join(str(t) for t in tm_list))
            
        metadata.append({
            'id': pid,
            'title': page['title'],
            'text': txt,
            'words': words,
            'tm': tm_list,
            'audioFile': mp3_name,
            'image': f'{pid}-ipad@2x.png'
        })
        print(f'Generated {pid}: {len(words)} words, saved {mp3_path}')
        
    with open(os.path.join(out_dir, 'story_data.json'), 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print('Successfully generated Romanian storybook with audio & .tm timestamps!')

if __name__ == '__main__':
    asyncio.run(main())
