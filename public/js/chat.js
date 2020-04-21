const socket = io();

//Element
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormBtn = $messageForm.querySelector('button');
const $locationBtn = document.querySelector('#location-btn');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');



//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


//Options
const {username ,room} = Qs.parse(location.search , {ignoreQueryPrefix:true});

const autoScroll = ()=>{
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visoble height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageHeight);
}
//receive
socket.on('message' , (message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html); 
    autoScroll()
});

socket.on('locationMessage', (url)=>{
    console.log(url)
    const html = Mustache.render(locationTemplate , {
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('hh:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend' , html);
    autoScroll()
});

socket.on('roomData' , ({room,users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    //disable button
    $messageFormBtn.setAttribute('disabled', 'disabled');

    // let message = document.querySelector('input').value;
    let message = e.target.elements.message.value

    //send message
    socket.emit('sendMessage' , message, (err)=>{
    
    //enable button
    $messageFormBtn.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

        if(err){
            return console.log(err)
        }
        console.log('Delivered')

    });
});

$locationBtn.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported on your browser')
    }
    //disable button
    $locationBtn.setAttribute('disabled' , 'disabled');

        navigator.geolocation.getCurrentPosition((position)=>{
          socket.emit('sendLocation', {
              latitude:position.coords.latitude,
              longitude:position.coords.longitude
          } , ()=>{
              // enable button
              $locationBtn.removeAttribute('disabled');

              console.log('Location shared')
            });
        });
});

socket.emit('join' , {username,room} , (error)=>{
    if(error){
        alert(error);
        location.href='/';
    }

});