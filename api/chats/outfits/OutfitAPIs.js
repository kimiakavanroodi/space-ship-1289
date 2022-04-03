const { validateTokenId, getUserRole } = require("../../../config/Firebase");
const { createOutfitSchema } = require("../../../models/chats/outfits/OutfitValidation");
const OutfitService = require("../../../services/chats/outfits/OutfitService");

const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true // remove unknown props
};

/**
 * Post a new outfit in the chat between stylist and style-seeker endpoint
 */
const createOutfit = async(req, res) => {
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

    const { error, value } = createOutfitSchema.validate(req.body, options);

    if (error) {
        res.status(400).send(error.message);

    } else {
        let io = req.app.get('socketio')

        const outfitHandler = new OutfitService(req.app.locals.db, uid, chatId);
        const outfit = await outfitHandler.createOutfit(value);

        io.in(`chats-${chatId}`).emit("UPDATE_CHAT", outfit);

        res.status(200).send({ chat : outfit })
    };
};

const outfitRoutes = {
    "createOutfit": createOutfit,
}

module.exports = outfitRoutes
