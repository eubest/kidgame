from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1280,880')

driver = webdriver.Chrome(options=options)
try:
    print("Navigating to http://localhost:8081 ...")
    driver.get('http://localhost:8081')
    time.sleep(3)

    # 1. Ollo 60fps Drag & Drop Feeding
    ollo_cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Hrănește-l pe Ollo')]")
    if ollo_cards:
        ollo_cards[0].click()
        time.sleep(2)
        driver.save_screenshot('verify_3_ollo_dragdrop.png')
        print("Saved verify_3_ollo_dragdrop.png")

    # Go back to Hub using 'Traseul Magic'
    home_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Traseul Magic')]")
    if home_btns:
        home_btns[0].click()
        time.sleep(1.5)

    # 2. Interactive Word-by-Word Storybook Reader (Ce Surpriză!)
    books_cards = driver.find_elements(By.XPATH, "//*[contains(text(), 'Cărți & Povești')]")
    if books_cards:
        books_cards[0].click()
        time.sleep(2)
        driver.save_screenshot('verify_4_storybook_page1.png')
        print("Saved verify_4_storybook_page1.png")

        # Next page to see Page 2 with active story and illustration
        next_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Pagina Următoare')]")
        if next_btns:
            next_btns[0].click()
            time.sleep(2.5)
            driver.save_screenshot('verify_5_storybook_page2_karaoke.png')
            print("Saved verify_5_storybook_page2_karaoke.png")

    # Go back to Hub
    home_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Traseul Magic')]")
    if home_btns:
        home_btns[0].click()
        time.sleep(1.5)

    # 3. Open Library & Books Tab
    lib_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Deschide Biblioteca')]")
    if lib_btns:
        lib_btns[0].click()
        time.sleep(1.5)
        book_tabs = driver.find_elements(By.XPATH, "//*[contains(text(), 'Cărți & Povești')]")
        if book_tabs:
            book_tabs[0].click()
            time.sleep(1.5)
        driver.save_screenshot('verify_6_library_books.png')
        print("Saved verify_6_library_books.png")

finally:
    driver.quit()
    print("Verification completed cleanly!")
