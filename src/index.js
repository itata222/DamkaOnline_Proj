const express = require('express')
const http = require('http')
const cors = require('cors')
const path = require('path')
const socketio = require('socket.io')

require('./db/mongoose')

const { generateMessage } = require('./utils/messages')
const { addUserToLobby,
    removeUser,
    getUsersInRoom,
    getUsersInLobby,
    getUser } = require('./utils/users')

const app = express();
const port = process.env.PORT;
const publicDirectoryPath = path.join(__dirname, '../public')
const server = http.createServer(app)//express do that step automaticly but for the socketio we want to explicity get the server
const io = socketio(server) //configure socketio to work with a server

app.use(express.static(publicDirectoryPath))
app.use(cors());
app.use(express.json())

io.on('connection', (socket) => {//connection gonna fire whenever a user is get in or out of the server
    socket.on('join', ({ username }, callback) => {
        const { error, newUser } = addUserToLobby({ id: socket.id, username })

        if (error)
            return callback(error)

        socket.emit('message', generateMessage(`Welcome ${newUser.username}`))
        socket.broadcast.emit('message', generateMessage(`${newUser.username} just joined!`))

        io.emit('usersLogged', {
            users: getUsersInLobby()
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        io.emit('message', generateMessage(message.username, message.text))
        callback()
    })



    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

    })
})

server.listen(port, () => {
    console.log('server up, port:', port)
})