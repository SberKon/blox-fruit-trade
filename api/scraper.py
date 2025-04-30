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

# ...existing setup_driver code...

# ...existing get_gamepass_data code...

# ...existing get_fruit_data code...

# ...existing scrape_all_data code...

def save_data(items):
    data = {
        "items": items,
        "timestamp": datetime.now().isoformat(),
        "source": "BloxFruitsValues",
        "total_items": len(items)
    }
    
    # Use absolute path relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, 'data')
    data_file = os.path.join(data_dir, 'bloxfruits.json')
    
    print(f"Saving data to: {data_file}")
    
    os.makedirs(data_dir, exist_ok=True)
    
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    try:
        print("Starting scraper...")
        items = scrape_all_data()
        print(f"Found {len(items)} items")
        save_data(items)
        print("Data saved successfully")
    except Exception as e:
        print(f"Error: {e}")
        raise
