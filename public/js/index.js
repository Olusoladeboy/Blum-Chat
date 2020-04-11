const socket = io()

const roomTemplate = document.querySelector('#rooms-template').innerHTML
const roomSelect = document.querySelector('#room-select')
const $roomSelect = document.querySelector('#roomSelect')

$roomSelect.addEventListener('click', () => {
    const selected = $roomSelect[$roomSelect.selectedIndex].value;
    console.log(selected)
})

socket.on('rooms', (rooms) => {
    console.log(rooms)
    const html = Mustache.render(roomTemplate, {room: rooms})
    document.querySelector('#roomSelect').innerHTML = html
})
