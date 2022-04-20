const { optional, array } = require("joi");
const Joi = require("joi")

// calendar schema for request body
module.exports.createCalendarInvite = Joi.object({
    start_date: Joi.string(),
    location: Joi.string(),
    end_date: Joi.string(),
    title: Joi.string().required().min(3),
    description: Joi.string().required(),
})
