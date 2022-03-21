const { validateTokenId } = require("../../config/Firebase");
const ChatService = require("../../services/chats/ChatService");

/*
 * Get specific chat details
 */
const getChat = async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) {
        res.status(401).send("Bad Token...");
        return;
    };

    const chatId = req.params.id
    const chatHandler = new ChatService(req.app.locals.db, uid);
    const chat = await chatHandler.getChat(chatId);

    res.status(200).send({ chat : chat });
};

/**
 * Get all chat details of a user
 */
const getAllChats = async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    
    if (uid == null) {
        res.status(401).send("Bad Token...");
        return;
    }

    const chatHandler = new ChatService(req.app.locals.db, uid);
    const chats = await chatHandler.getAllChats();

    res.status(200).send({ chat : chats });
};

const chatRoutes = {
    "getChat": getChat,
    "getAllChats": getAllChats
}

module.exports = chatRoutes