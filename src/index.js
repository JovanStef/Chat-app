const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const{generateMessage , generateLocationMessage}=require('./utils/messages')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));


io.on('connection' , (socket)=>{
    console.log('New WebSocket connection');
//send
    socket.emit('message' , generateMessage('Welcome'));

    //broadcast to all
    socket.broadcast.emit('message' , generateMessage('A new user has joined'));

    //receive
    socket.on('sendMessage' , (message , callback)=>{
        const filter = new Filter;

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        //send
        io.emit('message' , generateMessage(message));
        callback('Delivered');
    });

    //send location
    socket.on('sendLocation', (coords , callback)=>{
        io.emit('locationMessage' , generateLocationMessage(`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback()
    })

    //disconnect
    socket.on('disconnect' , ()=>{
        io.emit('message' , generateMessage('A user has left'))
    });

});

server.listen(port, ()=>{
    console.log('SERVER UP ON ' + port)
});
