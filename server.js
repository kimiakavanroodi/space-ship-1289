const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app);
const cors = require('cors');

// var admin = require('firebase-admin');


app.use(express.json());
app.use(cors())
// const MongoClient = require('mongodb').MongoClient
// const config = require('./config/config');

app.get('/test', (req, res) => {
    res.status(200).send("Great!")
})


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const PORT = process.env.PORT || 8080;

http.listen(PORT, () => {
    console.log(`Node.js app is listening at http://localhost:${PORT}`);
});
