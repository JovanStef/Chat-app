const socket = io();
//receive
socket.on('message' , (message)=>{
    console.log(message)
});

document.querySelector('#message-form').addEventListener('submit', (e)=>{
    e.preventDefault();

    // let message = document.querySelector('input').value;
    let message = e.target.elements.message.value

    //send
    socket.emit('sendMessage' , message)
});
