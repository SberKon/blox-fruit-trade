const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get("/api/bloxfruits", async (req, res) => {
  try {
    const response = await axios.get("https://fruityblox.com/blox-fruits-value-list", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const items = [];

    $('.p-4.border').each((i, element) => {
      const $el = $(element);
      const name = $el.find('.font-bold.uppercase').text().trim();
      const type = $el.find('.text-xs.text-gray-400').text().trim();
      const values = $el.find('.text-sm').map((_, el) => $(el).text().trim()).get();
      
      // Skip empty entries and header text
      if (!name || !type) return;
      
      if (type === 'fruit') {
        items.push({
          name,
          type: 'Fruit',
          valueCost: values[0],
          permValueCost: values[1]
        });
      } else {
        items.push({
          name,
          type: type.charAt(0).toUpperCase() + type.slice(1),
          valueCost: values[0]
        });
      }
    });

    res.json({
      items: items.filter(item => item.name && item.type), // Additional filter for safety
      timestamp: new Date().toISOString(),
      source: "FruityBlox"
    });
    
  } catch (error) {
    console.error('Blox Fruits API Error:', error.message);
    res.status(500).json({ error: "Failed to fetch Blox Fruits data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
