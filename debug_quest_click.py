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
    
    # Get all clickable elements in welcome banner
    res = driver.execute_script("""
        let els = document.querySelectorAll('*');
        let quest = null;
        for (let el of els) {
            if (el.textContent && el.textContent.includes('Excursia Zilei') && el.textContent.length < 30) {
                quest = el;
                break;
            }
        }
        if (quest) {
            let p = quest;
            while (p && p !== document.body) {
                if (p.getAttribute('role') === 'button' || p.tabIndex === 0) {
                    p.click();
                    return 'Clicked parent button: ' + p.className;
                }
                p = p.parentElement;
            }
            quest.click();
            return 'Clicked quest directly: ' + quest.className;
        }
        return 'Not found';
    """)
    print('JS Exec:', res)
    time.sleep(2)
    driver.save_screenshot('master_2_quest_trail_active.png')
    
    # Check if text from quest is in DOM
    body_text = driver.find_element(By.TAG_NAME, 'body').text
    print('Contains Pasul 1:', 'Pasul 1' in body_text)
    print('Contains Trasare:', 'Trasare' in body_text)
finally:
    driver.quit()
