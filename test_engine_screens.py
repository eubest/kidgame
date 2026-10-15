from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1200,850')

driver = webdriver.Chrome(options=options)
driver.get('http://localhost:8081')
time.sleep(3)

# 1. Ollo Feeding screen
cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Hrănește-l pe Ollo')]")
if len(cards) > 0:
    cards[0].click()
    time.sleep(2)
    driver.save_screenshot('screen_engine_ollo_dragdrop.png')
    print('Saved screen_engine_ollo_dragdrop.png')

# 2. Go to Library
lib_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Biblioteca')]")
if len(lib_btns) > 0:
    lib_btns[0].click()
    time.sleep(1)

# 3. Click on Trasare Vectorială tab
trace_tabs = driver.find_elements(By.XPATH, "//*[contains(text(), 'Trasare Vectorială')]")
if len(trace_tabs) > 0:
    trace_tabs[0].click()
    time.sleep(1)
    driver.save_screenshot('screen_engine_library_tracing.png')
    print('Saved screen_engine_library_tracing.png')

    # Launch a tracing sheet
    start_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'START ▶')]")
    if len(start_btns) > 0:
        start_btns[0].click()
        time.sleep(2)
        driver.save_screenshot('screen_engine_tracing_active.png')
        print('Saved screen_engine_tracing_active.png')

driver.quit()
print('Testing completed!')
