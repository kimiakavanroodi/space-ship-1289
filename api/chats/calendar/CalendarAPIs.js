const { validateTokenId } = require("../../../config/Firebase");
const { createCalendarInvite } = require("../../../models/chats/calendar/CalendarValidation");

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
        const calendarHandler = new CalendarService(req.app.locals.db, uid, chatId);
        const calendar = await calendarHandler.createCalendar(value);
        
        res.status(200).send({ calendar : calendar });
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

    const calendarHandler = new CalendarService(req.app.locals.db, uid, chatId);
    const calendar = await calendarHandler.deleteCalendar(calendarId);
        
    res.status(200).send({ calendar : calendar });
};

// update a calendar object endpoint
const updateCalendar = async(req, res) => {};

const calendarRoutes = {
    "createCalendar": createCalendar,
    "deleteCalendar": deleteCalendar,
    "updateCalendar": updateCalendar
}

module.exports = calendarRoutes;