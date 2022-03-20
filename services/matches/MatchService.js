const { async } = require("@firebase/util");
const { ObjectID } = require("mongodb");


class MatchService {
    constructor(db) {
        this.db = db;
    }

    /**
     * check if a match aleady exists 
     * @param {string} style_seeker_uid uid of style seeker
     * @param {string} stylist_uid uid of stylist
     * return a boolean value (true if its does exist or false if it doesn't exist)
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
     * returns an object of the match created
     */
    createMatch = async(style_seeker_uid, stylist_uid) => {

        const matchBody = {
            style_seeker_uid: style_seeker_uid,
            stylist_uid: stylist_uid,
            approved: false
        }

        const createMatch = new Promise((resolve, reject) => {
            this.db.collection('matches').insertOne(matchBody).then((doc) => {
                resolve(doc)
            })}).then((doc) => doc)

        return await createMatch;
    };

}

module.exports = MatchService