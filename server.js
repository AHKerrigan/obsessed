const { updateAll } = require('./updateAll')
require('dotenv').config()

const express = require('express')

const app = express();
app.use(express.json())


const PORT = 3000


app.get('/', (req, res) => {
    console.log("Get was hit at least");
    res.send('Get was hit')
})
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
app.use('/update', updateAll);
