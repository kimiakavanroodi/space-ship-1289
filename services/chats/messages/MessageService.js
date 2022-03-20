const { getUserRole, getUserDisplayName } = require("../../../config/Firebase");
const ChatService = require("../ChatService");
const { v4: uuidv4 } = require('uuid');

class MessageService extends ChatService {
    constructor(db, uid, chatId) {
        super()
        this.db = db;
        this.uid = uid;
        this.chatId = chatId;
    };

    /**
     * Create and send a new message by any user
     * @param {string} uid  their identity
     * @param {string} chat_id  chat Id
     * @param {string} message message being sent
     * returns the newly-created message object
     */
    createMessage = async(message) => {
        const role = await getUserRole(this.uid);
        const displayName = await getUserDisplayName(this.uid);

        const messageBody = {
            _id: uuidv4().toString(),
            date_time: new Date().toISOString(),
            sender: {
                role: role,
                uid: this.uid,
                name: displayName
            },
            ...message
        };

        var chatDetails = await this.getChat(this.chatId);
        chatDetails.messages.push(messageBody)

        const updatedChat = await this.updateChat(this.chatId, chatDetails);
        return updatedChat;
    };

    /**
     * 
     * @param {\} messageId 
     */
    deleteMessage = async(messageId) => {};

    /**
     * 
     * @param {*} messageId 
     * @param {*} message 
     */
    updateMessage = async(messageId, message) => {};
};

module.exports = MessageService;