const { optional, array } = require("joi");
const Joi = require("joi")

module.exports.createMessageSchema = Joi.object({
    message: Joi.string().min(1).required(),
})
