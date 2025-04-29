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
    const items = [];

    $('.flex.flex-col.w-\\[334px\\]').each((i, element) => {
      const $el = $(element);
      
      // Get fruit name
      const name = $el.find('h1.text-2xl.font-semibold.mt-1').text().trim();
      
      // Get rarity
      const rarity = $el.find('p.text-xs.font-semibold.text-white\\/40').text().trim();
      
      // Get stability status
      const statusText = $el.find('.relative.items-center h1.text-sm.font-medium').text().trim();
      const statusColor = $el.find('.relative.items-center h1.text-sm.font-medium').css('color');
      
      // Get value and demand
      const valueText = $el.find('.text-2xl.contents').first().text().trim().replace(/,/g, '');
      const demandText = $el.find('.text-2xl.contents').last().text().trim();
      
      const value = parseInt(valueText, 10);
      const demand = parseInt(demandText.split('/')[0], 10);

      // Create item object
      const item = {
        name,
        rarity,
        status: statusText,
        physicalValue: value,
        physicalDemand: demand,
        permanentValue: null,  // Will be populated when available
        permanentDemand: null, // Will be populated when available
        imageUrl: $el.find('img').attr('src')
      };

      items.push(item);
    });

    res.json({
      items: items.filter(item => item.name && item.rarity),
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
