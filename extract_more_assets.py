import zipfile, os

with zipfile.ZipFile(r'..\apk-analysis\khankids.apk', 'r') as z:
    for n in z.namelist():
        if 'bubble_break' in n:
            with open('assets/audio/bubble_break.mp3', 'wb') as f:
                f.write(z.read(n))
            print('Extracted bubble_break.mp3')
        if '10BlocksMake1Rod' in n:
            with open('assets/audio/ten_blocks_make_one_rod.mp3', 'wb') as f:
                f.write(z.read(n))
            print('Extracted ten_blocks_make_one_rod.mp3')
        if 'Cool Beans' in n or 'coolbeans' in n.lower():
            if n.endswith('.mp3'):
                clean = os.path.basename(n).replace('$', '_')
                with open(os.path.join('assets/audio', clean), 'wb') as f:
                    f.write(z.read(n))
                print('Extracted story audio:', clean)
