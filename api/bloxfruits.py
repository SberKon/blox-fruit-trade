from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import json
import time

app = FastAPI()

BASE_URLS = {
    "common":     "https://bloxfruitsvalues.com/common",
    "uncommon":   "https://bloxfruitsvalues.com/uncommon",
    "rare":       "https://bloxfruitsvalues.com/rare",
    "legendary":  "https://bloxfruitsvalues.com/legendary",
    "mythical":   "https://bloxfruitsvalues.com/mythical",
    "gamepass":   "https://bloxfruitsvalues.com/gamepass",
}

class ScrapeResult(BaseModel):
    name: str
    values: dict

def parse_card(card_div, is_gamepass=False):
    title = card_div.select_one("h1.text-2xl.font-semibold").get_text(strip=True)
    if is_gamepass:
        status = card_div.select_one("div.items-center h1").get_text(strip=True)
        value  = card_div.select_one("div.text-sm.font-medium h2").get_text(strip=True)
        demand = card_div.select_one("h2#Demand").get_text(strip=True)
        return {
            "name": title,
            "values": {
                "value": value.replace(",", ""),
                "demand": demand,
                "status": status
            }
        }
    else:
        phys_status = card_div.select_one("div.relative.items-center h1").get_text(strip=True)
        phys_vals   = card_div.select("div.text-sm.font-medium h2")
        phys_value  = phys_vals[0].get_text(strip=True)
        phys_demand = phys_vals[1].get_text(strip=True)

        # Тут можна за потреби допиляти реальний permanent, якщо він відрізняється
        return {
            "name": title,
            "values": {
                "physical": {
                    "status": phys_status,
                    "value": phys_value.replace(",", ""),
                    "demand": phys_demand
                },
                "permanent": {
                    "status": phys_status,
                    "value": phys_value.replace(",", ""),
                    "demand": phys_demand
                }
            }
        }

@app.get("/api/bloxfruits", response_model=list[ScrapeResult])
def scrape_all():
    all_data = []
    for kind, url in BASE_URLS.items():
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Error fetching {url}: {e}")

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select(r"div.flex.flex-col.w-\[334px\]")
        for card in cards:
            try:
                data = parse_card(card, is_gamepass=(kind=="gamepass"))
                all_data.append(data)
            except Exception:
                # ігноруємо проблемні картки
                continue
        time.sleep(0.5)

    return all_data
