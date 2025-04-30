from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from templates.scraper import scrape_fruits

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cache = {
    "data": None,
    "last_update": None
}

@app.get("/")
async def root():
    return {"message": "Welcome to Blox Fruits Values API"}

@app.get("/api/fruits")
async def get_fruits():
    try:
        current_time = datetime.now()
        if cache["data"] and cache["last_update"] and \
           current_time - cache["last_update"] < timedelta(hours=1):
            return cache["data"]

        data = scrape_fruits()
        cache["data"] = data
        cache["last_update"] = current_time
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))