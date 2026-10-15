import urllib.request, re

req = urllib.request.Request('http://localhost:8081', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')
    scripts = re.findall(r'src="([^"]+)"', html)
    print('Found script bundles:', scripts)
    for s in scripts:
        url = 'http://localhost:8081' + s if s.startswith('/') else s
        print('Fetching bundle:', url)
        b_req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(b_req) as b_resp:
            content = b_resp.read()
            print(f'Bundle {s}: {len(content)} bytes bundled successfully!')
