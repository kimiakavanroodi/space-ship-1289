const { optional, array } = require("joi");
const Joi = require("joi")

// card schema for request body
module.exports.createCardSchema = Joi.object({
    card_number: Joi.number().min(1).required(),
    card_name: Joi.string().min(1).required(),
    security_code: Joi.number().required(),
    exp_date: Joi.number().required(),
})
