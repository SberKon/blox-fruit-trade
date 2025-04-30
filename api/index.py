from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
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

@app.get("/")
async def root():
    return {"message": "Welcome to Blox Fruits Values API"}

@app.get("/api/fruits")
async def get_fruits():
    try:
        data = scrape_fruits()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))