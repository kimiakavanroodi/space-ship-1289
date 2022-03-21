const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app);
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient
var mongo = require('mongodb');

const admin = require("firebase-admin");

const { validateTokenId, getUserRole, getUserAge, getUserDisplayName } = require('./config/Firebase');
const { userAccountSchema, stylistSchema, styleSeekerSchema } = require('./models/profiles/UserValidation');
const { matchSchema, createMatchSchema } = require('./models/matches/MatchValidaton');
const ChatService = require('./services/chats/ChatService');
const MatchService = require('./services/matches/MatchService');
const { createMessageSchema } = require('./models/chats/MessageValidation');
const ProfileService = require('./services/profiles/ProfileService');
const MessageService = require('./services/chats/messages/MessageService');
const { createCalendarInvite } = require('./models/chats/calendar/CalendarValidation');
const CalendarService = require('./services/chats/calendar/CalendarService.ts');
const { createOutfit } = require('./models/chats/outfits/OutfitValidation');
const OutfitService = require('./services/chats/outfits/OutfitService');
const { getSecret } = require('./config/SecretManager');


const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true // remove unknown props
};

/**
 * Global variables to use around folder 
 */

app.use(express.json());
app.use(cors())


app.post('/account', async(req, res) => {

    const { error, value } = userAccountSchema.validate(req.body, options);
    
    if (error) {

        res.status(400).send({ message : "Bad request"  })

    } else {

        const accountBody = {
            email: value.email,
            password: value.password,
            displayName: value.name
        };

        admin.auth().createUser(accountBody).then((user) => {

            admin.auth().setCustomUserClaims(user.uid, { role : value.role }) // set role in metadata
            admin.auth().setCustomUserClaims(user.uid, { age : value.age }) // set role in metadata
            admin.auth().setCustomUserClaims(user.uid, { onboarding : false }) // has not completed onboarding

            res.status(200).send({ message : "Success!" })
         }).catch((error) => {

            res.status(400).send({ message : error.message})
         })
    }
})

app.post('/stylist', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    const role = await getUserRole(uid)

    if (uid == null) {
        res.status(401).send("Bad Token...");
        return;
    };

    if (role != "stylist") {
        res.status(403).send("You are not registered as a stylist.")
        return;
    };

    const { error, value } = stylistSchema.validate(req.body, options);

    if (error) {
        res.status(400).send({ message : error.message })
    } else {
        const profileHandler = new ProfileService(app.locals.db)
        const profile = await profileHandler.createStylistProfile(uid, value);

        res.status(200).send({ profile : profile })
    }
})

app.get('/stylist/:id', async(req, res) => {
    const auth = req.headers.authorization;
    const uid = await validateTokenId(auth);
    const stylistId = req.params.id
    
    if (uid == null) {
        res.status(401).send("Bad Token...")
        return;
    };

    const profileHandler = new ProfileService(app.locals.db);
    const styleProfile = await profileHandler.getStylistProfile(stylistId);

    res.status(200).send({ profile : styleProfile });
})

app.post('/style-seeker', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth);
    const role = await getUserRole(uid);
    
    if (uid == null) {
        res.status(401).send("Bad Token...");
        return;
    }

    if (role != "style-seeker") {
        res.status(403).send("You are not registered as a style seeker.")
        return;
    }

    const { error, value } = styleSeekerSchema.validate(req.body, options);

    if (error) {

        res.status(400).send({ message : error.message })

    } else {
        const profileHandler = new ProfileService(app.locals.db)
        const profile = await profileHandler.createStyleSeekerProfile(uid, value);

        res.status(200).send({ profile : profile })
    }
})

app.get('/style-seeker/:id', async(req, res) => {
    const auth = req.headers.authorization;
    const uid = await validateTokenId(auth);
    const styleSeekerId = req.params.id
    
    if (uid == null) {
        res.status(401).send("Bad Token...")
        return;
    };

    const profileHandler = new ProfileService(app.locals.db);
    const styleSeekerProfile = await profileHandler.getStyleSeekerProfile(styleSeekerId);

    res.status(200).send({ profile : styleSeekerProfile });
})

/*
 * Grab a bulk set of stylists to display on style-seeker's feed
 */
app.get('/bulk-stylists', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) {
        res.status(401).send("Bad Token...")
        return;
    };

    const page_token = req.query.page

    const profileHandler = new ProfileService(app.locals.db);
    const stylists = await profileHandler.getBulkStylists(Number(page_token));

    res.status(200).send({ stylists: stylists, page_token: Number(page_token) })
})

/*
 * Create a match with user 
 */
 app.post('/matches', async(req, res) => {
    const auth = req.headers.authorization;
    const uid = await validateTokenId(auth);
    const role = await getUserRole(uid);

    if (uid == null) {
        res.status(401).send("Bad Token")
        return;
    };

    if (role != "style-seeker") {
        res.status(401).send("You cannot make matches with style-seekers. They have to pick you. :)");
        return;
    };

    const { error , value } = createMatchSchema.validate(req.body, options);

    if (error) {
         res.status(400).send({ message : error.message })
    } else {
        const matchHandler = new MatchService(app.locals.db)
        const profileHandler = new ProfileService(app.locals.db)

        const matchExists = await matchHandler.doesMatchExist(uid, value.stylist_uid)
        const isStylist = await profileHandler.isStylist(value.stylist_uid);

        if (isStylist) {
            if (matchExists) {
                res.status(403).send("Match already exists");

            } else {
                const match = await matchHandler.createMatch(uid, value.stylist_uid);
                res.status(200).send({ match : match });
            }
        } else {
            res.status(403).send("This user is not a stylist")
        }
    }
})

/*
 * Get matches for style-seeker & stylist 
 */
app.get('/matches', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) {
        res.status(401).send("Bad Token")
        return;
    };

    const matchHandler = new MatchService(app.locals.db);
    const allMatches = await matchHandler.getAllMatches(uid);

    res.status(200).send({ matches : allMatches });
})

/*
 * Get Specific Match Id
 */
app.get('/matches/:id', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)

    const matchId = req.params.id

    if (uid == null) {
        res.status(401).send("Bad Token")
        return;
    };

    const matchHandler = new MatchService(app.locals.db);
    const match = await matchHandler.getMatch(uid, matchId);

    res.status(200).send({ match : match })
})

/*
 * Approve a match with a style-seeker
 */
app.post('/matches/:id', async(req, res) => {
    const auth = req.headers.authorization;
    const uid = await validateTokenId(auth);

    const matchId = req.params.id;
    
    if (uid == null) {
        res.status(401).send("Bad Token")
        return;
    };

    const matchHandler = new MatchService(app.locals.db);
    const approvedMatch = await matchHandler.approveMatch(uid, matchId);

    console.log(approvedMatch)

    res.status(200).send({ match : await approvedMatch });
})

/*
 * Get specific chat details
 */
app.get('/chats/:id', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) {
        res.status(401).send("Bad Token...");
        return;
    };

    const chatId = req.params.id
    const chatHandler = new ChatService(app.locals.db, uid);

    chatHandler.getChat(chatId).then((resp) => {
        res.status(200).send({ chat : resp })
    })
});

/**
 * Get all chat details of a user
 */
 app.get('/chats', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) {
        res.status(401).send("Bad Token...");
        return;
    }

    const chatHandler = new ChatService(app.locals.db, uid);

    chatHandler.getAllChats().then((resp) => {
        res.status(200).send({ chats : resp })
    });
});

/**
 * Post a new message in the chat between the two users
 */
 app.post('/chats/:id/message', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    const chatId = req.params.id;

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    const { error, value } = createMessageSchema.validate(req.body, options);

    if (error) {

        res.status(400).send(error.message);

    } else {
        const messageHandler = new MessageService(app.locals.db, uid, chatId);

        messageHandler.createMessage(value).then((resp) => {
            res.status(200).send({ chat : resp })
        });
    };
})

/**
 * Post a new message in the chat between the two users
 */
 app.delete('/chats/:id/message/:mId', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)

    const chatId = req.params.id;
    const messageId = req.params.mId

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    const messageHandler = new MessageService(app.locals.db, uid, chatId);

    messageHandler.deleteMessage(messageId).then((resp) => {
        res.status(200).send({ chat : resp })
    });
})

/**
 * Update a message in the chat between the two users
 */
 app.put('/chats/:id/message/:mId', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)

    const chatId = req.params.id;
    const messageId = req.params.mId

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    const { error, value } = createMessageSchema.validate(req.body, options);

    if (error) {

        res.status(400).send(error.message);

    } else {
        const messageHandler = new MessageService(app.locals.db, uid, chatId);

        messageHandler.updateMessage(messageId, value).then((resp) => {
            res.status(200).send({ chat : resp })
        });
    }
})

/**
 * Post a new outfit in the chat between stylist and style-seeker
 */
 app.post('/chats/:id/outfit', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    const role = await getUserRole(auth);
    const chatId = req.params.id;

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    if (role !== "stylist") {
        res.status(403).send("You cannot make outfits.")
        return;
    };

    const { error, value } = createOutfit.validate(req.body, options);

    if (error) {

        res.status(400).send(error.message);

    } else {
        const outfitHandler = new OutfitService(app.locals.db, uid, chatId);

        outfitHandler.createOutfit(value).then((resp) => {
            res.status(200).send({ outfit : resp })
        });
    };
})


/**
 * Post a new message in the chat between the two users
 */
 app.post('/chats/:id/calendar', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    const chatId = req.params.id;

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    const { error, value } = createCalendarInvite.validate(req.body, options);

    if (error) {

        res.status(400).send(error.message);

    } else {
        const calendarHandler = new CalendarService(app.locals.db, uid, chatId);

        calendarHandler.createCalendar(value).then((resp) => {
            res.status(200).send({ calendar : resp })
        });
    };
})


/**
 * Delete a calendar invite endpoint
 */
 app.delete('/chats/:id/calendar/:cId', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)

    const chatId = req.params.id;
    const calendarId = req.params.cId;

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    const calendarHandler = new CalendarService(app.locals.db, uid, chatId);

    calendarHandler.deleteCalendar(calendarId).then((resp) => {
        res.status(200).send({ chat : resp })
    });
})


/**
 * DON'T TOUCH THIS PART
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

getSecret('mongo-db-connection').then((uri) => {
    MongoClient.connect(uri, async(err, db) => {

        const serviceAccount = await getSecret("json-secret-service-account");

        app.locals.db = db.db('match-it')
        app.locals.admin = admin;

        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount))
        });

        http.listen(PORT, async() => {
            console.log(`Node.js app is listening at http://localhost:${PORT}`);
        });
    })
})