const { async } = require("@firebase/util");
const { ObjectID } = require("mongodb");
const { getUserRole } = require("../../config/Firebase");

class ProfileService {
    constructor(db) {
        this.db = db;
    }

    /**
     * 
     * @param {string} stylist_uid 
     */
    getStylistProfile = async(stylist_uid) => {
        const getStylistProfile = new Promise(async(resolve, reject) => {
            console.log(stylist_uid)
            await this.db.collection('stylist').findOne({ '_id' : stylist_uid }).then((doc) => {
                resolve(doc)
            });
        }).then((doc) => doc);

        return await getStylistProfile;
    };

    /**
     * Checks to see if a user is a stylist
     * @param {string} stylist_uid stylist uid
     * Returns a boolean value 
     */
    isStylist = async(stylist_uid) => {
        const role = await getUserRole(stylist_uid)
        return role === "stylist";
    };

}

module.exports = ProfileService;