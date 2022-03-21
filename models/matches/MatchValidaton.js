const { optional, array } = require("joi");
const Joi = require("joi")

// match schema for request body
module.exports.createMatchSchema = Joi.object({
    stylist_uid: Joi.string().required(),
})

