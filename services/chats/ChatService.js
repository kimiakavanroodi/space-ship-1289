const { crypto } = require("crypto");
const { ObjectID } = require("mongodb");
const { getUserRole, getUserDisplayName } = require("../../config/Firebase");
const { v4: uuidv4 } = require('uuid');
const { async } = require("@firebase/util");

class ChatService {
    constructor(db) { 
        this.db = db 
    }
    /**
     *  gets all chats for any user (style-seeker or stylist)
     * @param {string} role style-seeker or stylist
     * @param {string} uid  their identity
     * @returns an array of all chats for user
     */
    getAllChats = async(role, uid) => {
        const reformatRole = `${role.replace(/-/g, '_')}_uid` // style_seeker_uid or stylist_uid
        const filterBody = {};
        filterBody[reformatRole] = uid
        
        // get all chat details from database
        const getAllChatDetails = new Promise(async(resolve, reject) => {
            const chatArr = []
            await this.db.collection('chats').find(filterBody).forEach((item) => chatArr.push(item)) 
            resolve(chatArr)
        }).then((doc) => doc)

        return await getAllChatDetails;
    }

    /**
     * Create and send a new message by any user
     * @param {string} uid  their identity
     * @param {string} chat_id  chat Id
     * @param {string} message message being sent
     * returns the newly-created message object
     */
    createMessage = async(uid, chat_id, message) => {
        const role = await getUserRole(uid);
        const displayName = await getUserDisplayName(uid);

        const messageBody = {
            _id: uuidv4().toString(),
            date_time: new Date().toISOString(),
            sender: displayName,
            role: role,
            message: message
        };

        var chatDetails = await this.getChat(chat_id, role, uid);
        chatDetails.messages.push(messageBody)

        const updatedChat = await this.updateChat(uid, chat_id, chatDetails);

        return updatedChat;
    };

    /**
     * Update a chat's contents after changing some data
     * @param {string} uid uid of user
     * @param {string} chat_id chat Id
     * @param {string} chat_content updated content of chat
     * Returns the updated version of the chat details
     */
    updateChat = async(uid, chat_id, chat_content) => {
        const role = await getUserRole(uid);
        const reformatRole = `${role.replace(/-/g, '_')}_uid`
        const filterBody = {
            "_id": ObjectID(chat_id),
        };

        filterBody[reformatRole] = uid;

        const updateChat = new Promise(async(resolve, reject) => {
            await this.db.collection('chats').findOneAndUpdate(filterBody, { $set : chat_content }, { upsert: false }).then((doc) => {
                resolve(doc);
            })
        }).then((doc) => doc)

        return await updateChat;
    };

    /**
     * Retrieve the chat for the specific id
     * @param {string} chat_id  pass in chat id
     * @param {string} role style-seeker or stylist
     * @param {string} uid identity of user
     * @returns 
     */
    getChat = async(chat_id, role, uid) => {
        const reformatRole = `${role.replace(/-/g, '_')}_uid`
        const filterBody = {
            "_id": ObjectID(chat_id),
        };

        filterBody[reformatRole] = uid

        const getChatDetails = new Promise((resolve, reject) => {
            this.db.collection('chats').findOne(filterBody).then((doc) => {
                resolve(doc)
            })}).then((doc) => doc)

        return await getChatDetails;
    }


    createChat = async(style_seeker_uid, stylist_uid) => {
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
    
        const createChatDetails = new Promise((resolve, reject) => {
            this.db.collection('chats').insertOne(chatBody).then((doc) => {
                resolve(doc)
            })}).then((doc) => doc)

        return await createChatDetails;
    }

}

module.exports = ChatService
