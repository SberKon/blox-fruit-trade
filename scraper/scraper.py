from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import json
import time
from datetime import datetime

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def scrape_data():
    driver = setup_driver()
    try:
        driver.get("https://fruityblox.com/blox-fruits-value-list")
        time.sleep(5)  # Wait for page to load
        
        items = []
        elements = driver.find_elements(By.CLASS_NAME, "p-4.border")
        
        for element in elements:
            try:
                name = element.find_element(By.CLASS_NAME, "font-bold.uppercase").text.strip()
                type_element = element.find_element(By.CLASS_NAME, "text-xs.text-gray-400")
                item_type = type_element.text.strip()
                values = element.find_elements(By.CLASS_NAME, "text-sm")
                
                if not name or not item_type:
                    continue
                
                if item_type == 'fruit':
                    items.append({
                        "name": name,
                        "type": "Fruit",
                        "valueCost": values[0].text.strip(),
                        "permValueCost": values[1].text.strip()
                    })
                else:
                    items.append({
                        "name": name,
                        "type": item_type.capitalize(),
                        "valueCost": values[0].text.strip()
                    })
            except Exception as e:
                print(f"Error processing element: {e}")
                continue

        return items

    finally:
        driver.quit()

def save_data(items):
    data = {
        "items": items,
        "timestamp": datetime.now().isoformat(),
        "source": "FruityBlox"
    }
    
    with open('api/data/bloxfruits.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    items = scrape_data()
    save_data(items)
