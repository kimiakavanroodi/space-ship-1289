const { optional, array } = require("joi");
const Joi = require("joi")

// sign-up account schema for request body
module.exports.userAccountSchema = Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required().min(3).max(100),
    age: Joi.string().required(),
    profile_img: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('stylist', 'style-seeker').required()
});

// stylist profile schema for request body
module.exports.stylistSchema = Joi.object({
    cost: Joi.number().required(),
    // description: Joi.string().required(),
    interests: Joi.array().optional(),
    portfolio: Joi.array().optional()
})

// style seeker schema for request body
module.exports.styleSeekerSchema = Joi.object({
    interests: Joi.array().optional(),
})