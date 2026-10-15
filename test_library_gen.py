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

# Screenshot 1: Hub with Mode Switcher
driver.save_screenshot('screen_hub_new.png')
print('Hub screenshot saved')

# Click on 'Biblioteca de Fise'
lib_btn = driver.find_elements(By.XPATH, "//*[contains(text(), 'Biblioteca de Fișe')]")
if len(lib_btn) > 0:
    lib_btn[0].click()
    time.sleep(1.5)
    driver.save_screenshot('screen_library_math.png')
    print('Library Math screenshot saved')

# Click on 'Creeaza o Fisa Noua' (Generator)
gen_tab = driver.find_elements(By.XPATH, "//*[contains(text(), 'Creează o Fișă Nouă')]")
if len(gen_tab) > 0:
    gen_tab[0].click()
    time.sleep(1.5)
    driver.save_screenshot('screen_generator.png')
    print('Generator screenshot saved')

    # Click on 'Generează și Deschide Fișa!'
    launch_btn = driver.find_elements(By.XPATH, "//*[contains(text(), 'Generează și Deschide Fișa!')]")
    if len(launch_btn) > 0:
        launch_btn[0].click()
        time.sleep(2)
        driver.save_screenshot('screen_generated_activity.png')
        print('Generated activity screenshot saved')

driver.quit()
print('All test screenshots captured!')
