const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");

const BASE_URL = "https://www.du.edu/calendar";
const RESULTS_FILE = "results/calendar_events.json";

// Generate all month URLs for 2025
const getMonthUrls = () => {
    let urls = [];
    for (let month = 1; month <= 12; month++) {
        let start = `2025-${String(month).padStart(2, "0")}-01`;
        let end = `2025-${String(month + 1).padStart(2, "0")}-01`;
        if (month === 12) end = "2026-01-01"; // Special case for December
        urls.push(`${BASE_URL}?start_date=${start}&end_date=${end}`);
    }
    return urls;
};

// Scrape events from a given URL
const scrapeEvents = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        let events = [];

        $(".event-card").each((_, el) => {
            const title = $(el).find("h3").text().trim();
            const date = $(el).find("p").first().text().trim();
            const time = $(el).find(".icon-du-clock").parent().text().trim();
            const eventPage = $(el).attr("href");

            events.push({ title, date, time: time || undefined, url: eventPage });
        });

        return events;
    } catch (error) {
        console.error(`Failed to scrape ${url}:`, error.message);
        return [];
    }
};

// Scrape all months and save data
const scrapeAllEvents = async () => {
    let allEvents = [];
    const urls = getMonthUrls();

    console.log(`Scraping ${urls.length} months of events...`);

    for (const url of urls) {
        console.log(`Scraping: ${url}`);
        const events = await scrapeEvents(url);
        allEvents.push(...events);
    }

    // Save to JSON file
    fs.outputJsonSync(RESULTS_FILE, { events: allEvents }, { spaces: 2 });
    console.log(`Scraping complete! Results saved to ${RESULTS_FILE}`);
};

// Run the scraper
scrapeAllEvents();