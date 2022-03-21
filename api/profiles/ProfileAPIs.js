const { validateTokenId, getUserRole } = require("../../config/Firebase");
const { stylistSchema, styleSeekerSchema, userAccountSchema } = require("../../models/profiles/UserValidation");
const ProfileService = require("../../services/profiles/ProfileService");
const admin = require("firebase-admin");

const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true // remove unknown props
};
 
// create an account
const createAccount = async(req, res) => {
    const { error, value } = userAccountSchema.validate(req.body, options);
    
    if (error) {

        res.status(400).send({ message : "Bad request"  })

    } else {

        console.log(accountBody)

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
};
 
 const createStylistProfile = async(req, res) => {
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
         const profileHandler = new ProfileService(req.app.locals.db)
         const profile = await profileHandler.createStylistProfile(uid, value);
 
         res.status(200).send({ profile : profile })
     }
 };
 
 const getStylistProfile = async(req, res) => {
     const auth = req.headers.authorization;
     const uid = await validateTokenId(auth);
     const stylistId = req.params.id
     
     if (uid == null) {
         res.status(401).send("Bad Token...")
         return;
     };
 
     const profileHandler = new ProfileService(req.app.locals.db);
     const styleProfile = await profileHandler.getStylistProfile(stylistId);
 
     res.status(200).send({ profile : styleProfile });
 };
 
 //
 const createStyleSeekerProfile = async(req, res) => {
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
         const profileHandler = new ProfileService(req.app.locals.db)
         const profile = await profileHandler.createStyleSeekerProfile(uid, value);
 
         res.status(200).send({ profile : profile })
     }
 };
 
/*
*
*/
const getStyleSeekerProfile = async(req, res) => {
     const auth = req.headers.authorization;
     const uid = await validateTokenId(auth);
     const styleSeekerId = req.params.id
     
     if (uid == null) {
         res.status(401).send("Bad Token...")
         return;
     };
 
     const profileHandler = new ProfileService(req.app.locals.db);
     const styleSeekerProfile = await profileHandler.getStyleSeekerProfile(styleSeekerId);
 
     res.status(200).send({ profile : styleSeekerProfile });
 };
 
 /*
  * Grab a bulk set of stylists to display on style-seeker's feed
  */
const getBulkStylists = async(req, res) => {
     const auth = req.headers.authorization
     const uid = await validateTokenId(auth)
     
     if (uid == null) {
         res.status(401).send("Bad Token...")
         return;
     };
 
     const page_token = req.query.page
 
     const profileHandler = new ProfileService(req.app.locals.db);
     const stylists = await profileHandler.getBulkStylists(Number(page_token));
 
     res.status(200).send({ stylists: stylists, page_token: Number(page_token) + 1 })
 };

 const profileRoutes = {
    "createStylistProfile": createStylistProfile,
    "getStylistProfile": getStylistProfile,
    "getBulkStylists": getBulkStylists,
    "getStyleSeekerProfile": getStyleSeekerProfile,
    "createAccount": createAccount,
    "createStyleSeekerProfile": createStyleSeekerProfile
 };

 module.exports = profileRoutes;