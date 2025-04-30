# Contents of /bloxfruits-api/bloxfruits-api/README.md

# Blox Fruits API

This project provides an API to access information about fruits from the game Blox Fruits. It utilizes web scraping to gather data and serves it through a RESTful API.

## Project Structure

- `api/index.py`: Entry point for the API, defining endpoints and handling requests.
- `templates/scraper.py`: Contains the web scraping logic using Selenium to gather fruit data.
- `data/all_fruits.json`: Stores the scraped fruit data in JSON format for API responses.
- `requirements.txt`: Lists the dependencies required for the project.
- `vercel.json`: Configuration settings for deploying the project on Vercel.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd bloxfruits-api
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the API:
   ```
   python api/index.py
   ```

## Usage

Once the API is running, you can access the endpoints to retrieve information about the fruits. The API will respond with data in JSON format.

## License

This project is licensed under the MIT License.