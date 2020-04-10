const socket = io()

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated ', count)
// })

// elements
const $messageForm = document.querySelector('#formMessage')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton =  $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const messageLocationTemplate = document.querySelector('#message-location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
// const roomTemplate = document.querySelector('#rooms-template').innerHTML


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset)  {
        $messages.scrollTop = $messages.scrollHeight

    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    // disable form

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        // enable form
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered!')
    })
})


const $sendLocation = document.querySelector('#send-location')

socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(messageLocationTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})



$sendLocation.addEventListener('click', () => {
    // disable
    var options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
        };
        
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        $sendLocation.removeAttribute('disabled')
        }

    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocation.setAttribute('disabled', 'disabled')
        
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        const locationCoord = {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }
        socket.emit('sendLocation', locationCoord, (err) => {
            console.log('location shared!')
            $sendLocation.removeAttribute('disabled')
            if(err){
                return console.log(error)
            }
        })
    }, error, options)
})


socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// socket.on('rooms', (room) => {
//     const html = Mustache.render(roomTemplate, rooms)
//     document.querySelector('#roomSelect').innerHTML = html
// })
 
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        console.log(error)
        location.href = '/'
    }
})
