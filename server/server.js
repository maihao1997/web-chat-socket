var express = require('express');
const path = require("path");
var fs = require('fs');
var cors = require('cors');
var crypto = require('crypto');
var rsa = require('./rsa');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/websocket', {useNewUrlParser: true, useUnifiedTopology: true});
var bodyParser = require('body-parser');
const multer = require('multer');
var app = express();
app.use(cors())
app.use(bodyParser.json())
// var upload = multer({ dest: './uploads' });
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const ClientManager = require('./ClientManager')
const ChatroomManager = require('./ChatroomManager')
const makeHandlers = require('./handlers')

const clientManager = ClientManager()
const chatroomManager = ChatroomManager()

io.on('connection', function (client) {
  const {
    handleRegister,
    handleJoin,
    handleLeave,
    handleMessage,
    handleGetChatrooms,
    handleGetAvailableUsers,
    handleDisconnect
  } = makeHandlers(client, clientManager, chatroomManager)

  console.log('client connected...', client.id)
  clientManager.addClient(client)

  client.on('register', handleRegister)

  client.on('join', handleJoin)

  client.on('leave', handleLeave)

  client.on('message', handleMessage)

  client.on('chatrooms', handleGetChatrooms)

  client.on('availableUsers', handleGetAvailableUsers)

  client.on('disconnect', function () {
    console.log('client disconnect...', client.id)
    handleDisconnect()
  })

  client.on('error', function (err) {
    console.log('received error from client:', client.id)
    console.log(err)
  })
})
const secret = {
  iv: Buffer.from('efb2da92cff888c9c295dc4ee682789c', 'hex'),
  key: Buffer.from('6245cb9b8dab1c1630bb3283063f963574d612ca6ec60bc8a5d1e07ddd3f7c53', 'hex')
}

var User = mongoose.model('User', {username: String, password: String, name: String, lastName: String, statusText: String, image: String, roles: Array, age: Number});
var Room = mongoose.model('Room', {name: String, image: String});
 
const storage = multer.memoryStorage()
const upload = multer({ storage });


app.post("/upload", upload.single("file"),  (req, res, next) => {

  console.log("file upload: ", req.file);
  rsa.saveEncryptedFile(req.file.buffer, path.join("./uploads", req.file.originalname), secret.key, secret.iv);
  res.status(201).json( { status: "ok" });
});

app.get("/file/:fileName", (req, res, next) => {
  console.log("Getting file:", req.params.fileName);
  const buffer = rsa.getEncryptedFile(path.join("./uploads", req.params.fileName), secret.key, secret.iv);
  const readStream = new stream.PassThrough();
  readStream.end(buffer);
  res.writeHead(200, {
      "Content-disposition": "attachment; filename=" + req.params.fileName,
      "Content-Type": "application/octet-stream",
      "Content-Length": buffer.length
  });
  res.end(buffer);
});

app.get('/', function (req, res, next) {
  res.send('Hello World');
})

app.get('/room', function (req, res) {
  let allUser = Room.find({}, function(err, users) {
    if (err) return next(err);
    res.json(users);
  });
})

app.post('/register', function (req, res){
  var user = new User();

  user.name = 'Rick',
  user.lastName =  'Grimes',
  user.statusText =  'I am the leader!',
  user.image =  'users/rick.jpg'

  user.save(function(err, user){
    if(err) return err;
    res.send(user); 
  });
  console.log(req.body)
})

app.post('/addRoom', function (req, res){
  let room = new Room();
  room.name = 'Alexandria',
  room.image = 'chatrooms/alexandria.jpg'

  room.save(function(err, room){
    if(err) return err;
    res.send(room); 
  });
  console.log(req.body)
})


app.post('/login', function (req, res){
  const salt = "3nc0d3_";
  let { username, password } = req.body;


  password = salt + password;
  password = crypto.createHash('sha256').update(password).digest('hex');
  
  console.log(password)
  let allUser = Room.find({}, function(err, users) {
    if (err) return next(err);
    res.json(users);
  });
 
  console.log(req.body)
})



app.post("/person", async (request, response) => {
  try {
    var person = new PersonModel(request.body);
    var result = await person.save();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.post("/upload",async(request, response) => {
  try{

  } catch (error) {
    response.status(500).send(error)
  }
})
app.post('/uploadphoto', upload.single('avatar'), (req, res) => {
  try{
    console.log(req.file);
    console.log(req.body)
    res.redirect('http://localhost:3000')

  } catch(e){
    res.status(500).send(e);
  }
})
server.listen(3000, function (err) {
  let key = rsa.createKey();
  fs.writeFile('publicKey.txt', key.publicKey, 'utf8', function (err) {
    //Kiểm tra nếu có lỗi thì xuất ra lỗi
    if (err)
        throw err;
    else //nếu không thì hiển thị nội dung ghi file thành công
        console.log('Ghi file thanh cong!');
  });

  fs.writeFile('privateKey.txt', key.privateKey, 'utf8', function (err) {
    //Kiểm tra nếu có lỗi thì xuất ra lỗi
    if (err)
        throw err;
    else //nếu không thì hiển thị nội dung ghi file thành công
        console.log('Ghi file thanh cong!');
  });
  if (err) throw err
  console.log('listening on port 3000')
})
