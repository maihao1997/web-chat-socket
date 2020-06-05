const crypto = require("crypto")

function createKey() {
    
    console.log('zooooooooo')
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        // The standard secure default length for RSA keys is 2048 bits
        modulusLength: 2048,
    })

    console.log(
        publicKey.export({
            type: "pkcs1",
            format: "pem",
        }),

        privateKey.export({
            type: "pkcs1",
            format: "pem",
        })
    )
    return {publicKey,privateKey};
    
}
function key(){
    let key = createKey();
    return key;
}
module.exports = { 
    key: key,
    externals: {
        'crypto': 'crypto'
    } 
};