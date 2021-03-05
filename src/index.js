
const express = require('express')
const cors = require('cors')

const http = require('http')
const path = require('path')

const app = express();
const port = process.env.PORT;

require('./db/mongoose')
const damkaRouter = require('./routes/damka-routes')

const server = http.createServer(app)

const io = require("socket.io")(server, {
    cors: {
        origin: "https://example.com",
        methods: ["GET", "POST"]
    }
});

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
    getUserById, removeUserFromRoom } = require('./utils/users');

let gameRoom = 0;


io.on('connection', (socket) => {
    socket.on('join', ({ username, room, previousRoom, score }, callback) => {
        let isWhite = true;
        if (room !== 'lobby') {
            previousRoom = 'lobby'
            isWhite = getUsersInRoom(room).length === 0 ? true : false
        }
        const { error, newUser } = addUserToRoom({ id: socket.id, username, room, previousRoom, score, isWhite })

        // console.log('join:', newUser, error)

        if (error)
            return callback(error)

        if (newUser != undefined) {
            socket.join(newUser.room)

            const messageEventMessage = (newUser.room === 'lobby') ? `Welcome ${newUser.username}` : `Good luck ${newUser.username.toUpperCase()}! Dont forget to Respect your opponent`
            socket.emit('message', generateMessage(messageEventMessage))
            if (newUser.room === 'lobby') socket.broadcast.to(newUser.room).emit('message', generateMessage(`${newUser.username} just joined!`))
            io.to(newUser.room).emit('usersLogged', { users: getUsersInRoom(newUser.room), room: newUser.room })

        }
        callback(undefined, socket.id)
    })

    socket.on('sendMessage', (message, callback) => {
        io.to(message.room).emit('message', generateMessage(message.username, message.text))
        callback()
    })

    socket.on('disconnect', () => {
        const user = getUserById(socket.id)
        if (user && user.room === 'lobby') {
            // console.log('2:', user)

            removeUser(socket.id)
            socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} left`))
            io.to(user.room).emit('usersLogged', { users: getUsersInRoom(user.room), room: user.room })
        }
        else if (user && user.room !== 'lobby') {
            removeUser(socket.id)

            socket.leave(gameRoom)
            let playersInRoom = getUsersInRoom(user.room)
            let loser, winner;
            if (playersInRoom.length === 2) {
                loser = playersInRoom[0].username === user.username ? user.username : playersInRoom[1].username
                winner = playersInRoom[1].username === loser ? playersInRoom[0].username : playersInRoom[1].username
            }
            socket.to(user.room).emit('forfeit', { loser, winner })
        }
    })

    socket.on('sendInvitation', ({ sender, reciever, senderId, recieverId }, callback) => {
        socket.join(gameRoom)
        socket.to(recieverId).emit('invitation', { sender, reciever, senderId, recieverId })
        callback()
    })

    socket.on('invitationRejected', ({ sender, reciever, senderId, recieverId }) => {
        socket.leave(gameRoom);
        getUser(sender).room = 'lobby'

        console.log('98:', getUsersInRoom(gameRoom))

        socket.to(senderId).emit('invitationAnswerIsNo', { sender, reciever })
    })

    socket.on('invitationAccepted', ({ sender, reciever, senderId, recieverId }) => {

        socket.join(gameRoom)

        // addUserToRoom({ id: senderId, username: sender, room: gameRoom, previousRoom: 'lobby', score: getUser(sender).score, isWhite: true })
        // addUserToRoom({ id: recieverId, username: reciever, room: gameRoom, previousRoom: 'lobby', score: getUser(reciever).score, isWhite: false })

        socket.broadcast.to('lobby').emit('message', generateMessage(`${sender} and ${reciever} began a match in Room ${gameRoom}`))
        io.to('lobby').emit('usersLogged', { users: getUsersInRoom('lobby'), room: 'lobby' })
        getUser(reciever).isWhite = false

        io.to(gameRoom).emit('redirectToGamePage', { url: `${gamePageUrl}?room=${gameRoom}&username=`, players: [getUser(sender), getUser(reciever)] })
        gameRoom++;
    })


    socket.on('sendForfeit', ({ loser, winner, room }, callback) => {
        io.to(room).emit('forfeit', { loser, winner })
        callback();
    })

    socket.on('start', ({ isWhite, username, player2, room }) => {
        // console.log('124', getUsersInRoom(room))
        io.to(room).emit('startGame', { isWhite, username, player2, room })
    })

})

server.listen(port, () => {
    console.log('server up, port:', port)
})