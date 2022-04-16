const { validateTokenId, getUserRole } = require("../../../config/Firebase");
const { createOutfitSchema } = require("../../../models/chats/outfits/OutfitValidation");
const CardService = require("../../../services/card/CardService");
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
    const role = await getUserRole(uid);
    const chatId = req.params.id;

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    console.log(role)
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

const payOutfit = async(req, res) => {
    let auth = req.headers.authorization
    let uid = await validateTokenId(auth)

    let chatId = req.params.id;
    let outfitId = req.params.oId;

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    }

    const outfitHandler = new OutfitService(req.app.locals.db, uid, chatId);
    const cardHandler = new CardService(req.app.locals.db, uid);

    const allOutfits = await outfitHandler.getAllOutfits();

    let stylist_uid = allOutfits['stylist_uid'];
    let stylist_seeker_uid = allOutfits['style_seeker_uid'];

    let stylist_rate = allOutfits['stylist_rate'];

    const outfit = await outfitHandler.seeOutfit(uid, outfitId);

    res.status(200).send({ outfit : outfit })
};

const outfitRoutes = {
    "createOutfit": createOutfit,
    "payOutfit": payOutfit
}

module.exports = outfitRoutes
