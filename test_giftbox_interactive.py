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

# Click on 🎁 Cadou! in top bar
cadou_btn = driver.find_elements(By.XPATH, "//*[contains(text(), 'Cadou!')]")
print('Cadou buttons found:', len(cadou_btn))
if len(cadou_btn) > 0:
    cadou_btn[0].click()
    time.sleep(1.5)
    driver.save_screenshot('screen_gift_box_modal.png')
    print('Saved screen_gift_box_modal.png')

    # Find the gift box to tap
    tap_badge = driver.find_elements(By.XPATH, "//*[contains(text(), 'Atinge-mă!')]")
    print('Tap badge found:', len(tap_badge))
    if len(tap_badge) > 0:
        # Tap 1
        tap_badge[0].click()
        time.sleep(0.4)
        # Tap 2
        tap_badge[0].click()
        time.sleep(0.4)
        driver.save_screenshot('screen_gift_box_shaking.png')
        print('Saved screen_gift_box_shaking.png')
        # Tap 3 (Climax Unbox!)
        tap_badge[0].click()
        time.sleep(2.5)
        driver.save_screenshot('screen_gift_box_unboxed.png')
        print('Saved screen_gift_box_unboxed.png')

driver.quit()
print('GiftBox test finished!')
