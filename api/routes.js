const express = require("express");
const cors = require('cors');
const profileRoutes = require("./profiles/ProfileAPIs");
const matchRoutes = require("./matches/MatchAPIs");
const chatRoutes = require("./chats/ChatAPIs");
const messageRoutes = require("./chats/messages/MessageAPIs");
const calendarRoutes = require("./chats/calendar/CalendarAPIs");
const outfitRoutes = require("./chats/outfits/OutfitAPIs");
const cardRoutes = require("./card/CardAPIs");

// api routes
module.exports = function(app) {
    app.use(express.json());
    app.use(cors())

    // video chat routes

    // card routes
    app.post('/card', cardRoutes.createCard);

    // chat routes
    app.get('/chats/:id', chatRoutes.getChat);
    app.get('/chats', chatRoutes.getAllChats);

    // chat message routes
    app.post('/chats/:id/message', messageRoutes.createMessage);
    app.delete('/chats/:id/message/:mId', messageRoutes.deleteMessage);
    app.put('/chats/:id/message/:mId', messageRoutes.updateMessage);

    // chat calendar routes
    app.post('/chats/:id/calendar', calendarRoutes.createCalendar);
    app.delete('/chats/:id/calendar/:cId', calendarRoutes.deleteCalendar);
    // app.update

    // chat outfit routes
    app.post('/chats/:id/outfit', outfitRoutes.createOutfit);
    app.post('/chats/:id/outfit/:oId/pay', outfitRoutes.payOutfit);

    // match routes
    app.get('/matches', matchRoutes.getAllMatches)
    app.post('/matches', matchRoutes.createMatch)
    app.get('/matches/:id', matchRoutes.getMatch)
    app.post('/matches/:id', matchRoutes.approveMatch);

    // profile routes
    app.get('/stylist/:id', profileRoutes['getStylistProfile'])
    app.post('/stylist', profileRoutes['createStylistProfile'])
    
    app.get('/style-seeker/:id', profileRoutes['getStyleSeekerProfile'])
    app.post('/style-seeker', profileRoutes['createStyleSeekerProfile'])

    app.get('/bulk-stylists', profileRoutes['getBulkStylists'])

    app.get('/role', profileRoutes['getUserRole'])
    app.get('/new-user', profileRoutes['isNewUser'])

    // create account route
    app.post('/account', profileRoutes.createAccount)

    // TEST APIS (Do not push into prod)
    app.post('/token', profileRoutes.getAccountToken);


};