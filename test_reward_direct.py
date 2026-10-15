import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1200,900')

driver = webdriver.Chrome(options=options)
driver.get('http://localhost:8081')
time.sleep(3)

print('Current URL:', driver.current_url)

# Find cards
all_cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Jucării')]")
print('Jucarii elements found:', len(all_cards))
for c in all_cards:
    try:
        driver.execute_script("arguments[0].scrollIntoView(true);", c)
        time.sleep(0.5)
        c.click()
        time.sleep(2)
        driver.save_screenshot('screen_mascot_decorator_room.png')
        print('Saved screen_mascot_decorator_room.png')
        break
    except Exception as e:
        print('Click err:', e)

# Now check if room is open and click "Deschide un Cadou!"
open_box = driver.find_elements(By.XPATH, "//*[contains(text(), 'Cadou')]")
print('Cadou elements found:', len(open_box))
for b in open_box:
    try:
        b.click()
        time.sleep(2)
        driver.save_screenshot('screen_gift_box_initial.png')
        print('Saved screen_gift_box_initial.png')
        break
    except Exception as e:
        print('Box click err:', e)

# Tap 3 times to unbox
tap_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Atinge')]")
print('Atinge elements found:', len(tap_elements))
if len(tap_elements) > 0:
    for _ in range(3):
        tap_elements[0].click()
        time.sleep(0.5)
    time.sleep(2.5)
    driver.save_screenshot('screen_gift_box_unboxed.png')
    print('Saved screen_gift_box_unboxed.png')

driver.quit()
print('Testing completed cleanly!')
