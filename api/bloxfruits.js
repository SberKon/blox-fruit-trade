// Vercell Api
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
    const response = await axios.get("https://bloxfruitsvalues.com/legendary", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const items = new Map(); // Use map to combine physical and permanent values

    $('.flex.flex-col.w-\\[334px\\]').each((i, element) => {
      const $el = $(element);
      
      const name = $el.find('h1.text-2xl.font-semibold.mt-1').text().trim();
      const rarity = $el.find('p.text-xs.font-semibold.text-white\\/40').text().trim();
      const status = $el.find('.relative.items-center h1.text-sm.font-medium').text().trim();
      
      // Values and demand
      const valueText = $el.find('.text-2xl.contents').first().text().trim();
      const demandText = $el.find('.text-2xl.contents').last().text().trim();
      
      const value = parseInt(valueText.replace(/,/g, ''), 10) || 0;
      const demand = parseInt(demandText.split('/')[0], 10) || 0;
      
      // Image URL
      const imageUrl = $el.find('img').attr('src').split('?')[0];

      // Check if we already have this fruit
      if (!items.has(name)) {
        items.set(name, {
          name,
          rarity,
          status,
          physicalValue: null,
          physicalDemand: null,
          permanentValue: null,
          permanentDemand: null,
          imageUrl: imageUrl || null
        });
      }

      const item = items.get(name);

      // Determine if this is physical or permanent based on value
      if (value < item.permanentValue || !item.physicalValue) {
        item.physicalValue = value;
        item.physicalDemand = demand;
      } else {
        item.permanentValue = value;
        item.permanentDemand = demand;
      }

      // Update the item in the map
      items.set(name, item);
    });

    res.json({
      items: Array.from(items.values()).filter(item => item.name && item.rarity),
      timestamp: new Date().toISOString(),
      source: "BloxFruitsValues"
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
