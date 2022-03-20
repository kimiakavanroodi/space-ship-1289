const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app);
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient
var mongo = require('mongodb');

const admin = require("firebase-admin");
var serviceAccount = require("/Users/kimiakavanroodi/Documents/create-x-capstone-backend/match-84338-firebase-adminsdk-pkzko-033fc5925d.json");

const { validateTokenId, getUserRole } = require('./config/Firebase');
const { userAccountSchema, stylistSchema, styleSeekerSchema } = require('./models/UserValidation');
const { matchSchema, createMatchSchema } = require('./models/MatchValidaton');
const ChatService = require('./services/chats/ChatService');
const MatchService = require('./services/matches/MatchService');
const { createMessageSchema } = require('./models/chats/MessageValidation');


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

        const email = value.email;
        const password = value.password;
        const role = value.role;
        const name = value.name;

        admin.auth().createUser({
               email: email,
               emailVerified: false,
               password: password,
               displayName: name,
               disabled: false,
        }).then((user) => {

            admin.auth().setCustomUserClaims(user.uid, { role : role }) // set role in metadata
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
    
    if (uid == null) return;

    const role = await getUserRole(uid)

    if (role != "stylist") return

    const { error, value } = stylistSchema.validate(req.body, options);

    if (error) {

        res.status(400).send({ message : error.message })

    } else {
        const stylistBody = value
        stylistBody._id = uid;
        stylistBody.role = role;

        app.locals.db.collection('stylist').insertOne(stylistBody).then((doc) => {
            res.status(200).send({ profile : stylistBody }) 

        }).catch((error) => {
            res.status(400).send([]) 
        })
    }
})

app.get('/stylist/:id', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) return;

    const paramsId = req.params.id

    app.locals.db.collection('stylist').findOne({'_id' : paramsId.toString() }).then((doc) => {
        res.status(200).send({ profile : doc })
    }).catch((error) => {
        res.status(400).send([]) 
    })
})

app.post('/style-seeker', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) return;

    const role = await getUserRole(uid)

    if (role != "style-seeker") return

    const { error, value } = styleSeekerSchema.validate(req.body, options);

    if (error) {

        res.status(400).send({ message : error.message })

    } else {
        const styleSeeker = value
        styleSeeker._id = uid;
        styleSeeker.role = role;

        app.locals.db.collection('style-seeker').insertOne(styleSeeker).then((doc) => {
            res.status(200).send({ profile : styleSeeker }) 

        }).catch((error) => {
            res.status(400).send({ message : error.message }) 
        })
    }

})

app.get('/style-seeker/:id', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) return;

    const paramsId = req.params.id

    app.locals.db.collection('style-seeker').findOne({'_id' : paramsId.toString() }).then((doc) => {
        res.status(200).send({ profile : doc })
    }).catch((error) => {
        res.status(400).send([]) 
    })
})

/*
 * Grab a bulk set of stylists to display on style-seeker's feed
 */
app.get('/bulk-stylists', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) return;

    const page_token = req.query.page
    const agg = [{ '$skip': Number(page_token) }, { '$limit': 2 }];

     const pagDocuments = new Promise(async(resolve, reject) => {
         const arr = []
         await app.locals.db.collection('stylist').aggregate(agg).forEach((item) => { arr.push(item) }) 
        resolve(arr);
    }).then((items) => items)

    res.status(200).send({ stylists : await pagDocuments , page_token: Number(page_token) + 1 })
})

/*
 * Create a match with user 
 */
 app.post('/matches', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    const role = await getUserRole(uid)

    if (uid == null) {
        res.status(401).send("Bad Token")
        return;
    };

    if (role != "style-seeker") {
        res.status(401).send("You cannot make matches with style-seekers. They have to pick you. :)");
        return;
    };

    const { error, value } = createMatchSchema.validate(req.body, options);

    if (error) {
         res.status(400).send({ message : error.message })
    } else {

        const matchHandler = new MatchService(app.locals.db)
        const matchExists = matchHandler.doesMatchExist(value, value.stylist_uid)

        if (matchExists) {
            res.status(403).send("Match already exists")
        } else {
            matchHandler.createMatch(uid, value).then((match) => {
                if (match) {
                    res.status(200).send({ match : match }) 
                }
            })
        }
    }
})

/*
 * Get matches for style-seeker & stylist 
 */
app.get('/matches', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) return;

    const role = (await getUserRole(uid)).replace(/-/g, '_');
    const formatRole = `${role}_uid`

    const filterObj = {}
    filterObj[formatRole] = uid;
    
    const allMatches = new Promise(async(resolve, reject) => {
        const arr = []
        await app.locals.db.collection('matches').find(filterObj).forEach((item) => { arr.push(item) }) 
       resolve(arr);
    }).then((items) => items)

    res.status(200).send({ matches : await allMatches })
})


/*
 * Approve a match with a style-seeker
 */
app.get('/matches/:id', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) return;

    const matchId = req.params.id
    const role = (await getUserRole(uid)).replace(/-/g, '_');
    const formatRole = `${role}_uid`

    const filterObj = {}
    filterObj[formatRole] = uid;
    filterObj[`_id`] = new mongo.ObjectID(matchId)
    
    const allMatches = new Promise(async(resolve, reject) => {
        const arr = []
        await app.locals.db.collection('matches').find(filterObj).forEach((item) => { arr.push(item) }) 
       resolve(arr);
    }).then((items) => items)

    res.status(200).send({ match : await allMatches })
})

/*
 * Approve a match with a style-seeker
 */
app.post('/matches/:id', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) return;

    const matchId = req.params.id
    const formatRole = `stylist_uid`

    const filterObj = {}
    filterObj[formatRole] = "P1Akn1HELtXtz8tkDxuko1elwFt2";
    filterObj[`_id`] = new mongo.ObjectID(matchId)
    
    var getMatchDetails = new Promise(async(resolve, reject) => {
        return await app.locals.db.collection('matches').findOne(filterObj).then((doc) => resolve(doc)) 
    }).then((items) => items)
    
    var matchDetails = await getMatchDetails;
    matchDetails.approved = true

    const chatService = new ChatService(app.locals.db)

    await app.locals.db.collection('matches').updateOne(filterObj, { $set: matchDetails }, { upsert: false }).then((res) => {
        chatService.createChat(matchDetails.style_seeker_uid, matchDetails.stylist_uid)
    })

    res.status(200).send({ match : matchDetails })

    // create a new chat
})

/**
 * Get specific chat details
 */
app.get('/chats/:id', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) return;

    const chatId = req.params.id
    const role = await getUserRole(uid)

    const chatService = new ChatService(app.locals.db);

    chatService.getChat(chatId, role, uid).then((resp) => {
        res.status(200).send({ chat : resp })
    })

})

/**
 * Get all chat details of a user
 */
 app.get('/chats', async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) return;

    const role = await getUserRole(uid)

    const chatService = new ChatService(app.locals.db);

    chatService.getAllChats(role, uid).then((resp) => {
        res.status(200).send({ chats : resp })
    })
})


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

        const chatService = new ChatService(app.locals.db);

        chatService.createMessage(uid, chatId, value.message).then((resp) => {
            res.status(200).send({ chat : resp })
        })
    }
})




/**
 * DON'T TOUCH THIS PART
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

MongoClient.connect('DB-SECRET', async(err, db) => {
    http.listen(PORT, async() => {

        app.locals.db = db.db('match-it')
        app.locals.admin = admin;

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        console.log(app.locals)

        console.log(`Node.js app is listening at http://localhost:${PORT}`);
    });
})