from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager
import json
import time
from datetime import datetime
import os

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def get_gamepass_data(driver, card):
    try:
        name = card.find_element(By.CSS_SELECTOR, "h1.text-2xl.font-semibold").text
        status = card.find_element(By.CSS_SELECTOR, "div.items-center h1").text
        value = card.find_element(By.CSS_SELECTOR, "div.text-sm.font-medium h2").text
        demand = card.find_element(By.CSS_SELECTOR, "h2#Demand").text
        
        return {
            "name": name,
            "type": "Gamepass",
            "values": {
                "value": value.replace(",", ""),
                "demand": demand,
                "status": status
            }
        }
    except Exception as e:
        print(f"Error in gamepass data extraction: {e}")
        return None

def get_fruit_data(driver, card):
    try:
        name = card.find_element(By.CSS_SELECTOR, "h1.text-2xl.font-semibold").text
        
        data = {
            "name": name,
            "type": "Fruit",
            "values": {}
        }
        
        # Get data for both physical and permanent values
        select = Select(card.find_element(By.CSS_SELECTOR, "select#types"))
        
        # Physical value
        status = card.find_element(By.CSS_SELECTOR, "div.relative.items-center h1").text
        value = card.find_element(By.CSS_SELECTOR, "div.text-sm.font-medium h2").text
        demand = card.find_elements(By.CSS_SELECTOR, "div.text-sm.font-medium h2")[1].text
        data["values"]["physical"] = {
            "value": value.replace(",", ""),
            "demand": demand,
            "status": status
        }
        
        # Switch to permanent value
        select.select_by_value("permanent")
        time.sleep(0.5)
        
        status = card.find_element(By.CSS_SELECTOR, "div.relative.items-center h1").text
        value = card.find_element(By.CSS_SELECTOR, "div.text-sm.font-medium h2").text
        demand = card.find_elements(By.CSS_SELECTOR, "div.text-sm.font-medium h2")[1].text
        data["values"]["permanent"] = {
            "value": value.replace(",", ""),
            "demand": demand,
            "status": status
        }
        
        return data
    except Exception as e:
        print(f"Error in fruit data extraction: {e}")
        return None

def scrape_all_data():
    urls = [
        "https://bloxfruitsvalues.com/common",
        "https://bloxfruitsvalues.com/uncommon",
        "https://bloxfruitsvalues.com/rare",
        "https://bloxfruitsvalues.com/legendary",
        "https://bloxfruitsvalues.com/mythical",
        "https://bloxfruitsvalues.com/gamepass"
    ]
    
    driver = setup_driver()
    all_items = []
    
    try:
        for url in urls:
            try:
                driver.get(url)
                is_gamepass = "gamepass" in url
                rarity = url.split('/')[-1].capitalize()
                
                # Wait for cards to load
                wait = WebDriverWait(driver, 10)
                cards = wait.until(EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, "div.flex.flex-col.w-[334px]")
                ))
                
                for card in cards:
                    try:
                        if is_gamepass:
                            item_data = get_gamepass_data(driver, card)
                        else:
                            item_data = get_fruit_data(driver, card)
                        
                        if item_data:
                            item_data["rarity"] = rarity
                            all_items.append(item_data)
                    except Exception as e:
                        print(f"Error processing card from {url}: {e}")
                        continue
                
                time.sleep(2)  # Small delay between pages
                
            except Exception as e:
                print(f"Error processing URL {url}: {e}")
                continue
                
    finally:
        driver.quit()
    
    return all_items

def save_data(items):
    try:
        data = {
            "items": items,
            "timestamp": datetime.now().isoformat(),
            "source": "BloxFruitsValues",
            "total_items": len(items)
        }
        
        # Get absolute path to the data directory
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(current_dir, 'api', 'data')
        data_file = os.path.join(data_dir, 'bloxfruits.json')
        
        print(f"Saving data to: {data_file}")
        print(f"Total items found: {len(items)}")
        
        # Create directory if it doesn't exist
        os.makedirs(data_dir, exist_ok=True)
        
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print("Data saved successfully!")
        
    except Exception as e:
        print(f"Error saving data: {e}")
        raise

if __name__ == "__main__":
    print("Starting scraper...")
    try:
        items = scrape_all_data()
        print(f"Scraping completed. Found {len(items)} items")
        save_data(items)
    except Exception as e:
        print(f"Error in main execution: {e}")
        raise
