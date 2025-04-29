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
      
      // Basic info
      const name = $el.find('h1.text-2xl.font-semibold.mt-1').text().trim();
      const rarity = $el.find('p.text-xs.font-semibold.text-white\\/40').text().trim();
      
      // Status (Stable/Unstable/Overpaid/Underpaid)
      const status = $el.find('.relative.items-center h1.text-sm.font-medium').text().trim();
      
      // Physical values
      const valueText = $el.find('.text-2xl.contents').first().text().trim();
      const demandText = $el.find('.text-2xl.contents').last().text().trim();
      
      // Clean up values
      const physicalValue = parseInt(valueText.replace(/,/g, ''), 10) || 0;
      const physicalDemand = parseInt(demandText.split('/')[0], 10) || 0;
      
      // Image URL - keep just the path part
      const imageUrl = $el.find('img').attr('src').split('?')[0];

      const item = {
        name,
        rarity,
        status,
        physicalValue,
        physicalDemand,
        permanentValue: null,  // Will be populated when permanent values are available
        permanentDemand: null, // Will be populated when permanent values are available
        imageUrl: imageUrl || null
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
