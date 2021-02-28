const users = [];


const addUserToRoom = ({ id, username, room }) => {
    username = username.trim().toLowerCase();

    if (!username)
        return { error: 'username and room are required!' }

    const existingUser = users.find((user) => {
        return user.username === username
    })

    if (existingUser)
        return { error: 'username already exist in this room' }

    const newUser = { id, username, room }
    users.push(newUser)
    return { newUser }
}

const removeUser = (id) => {
    const indexUser = users.findIndex((user) => user.id === id)
    if (indexUser !== -1) {
        return users.splice(indexUser, 1)[0]
    }
}

const getUser = (username) => {
    const userToFind = users.find((user) => user.username === username)
    return userToFind
}
const getUserById = (id) => {
    const userToFind = users.find((user) => user.id === id)
    return userToFind
}

const getUsersInRoom = (room) => {
    const usersInroom = users.filter((user) => user.room === room)
    return usersInroom
}

module.exports = {
    addUserToRoom,
    removeUser,
    getUsersInRoom,
    getUser,
    getUserById
}