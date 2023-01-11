const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.Promise = Promise;

const dbUrl = 'mongodb+srv://test:test@cluster0.qewkhqy.mongodb.net/test';

const Message = mongoose.model('Message', {
    timestamp: String,
    name: String,
    message: String
});

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });
});

app.delete('/messages', (req, res) => {
    Message.remove({}, (err) => {
        console.log('all messages deleted');
    })
    io.emit('delete');
});

app.post('/messages', async (req, res) => { // curl -i -X POST -H "Content-Type: application/json" -d "{ \"name\": \"Tim\", \"message\": \"Hi\" }" http://localhost:3000/messages
    try {
        const message = new Message(req.body);
        const savedMessage = await message.save();
        const censored = await Message.findOne({ message: 'censored' });
        if (censored) {
            await Message.remove({ _id: censored.id }, (err) => {
                console.log('message with censored word removed');
            })
        } else {
            io.emit('message', req.body);
        }
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        return console.error('error saving message to db', error);
    }
});

io.on('connection', (socket) => {
    console.log('a new user connected');
});

mongoose.set('strictQuery', false); // to get rid off DeprecationWarning

mongoose.connect(dbUrl, (err) => {
    console.log('mongo db connection:', err ?? 'success');
});

// const server = app.listen(3000, () => {
//     console.log('server is listening on port', server.address().port)
// });

const server = http.listen(3000, () => { // socket.io cannot work directly with express so had to use regular node http server
    console.log('server is listening on port', server.address().port)
});