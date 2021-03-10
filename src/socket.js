const server = require('./index')

const io = require("socket.io")(server, {
    cors: {
        origin: "https://example.com",
        methods: ["GET", "POST"]
    }
});

const gamePageUrl = '/damka-game.html'


const { generateMessage } = require('./utils/messages')
const { addUserToRoom,
    removeUser,
    getUsersInRoom,
    getUser,
    getUserById } = require('./utils/users');

let gameRoom = 0;

io.on('connection', (socket) => {
    socket.on('join', ({ username, room, previousRoom, score, isWhite }, callback) => {
        let isWhites = true;
        if (room !== 'lobby') {
            previousRoom = 'lobby'
            isWhites = getUsersInRoom(room).length === 0 ? true : false
        }
        console.log('connect1', getUsersInRoom('lobby'))
        console.log('connect2', getUsersInRoom(room))

        const { error, newUser } = addUserToRoom({ id: socket.id, username, room, previousRoom, score, isWhite: isWhites })


        if (error)
            return callback(error)

        if (newUser != undefined) {
            console.log('join:', newUser)

            socket.join(newUser.room)

            const messageEventMessage = (newUser.room === 'lobby') ? `Welcome ${newUser.username}` : `Good luck ${newUser.username.toUpperCase()}! You are the ${isWhite === 'true' ? 'White' : 'Black'} Player. \n Dont forget to Respect your opponent`
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
        console.log('disconnect1', getUsersInRoom('lobby'))
        console.log('disconnect2', gameRoom, getUsersInRoom(gameRoom - 1 + ''))
        const user = getUserById(socket.id)
        if (user && user.room === 'lobby') {
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
        socket.to(senderId).emit('invitationAnswerIsNo', { sender, reciever })
    })

    socket.on('invitationAccepted', ({ sender, reciever, senderId, recieverId }) => {

        socket.join(gameRoom)

        addUserToRoom({ id: senderId, username: sender, room: gameRoom, previousRoom: 'lobby', score: getUser(sender).score, isWhite: true })
        addUserToRoom({ id: recieverId, username: reciever, room: gameRoom, previousRoom: 'lobby', score: getUser(reciever).score, isWhite: false })

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

    socket.on('move made', ({ boardBack, room }) => {
        io.to(room).emit('update board', (boardBack))

    })

    socket.on('checkersSocket', ({ room, winner, loser }) => {
        console.log('ended:', winner, loser)

        io.to(room).emit('redirectToLobbyPage', { url: `/lobby.html?room=lobby&username=`, winner })
    })

})