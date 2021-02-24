// const allUsers = new Map();
// const availableUsers = new Map()

const users = [];


const addUserToLobby = ({ id, username }) => {
    username = username.trim().toLowerCase();

    if (!username)
        return { error: 'username and room are required!' }

    const existingUser = users.find((user) => {
        return user.username === username
    })

    if (existingUser)
        return { error: 'username already exist in this room' }

    const newUser = { id, username }
    users.push(newUser)
    return { newUser }
}

const removeUser = (id) => {
    const indexUser = users.findIndex((user) => user.id === id)
    if (indexUser !== -1) {
        return users.splice(indexUser, 1)[0]
    }
}

const getUser = (id) => {
    const userToFind = users.find((user) => user.id === id)
    return userToFind
}

const getUsersInRoom = (room) => {
    const usersInroom = users.filter((user) => user.room === room)
    return usersInroom
}

const getUsersInLobby = () => {
    return users
}

module.exports = {
    addUserToLobby,
    removeUser,
    getUsersInRoom,
    getUsersInLobby,
    getUser
}