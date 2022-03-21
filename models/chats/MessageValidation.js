const { optional, array } = require("joi");
const Joi = require("joi")

// message schema for request body
module.exports.createMessageSchema = Joi.object({
    message: Joi.string().min(1).required(),
})
