from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1200,850')

driver = webdriver.Chrome(options=options)
driver.get('http://localhost:8081')
time.sleep(2)

# Screenshot 1: Hub
driver.save_screenshot('screen_1_hub.png')
print('Hub screenshot saved!')

# Click on Math (Grila Matematica)
cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Grila Matematică')]")
if len(cards) > 0:
    cards[0].click()
    time.sleep(2)
    driver.save_screenshot('screen_2_math.png')
    print('Math screenshot saved!')

# Go back to Hub
home_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Orășelul')]")
if len(home_btns) > 0:
    home_btns[0].click()
    time.sleep(1)

# Click on Ollo Phonics
cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Hrănește-l pe Ollo')]")
if len(cards) > 0:
    cards[0].click()
    time.sleep(2)
    driver.save_screenshot('screen_3_ollo.png')
    print('Ollo screenshot saved!')

# Go back to Hub
home_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Orășelul')]")
if len(home_btns) > 0:
    home_btns[0].click()
    time.sleep(1)

# Click on Memory Cards
cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Cartonașele Magice')]")
if len(cards) > 0:
    cards[0].click()
    time.sleep(2)
    driver.save_screenshot('screen_4_memory.png')
    print('Memory screenshot saved!')

# Go back to Hub
home_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Orășelul')]")
if len(home_btns) > 0:
    home_btns[0].click()
    time.sleep(1)

# Click on Atelier
cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Atelierul de Pictură')]")
if len(cards) > 0:
    cards[0].click()
    time.sleep(2)
    driver.save_screenshot('screen_5_atelier.png')
    print('Atelier screenshot saved!')

# Go back to Hub
home_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Orășelul')]")
if len(home_btns) > 0:
    home_btns[0].click()
    time.sleep(1)

# Click on Clubhouse
cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Căsuța cu Jucării')]")
if len(cards) > 0:
    cards[0].click()
    time.sleep(2)
    driver.save_screenshot('screen_6_clubhouse.png')
    print('Clubhouse screenshot saved!')

driver.quit()
print('All screens captured successfully!')
