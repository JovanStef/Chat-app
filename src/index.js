const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));


io.on('connection' , (socket)=>{
    console.log('New WebSocket connection');
//send
    socket.emit('message' , 'Welcome');

    //broadcast to all
    socket.broadcast.emit('message' , 'A new user has joined');

    //receive
    socket.on('sendMessage' , (message)=>{
        //send
        io.emit('message' , message)
    });

    //disconnect
    socket.on('disconnect' , ()=>{
        io.emit('message' , 'A user has left')
    });

});

server.listen(port, ()=>{
    console.log('SERVER UP ON ' + port)
});

