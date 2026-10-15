from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1280,880')

driver = webdriver.Chrome(options=options)
try:
    print('Loading web app...')
    driver.get('http://localhost:8081')
    time.sleep(3)

    # 1. Screenshot Hub
    driver.save_screenshot('screen_hub_logiclike_integrated.png')
    print('Saved screen_hub_logiclike_integrated.png')

    # 2. Click Scratchpad button
    print('Toggling Scratchpad...')
    driver.execute_script("""
        let els = document.querySelectorAll('*');
        for (let el of els) {
            if (el.textContent && el.textContent.trim() === 'Ciornă') {
                let p = el;
                while (p && p !== document.body) {
                    if (p.getAttribute('role') === 'button' || p.tabIndex === 0 || p.onclick) {
                        p.click();
                        return;
                    }
                    p = p.parentElement;
                }
                el.click();
                return;
            }
        }
    """)
    time.sleep(2)
    driver.save_screenshot('screen_scratchpad_overlay_active.png')
    print('Saved screen_scratchpad_overlay_active.png')

    # Close scratchpad by clicking close
    driver.execute_script("""
        let els = document.querySelectorAll('*');
        for (let el of els) {
            if (el.textContent && el.textContent.includes('Închide')) {
                let p = el;
                while (p && p !== document.body) {
                    if (p.getAttribute('role') === 'button' || p.tabIndex === 0) {
                        p.click();
                        return;
                    }
                    p = p.parentElement;
                }
                el.click();
                return;
            }
        }
    """)
    time.sleep(1)

    # 3. Launch Broscuta Saltareata (Stepping Stones)
    print('Launching Stepping Stones Game...')
    driver.execute_script("""
        let els = document.querySelectorAll('*');
        for (let el of els) {
            if (el.textContent && el.textContent.includes('Salturi pe Nuferi')) {
                let p = el;
                while (p && p !== document.body) {
                    if (p.getAttribute('role') === 'button' || p.tabIndex === 0) {
                        p.click();
                        return;
                    }
                    p = p.parentElement;
                }
                el.click();
                return;
            }
        }
    """)
    time.sleep(2)
    driver.save_screenshot('screen_stepping_stones_game.png')
    print('Saved screen_stepping_stones_game.png')

    # 4. Return to Hub and Launch One-Line Puzzle
    driver.get('http://localhost:8081')
    time.sleep(2)
    print('Launching One-Line Puzzle...')
    driver.execute_script("""
        let els = document.querySelectorAll('*');
        for (let el of els) {
            if (el.textContent && el.textContent.includes('Puzzle-uri Euleriene')) {
                let p = el;
                while (p && p !== document.body) {
                    if (p.getAttribute('role') === 'button' || p.tabIndex === 0) {
                        p.click();
                        return;
                    }
                    p = p.parentElement;
                }
                el.click();
                return;
            }
        }
    """)
    time.sleep(2)
    driver.save_screenshot('screen_oneline_puzzle_game.png')
    print('Saved screen_oneline_puzzle_game.png')

    print('All screenshots captured successfully!')
finally:
    driver.quit()
