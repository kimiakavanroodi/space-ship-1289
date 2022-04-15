const { optional, array } = require("joi");
const Joi = require("joi")

// calendar schema for outfit body
module.exports.createOutfitSchema = Joi.object({
    title: Joi.string().required(),
    pieces: Joi.array().items({
        name: Joi.string().required(),
        img_url: Joi.string().required(),
        note: Joi.string().required(),
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