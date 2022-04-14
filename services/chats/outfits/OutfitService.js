const ChatService = require("../ChatService");
const { v4: uuidv4 } = require('uuid');

/**
 * Outfit Service that allows stylists create outfits for style-seekers
 * Be able to create, delete, or update outfits
 */
class OutfitService extends ChatService {
    constructor(db, uid, chatId) {
        super()
        this.db = db;
        this.uid = uid;
        this.chatId = chatId;
    };

    /**
     * Creates a new outfit for the style-seeker made by the stylist
     * @param {object} outfit outfit object
     * Returns back an Outfit object
     */
    createOutfit = async(outfit) => {
        // copy over the outfit contents to object and create new id
        const outfitBody = {
            '_id': uuidv4(), 
            'has_paid': false, 
            'date_time': new Date().toISOString(),
            ...outfit
        };

        // get chat details of chat id
        var chatDetails = await this.getChat(this.chatId);

        chatDetails.outfits.push(outfitBody) // push new outfit object

        // update chat details with new chat
        const updatedChat = await this.updateChat(this.chatId, chatDetails);

        return updatedChat;
    };

    /**
     * Pay and see the outfit to give style-seeker fit
     * @param {string} style_seeker_uid uid of style_seeker
     * @returns the updated object of the outfit been seen
     */
    seeOutfit = async(outfitId) => {

        // get outfit details such as rate and stylist id 
        const chat = (await this.getChat(this.chatId));

        chat.outfits.filter((val, idx, arr) => {
            if (val._id === outfitId) {
                val.has_paid = true;
            }
        });

        const updatedChat = await this.updateChat(this.chatId, chat);

        return updatedChat;
    };

     /**
     * Pay and see the outfit to give style-seeker fit
     * @param {string} style_seeker_uid uid of style_seeker
     * @returns the updated object of the outfit been seen
     */
    getAllOutfits = async() => {
        const chat = (await this.getChat(this.chatId));

        return chat;
    };

    /**
     * Delete an outfit using the outfit id
     * @param {string} outfitId 
     * Returns the deleted Outfit object
     */
    deleteOutfit = async(outfitId) => {};

    /**
     *  Update the Outfit object using id and new Outfit object
     * @param {string} outfitId 
     * @param {object} outfit 
     * Return the updated Outfit Object
     */
    updateOutfit = async(outfitId, outfit) => {};

};

module.exports = OutfitService