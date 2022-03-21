const { getUserRole, getUserDisplayName } = require("../../../config/Firebase");
const ChatService = require("../ChatService");
const { v4: uuidv4 } = require('uuid');

/**
 * Message Service that handles the messages back and forth with style-seekers & stylists
 * Be able to create, delete, or update messages
 */
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

        // create new message object 
        const messageBody = {
            _id: uuidv4().toString(),
            date_time: new Date().toISOString(),
            sender: {
                role: role,
                uid: this.uid,
                name: displayName
            },
            // copy over the message content from the request body
            ...message
        };

        // get the details of the chat
        var chatDetails = await this.getChat(this.chatId);
        chatDetails.messages.push(messageBody) // push new message details

        // update the chat object
        const updatedChat = await this.updateChat(this.chatId, chatDetails);

        return updatedChat;
    };

    /**
     * Delete a message using their id and update the chat
     * @param {string} messageId id of a message
     * Returns the updated chat object
     **/
    deleteMessage = async(message_id) => {
        // get object of the chat
        var chatDetails = await this.getChat(this.chatId);

        // filter all the objects in the array 
        // only add the objects that do not have the messageId
        const updatedMessages = chatDetails.messages.filter((item, idx, arr) => item._id !== message_id)

        chatDetails.messages = updatedMessages;

        // update chat object with the new content
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
         // get chat details of the chat Id
        var chatDetails = await this.getChat(this.chatId)

        // update the message content by filtering and finding messageId & chat content
        const messagesCopy = chatDetails.messages.map((item, idx) => {
            if (item._id === message_id) {
                delete item.message // delete the old message
                return {
                    ...item, // copy attributes over
                    ...chat_content // copy over new message content
                };
            }
            return item
        });

        chatDetails.messages = messagesCopy;

        // update the chat content with the new content
        const updatedChat = await this.updateChat(this.chatId, chatDetails);

        return updatedChat;
    };
};

module.exports = MessageService;