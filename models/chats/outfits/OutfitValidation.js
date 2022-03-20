const { optional, array } = require("joi");
const Joi = require("joi")

module.exports.createOutfit = Joi.object({
    collage_type: Joi.string().required(),
    liked: Joi.boolean(),
    pieces: Joi.array().items({
        type: Joi.string().required(),
        link: Joi.string().required(),
        brand: Joi.string().required(),
        cost: Joi.number().required(),
    })
})


// outfits: [{
//     collage_type: string, // type of structure
//     liked: boolean, // did client save it
//     pieces: [
//         {
//             type: string, // top, pant, accessory, shoes, etc,
//             link: string, 
//             brand: string,
//             cost: integer,
//         },
//         ...
//         ]
//     ]},
//     ...
// ]},