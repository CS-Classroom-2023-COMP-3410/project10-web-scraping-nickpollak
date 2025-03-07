const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeCourses() {
    try {
        const url = 'https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext';
        
        // Fetch the page content
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const courses = [];

        $('.courseblock').each((_, element) => {
            const courseTitle = $(element).find('.courseblocktitle').text().trim();
            const courseDesc = $(element).find('.courseblockdesc').text().trim();

            console.log("Found Course Title:", courseTitle); // Debugging

            // Extract course number (e.g., COMP-3001)
            const match = courseTitle.match(/(COMP[-\s]?\d{4})/);
            if (match) {
            // Extract digits only (removes "COMP-", "COMP ", etc.)
                const courseNumber = parseInt(match[0].replace(/\D/g, ''), 10);
                console.log('CRN: ' + courseNumber);
            
                // Filter: Only COMP-3000+ without "prerequisite" in description
                if (courseNumber >= 3000 && !/prerequisite/i.test(courseDesc)) {
                    courses.push({
                        course: match[0],
                        title: courseTitle.replace(match[0], '').trim()
                    });
                }
            }
        });

        // Debugging: Check if courses are found
        if (courses.length === 0) {
            console.log("No courses found. The page structure might have changed.");
        } else {
            console.log(`Found ${courses.length} courses.`);
        }

        // Save results to JSON
        const outputFile = path.join(__dirname, 'results', 'bulletin.json');
        if (!fs.existsSync(path.dirname(outputFile))) {
            fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        }
        fs.writeFileSync(outputFile, JSON.stringify({ courses }, null, 4), 'utf8');

        console.log(`Saved to ${outputFile}`);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

scrapeCourses();
