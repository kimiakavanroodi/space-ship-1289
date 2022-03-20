const ChatService = require("../ChatService");
const { v4: uuidv4 } = require('uuid');

class OutfitService extends ChatService {
    constructor(db, uid, chatId) {
        super()
        this.db = db;
        this.uid = uid;
        this.chatId = chatId;
    };

    /**
     * Creates a new outfit for the style-seeker made by the stylist
     * @param {object} outfit 
     * Returns back an object type 
     */
    createOutfit = async(outfit) => {
        const outfitBody = {'_id': uuidv4(), ...outfit};

        var chatDetails = await this.getChat(this.chatId);
        chatDetails.outfits.push(outfitBody)

        const updatedChat = await this.updateChat(this.chatId, chatDetails);
        return updatedChat;
    };

    /**
     * 
     * @param {*} outfitId 
     */
    deleteOutfit = async(outfitId) => {};

    /**
     * 
     * @param {*} outfitId 
     * @param {*} outfit 
     */
    updateOutfit = async(outfitId, outfit) => {};

};

module.exports = OutfitService