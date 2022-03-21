const { async } = require("@firebase/util");
const { Console } = require("console");
const { ObjectID } = require("mongodb");
const { getUserRole } = require("../../config/Firebase");
const ChatService = require("../chats/ChatService");

/*
 * Match Service where stylists and style-seekers interact & make matches!
 */
class MatchService {
    constructor(db) {
        this.db = db;
    };
    /**
     * Check if a match aleady exists 
     * @param {string} style_seeker_uid uid of style seeker
     * @param {string} stylist_uid uid of stylist
     * Return a boolean value (true if its does exist) or (false if it doesn't exist)
     */
    doesMatchExist = async(style_seeker_uid, stylist_uid) => {
        const filterBody = { "style_seeker_uid": style_seeker_uid, "stylist_uid": stylist_uid };

        const getMatchDetails = new Promise(async(resolve, reject) => {
            if ((await this.db.collection('matches').findOne(filterBody)) == null) {
                resolve(false)
            } else {
                resolve(true)
            }
        }).then((match) => match)

        return await getMatchDetails;
    };
    /**
     * Creates a match for the style seeker and stylist
     * @param {string} style_seeker_uid uid of style-seeker
     * @param {string} stylist_uid uid of stylist
     * Returns an object of the match that was created
     **/
    createMatch = async(style_seeker_uid, stylist_uid) => {
        const matchBody = {
            style_seeker_uid: style_seeker_uid,
            stylist_uid: stylist_uid,
            approved: false
        };

        new Promise((resolve, reject) => {
            this.db.collection('matches').insertOne(matchBody).then((doc) => {
                resolve(doc)
        })}).then((doc) => doc)

        return matchBody;
    };
    /**
     * Gets matches between style seekers and stylists
     * @param {string} uid uid of the user (style-seeker or stylist)
     * Returns an array of Match objects
     **/
     getAllMatches = async(uid) => {
        const role = (await getUserRole(uid)).replace(/-/g, '_');
        const formatRole = `${role}_uid`

        const filterObj = {}
        filterObj[formatRole] = uid;

        const allMatches = new Promise(async(resolve, reject) => {
            const arr = []
            await this.db.collection('matches').find(filterObj).forEach((item) => { arr.push(item) }) 
           resolve(arr);
        }).then((items) => items)

        return await allMatches;
    };

    /**
     * Get a specific match between style-seeker and stylist
     * @param {string} uid enter in user's uid
     * @param {string} matchId enter in uid of match
     * Returns a Match object
     */
    getMatch = async(uid, matchId) => {
        const role = (await getUserRole(uid)).replace(/-/g, '_');
        const formatRole = `${role}_uid`
    
        const filterObj = {}
        filterObj[formatRole] = uid;
        filterObj[`_id`] = ObjectID(matchId)
        
        const allMatches = new Promise(async(resolve, reject) => {
            const arr = []
            await this.db.collection('matches').find(filterObj).forEach((item) => { arr.push(item) }) 
           resolve(arr);
        }).then((items) => items)

        return await allMatches;
    };

    /**
     * Approve a match with style-seee
     * @param {string} uid 
     * @param {string} matchId 
     * @returns 
     */
    approveMatch = async(uid, matchId) => {
        const match = (await this.getMatch(uid, matchId))[0];
        const chatHandler = new ChatService(this.db, uid)

        const formatRole = `stylist_uid`

        const filterObj = {}
        filterObj[formatRole] = uid;
        filterObj[`_id`] = ObjectID(matchId)
        
        if (match.approved) {
            return  { message : "This match was already approved!" };
        } else {
            match.approved = true;

            const updateMatch = new Promise(async(resolve, reject) => {
                await this.db.collection('matches').updateOne(filterObj, { $set: match }, { upsert: false }).then((res) => {
                    chatHandler.createChat(match.style_seeker_uid, match.stylist_uid)
                    resolve(match)
                })
            }).then((doc) => doc);
            
            return await updateMatch;
        }
    };

}

module.exports = MatchService