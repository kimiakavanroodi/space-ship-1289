const { ObjectID } = require("mongodb");
const { getUserRole, getUserAge, getUserDisplayName } = require("../../config/Firebase");

/**
 * Profile class to manage all users and user actions, 
 * including style-seekers and stylists related to profile
 **/
class ProfileService {
    constructor(db) {
        this.db = db;
    };

    /**
     * Creates a style-seeker profile after sign up
     * @param {object} profile object of the style seeker profile
     * Returns an object of the style seeker profile that has been added
     **/
     createStyleSeekerProfile = async(uid, profile) => {
        const age = await getUserAge(uid);
        const name = await getUserDisplayName(uid);

        // create a new style seeker object
        const styleSeekerBody = {
            '_id': uid,
            'name': name,
            'role': "style-seeker",
            'age': age,
            ...profile // copy over contents from the request body
        };

        // add a new profile into the database
        const createStyleSeekerProfile = new Promise(async(resolve, reject) => {
            await this.db.collection('style-seeker').insertOne(styleSeekerBody).then((doc) => {
                // return back the style seeker object
                resolve(styleSeekerBody);
            })
        }).then((doc) => doc);

        return await createStyleSeekerProfile;
    };

    /**
     * Get a style-seeker's profile using uid
     * @param {string} stylist_uid uid of stylist
     * Returns an object of the stylist profile
     **/
    getStyleSeekerProfile = async(style_seeker_uid) => {

        // grab the style seeker profile from the database
        const getStyleSeekerProfile = new Promise(async(resolve, reject) => {
            await this.db.collection('style-seeker').findOne({ '_id' : style_seeker_uid }).then((doc) => {
                resolve(doc)
            });
        }).then((doc) => doc);

        return await getStyleSeekerProfile;
    };

    /**
     * Get a stylist's profile using uid
     * @param {string} stylist_uid uid of stylist
     * Returns an object of the stylist profile
     **/
    getStylistProfile = async(stylist_uid) => {
        const getStylistProfile = new Promise(async(resolve, reject) => {
            await this.db.collection('stylist').findOne({ '_id' : stylist_uid }).then((doc) => {
                resolve(doc)
            });
        }).then((doc) => doc);

        return await getStylistProfile;
    };

    /**
     * Creates a stylist profile after sign up
     * @param {object} profile 
     * Returns an object of the stylist profile that has been added
     **/
    createStylistProfile = async(uid, profile) => {
        const age = await getUserAge(uid);
        const name = await getUserDisplayName(uid);

        // create a new stylist object
        const stylistBody = {
            '_id': uid,
            'name': name,
            'role': "stylist",
            'age': age,
            ...profile // copy over contents from the request body
        };

        // add this object into the database 
        const createStylistProfile = new Promise(async(resolve, reject) => {
            await this.db.collection('stylist').insertOne(stylistBody).then((doc) => {
                // return the object
                resolve(stylistBody);
            })
        }).then((doc) => doc);

        return await createStylistProfile;
    };
    /**
     * Get a bulk selection of stylists to show on a style-seeker's feed
     * @param {number} page_token number to get a certain page
     * Returns an array of stylist profile objects
     **/
    getBulkStylists = async(page_token) => {
        // create a query from the database to get a certain page
        const agg = [{ '$skip': Number(page_token) }, { '$limit': 2 } ];
        
        // get the documents from the database
        const pageDocuments = new Promise(async(resolve, reject) => {
            const arr = []
            await this.db.collection('stylist').aggregate(agg).forEach((item) => { arr.push(item) }) 

            // return an array of Stylist objects
           resolve(arr);
        }).then((items) => items)
        
        return await pageDocuments;
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