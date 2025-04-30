from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import json
import time

def get_gamepass_data(driver, card):
    # Get basic info
    name = card.find_element(By.CSS_SELECTOR, "h1.text-2xl.font-semibold").text
    status = card.find_element(By.CSS_SELECTOR, "div.items-center h1").text
    value = card.find_element(By.CSS_SELECTOR, "div.text-sm.font-medium h2").text
    demand = card.find_element(By.CSS_SELECTOR, "h2#Demand").text
    
    return {
        "name": name,
        "values": {
            "value": value.replace(",", ""),
            "demand": demand,
            "status": status
        }
    }

def get_fruit_data(driver, card, is_gamepass=False):
    if is_gamepass:
        return get_gamepass_data(driver, card)
        
    # Regular fruit data collection
    name = card.find_element(By.CSS_SELECTOR, "h1.text-2xl.font-semibold").text
    
    data = {
        "name": name,
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

def scrape_fruits():
    urls = [
        "https://bloxfruitsvalues.com/common",
        "https://bloxfruitsvalues.com/uncommon",
        "https://bloxfruitsvalues.com/rare",
        "https://bloxfruitsvalues.com/legendary",
        "https://bloxfruitsvalues.com/mythical",
        "https://bloxfruitsvalues.com/gamepass"
    ]
    
    driver = webdriver.Chrome()
    all_fruits_data = []
    
    for url in urls:
        driver.get(url)
        is_gamepass = "gamepass" in url
        
        # Wait for cards to load
        wait = WebDriverWait(driver, 10)
        cards = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.flex.flex-col.w-\\[334px\\]")))
        
        for card in cards:
            try:
                fruit_data = get_fruit_data(driver, card, is_gamepass)
                all_fruits_data.append(fruit_data)
            except Exception as e:
                print(f"Error processing card from {url}: {e}")
        
        time.sleep(1)
    
    driver.quit()
    
    with open("all_fruits.json", "w", encoding="utf-8") as f:
        json.dump(all_fruits_data, f, indent=2)

if __name__ == "__main__":
    scrape_fruits()
