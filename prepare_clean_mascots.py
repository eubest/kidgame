from PIL import Image
import os

img = Image.open('assets/images/characterrewardshw_kodi1@2x.png')
print('characterrewardshw_kodi1 size:', img.size)

# If width is 704 and height is 164, let's find non-empty bounding boxes
# or divide into 4 columns of 176px each
for i in range(4):
    box = (i * 176, 0, (i + 1) * 176, 164)
    crop = img.crop(box)
    bbox = crop.getbbox()
    if bbox:
        trimmed = crop.crop(bbox)
        trimmed.save(f'assets/images/mascots/kodi_frame_{i}.png')
        print(f'Saved frame {i}:', trimmed.size)

# Also let's save frame 0 as kodi.png if valid
if os.path.exists('assets/images/mascots/kodi_frame_0.png'):
    k0 = Image.open('assets/images/mascots/kodi_frame_0.png')
    k0.save('assets/images/mascots/kodi.png')
    print('Saved assets/images/mascots/kodi.png!')
