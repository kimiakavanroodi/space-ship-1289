const admin = require("firebase-admin");

/*
    Validate user token to be sure token is up-to-date and real
*/
module.exports.validateTokenId = async(tokenId) => {
    return admin.auth().verifyIdToken(tokenId).then((user) => {
        return user.uid

    }).catch((error) => {
        console.log("Bad token")
        return null;
    })
}

/**
 * Retrieve user role from metadata in firebase auth
 * @param {string} uid 
 * @returns the user role (style-seeker or stylist)
 */
module.exports.getUserRole = async(uid) => {
    return admin.auth().getUser(uid).then((user) => {
        return user.customClaims.role;

    }).catch((error) => {
        console.log("Wrong role")
        return null;
    })
};

/**
 * Get user's display name
 * @param {string} uid 
 * @returns display name of user
 */
module.exports.getUserDisplayName = async(uid) => {
    return admin.auth().getUser(uid).then((user) => {
        return user.displayName;

    }).catch((error) => {
        console.log("Wrong role")
        return null;
    })
  }
