import requests
from bs4 import BeautifulSoup
import json
import time

def get_fruit_data(soup_card, is_gamepass=False):
    data = {}
    try:
        # Using a more reliable selector for the name
        name_elem = soup_card.find('h1', class_='text-2xl font-semibold')
        if not name_elem:
            return None
        
        name = name_elem.text.strip()
        data["name"] = name
        
        if is_gamepass:
            status = soup_card.find('div', class_='items-center').find('h1').text.strip()
            value = soup_card.find('div', class_='text-sm font-medium').find('h2').text.strip()
            demand = soup_card.find('h2', id='Demand').text.strip()
            
            data["values"] = {
                "value": value.replace(",", ""),
                "demand": demand,
                "status": status
            }
        else:
            values_divs = soup_card.find_all('div', class_='text-sm font-medium')
            status = soup_card.find('div', class_='relative items-center').find('h1').text.strip()
            
            if len(values_divs) >= 2:
                value = values_divs[0].find('h2').text.strip()
                demand = values_divs[1].find('h2').text.strip()
                
                data["values"] = {
                    "physical": {
                        "value": value.replace(",", ""),
                        "demand": demand,
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
            # Changed selector to use class_ parameter
            cards = soup.find_all('div', class_=['flex', 'flex-col', 'w-[334px]'])
            
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
