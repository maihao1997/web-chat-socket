let rsa = require('./rsa');
let fs = require('fs');
module.exports = function ({ name, image }) {
  const members = new Map()
  let chatHistory = []

  async function broadcastMessage(message) {
    members.forEach(m=> m.emit('message', message))
  }

  function addEntry(entry) {
    try {  
      var privateKey = fs.readFileSync('privateKey.txt', 'utf8');
    } catch(e) {
      console.log('Error:', e.stack);
    }
    if(entry.message){
      
      let mess = new Buffer.from(entry.message, 'base64');
      mess = rsa.decrypted(mess, privateKey)
      entry.message = mess;
      console.log(entry, 'entry hello')
      chatHistory = chatHistory.concat(entry)

    }

    console.log(entry, 'entry')

    chatHistory = chatHistory.concat(entry)
  }

  function getChatHistory() {
    return chatHistory.slice()
  }

  function addUser(client) {
    members.set(client.id, client)
  }

  function removeUser(client) {
    members.delete(client.id)
  }

  function serialize() {
    return {
      name,
      image,
      numMembers: members.size
    }
  }

  return {
    broadcastMessage,
    addEntry,
    getChatHistory,
    addUser,
    removeUser,
    serialize
  }
}
