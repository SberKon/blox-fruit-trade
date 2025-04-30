from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.options import Options
import json
import time

# ... (keep existing get_gamepass_data and get_fruit_data functions) ...

def scrape_fruits():
    urls = [
        "https://bloxfruitsvalues.com/common",
        "https://bloxfruitsvalues.com/uncommon",
        "https://bloxfruitsvalues.com/rare",
        "https://bloxfruitsvalues.com/legendary",
        "https://bloxfruitsvalues.com/mythical",
        "https://bloxfruitsvalues.com/gamepass"
    ]
    
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=chrome_options)
    all_fruits_data = []
    
    try:
        for url in urls:
            driver.get(url)
            is_gamepass = "gamepass" in url
            
            wait = WebDriverWait(driver, 10)
            cards = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.flex.flex-col.w-\\[334px\\]")))
            
            for card in cards:
                try:
                    fruit_data = get_fruit_data(driver, card, is_gamepass)
                    all_fruits_data.append(fruit_data)
                except Exception as e:
                    print(f"Error processing card from {url}: {e}")
            
            time.sleep(1)
    finally:
        driver.quit()
    
    return all_fruits_data

if __name__ == "__main__":
    data = scrape_fruits()
    with open("all_fruits.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)