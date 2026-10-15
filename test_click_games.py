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

    # Click card directly by text
    print('Searching for Broscuta card...')
    res = driver.execute_script("""
        let els = document.querySelectorAll('*');
        for (let el of els) {
            if (el.textContent && el.textContent.includes('Broscuța Săltăreață') && el.textContent.length < 50) {
                let p = el;
                while (p && p !== document.body) {
                    if (p.getAttribute('role') === 'button' || p.tabIndex === 0) {
                        p.click();
                        return 'Clicked parent button: ' + p.className;
                    }
                    p = p.parentElement;
                }
                el.click();
                return 'Clicked el directly: ' + el.className;
            }
        }
        return 'Not found';
    """)
    print('JS Exec 1:', res)
    time.sleep(2)
    driver.save_screenshot('screen_stepping_stones_real.png')

    # Return to hub
    driver.get('http://localhost:8081')
    time.sleep(2)

    # Click OneLine card
    print('Searching for Traseaza dintr-o Miscare card...')
    res2 = driver.execute_script("""
        let els = document.querySelectorAll('*');
        for (let el of els) {
            if (el.textContent && el.textContent.includes('Trasează dintr-o Mișcare') && el.textContent.length < 50) {
                let p = el;
                while (p && p !== document.body) {
                    if (p.getAttribute('role') === 'button' || p.tabIndex === 0) {
                        p.click();
                        return 'Clicked parent button: ' + p.className;
                    }
                    p = p.parentElement;
                }
                el.click();
                return 'Clicked el directly: ' + el.className;
            }
        }
        return 'Not found';
    """)
    print('JS Exec 2:', res2)
    time.sleep(2)
    driver.save_screenshot('screen_oneline_real.png')

    print('Captured real game screens!')
finally:
    driver.quit()
