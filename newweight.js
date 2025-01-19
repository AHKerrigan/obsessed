const express = require('express')
const ss = require('simple-statistics');
const router = express.Router()

const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY});

const getAllWeight = async () => {
    const response = await notion.databases.query({
        database_id: process.env.NOTION_WEIGHT_DATABASE
    });
    return response.results
}


const getNWeights = async (nDays) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - nDays);
    const response = await notion.databases.query({
        database_id: process.env.NOTION_WEIGHT_DATABASE,
        filter: {
            property: "Date of Measurement",
            date: {
                after: pastDate.toISOString()
            }
        },
        sorts: [
            {
                property: "Date of Measurement",
                direction: "descending"
            }
        ]
    });
    return response
}

const getAverage = async (measurements) => {
    return 0
}

const getAverages = async (measurements) => {
    return 0
}

const getTrend = async (measurements) => {
    const startDate = new Date(measurements[0].date).getTime();
    const x = measurements.map(d => (new Date(d.date).getTime() - startDate) / (1000 * 60 * 60 * 24));
    const y = measurements.map(d => d.weight);

    const regression = ss.linearRegression(x.map((_, i) => [x[i], y[i]]));

    return regression.m;
}

const simplifyMeasurements = async (response) => {
    const measurements = response.results.map((result) => {
        weight: result.properties.Weight.number;
        calories: result.properties.Calories.number;
        date: result.properties['Date of Measurements'].date.start
    });
    return measurements;
}

router.post('/', async (req, res) => {

    const weights = await getAllWeight();
    response = await getNWeights(30);
    measurements = await simplifyMeasurements(response);
    console.log(measurements);
});

router.get('/', async (req, res) => {
    console.log("get endpoint hit");
})

module.exports = router;
