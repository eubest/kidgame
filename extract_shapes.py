import zipfile, os

apk = 'C:/Users/Stoian/.gemini/antigravity/scratch/apk-analysis/khankids.apk'
dest = r'C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\assets\images'

shapes = {
    'sheet_shape_cerc.png': 'assets/usgk$commonassets$collection$shape$shapecircle2@2x.png',
    'sheet_shape_patrat.png': 'assets/usgk$commonassets$collection$shape$shapesquare1@2x.png',
    'sheet_shape_triunghi.png': 'assets/usgk$commonassets$collection$shape$shapetriangle1@2x.png',
    'sheet_shape_dreptunghi.png': 'assets/usgk$commonassets$collection$shape$shaperectangle1@2x.png',
}

with zipfile.ZipFile(apk, 'r') as z:
    for out_name, target in shapes.items():
        if target in z.namelist():
            dst = os.path.join(dest, out_name)
            with z.open(target) as s, open(dst, 'wb') as d:
                d.write(s.read())
            print(f'Extracted: {out_name}')
