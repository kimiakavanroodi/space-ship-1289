const { validateTokenId } = require("../../config/Firebase");
const { createCardSchema } = require("../../models/card/CardValidation");
const CardService = require("../../services/card/CardService");


const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true // remove unknown props
};
 

/**
 * Post a new card for the user
 */
const createCard = async(req, res) => {
    let auth = req.headers.authorization
    let uid = await validateTokenId(auth)

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    const { error, value } = createCardSchema.validate(req.body, options);

    if (error) {

        res.status(400).send(error.message);

    } else {
        const cardHandler = new CardService(req.app.locals.db);
        const card = await cardHandler.addCard(uid, value);

        res.status(200).send({ card : card })
    };
};

const cardRoutes = {
    "createCard": createCard,
}

module.exports = cardRoutes;