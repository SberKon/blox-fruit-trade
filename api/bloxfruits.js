const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function runScraper() {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(process.cwd(), 'templates', 'scraper.py');
    exec(`python ${pythonPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Scraper error: ${error}`);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

async function getData() {
  try {
    const dataPath = path.join(process.cwd(), 'templates', 'all_fruits.json');
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    if (req.query.refresh !== undefined) {
      // Refresh data by running scraper
      await runScraper();
    }
    
    // Get and return data
    const data = await getData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
};
