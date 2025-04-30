const express = require("express");
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Initialize data file if it doesn't exist
async function initializeDataFile() {
  const dataDir = path.join(__dirname, 'data');
  const dataFile = path.join(dataDir, 'bloxfruits.json');
  
  try {
    await fs.mkdir(dataDir, { recursive: true });
    
    const initialData = {
      items: [],
      timestamp: new Date().toISOString(),
      source: "BloxFruitsValues",
      total_items: 0
    };

    await fs.writeFile(dataFile, JSON.stringify(initialData, null, 2));
    console.log('Data file initialized');
  } catch (error) {
    console.error('Error initializing data file:', error);
  }
}

// Function to run scraper
async function runScraper() {
  return new Promise((resolve, reject) => {
    const scraperPath = path.join(__dirname, 'scraper.py');
    const python = spawn('python', [scraperPath]);
    
    python.stdout.on('data', (data) => {
      console.log('Scraper output:', data.toString());
    });

    python.stderr.on('data', (data) => {
      console.error('Scraper error:', data.toString());
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.warn(`Scraper process exited with code ${code}`);
      }
      resolve();
    });
  });
}

// Get data with optional refresh
app.get("/api/bloxfruits", async (req, res) => {
  try {
    const dataFile = path.join(__dirname, 'data', 'bloxfruits.json');
    
    // Check if data file exists
    try {
      await fs.access(dataFile);
    } catch {
      await initializeDataFile();
    }

    const refresh = req.query.refresh === 'true';
    if (refresh) {
      console.log('Refreshing data...');
      await runScraper();
    }

    const data = await fs.readFile(dataFile, 'utf-8');
    const jsonData = JSON.parse(data);
    
    // Apply filters if any
    const { rarity, type, value_type } = req.query;
    if (rarity || type || value_type) {
      jsonData.items = jsonData.items.filter(item => {
        let match = true;
        if (rarity) match = match && item.rarity.toLowerCase() === rarity.toLowerCase();
        if (type) match = match && item.type.toLowerCase() === type.toLowerCase();
        if (value_type) match = match && item.values[value_type];
        return match;
      });
    }
    
    res.json(jsonData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Endpoint to force refresh
app.post("/api/bloxfruits/refresh", async (req, res) => {
  try {
    await runScraper();
    res.json({ message: "Data refresh completed" });
  } catch (error) {
    console.error('Refresh Error:', error);
    res.status(500).json({ error: "Failed to refresh data" });
  }
});

// Initialize data file on startup
const PORT = process.env.PORT || 3000;
initializeDataFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
