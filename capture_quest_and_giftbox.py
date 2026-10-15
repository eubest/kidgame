from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1280,880')

driver = webdriver.Chrome(options=options)

def click_touchable(driver, xpath_text):
    elems = driver.find_elements(By.XPATH, f"//*[contains(text(), '{xpath_text}')]")
    if elems:
        driver.execute_script("""
            let el = arguments[0];
            let btn = el.closest('[role="button"]') || el.parentElement || el;
            btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        """, elems[0])
        return True
    return False

try:
    print("Navigating to http://localhost:8081 ...")
    driver.get('http://localhost:8081')
    time.sleep(3)

    # 1. Click "Cadou!" in top bar to test GiftBoxUnboxer
    print("Testing Gift Box Unboxer...")
    if click_touchable(driver, "Cadou!"):
        time.sleep(2)
        driver.save_screenshot('master_6_giftbox_closed.png')
        print("Saved master_6_giftbox_closed.png")

        # Click on the gift box to open it!
        click_touchable(driver, "Atinge pentru a Deschide")
        time.sleep(2)
        driver.save_screenshot('master_7_giftbox_opened.png')
        print("Saved master_7_giftbox_opened.png")

        # Click Continue / Închide
        click_touchable(driver, "Închide") or click_touchable(driver, "Continuă")
        time.sleep(1.5)

    # 2. Click "Excursia Zilei" button
    print("Testing Excursia Zilei Quest...")
    if click_touchable(driver, "Excursia Zilei"):
        time.sleep(2)
        driver.save_screenshot('master_2_quest_trail_active.png')
        print("Saved master_2_quest_trail_active.png")

finally:
    driver.quit()
    print("Completed capture_quest_and_giftbox.py cleanly!")
