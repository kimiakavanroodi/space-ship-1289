const { optional, array } = require("joi");
const Joi = require("joi")

module.exports.createMatchSchema = Joi.object({
    stylist_uid: Joi.string().required(),
})

