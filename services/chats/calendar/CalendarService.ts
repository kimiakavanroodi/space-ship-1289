const ChatService = require("../ChatService");
const { v4: uuidv4 } = require('uuid');
const { getUserEmail, getUserDisplayName, getUserRole } = require("../../../config/Firebase");

class CalendarService extends ChatService {
    constructor(db, uid, chatId) {
        super()
        this.db = db;
        this.uid = uid;
        this.chatId = chatId;
    };

    /**
     * Create a calendar invite for the stylist and style-seeker
     * @param {object} calendar refer to Calendar interface
     * @returns the updated chat object
     */
    createCalendar = async(calendar) => {
        const role = await getUserRole(this.uid);
        const displayName = await getUserDisplayName(this.uid);
        const userEmail = await getUserEmail(this.uid);

        const calendarBody = {
            _id: uuidv4().toString(),
            sender: {
                role: role,
                uid: this.uid,
                name: displayName,
                email: userEmail
            },   
            invitee: {
                name: "",
                uid: "",
                role: "",
                email: ""
            }, 
            ...calendar
        };

        var chatDetails = await this.getChat(this.chatId);

        var invitee_role = "stylist"
        if (role === "stylist") invitee_role = "style-seeker"

        const reformatRole = `${invitee_role.replace(/-/g, '_')}_uid`;
        const invitee_uid = chatDetails[reformatRole]

        calendarBody['invitee']['name'] = await getUserDisplayName(invitee_uid);
        calendarBody['invitee']['uid'] = invitee_uid;
        calendarBody['invitee']['role'] = await getUserRole(invitee_uid);
        calendarBody['invitee']['email'] = await getUserEmail(invitee_uid);

        chatDetails.calendar_invites.push(calendarBody)

        const updatedChat = await this.updateChat(this.chatId, chatDetails);
        return updatedChat;
    };

    /**
     * 
     * @param {*} calendarId 
     * @param {*} calendar 
     */
    createGoogleInvite = async(calendarId, calendar) => {};

    /**
     * Delete a calendar invite based on the calendar id
     * @param {*} calendarId id of calendar
     * Returns the updated chat object
     */
    deleteCalendar = async(calendarId) => {
        var chatDetails = await this.getChat(this.chatId)

        const updatedCalendar = chatDetails.messages.filter((item, idx, arr) => item._id !== calendarId)

        chatDetails.calendar_invites = updatedCalendar;

        const updatedChat = await this.updateChat(this.chatId, chatDetails);
        return updatedChat
    };

    /**
     * 
     * @param {*} calendarId 
     * @param {*} calendar 
     */
    updateCalendar = async(calendarId, calendar) => {};

}

module.exports = CalendarService