const { optional, array } = require("joi");
const Joi = require("joi")

// card schema for request body
module.exports.createCardSchema = Joi.object({
    number: Joi.number().min(1).required(),
    name: Joi.string().min(1).required(),
    cvc: Joi.number().required(),
    expiry: Joi.string().required(),
})
