const newweight = require('./newweight')
require('dotenv').config()

const express = require('express')
const { Client } = require('@notionhq/client');


const app = express();
app.use(express.json())


const PORT = 3000

app.post('/', (req, res) => {
    console.log("Hit")
    res.send('Hellow World');
})


app.get('/', (req, res) => {
    console.log("Get was hit at least");
    res.send('Get was hit')
})
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

app.use('/newweight', newweight)
