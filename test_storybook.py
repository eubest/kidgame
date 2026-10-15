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

# Click Cărți / Povești tab
books_tab = driver.find_elements(By.XPATH, "//*[contains(text(), 'Cărți') or contains(text(), 'Povești')]")
if len(books_tab) > 0:
    books_tab[0].click()
    time.sleep(1)
    driver.save_screenshot('screen_library_books.png')
    print('Books tab saved')

# Click START on the storybook
start_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'START')]")
if len(start_btns) > 0:
    start_btns[0].click()
    time.sleep(2.5)
    driver.save_screenshot('screen_storybook_reading.png')
    print('Storybook reading screen saved!')

driver.quit()
