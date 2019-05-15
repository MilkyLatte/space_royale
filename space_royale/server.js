const express = require('express');
const bodyParser = require('body-parser');
const socket = require("socket.io");



const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/api/hello', (req, res) => {
    res.send({ express: Math.random()});
});
app.post('/api/world', (req, res) => {
    console.log(req.body);
    res.send(
        `I received your POST request. This is what you sent me: ${req.body.post}`,
    );
});

const server = app.listen(port, () => console.log(`Listening on port ${ port}`));

// Socket setup
var io = socket(server);

io.on('connection', function(socket){
    console.log('made socket connection', socket.id);

    socket.on('state', function(data){
        console.log(data);
    })
});

