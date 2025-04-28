const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/fruits', async (req, res) => {
  try {
    const { data } = await axios.get('https://fruityblox.com/blox-fruits-value-list');
    const $ = cheerio.load(data);

    const fruitsList = $('.mb-4 > div.space-y-2')
      .map((_, element) => $(element).text().trim())
      .get();

    res.json({
      success: true,
      data: fruitsList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fruit values'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
