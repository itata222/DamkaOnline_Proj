const users = [];


const addUserToRoom = ({ id, username, room, previousRoom, score, isWhite }) => {
    // console.log(username, room, previousRoom)
    username = username.trim().toLowerCase();

    if (!username)
        return { error: 'username and room are required!' }

    // const existingUser = users.find((user) => {
    //     return user.username === username && user.room === room
    // })

    // if (existingUser)
    //     return { error: 'username already exist in this room' }

    const newUser = { id, username, room, previousRoom, score, isWhite }
    let userExist = false;
    users.forEach((user) => {
        if (user.username === newUser.username)
            userExist = true
    })
    if (userExist) return {}
    users.push(newUser)
    // console.log("users", users)
    return { newUser }
}

const removeUser = (id) => {
    const indexUser = users.findIndex((user) => user.id === id)
    if (indexUser !== -1) {
        return users.splice(indexUser, 1)[0]
    }
}
const removeUserFromRoom = (username, room) => {
    const indexUser = users.findIndex((user) => user.username === username)
    if (indexUser !== -1) {
        let usersInRoom = getUsersInRoom(room)
        return usersInRoom.splice(indexUser, 1)[0]
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
    getUserById,
    removeUserFromRoom
}