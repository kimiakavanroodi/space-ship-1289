const { crypto } = require("crypto");
const { ObjectID } = require("mongodb");
const { getUserRole, getUserDisplayName } = require("../../config/Firebase");
const { v4: uuidv4 } = require('uuid');


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

        const filterBody = {};
        filterBody[reformatRole] = this.uid
        
        // get all chat details from database
        const getAllChatDetails = new Promise(async(resolve, reject) => {
            const chatArr = []
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

        filterBody[reformatRole] = this.uid;

        const updateChat = new Promise(async(resolve, reject) => {
            await this.db.collection('chats').findOneAndUpdate(filterBody, { $set : chat_content }, { returnOriginal: false }).then((doc) => {
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

        const filterBody = { "_id" : ObjectID(chat_id) };
        filterBody[reformatRole] = this.uid

        console.log({'_id': this.uid })

        console.log(filterBody)

        const getChatDetails = new Promise((resolve, reject) => {
            this.db.collection('chats').findOne(filterBody).then((doc) => {
                console.log(doc)
                resolve(doc)
            })}).then((doc) => doc)
        
        console.log(await getChatDetails)

        return await getChatDetails;
    };

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
    };
}

module.exports = ChatService
