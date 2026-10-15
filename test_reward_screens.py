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

# Find and scroll to Căsuța cu Jucării
cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Căsuța cu Jucării')]")
print('Found cards:', len(cards))
if len(cards) > 0:
    driver.execute_script("arguments[0].scrollIntoView(true);", cards[0])
    time.sleep(0.5)
    cards[0].click()
    time.sleep(2)
    driver.save_screenshot('screen_mascot_decorator_room.png')
    print('Saved screen_mascot_decorator_room.png')

    # Click on "Deschide un Cadou!"
    open_box = driver.find_elements(By.XPATH, "//*[contains(text(), 'Deschide un Cadou!')]")
    print('Found open box btns:', len(open_box))
    if len(open_box) > 0:
        open_box[0].click()
        time.sleep(2)
        driver.save_screenshot('screen_gift_box_initial.png')
        print('Saved screen_gift_box_initial.png')

        # Tap the gift box (tap 1)
        tap_box = driver.find_elements(By.XPATH, "//*[contains(text(), 'Atinge-mă!')]")
        print('Found tap box:', len(tap_box))
        if len(tap_box) > 0:
            tap_box[0].click()
            time.sleep(0.4)
            # Tap 2
            tap_box[0].click()
            time.sleep(0.4)
            # Tap 3 (Unbox!)
            tap_box[0].click()
            time.sleep(2)
            driver.save_screenshot('screen_gift_box_unboxed.png')
            print('Saved screen_gift_box_unboxed.png')

driver.quit()
print('Testing complete!')
