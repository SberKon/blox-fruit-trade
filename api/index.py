from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from datetime import datetime, timedelta
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from templates.scraper import scrape_fruits

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache variables
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
        # Check if cache exists and is less than 1 hour old
        current_time = datetime.now()
        if cache["data"] and cache["last_update"] and \
           current_time - cache["last_update"] < timedelta(hours=1):
            return cache["data"]

        # If cache is old or doesn't exist, fetch new data
        data = scrape_fruits()
        
        # Update cache
        cache["data"] = data
        cache["last_update"] = current_time
        
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))