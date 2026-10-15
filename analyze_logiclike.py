import zipfile, re

with zipfile.ZipFile(r'..\logiclike-analysis\logiclike_base.apk', 'r') as z:
    bundle = z.read('assets/index.android.bundle').decode('utf-8', errors='ignore')
    print('LogicLike bundle length:', len(bundle))

    # Look for puzzle names, types, or categories
    patterns = [
        r'category[":\s]+([a-zA-Z0-9_\-]+)',
        r'puzzleType[":\s]+([a-zA-Z0-9_\-]+)',
        r'courseId[":\s]+([a-zA-Z0-9_\-]+)',
        r'gameType[":\s]+([a-zA-Z0-9_\-]+)',
    ]
    for p in patterns:
        m = set(re.findall(p, bundle, re.I))
        if m:
            print(f'Matches for {p}:', len(m), list(m)[:15])

# Also check khan standard
with zipfile.ZipFile(r'..\khan-standard-analysis\khan_standard_base.apk', 'r') as z:
    bundle = z.read('assets/index.bundle').decode('utf-8', errors='ignore')
    print('Khan standard bundle length:', len(bundle))
    m = set(re.findall(r'exercise[A-Z][a-zA-Z0-9]+', bundle))
    print('Khan exercise keywords:', len(m), list(m)[:15])
