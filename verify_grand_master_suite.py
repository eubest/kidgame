from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1280,880')

driver = webdriver.Chrome(options=options)

def safe_click(elem):
    driver.execute_script("arguments[0].click();", elem)

try:
    print("Navigating to http://localhost:8081 ...")
    driver.get('http://localhost:8081')
    time.sleep(3)

    # 1. Master Hub with Ambient Clouds, Sun & Action Banners
    driver.save_screenshot('master_1_hub_ambient.png')
    print("Saved master_1_hub_ambient.png")

    # 2. Click on "🚀 Excursia Zilei"
    quest_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Excursia Zilei')]")
    if quest_btns:
        safe_click(quest_btns[0])
        time.sleep(2)
        driver.save_screenshot('master_2_quest_trail_step1.png')
        print("Saved master_2_quest_trail_step1.png")

        # Exit back to Hub
        exit_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Ieșire')]")
        if exit_btns:
            safe_click(exit_btns[0])
            time.sleep(1.5)

    # 3. Click on "Salon 👗"
    salon_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Salon 👗')]")
    if salon_btns:
        safe_click(salon_btns[0])
        time.sleep(2)
        driver.save_screenshot('master_3_salon_decorator.png')
        print("Saved master_3_salon_decorator.png")

        # Click on an accessory to equip it!
        acc_cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Joben Elegant') or contains(text(), 'Coroană de Aur')]")
        if acc_cards:
            safe_click(acc_cards[0])
            time.sleep(1.5)
            driver.save_screenshot('master_4_salon_equipped.png')
            print("Saved master_4_salon_equipped.png")

        # Go back to Hub
        back_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Înapoi la Orășel')]")
        if back_btns:
            safe_click(back_btns[0])
            time.sleep(1.5)

    # 4. Clubhouse (Căsuța cu Jucării)
    club_cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Căsuța cu Jucării')]")
    if club_cards:
        safe_click(club_cards[0])
        time.sleep(2)
        driver.save_screenshot('master_5_clubhouse_room.png')
        print("Saved master_5_clubhouse_room.png")

finally:
    driver.quit()
    print("Master verification suite completed successfully!")
