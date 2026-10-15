from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1280,880')

driver = webdriver.Chrome(options=options)
try:
    driver.get('http://localhost:8081')
    time.sleep(3)
    
    btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Excursia Zilei')]")
    if btns:
        parent = btns[0].find_element(By.XPATH, "..")
        driver.execute_script("arguments[0].click();", parent)
        time.sleep(2.5)
        driver.save_screenshot('master_2_quest_trail_active.png')
        print('Captured master_2_quest_trail_active.png successfully!')
finally:
    driver.quit()
