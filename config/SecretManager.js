const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

/**
 * 
 * @param {*} secret 
 * @returns 
 */
async function getSecret(secret) {
    const name = `projects/117516734307/secrets/${secret}/versions/1`;
    
    const [version] = await client.accessSecretVersion({
      name: name,
    });
    const payload = version.payload.data.toString();
    return payload;
};
    
module.exports.getSecret = getSecret;