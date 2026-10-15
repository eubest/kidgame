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

# Click Library
lib_btn = driver.find_elements(By.XPATH, "//*[contains(text(), 'Biblioteca de Fișe')]")
if len(lib_btn) > 0:
    lib_btn[0].click()
    time.sleep(1)

# Click Fișe de Colorat
color_tab = driver.find_elements(By.XPATH, "//*[contains(text(), 'Fișe de Colorat')]")
if len(color_tab) > 0:
    color_tab[0].click()
    time.sleep(1)
    driver.save_screenshot('screen_library_coloring.png')
    print('Coloring library screenshot saved!')

driver.quit()
