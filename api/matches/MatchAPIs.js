const admin = require("firebase-admin");
const { validateTokenId, getUserRole } = require("../../config/Firebase");
const { createMatchSchema } = require("../../models/matches/MatchValidaton");
const MatchService = require("../../services/matches/MatchService");
const ProfileService = require("../../services/profiles/ProfileService");


const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true // remove unknown props
};
 

// Create a match with user endpoint
const createMatch = async(req, res) => {
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
        const matchHandler = new MatchService(req.app.locals.db)
        const profileHandler = new ProfileService(req.app.locals.db)

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
};

// Get matches for style-seeker & stylist endpoint
const getAllMatches = async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) {
        res.status(401).send("Bad Token")
        return;
    };

    const matchHandler = new MatchService(req.app.locals.db);
    const allMatches = await matchHandler.getAllMatches(uid);

    res.status(200).send({ matches : allMatches });
};

// Get Specific Match Id endpoint
const getMatch = async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)

    const matchId = req.params.id

    if (uid == null) {
        res.status(401).send("Bad Token")
        return;
    };

    const matchHandler = new MatchService(req.app.locals.db);
    const match = await matchHandler.getMatch(uid, matchId);

    res.status(200).send({ match : match })
};

// Approve a match with a style-seeker endpoint
const approveMatch = async(req, res) => {
    const auth = req.headers.authorization;
    const uid = await validateTokenId(auth);

    const matchId = req.params.id;
    
    if (uid == null) {
        res.status(401).send("Bad Token")
        return;
    };

    const matchHandler = new MatchService(req.app.locals.db);
    const approvedMatch = await matchHandler.approveMatch(uid, matchId);

    res.status(200).send({ match : await approvedMatch });
};

const matchRoutes = {
    "createMatch": createMatch,
    "getAllMatches": getAllMatches,
    "getMatch": getMatch,
    "approveMatch": approveMatch
};

module.exports = matchRoutes;