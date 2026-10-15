import zipfile, os

apk = 'C:/Users/Stoian/.gemini/antigravity/scratch/apk-analysis/khankids.apk'
dest = r'C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\assets\images'

with zipfile.ZipFile(apk, 'r') as z:
    for num in range(1, 11):
        target = f'assets/usgk$commonassets$collection$numbermonster$numbermonster{num}@2x.png'
        if target in z.namelist():
            dst = os.path.join(dest, f'sheet_num_{num}.png')
            with z.open(target) as s, open(dst, 'wb') as d:
                d.write(s.read())
            print(f'Extracted sheet_num_{num}.png')
        else:
            print(f'Not found: {target}')

    # Also extract shape sheets
    for shape in ['circle', 'triangle', 'square', 'rectangle', 'star', 'oval', 'diamond', 'heart']:
        target = f'assets/usgk$commonassets$collection$shape${shape}@2x.png'
        if target in z.namelist():
            dst = os.path.join(dest, f'sheet_shape_{shape}.png')
            with z.open(target) as s, open(dst, 'wb') as d:
                d.write(s.read())
            print(f'Extracted sheet_shape_{shape}.png')
