

class CardService {
    constructor(db, uid) {
        this.db = db;
    };

    /**
     * Adds a card to the user's wallet
     * @param {object} card card object of the user
     * Returns a card object that has been added to db
     **/
    addCard = async(uid, card) => {

        // create a new card object using uid
        const cardBody = {
            '_id': uid,
            ...card
        };

        // add the new card object into the database
        const addCardObject = new Promise(async(resolve, reject) => {
            await this.db.collection('card').insertOne(cardBody).then((doc) => {
                // return the new match object
                resolve(doc)
                
            }).catch(() => resolve(null))

        }).then((doc) => doc).catch(() => null)

        const resp = await addCardObject;

        if (resp && resp != null) {
            return cardBody;
        } else {
            return null;
        }
    };

}

module.exports = CardService