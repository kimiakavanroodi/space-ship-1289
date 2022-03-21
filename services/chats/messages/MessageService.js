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
     **/
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
     * Delete a message using their id and update the chat
     * @param {string} messageId id of a message
     * Returns the updated chat object
     **/
    deleteMessage = async(message_id) => {
        var chatDetails = await this.getChat(this.chatId)

        const updatedMessages = chatDetails.messages.filter((item, idx, arr) => item._id !== message_id)

        chatDetails.messages = updatedMessages;

        const updatedChat = await this.updateChat(this.chatId, chatDetails);
        return updatedChat
    };

    /**
     * Update a message using their id and updated message 
     * @param {string} messageId id of message
     * @param {object} message message object {"message": string }
     * Returns the updated chat object
     **/
     updateMessage = async(message_id, chat_content) => {
        var chatDetails = await this.getChat(this.chatId)

        const messagesCopy = chatDetails.messages.map((item, idx) => {
            if (item._id === message_id) {
                delete item.message
                return {
                    ...item,
                    ...chat_content
                };
            }
            return item
        });

        chatDetails.messages = messagesCopy;
        const updatedChat = await this.updateChat(this.chatId, chatDetails);

        return updatedChat;
    };

};

module.exports = MessageService;