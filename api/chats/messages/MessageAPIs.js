const { validateTokenId } = require("../../../config/Firebase");
const { createMessageSchema } = require("../../../models/chats/MessageValidation");
const MessageService = require("../../../services/chats/messages/MessageService");

const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true // remove unknown props
};
 

/**
 * Post a new message in the chat between the two users
 */
const createMessage = async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    const chatId = req.params.id;

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    const { error, value } = createMessageSchema.validate(req.body, options);

    if (error) {

        res.status(400).send(error.message);

    } else {
        const messageHandler = new MessageService(req.app.locals.db, uid, chatId);
        const message = await messageHandler.createMessage(value);

        res.status(200).send({ chat : message })
    };
};

/**
 * Deletes a message in the chat between the two users
 */
 const deleteMessage = async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)

    const chatId = req.params.id;
    const messageId = req.params.mId

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    const messageHandler = new MessageService(req.app.locals.db, uid, chatId);
    const message = await messageHandler.deleteMessage(messageId);

    res.status(200).send({ chat : message })
};

/**
 * Update a message in the chat between the two users
 */
 const updateMessage = async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)

    const chatId = req.params.id;
    const messageId = req.params.mId

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    const { error, value } = createMessageSchema.validate(req.body, options);

    if (error) {

        res.status(400).send(error.message);

    } else {
        const messageHandler = new MessageService(req.app.locals.db, uid, chatId);
        const message = await messageHandler.updateMessage(messageId, value);

        res.status(200).send({ chat : message })
    }
};

const messageRoutes = {
    "createMessage": createMessage,
    "deleteMessage": deleteMessage,
    "updateMessage": updateMessage
}

module.exports = messageRoutes;