import requests
from bs4 import BeautifulSoup
import json
import time

def extract_card_data(card):
    try:
        name = card.find('h1', {'class': 'text-2xl'}).text.strip()
        
        # Get the value and demand elements
        value_elements = card.find_all('div', {'class': 'text-sm'})
        status_element = card.find('div', {'class': 'relative'})
        
        # Extract values
        if status_element:
            status = status_element.find('h1').text.strip()
        else:
            status = "Unknown"
            
        if value_elements:
            value = value_elements[0].find('h2').text.strip()
            demand = value_elements[1].find('h2').text.strip() if len(value_elements) > 1 else "Unknown"
        else:
            value = "Unknown"
            demand = "Unknown"
            
        return {
            "name": name,
            "values": {
                "physical": {
                    "value": value.replace(",", ""),
                    "demand": demand,
                    "status": status
                }
            }
        }
    except Exception as e:
        print(f"Error extracting card data: {e}")
        return None

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
    }
    
    all_fruits_data = []
    
    for url in urls:
        try:
            print(f"Scraping {url}...")
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            # Print response status and content length for debugging
            print(f"Status: {response.status_code}, Content Length: {len(response.text)}")
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all card containers
            cards = soup.find_all('div', class_='flex flex-col')
            print(f"Found {len(cards)} cards on {url}")
            
            for card in cards:
                fruit_data = extract_card_data(card)
                if fruit_data:
                    all_fruits_data.append(fruit_data)
                    print(f"Processed: {fruit_data['name']}")
            
            time.sleep(2)  # Add delay between requests
            
        except Exception as e:
            print(f"Error processing URL {url}: {e}")
    
    return all_fruits_data

def save_to_file(data):
    try:
        with open("all_fruits.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Data saved successfully! Total items: {len(data)}")
    except Exception as e:
        print(f"Error saving data: {e}")

if __name__ == "__main__":
    print("Starting scraper...")
    data = scrape_fruits()
    save_to_file(data)