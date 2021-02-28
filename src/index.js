const express = require('express')
const cors = require('cors')

const http = require('http')
const path = require('path')

const app = express();
const port = process.env.PORT;

require('./db/mongoose')
const damkaRouter = require('./routes/damka-routes')

const server = http.createServer(app)
//express do that step automaticly but for the socketio we want to explicity get the server

const io = require("socket.io")(server, {
    cors: {
        origin: "https://example.com",
        methods: ["GET", "POST"]
    }
});
//configure socketio to work with a server

const publicDirectoryPath = path.join(__dirname, '../public')
const gamePageUrl = '/damka-game.html'

app.use(express.static(publicDirectoryPath))
app.use(cors());
app.use(express.json())
app.use(damkaRouter)

const { generateMessage } = require('./utils/messages')
const { addUserToRoom,
    removeUser,
    getUsersInRoom,
    getUser,
    getUserById } = require('./utils/users');

let gameRoom = 0;


io.on('connection', (socket) => {//connection gonna fire whenever a user is get in or out of the server
    socket.on('join', ({ username, room }, callback) => {
        const { error, newUser } = addUserToRoom({ id: socket.id, username, room })

        if (error)
            return callback(error)

        socket.join(newUser.room)
        const messageEventMessage = (newUser.room === 'lobby') ? `Welcome ${newUser.username}` : `Good luck ${newUser.username}! Dont forget to Respect your opponent`
        socket.emit('message', generateMessage(messageEventMessage))
        if (newUser.room === 'lobby') socket.broadcast.to(newUser.room).emit('message', generateMessage(`${newUser.username} just joined!`))
        io.to(newUser.room).emit('usersLogged', { users: getUsersInRoom(newUser.room), room: newUser.room })

        // console.log('reConnect:', newUser)
        // console.log(getUsersInRoom('lobby'))
        // console.log(getUsersInRoom(newUser.room))
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        // console.log(message)
        // console.log(getUsersInRoom('lobby'))
        // console.log(getUsersInRoom(gameRoom))
        io.to(message.room).emit('message', generateMessage(message.username, message.text))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        // console.log('disconnect:', user)
        if (user) {
            socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} left`))
            io.to(user.room).emit('usersLogged', { users: getUsersInRoom(user.room), room: user.room })
        }
    })

    socket.on('sendInvitation', ({ sender, reciever }, callback) => {
        socket.join(gameRoom)

        // console.log(getUsersInRoom('lobby'))
        // console.log(getUsersInRoom(gameRoom))
        socket.to(getUser(reciever)?.id).emit('invitation', { sender, reciever })
        callback()
    })

    socket.on('invitationRejected', ({ sender, reciever }) => {
        socket.leave(gameRoom);

        // console.log(getUsersInRoom('lobby'))
        // console.log(getUsersInRoom(gameRoom))
        socket.to(getUser(sender)?.id).emit('invitationAnswerIsNo', { sender, reciever })
    })
    socket.on('invitationAccepted', ({ sender, reciever }) => {
        socket.join(gameRoom)
        getUser(sender).room = gameRoom
        getUser(reciever).room = gameRoom

        // console.log(getUsersInRoom('lobby'))
        // console.log(getUsersInRoom(gameRoom))
        io.to(gameRoom).emit('redirectToGamePage', `${gamePageUrl}?room=${gameRoom}&username=`)
        gameRoom++;
    })
})

server.listen(port, () => {
    console.log('server up, port:', port)
})