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

app.get("/api/bloxfruits", async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'bloxfruits.json');
    const jsonData = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(jsonData);
    
    res.json(data);
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
