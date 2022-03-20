const { optional, array } = require("joi");
const Joi = require("joi")

module.exports.userAccountSchema = Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required().min(3).max(100),
    age: Joi.number().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('stylist', 'style-seeker').required()
});

module.exports.stylistSchema = Joi.object({
    rate: {
        cost: Joi.number().required(),
        max_outfits: Joi.number().required()
    },
    profile_pic: Joi.optional(),
    description: Joi.string().required(),
    interests: Joi.array().optional(),
    portfolio: Joi.array().optional()
})

module.exports.styleSeekerSchema = Joi.object({
    description: Joi.string().required(),
    profile_pic: Joi.optional(),
    interests: Joi.array().optional(),
})