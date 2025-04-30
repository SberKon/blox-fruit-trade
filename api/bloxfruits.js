// Vercell Api
const express = require("express");
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const getInitialData = () => {
  return {
    items: [],
    timestamp: new Date().toISOString(),
    source: "BloxFruitsValues",
    total_items: 0
  };
};

app.get("/api/bloxfruits", async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'bloxfruits.json');
    let data;
    
    try {
      const jsonData = await fs.readFile(dataPath, 'utf-8');
      data = JSON.parse(jsonData);
    } catch (err) {
      console.warn('Data file not found, using initial data');
      data = getInitialData();
    }
    
    const { rarity, type, value_type } = req.query;
    
    if (rarity || type || value_type) {
      data.items = data.items.filter(item => {
        let match = true;
        if (rarity) {
          match = match && item.rarity.toLowerCase() === rarity.toLowerCase();
        }
        if (type) {
          match = match && item.type.toLowerCase() === type.toLowerCase();
        }
        if (value_type && item.values[value_type]) {
          match = match && true;
        }
        return match;
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Blox Fruits API Error:', error);
    res.status(500).json({ error: "Failed to fetch Blox Fruits data" });
  }
});

// Get available filters
app.get("/api/bloxfruits/filters", async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'bloxfruits.json');
    let data;
    
    try {
      const jsonData = await fs.readFile(dataPath, 'utf-8');
      data = JSON.parse(jsonData);
    } catch (err) {
      console.warn('Data file not found, using initial data');
      data = getInitialData();
    }
    
    const filters = {
      rarities: [...new Set(data.items.map(item => item.rarity))],
      types: [...new Set(data.items.map(item => item.type))],
      value_types: ["physical", "permanent"]
    };
    
    res.json(filters);
  } catch (error) {
    console.error('Error fetching filters:', error.message);
    res.status(500).json({ error: "Failed to fetch filters" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
