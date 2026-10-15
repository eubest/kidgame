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

        # 1. Capture Hub with all new Faza 3 modules
        driver.save_screenshot('screen_hub_faza3.png')
        print('Captured screen_hub_faza3.png')

        # 2. Click "Pescuitul Sunetelor"
        elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Pescuitul Sunetelor')]")
        if elements:
            elements[0].click()
            time.sleep(2.5)
            driver.save_screenshot('screen_phonics_fishing.png')
            print('Captured screen_phonics_fishing.png')
        else:
            print('Could not find Pescuitul Sunetelor')

        # Return to Hub
        driver.get('http://localhost:8081')
        time.sleep(2.5)

        # 3. Click "Cântarul Echilibrat"
        elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Cântarul Echilibrat')]")
        if elements:
            elements[0].click()
            time.sleep(2.5)
            driver.save_screenshot('screen_balance_scale.png')
            print('Captured screen_balance_scale.png')
        else:
            print('Could not find Cântarul Echilibrat')

    finally:
        driver.quit()

if __name__ == '__main__':
    capture()
