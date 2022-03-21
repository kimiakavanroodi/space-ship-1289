const { crypto } = require("crypto");
const { ObjectID } = require("mongodb");
const { getUserRole, getUserDisplayName } = require("../../config/Firebase");
const { v4: uuidv4 } = require('uuid');

/**
 * Chat Service that allows style-seekers & stylists pass information to each other (outfits, messafes, etc)
 * Be able to delete, update, or create chat items
 */
class ChatService {
    constructor(db, uid) { 
        this.db = db
        this.uid = uid; 
    };
    /**
     *  Get all chats for any user (style-seeker or stylist)
     * @param {string} role style-seeker or stylist
     * @param {string} uid  their identity
     * @returns an array of all chats for user
     **/
    getAllChats = async() => {
        const role = await getUserRole(this.uid)
        const reformatRole = `${role.replace(/-/g, '_')}_uid` // style_seeker_uid or stylist_uid

        // create filter object to search in database based user's uid
        const filterBody = {};
        filterBody[reformatRole] = this.uid
        
        // get all chat details from database
        const getAllChatDetails = new Promise(async(resolve, reject) => {
            const chatArr = []
            // get the chat object
            await this.db.collection('chats').find(filterBody).forEach((item) => chatArr.push(item)) 
            resolve(chatArr)
        }).then((doc) => doc)

        return await getAllChatDetails;
    };

    /**
     * Update a chat's contents after changing some data
     * @param {string} uid uid of user
     * @param {string} chat_id chat Id
     * @param {string} chat_content updated content of chat
     * Returns the updated version of the chat details
     **/
    updateChat = async(chat_id, chat_content) => {
        const role = await getUserRole(this.uid);
        const reformatRole = `${role.replace(/-/g, '_')}_uid`

        const filterBody = {
            "_id": ObjectID(chat_id),
        };

        // create a filter object to search in the database using chat Id and one's uid
        filterBody[reformatRole] = this.uid;

        // update a chat object in the database with the new content 
        const updateChat = new Promise(async(resolve, reject) => {
            await this.db.collection('chats').findOneAndUpdate(filterBody, { $set : chat_content }, {returnDocument: "after"}).then((doc) => {
                // return the updated content
                resolve(doc.value);
            })
        }).then((doc) => doc)

        return await updateChat;
    };

    /**
     * Retrieve the chat for the specific id
     * @param {string} chat_id pass in chat_id
     * @param {string} role style-seeker or stylist
     * @param {string} uid identity of user
     * @returns the specific chat
     **/
    getChat = async(chat_id) => {
        const role = await getUserRole(this.uid);
        const reformatRole = `${role.replace(/-/g, '_')}_uid`

        // create a filter object to search in the database using chatId and uid
        const filterBody = { "_id" : ObjectID(chat_id) };
        filterBody[reformatRole] = this.uid

        // get the specific chat from the database
        const getChatDetails = new Promise((resolve, reject) => {
            this.db.collection('chats').findOne(filterBody).then((doc) => {
                // return the chat object
                resolve(doc)
            })}).then((doc) => doc)
        
        return await getChatDetails;
    };

    /**
     * Create a chat between the style-seeker and stylist
     * @param {string} style_seeker_uid 
     * @param {string} stylist_uid 
     * @returns a newly-created chat object
     */
    createChat = async(style_seeker_uid, stylist_uid) => {

        // create a new chat object with default values
        const chatBody = {
            stylist_uid: stylist_uid,
            style_seeker_uid: style_seeker_uid,
            messages: [],
            calendar_invites: [],
            payment_details: {
                balance: 0,
                is_paid: 0,
            },
            outfits: [],
            video_chats: []
        };
    
        // add it to the database
        const createChatDetails = new Promise((resolve, reject) => {
            this.db.collection('chats').insertOne(chatBody).then((doc) => {
                // return a copy of that new chat object
                resolve(doc)
            })}).then((doc) => doc)

        return await createChatDetails;
    };
}

module.exports = ChatService
