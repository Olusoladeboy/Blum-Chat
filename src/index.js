const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getRoom, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicdirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');


app.set('views', viewsPath);
app.use(express.static(publicdirectoryPath))

const port = process.env.PORT || 3000;

let count = 0

let message = 'Welcome!'

io.on


io.on('connection', (socket) => {
    console.log('New websocket connection')

    // socket.emit('countUpdated', count)

    // socket.on('increment', () => {
    //     count++
    //     // socket.emit('countUpdated', count)
    //     io.emit('countUpdated', count)
    // }) 1.4240 1.42000 1.4330

    // Challenge Code

    const rooms = getRoom()
    io.emit('rooms', rooms)
 

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if(error){
            console.log(error)
            return callback(error)
            
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Welcome'))        
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`))

        console.log(rooms)

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('')
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.lat},${coords.long}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})


server.listen(port, () => console.log('App Served on Port ', port));