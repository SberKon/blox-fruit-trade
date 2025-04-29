// Vercell Api
const express = require("express");
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get("/api/bloxfruits", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto("https://bloxfruitsvalues.com/legendary", {
      waitUntil: "networkidle0"
    });

    const items = new Map();

    // Get physical values first
    const physicalData = await page.evaluate(() => {
      const fruits = [];
      document.querySelectorAll('.flex.flex-col.w-\\[334px\\]').forEach(el => {
        const name = el.querySelector('h1.text-2xl.font-semibold.mt-1').textContent.trim();
        const rarity = el.querySelector('p.text-xs.font-semibold.text-white\\/40').textContent.trim();
        const status = el.querySelector('.relative.items-center h1.text-sm.font-medium').textContent.trim();
        const valueText = el.querySelector('.text-2xl.contents').textContent.trim();
        const demandText = el.querySelectorAll('.text-2xl.contents')[1].textContent.trim();
        const imageUrl = el.querySelector('img').getAttribute('src').split('?')[0];

        fruits.push({
          name,
          rarity,
          status,
          value: parseInt(valueText.replace(/,/g, ''), 10) || 0,
          demand: parseInt(demandText.split('/')[0], 10) || 0,
          imageUrl
        });
      });
      return fruits;
    });

    // Click all select elements to "Permanent Value"
    await page.evaluate(() => {
      document.querySelectorAll('select').forEach(select => {
        select.value = 'permanent';
        select.dispatchEvent(new Event('change'));
      });
    });

    // Wait for values to update
    await page.waitForTimeout(1000);

    // Get permanent values
    const permanentData = await page.evaluate(() => {
      const fruits = [];
      document.querySelectorAll('.flex.flex-col.w-\\[334px\\]').forEach(el => {
        const name = el.querySelector('h1.text-2xl.font-semibold.mt-1').textContent.trim();
        const valueText = el.querySelector('.text-2xl.contents').textContent.trim();
        const demandText = el.querySelectorAll('.text-2xl.contents')[1].textContent.trim();

        fruits.push({
          name,
          value: parseInt(valueText.replace(/,/g, ''), 10) || 0,
          demand: parseInt(demandText.split('/')[0], 10) || 0,
        });
      });
      return fruits;
    });

    // Combine the data
    physicalData.forEach(fruit => {
      items.set(fruit.name, {
        name: fruit.name,
        rarity: fruit.rarity,
        status: fruit.status,
        physicalValue: fruit.value,
        physicalDemand: fruit.demand,
        permanentValue: null,
        permanentDemand: null,
        imageUrl: fruit.imageUrl
      });
    });

    permanentData.forEach(fruit => {
      const item = items.get(fruit.name);
      if (item) {
        item.permanentValue = fruit.value;
        item.permanentDemand = fruit.demand;
        items.set(fruit.name, item);
      }
    });

    await browser.close();

    res.json({
      items: Array.from(items.values()),
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
