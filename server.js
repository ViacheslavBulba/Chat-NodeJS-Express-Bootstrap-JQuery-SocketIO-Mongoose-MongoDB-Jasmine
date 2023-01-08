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
    name: String,
    message: String
});

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });
});

app.post('/messages', (req, res) => { // curl -i -X POST -H "Content-Type: application/json" -d "{ \"name\": \"Tim\", \"message\": \"Hi\" }" http://localhost:3000/messages
    const message = new Message(req.body);
    message.save().then(() => {
        // filter words
        Message.findOne({ message: 'badword' }, (err, censored) => {
            if (censored) {
                console.log('censored word found', censored);
                Message.remove({ _id: censored.id }, (err) => {
                    console.log('censored message removed');
                })
            }
        })
        io.emit('message', req.body);
        res.sendStatus(200);
    }).catch((err) => {
        res.sendStatus(500);
        return console.error('error saving message to db', err);
    })
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