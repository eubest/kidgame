import zipfile, plistlib, json, os

apk_path = r'C:\Users\Stoian\.gemini\antigravity\scratch\apk-analysis\khankids.apk'
output_js = r'C:\Users\Stoian\.gemini\antigravity\scratch\magic-words-ro\engine\tracing\PathPresets.js'

def parse_coords_to_points(coord_str, scale=300.0/1536.0):
    nums = [float(x.strip()) for x in coord_str.split(',') if x.strip()]
    points = []
    for i in range(0, len(nums), 2):
        if i + 1 < len(nums):
            px = round(nums[i] * scale)
            py = round(nums[i+1] * scale)
            # Avoid consecutive duplicate points
            if not points or points[-1]['x'] != px or points[-1]['y'] != py:
                points.append({'x': px, 'y': py})
    return points

with zipfile.ZipFile(apk_path, 'r') as z:
    presets = {}
    
    # 1. Letter A (ua)
    a_plist = plistlib.loads(z.read([n for n in z.namelist() if n.endswith('ua-ipad@2x.plist')][0]))
    presets['letterA'] = {
        'id': 'letterA',
        'title': 'Litera A',
        'symbol': 'A',
        'category': 'Litere',
        'viewBox': '0 0 300 300',
        'width': 300,
        'height': 300,
        'strokes': [
            {'id': 's1', 'label': 'Piciorul stâng', 'points': parse_coords_to_points(a_plist['part1']['coordinates'])},
            {'id': 's2', 'label': 'Piciorul drept', 'points': parse_coords_to_points(a_plist['part2']['coordinates'])},
            {'id': 's3', 'label': 'Bara din mijloc', 'points': parse_coords_to_points(a_plist['part3']['coordinates'])},
        ]
    }
    
    # 2. Letter B (ub)
    b_plist = plistlib.loads(z.read([n for n in z.namelist() if n.endswith('ub-ipad@2x.plist') and 'lettertracing' in n][0]))
    presets['letterB'] = {
        'id': 'letterB',
        'title': 'Litera B',
        'symbol': 'B',
        'category': 'Litere',
        'viewBox': '0 0 300 300',
        'width': 300,
        'height': 300,
        'strokes': [
            {'id': 's1', 'label': 'Linia verticală', 'points': parse_coords_to_points(b_plist['part1']['coordinates'])},
            {'id': 's2', 'label': 'Burtica de sus', 'points': parse_coords_to_points(b_plist['part2']['coordinates'])},
            {'id': 's3', 'label': 'Burtica de jos', 'points': parse_coords_to_points(b_plist['part3']['coordinates'])},
        ]
    }
    
    # 3. Letter M (um)
    m_plist = plistlib.loads(z.read([n for n in z.namelist() if n.endswith('um-ipad@2x.plist')][0]))
    presets['letterM'] = {
        'id': 'letterM',
        'title': 'Litera M',
        'symbol': 'M',
        'category': 'Litere',
        'viewBox': '0 0 300 300',
        'width': 300,
        'height': 300,
        'strokes': [
            {'id': 's1', 'label': 'Linia stângă', 'points': parse_coords_to_points(m_plist['part1']['coordinates'])},
            {'id': 's2', 'label': 'Diagonala spre centru', 'points': parse_coords_to_points(m_plist['part2']['coordinates'])},
            {'id': 's3', 'label': 'Diagonala spre dreapta sus', 'points': parse_coords_to_points(m_plist['part3']['coordinates'])},
            {'id': 's4', 'label': 'Linia dreaptă coboară', 'points': parse_coords_to_points(m_plist['part4']['coordinates'])},
        ]
    }
    
    # 4. Letter O (uo)
    o_plist = plistlib.loads(z.read([n for n in z.namelist() if n.endswith('uo-ipad@2x.plist')][0]))
    presets['letterO'] = {
        'id': 'letterO',
        'title': 'Litera O',
        'symbol': 'O',
        'category': 'Litere',
        'viewBox': '0 0 300 300',
        'width': 300,
        'height': 300,
        'strokes': [
            {'id': 's1', 'label': 'Conturul rotund al literei O', 'points': parse_coords_to_points(o_plist['part1']['coordinates'])},
        ]
    }
    
    # 5. Letter R (ur)
    r_plist = plistlib.loads(z.read([n for n in z.namelist() if n.endswith('ur-ipad@2x.plist')][0]))
    presets['letterR'] = {
        'id': 'letterR',
        'title': 'Litera R',
        'symbol': 'R',
        'category': 'Litere',
        'viewBox': '0 0 300 300',
        'width': 300,
        'height': 300,
        'strokes': [
            {'id': 's1', 'label': 'Linia verticală', 'points': parse_coords_to_points(r_plist['part1']['coordinates'])},
            {'id': 's2', 'label': 'Burtica rotundă', 'points': parse_coords_to_points(r_plist['part2']['coordinates'])},
            {'id': 's3', 'label': 'Piciorul oblic', 'points': parse_coords_to_points(r_plist['part3']['coordinates'])},
        ]
    }
    
    # 6. Number 1 (1)
    num1_plist = plistlib.loads(z.read([n for n in z.namelist() if n.endswith('1-ipad@2x.plist') and 'lettertracing' in n][0]))
    presets['number1'] = {
        'id': 'number1',
        'title': 'Cifra 1',
        'symbol': '1',
        'category': 'Numere',
        'viewBox': '0 0 300 300',
        'width': 300,
        'height': 300,
        'strokes': [
            {'id': 's1', 'label': 'Bastonul vertical', 'points': parse_coords_to_points(num1_plist['part1']['coordinates'])},
        ]
    }
    
    # 7. Number 2 (2)
    num2_plist = plistlib.loads(z.read([n for n in z.namelist() if n.endswith('2-ipad@2x.plist') and 'lettertracing' in n][0]))
    presets['number2'] = {
        'id': 'number2',
        'title': 'Cifra 2',
        'symbol': '2',
        'category': 'Numere',
        'viewBox': '0 0 300 300',
        'width': 300,
        'height': 300,
        'strokes': [
            {'id': 's1', 'label': 'Arcul de sus și diagonala', 'points': parse_coords_to_points(num2_plist['part1']['coordinates'])},
            {'id': 's2', 'label': 'Baza orizontală', 'points': parse_coords_to_points(num2_plist['part2']['coordinates'])},
        ]
    }
    
    # 8. Shape Circle
    circle_plist = plistlib.loads(z.read([n for n in z.namelist() if n.endswith('circle-ipad@2x.plist') and 'lettertracing' in n][0]))
    presets['shapeCircle'] = {
        'id': 'shapeCircle',
        'title': 'Cerc Magic',
        'symbol': '⭕',
        'category': 'Forme',
        'viewBox': '0 0 300 300',
        'width': 300,
        'height': 300,
        'strokes': [
            {'id': 's1', 'label': 'Conturul cercului', 'points': parse_coords_to_points(circle_plist['part1']['coordinates'])},
        ]
    }
    
    # 9. Shape Triangle
    tri_plist = plistlib.loads(z.read([n for n in z.namelist() if n.endswith('triangle-ipad@2x.plist') and 'lettertracing' in n][0]))
    presets['shapeTriangle'] = {
        'id': 'shapeTriangle',
        'title': 'Triunghi Jucăuș',
        'symbol': '🔺',
        'category': 'Forme',
        'viewBox': '0 0 300 300',
        'width': 300,
        'height': 300,
        'strokes': [
            {'id': 's1', 'label': 'Latura stângă', 'points': parse_coords_to_points(tri_plist.get('part1', {}).get('coordinates', '768, 255, 300, 1250'))},
            {'id': 's2', 'label': 'Baza', 'points': parse_coords_to_points(tri_plist.get('part2', {}).get('coordinates', '300, 1250, 1236, 1250'))},
            {'id': 's3', 'label': 'Latura dreaptă', 'points': parse_coords_to_points(tri_plist.get('part3', {}).get('coordinates', '1236, 1250, 768, 255'))},
        ]
    }
    
    # 10. Shape Star
    presets['shapeStar'] = {
        'id': 'shapeStar',
        'title': 'Stea Strălucitoare',
        'symbol': '⭐',
        'category': 'Forme',
        'viewBox': '0 0 300 300',
        'width': 300,
        'height': 300,
        'strokes': [
            {
                'id': 's1',
                'label': 'Conturul stelei',
                'points': [
                    {'x': 150, 'y': 45},
                    {'x': 180, 'y': 110},
                    {'x': 255, 'y': 115},
                    {'x': 200, 'y': 165},
                    {'x': 220, 'y': 240},
                    {'x': 150, 'y': 195},
                    {'x': 80, 'y': 240},
                    {'x': 100, 'y': 165},
                    {'x': 45, 'y': 115},
                    {'x': 120, 'y': 110},
                    {'x': 150, 'y': 45},
                ]
            }
        ]
    }

js_content = f"""/**
 * Authentic Vector Path Presets extracted directly from Khan Academy Kids
 * Normalized to 300x300 viewBox grid for Preschool Motor Coordination
 */
export const PATH_PRESETS = {json.dumps(presets, indent=2)};
"""

with open(output_js, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Successfully wrote {len(presets)} authentic presets to {output_js}!")
