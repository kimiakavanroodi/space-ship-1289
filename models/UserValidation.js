const { optional, array } = require("joi");
const Joi = require("joi")

module.exports.userAccountSchema = Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required().min(3).max(100),
    password: Joi.string().required(),
    role: Joi.string().valid('stylist', 'style-seeker').required()
});

module.exports.stylistSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.empty': 'Display name cannot be empty',
        'string.min': 'Min  characteers',
    }),
    age: Joi.number().min(18).max(100).required().messages({
        'number.empty': 'Display name cannot be empty',
        'number.min': 'Min  characteers',
        'number.max': '34  characteers',
    }),
    rate: {
        cost: Joi.number().required(),
        max_outfits: Joi.number().required()
    },
    description: Joi.string().required(),
    interests: Joi.array().optional(),
    portfolio: Joi.array().optional()
})

module.exports.styleSeekerSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.empty': 'Display name cannot be empty',
        'string.min': 'Min  characteers',
    }),
    age: Joi.number().min(18).max(100).required().messages({
        'number.empty': 'Display name cannot be empty',
        'number.min': 'Min  characteers',
        'number.max': '34  characteers',
    }),
    rate: Joi.allow(null).required(),
    description: Joi.string().required(),
    interests: Joi.array().optional(),
    portfolio: Joi.allow(null).required()
})




// name: string,
// age: int,
// display_photo: string,
// rate: {
//     cost: 5,
//     max_outfits: 5,
// },  // null, if style-seeker
// description: string,
// interests: [{
//         q_1: string,
//         a_1: string,
//     },{
//         q_2: string,
//         a_2: string,
//     }
//     ...
// ],
// portfolio: [ // null, if style-seeker
//     {
//         id: integer,
//         photo_url: string
//     },
//     ...
// ]