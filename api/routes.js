const express = require("express");
const cors = require('cors');
const profileRoutes = require("./profiles/ProfileAPIs");

module.exports = function(app) {
    app.use(express.json());
    app.use(cors())

    // profile routes
    app.post('/stylist', profileRoutes['createStylistProfile'])
    app.get('/stylist/:id', profileRoutes['getStylistProfile'])
    app.get('/bulk-stylists', profileRoutes['getBulkStylists'])
    app.get('/style-seeker/:id', profileRoutes['getStyleSeekerProfile'])
    app.post('/style-seeker', profileRoutes['createStyleSeekerProfile'])

    // create account route
    app.post('/account', profileRoutes.createAccount)

};