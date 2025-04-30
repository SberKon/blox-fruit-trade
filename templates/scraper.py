import requests
from bs4 import BeautifulSoup
import json
import time

def get_fruit_data(soup_card, is_gamepass=False):
    data = {}
    try:
        name = soup_card.select_one("h1.text-2xl.font-semibold").text.strip()
        data["name"] = name
        
        if is_gamepass:
            status = soup_card.select_one("div.items-center h1").text.strip()
            value = soup_card.select_one("div.text-sm.font-medium h2").text.strip()
            demand = soup_card.select_one("h2#Demand").text.strip()
            
            data["values"] = {
                "value": value.replace(",", ""),
                "demand": demand,
                "status": status
            }
        else:
            values_div = soup_card.select("div.text-sm.font-medium")
            status = soup_card.select_one("div.relative.items-center h1").text.strip()
            
            data["values"] = {
                "physical": {
                    "value": values_div[0].select_one("h2").text.strip().replace(",", ""),
                    "demand": values_div[1].select_one("h2").text.strip(),
                    "status": status
                }
            }
            
    except Exception as e:
        print(f"Error processing card: {e}")
        return None
    
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
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    all_fruits_data = []
    
    for url in urls:
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            cards = soup.select("div.flex.flex-col.w-[334px]")
            
            is_gamepass = "gamepass" in url
            
            for card in cards:
                fruit_data = get_fruit_data(card, is_gamepass)
                if fruit_data:
                    all_fruits_data.append(fruit_data)
            
            time.sleep(1)
            
        except Exception as e:
            print(f"Error processing URL {url}: {e}")
    
    return all_fruits_data

if __name__ == "__main__":
    data = scrape_fruits()
    with open("all_fruits.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)