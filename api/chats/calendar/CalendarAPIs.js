
const { validateTokenId } = require("../../../config/Firebase");
const { createCalendarInvite } = require("../../../models/chats/calendar/CalendarValidation");
const CalendarService = require("../../../services/chats/calendar/CalendarService");


const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true // remove unknown props
};

/**
 * Create a new calendar in the chat between the two users
 */
const createCalendar = async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)
    const chatId = req.params.id;

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    const { error, value } = createCalendarInvite.validate(req.body, options);

    if (error) {
        res.status(400).send(error.message);

    } else {
        let io = req.app.get('socketio')

        const calendarHandler = new CalendarService(req.app.locals.db, uid, chatId);
        const calendar = await calendarHandler.createCalendar(value);
        
        io.in(`chats-${chatId}`).emit("UPDATE_CHAT", calendar);

        res.status(200).send({ chat : calendar });
    };
};

/**
 * Delete a calendar invite endpoint
 */
const deleteCalendar = async(req, res) => {
    const auth = req.headers.authorization
    const uid = await validateTokenId(auth)

    const chatId = req.params.id;
    const calendarId = req.params.cId;

    if (uid == null) {
        res.status(401).send("Bad token");
        return;
    };

    let io = req.app.get('socketio')

    const calendarHandler = new CalendarService(req.app.locals.db, uid, chatId);
    const calendar = await calendarHandler.deleteCalendar(calendarId);
        
    io.in(`chats-${chatId}`).emit("UPDATE_CHAT", calendar);

    res.status(200).send({ chat : calendar });
};

// update a calendar object endpoint
const updateCalendar = async(req, res) => {};

const calendarRoutes = {
    "createCalendar": createCalendar,
    "deleteCalendar": deleteCalendar,
    "updateCalendar": updateCalendar
}

module.exports = calendarRoutes;