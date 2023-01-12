const request = require('request');
const moment = require('moment');

describe('get messages:', () => {

    it('should return 200 ok', (done) => { // for async code you should pass (done) and call it later (see below)
        request.get('http://localhost:3000/messages', (err, res) => {
            console.log(res.body);
            expect(res.statusCode).toEqual(200);
            done();
        })
    });

    it('should return not empty list', (done) => {

        const timestamp = moment().format('MM/DD/YYYY h:mm:ss a');

        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://localhost:3000/messages',
            body: `{ \"name\": \"Adam\", \"message\": \"Hi\",  \"timestamp\": \"${timestamp}\"}`
        }, function (error, response, body) {
            console.log(body);
        });

        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://localhost:3000/messages',
            body: `{ \"name\": \"Monica\", \"message\": \"What's up?\",  \"timestamp\": \"${timestamp}\"}`
        }, function (error, response, body) {
            console.log(body);
        });

        request.get('http://localhost:3000/messages', (err, res) => {
            console.log(res.body);
            expect(JSON.parse(res.body).length).toBeGreaterThan(0);
            done();
        })
    });
});

describe('get messages from specific user:', () => {

    it('should return 200 ok', (done) => {
        request.get('http://localhost:3000/messages/john', (err, res) => {
            expect(res.statusCode).toEqual(200);
            done();
        })
    });

    it('name should be john', (done) => {

        const timestamp = moment().format('MM/DD/YYYY h:mm:ss a');

        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://localhost:3000/messages',
            body: `{ \"name\": \"John\", \"message\": \"Hi\",  \"timestamp\": \"${timestamp}\"}`
        }, function (error, response, body) {
            console.log(body);
        });

        request.get('http://localhost:3000/messages/John', (err, res) => {
            console.log(res.body);
            expect(JSON.parse(res.body)[0].name).toEqual('John');
            done();
        })
    });
});