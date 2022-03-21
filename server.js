const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app);
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient
const admin = require("firebase-admin");
const { getSecret } = require('./config/SecretManager');

// import all routes here
require('./api/routes')(app);

/**
 * DON'T TOUCH THIS PART
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

// get the secret for the mogoDB connection string from secret manager
getSecret('mongo-db-connection').then((uri) => {
    MongoClient.connect(uri, async(err, db) => {

        // load all secrets to run server
        const serviceAccount = await getSecret("json-secret-service-account");
        const dbName = await getSecret("db-name");

        // set important global variables 
        app.locals.db = db.db(dbName)
        app.locals.admin = admin;
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount))
        });

        // start the server at port 
        http.listen(PORT, async() => {
            console.log(`Node.js app is listening at http://localhost:${PORT}`);
        });
    })
})