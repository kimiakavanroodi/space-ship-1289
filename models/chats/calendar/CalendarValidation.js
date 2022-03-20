const { optional, array } = require("joi");
const Joi = require("joi")

module.exports.createCalendarInvite = Joi.object({
    start_date: Joi.string(),
    end_date: Joi.string(),
    title: Joi.string().required().min(3),
    description: Joi.string().required(),
})
