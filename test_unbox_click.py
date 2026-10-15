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

cadou_btn = driver.find_elements(By.XPATH, "//*[contains(text(), 'Cadou!')]")
if len(cadou_btn) > 0:
    cadou_btn[0].click()
    time.sleep(1.5)

    for i in range(3):
        # Re-query modal button or box
        box_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Atinge') or contains(text(), 'Cutia') or contains(text(), 'atingere') or contains(text(), 'Deschide')]")
        if len(box_elements) > 0:
            box_elements[-1].click()
            print(f'Tapped {i+1} time(s)')
            time.sleep(0.8)

    time.sleep(2)
    driver.save_screenshot('screen_gift_box_unboxed_real.png')
    print('Saved screen_gift_box_unboxed_real.png')

driver.quit()
print('Testing completed!')
