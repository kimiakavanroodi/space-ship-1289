const ChatService = require("../ChatService");
const { v4: uuidv4 } = require('uuid');
const { getUserEmail, getUserDisplayName, getUserRole } = require("../../../config/Firebase");

/**
 * Calendar Service that handles calendar invites between style-seekers & stylists 
 * Be able to create, delete, or update calendar invites
 */
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

        // create a new calendar object & add new details
        const calendarBody = {
            _id: uuidv4().toString(), // generate a unique id
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
            ...calendar // copy calendar content from request body over
        };

        // get chat details based on chat Id
        var chatDetails = await this.getChat(this.chatId);

        // get details of the recepient for the calendar object
        var invitee_role = "stylist"
        if (role === "stylist") invitee_role = "style-seeker"

        const reformatRole = `${invitee_role.replace(/-/g, '_')}_uid`;
        const invitee_uid = chatDetails[reformatRole]

        // update values in the calendar object
        calendarBody['invitee']['name'] = await getUserDisplayName(invitee_uid);
        calendarBody['invitee']['uid'] = invitee_uid;
        calendarBody['invitee']['role'] = await getUserRole(invitee_uid);
        calendarBody['invitee']['email'] = await getUserEmail(invitee_uid);

        chatDetails.calendar_invites.push(calendarBody)

        // create new Google invite based on information
        this.createGoogleInvite(calendar);

        // update the chat object in the database 
        const updatedChat = await this.updateChat(this.chatId, chatDetails);

        return updatedChat;
    };


    /**
     * Create a Google invite for the invitee and sender
     * @param {string} calendarId enter in id of calendar
     * @param {object} calendar calendar object
     * Returns a clendar object
     */
    createGoogleInvite = async(calendar) => {};

    /**
     * Delete a calendar invite based on the calendar id
     * @param {*} calendarId id of calendar
     * Returns the updated chat object
     */
    deleteCalendar = async(calendarId) => {
        var chatDetails = await this.getChat(this.chatId) // grab chat details

        // remove the calendar item in the array based on id and filtering
        const updatedCalendar = chatDetails.calendar_invites.filter((item, idx, arr) => item._id !== calendarId)

        // change the shape of the object
        chatDetails.calendar_invites = updatedCalendar;

        // update the chat again with the new object
        const updatedChat = await this.updateChat(this.chatId, chatDetails);

        return updatedChat
    };

    /**
     * Update the calendar object using the calendar Id and new content
     * @param {string} calendarId 
     * @param {object} calendar 
     */
    updateCalendar = async(calendarId, calendar) => {};

    
}

module.exports = CalendarService