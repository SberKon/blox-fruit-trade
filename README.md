# README.md

# Blox Fruits Web

This project is a web application that displays information about various fruits and their values scraped from specific URLs. The data is collected using a Python script and presented on a simple HTML page.

## Project Structure

```
blox-fruits-web
├── data
│   └── all_fruits.json          # JSON data scraped from the specified URLs
├── public
│   ├── index.html               # Main HTML file for the website
│   ├── styles
│   │   └── main.css             # CSS styles for the website
│   └── scripts
│       └── main.js              # JavaScript code to fetch and display data
├── scripts
│   └── scraper.py               # Python script for scraping fruit data
├── requirements.txt             # Python dependencies for the scraper
└── README.md                    # Project documentation
```

## Getting Started

To run this project, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd blox-fruits-web
   ```

2. **Install Python dependencies:**
   Make sure you have Python installed, then run:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the scraper:**
   Execute the scraper to fetch the latest fruit data:
   ```bash
   python scripts/scraper.py
   ```

4. **Open the website:**
   Open `public/index.html` in your web browser to view the information.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.