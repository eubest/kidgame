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

        # 1. Capture Stepping Stones Path Game (Broscuța Săltăreață)
        elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Broscuța Săltăreață')]")
        if elements:
            elements[0].click()
            time.sleep(2)
            driver.save_screenshot('screen_stepping_stones.png')
            print('Captured screen_stepping_stones.png')
        else:
            print('Could not find Broscuța Săltăreață')

        # Return to Hub
        driver.get('http://localhost:8081')
        time.sleep(2.5)

        # 2. Capture One Line Puzzle (Trasează dintr-o Mișcare)
        elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Trasează dintr-o Mișcare')]")
        if elements:
            elements[0].click()
            time.sleep(2)
            driver.save_screenshot('screen_oneline_puzzle.png')
            print('Captured screen_oneline_puzzle.png')
        else:
            print('Could not find Trasează dintr-o Mișcare')

        # Return to Hub
        driver.get('http://localhost:8081')
        time.sleep(2.5)

        # 3. Capture Math Ten-Frame with Pedagogical Scratchpad
        elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Grila Matematică')]")
        if elements:
            elements[0].click()
            time.sleep(2)
            # Find and click "✏️ Ciornă de Calcul" floating toggle
            toggles = driver.find_elements(By.XPATH, "//*[contains(text(), 'Ciornă de Calcul')]")
            if toggles:
                toggles[0].click()
                time.sleep(1)
            driver.save_screenshot('screen_math_scratchpad.png')
            print('Captured screen_math_scratchpad.png')
        else:
            print('Could not find Grila Matematică')

        # Return to Hub
        driver.get('http://localhost:8081')
        time.sleep(2.5)

        # 4. Capture Universal TopBar Scratchpad
        tbar = driver.find_elements(By.XPATH, "//*[contains(text(), 'Ciornă')]")
        if tbar:
            tbar[0].click()
            time.sleep(1.5)
            driver.save_screenshot('screen_universal_scratchpad.png')
            print('Captured screen_universal_scratchpad.png')

    finally:
        driver.quit()

if __name__ == '__main__':
    capture()
