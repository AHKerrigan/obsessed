require('dotenv').config();

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
        ],
        page_size: nDays
    });
    // We want the oldest date reverse for easier regression
    response.results.reverse()
    return response
}

const getCurrentWeight = async (measurements) => {
    return ss.mean(measurements.map(d => d.weight));
}

const getTrend = async (measurements) => {

    const oldestDate = new Date(measurements[0].date).getTime();
    const x = measurements.map(d => (new Date(d.date).getTime() - oldestDate) / (1000 * 60 * 60 * 24));
    const y = measurements.map(d => d.weight);
    const regression = ss.linearRegression(x.map((_, i) => [x[i], y[i]]));
    return regression.m * 7;
}

const getCaloricAverage = async (measurements) => {
    return ss.mean(measurements.map(d => d.calories));
}

const simplifyMeasurements = async (response) => {
    const measurements = response.results.map((result) => ({
        weight: result.properties.Weight.number,
        calories: result.properties.Calories.number,
        date: result.properties['Date of Measurement'].date.start
    }));
    return measurements;
}

const calculateMaintenance = async (weightTrend, calorieTrend) => {
    return calorieTrend - (500 * weightTrend);
}

const getDietMetrics = async () => {
    response = await getNWeights(30);
    measurements = await simplifyMeasurements(response);
    weightTrend = await getTrend(measurements);
    calorieTrend = await getCaloricAverage(measurements);

    maintenance = await calculateMaintenance(weightTrend, calorieTrend);

    currentWeight = await getCurrentWeight(measurements.slice(-10));
    // Right now just returns the same for 10, 20, 30 day
    return {
        maintenance: maintenance,
        calorieTrend: {
            '10day': calorieTrend,
            '20day': calorieTrend,
            '30day': calorieTrend
        },
        weightTrend: {
            '10day': weightTrend,
            '20day': weightTrend,
            '30day': weightTrend
        },
        currentWeight: currentWeight
    }
};

module.exports = getDietMetrics;
