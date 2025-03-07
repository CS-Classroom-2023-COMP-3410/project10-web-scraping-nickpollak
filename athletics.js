const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const URL = 'https://denverpioneers.com/calendar';
const OUTPUT_FILE = path.join(__dirname, 'results/athletic_events.json');

async function scrapeAthleticEvents() {
    try {
        // Fetch the Composite Schedule page
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        // Initialize an array to hold event details
        const events = [];

        // Select and iterate over each event entry
        $('.sidearm-schedule-game').each((index, element) => {
            const duTeam = $(element).find('.sidearm-schedule-game-opponent-name').text().trim() || 'Denver Pioneers';
            const opponent = $(element).find('.sidearm-schedule-game-opponent-text').text().trim();
            const date = $(element).find('.sidearm-schedule-game-date').text().trim();

            // Ensure all necessary details are present
            if (duTeam && opponent && date) {
                events.push({ duTeam, opponent, date });
            }
        });

        // Create the results directory if it doesn't exist
        fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

        // Write the events to the JSON file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ events }, null, 4));

        console.log(`Scraped ${events.length} events and saved to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error scraping DU Athletics site:', error);
    }
}

// Execute the scraper function
scrapeAthleticEvents();
