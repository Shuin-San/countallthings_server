const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const router = express.Router();
const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const socket = socketIo(server);

const counterState = { counter : 0 };

socket.on('connect', (client) => {
    console.log(`client connected. Current State ${counterState.counter}`);
    client.on('getCounter', () => getCounter());
    client.on('updateCounter', (action, amount) => updateCounter(String(action), Number(amount)));
    client.on('resetCounter', () => resetCounter());
    client.on('disconnect', ()=> console.log('Client Disconnected'));
});

const getCounter = () => {
    console.log('retrieving counter');
    socket.emit('counter', counterState);

};

const resetCounter= () => {
    counterState.counter = 0
};

const updateCounter = (action, amount) =>{
    console.log(action, amount);
    switch (action) {
        case 'increment' :
            counterState.counter = counterState.counter + amount;
            socket.emit('counter', counterState);
            break;

        case 'decrement' :
            counterState.counter = counterState.counter - amount;
            if (counterState.counter <= 0) {
                counterState.counter = 0;
                socket.emit('counter', counterState);
            } else {
                socket.emit('counter', counterState);
            }
            break;

        default :
            socket.emit('counter', counterState);
            break;

    }
};

app.get("/", (req, res) => {
    res.send(counterState).status(200);
});


server.listen(port, () => console.log(`Listening on port ${port}`));
