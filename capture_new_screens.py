import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def capture():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--window-size=1200,800')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    
    driver = webdriver.Chrome(options=options)
    try:
        driver.get('http://localhost:8081')
        time.sleep(3.5)
        
        # 1. Capture Hub with Living Mascot Kodi & new CTAs
        driver.save_screenshot('screen_hub_living_mascot.png')
        print('Captured screen_hub_living_mascot.png')

        # 2. Click "🎬 Desene" (Cartoon Cutscene)
        btns = driver.find_elements(By.TAG_NAME, 'div')
        for b in btns:
            if 'Desene' in b.text and len(b.text) < 15:
                b.click()
                break
        time.sleep(2)
        driver.save_screenshot('screen_cartoon_cutscene.png')
        print('Captured screen_cartoon_cutscene.png')

        # Return to Hub
        driver.get('http://localhost:8081')
        time.sleep(2)

        # 3. Click "🛁 Cădița" (Ollo Bathtub Room)
        btns = driver.find_elements(By.TAG_NAME, 'div')
        for b in btns:
            if 'Cădița' in b.text and len(b.text) < 15:
                b.click()
                break
        time.sleep(2)
        driver.save_screenshot('screen_ollo_bath_room.png')
        print('Captured screen_ollo_bath_room.png')

        # Return to Hub
        driver.get('http://localhost:8081')
        time.sleep(2)

        # 4. Click "Bastonul celor 10 Cuburi"
        cards = driver.find_elements(By.TAG_NAME, 'div')
        for c in cards:
            if 'Bastonul celor 10 Cuburi' in c.text and len(c.text) < 60:
                c.click()
                break
        time.sleep(2)
        driver.save_screenshot('screen_base_ten_rods.png')
        print('Captured screen_base_ten_rods.png')

        # Return to Hub
        driver.get('http://localhost:8081')
        time.sleep(2)

        # 5. Click "Acvariul cu Bule Fonetice"
        cards = driver.find_elements(By.TAG_NAME, 'div')
        for c in cards:
            if 'Acvariul cu Bule' in c.text and len(c.text) < 60:
                c.click()
                break
        time.sleep(2)
        driver.save_screenshot('screen_bubble_popper.png')
        print('Captured screen_bubble_popper.png')

        # Return to Hub
        driver.get('http://localhost:8081')
        time.sleep(2)

        # 6. Click "Cărți & Povești" -> check interactive hotspots
        cards = driver.find_elements(By.TAG_NAME, 'div')
        for c in cards:
            if 'Cărți & Povești' in c.text and len(c.text) < 50:
                c.click()
                break
        time.sleep(2)
        driver.save_screenshot('screen_storybook_hotspots.png')
        print('Captured screen_storybook_hotspots.png')

    finally:
        driver.quit()

if __name__ == '__main__':
    capture()
