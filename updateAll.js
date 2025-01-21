require('dotenv').config()
const express = require('express')
const getDietMetrics = require('./newweight')


const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY});

const router = express.Router();



// Takes an object mapping block ids to the values to update to
const updateFields = async (updates, notionEndpoint) => {
    updates.forEach(async (update) => {
        let success = false;
        while (!success) {
            // Wait a second and attempt an uopdate
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                const response = await notionEndpoint(update);
                if (response.status != 409) success = true
            }
            catch (error) {
                if (error.status != 409) throw error
            }
        }
    });
}

const updateRow = async (updates) => {
    await updateFields(updates, notion.pages.update);
}

const databaseRowUpdate = (page_id, value) => {
    return {
        page_id: page_id,
        properties: {
            Value: {
                type: 'number',
                number: value
            },
        },
    };
};

const textBox = (content) => {
    return {
        "type": "text",
        "text": {"content": content}
    }
}

const tableRowUpdate = (block_id, leftSide, RightSide) => {
    return {
        "block_id": block_id,
        "table_row": {
            "cells": [
                [
                    textBox(leftSide)
                ],
                [
                    textBox(RightSide)
                ]
            ]
        }
    }
}

const paragraphBlockUpdate = (block_id, content) => {
    return {
        "block_id": block_id,
        paragraph: {
            "rich_text": [
                {"type": "text", "text": {"content": content}}
            ]
        }
    }
}



const getUpdateWeights = async (dietMetrics) => {

    return ['10', '20', '30'].map((days) => tableRowUpdate(
        block_id=process.env[`NOTION_BLOCK_WEIGHT_TREND_${days}`],
        leftSide=`-Past ${days} Days`,
        RightSide=`${dietMetrics.weightTrend[`${days}day`]}`
    ))
}

const getUpdateMaintenance = async (dietMetrics) => {
    return [
        paragraphBlockUpdate(
            block_id=process.env.NOTION_BLOCK_CALCULATED_MAINTENANCE,
            content=`${dietMetrics.maintenance}`
        )
    ]
}

const getUpdateCalories = async (dietMetrics) => {
    return ['10', '20', '30'].map((days) => tableRowUpdate(
        block_id=process.env[`NOTION_BLOCK_CALORIES_${days}`],
        leftSide=`Past ${days} Days`,
        RightSide=`${dietMetrics.weightTrend[`${days}day`]}`
    ))
};

const getUpdateCurrentWeight = async (dietMetrics) => {
    return [
        paragraphBlockUpdate(
            block_id=process.env.NOTION_BLOCK_CURRENT_WEIGHT,
            content=`📈 Current Weight: ${dietMetrics.currentWeight}`
        )
    ]
}

const updateCalorieGoal = async ()



router.post('/newweight', async (req, res) => {
    const dietMetrics = await getDietMetrics()
});

router.post('/adjustgoals', async(req, res) => {
    console.log(req.body.data.properties)
});



testDietMetrics = {
    maintenance: 2000,
    calorieTrend: {
        '10day': 2300,
        '20day': 2400,
        '30day': 2500
    },
    weightTrend: {
        '10day': -0.45,
        '20day': 1.4,
        '30day': 0.25
    },
    currentWeight: 138
};


const test = async () => {
    const res = [
        ...await getUpdateCalories(testDietMetrics),
        ...await getUpdateMaintenance(testDietMetrics),
        ...await getUpdateWeights(testDietMetrics),
        ...await getUpdateCurrentWeight(testDietMetrics)
    ]

    await updateFields(res)
}

//test()

module.exports.updateAll = router
