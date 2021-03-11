const socket = io()
const myStorage = window.localStorage;
// myStorage.clear();
const token = sessionStorage.getItem('token')
console.log(token)
const buttonSocket = document.querySelector('#increment')
const inputText = document.getElementById('formInput');
const formSocket = document.getElementById('formSocket')
const messagesContainer = document.getElementById('messages')
const topPlayersHeadline = document.getElementById('leadersHeadline')
const usersLoggedContainer = document.getElementById('sidebar')
const topPlayersContainer = document.getElementById('leaders-container')
const mainPage = document.getElementById('mainpage-lobby')
const rejectButton = document.getElementsByClassName('continueBut')[0]
const playButton = document.getElementsByClassName('checkAndProBut')[0]
let invitationButton;
let currentUserScore;
let allPlayers = [];

const messageTemplate = document.getElementById('message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML
const topPlayersTemplate = document.getElementById('topPlayers-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const getUserUrl = '/get-user?username=' + username

const myLobbyUrl = location.href

const renderTop10Players = () => {
    const data = {}
    fetch('/lobby', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    })
        .then((res) => {
            if (res.ok)
                return res.json()
            else
                throw res
        }).then((allUsers) => {
            allPlayers = allUsers
            allUsers.sort((a, b) => b.score - a.score);
            let arrayOfTop10Players = allUsers.slice(0, 10)
            for (let i = 0; i < allUsers.length; i++) {
                if (i <= 9)
                    arrayOfTop10Players[i].position = i + 1
                if (allUsers[i].username === username)
                    currentUserScore = allUsers[i].score
            }
            const html = Mustache.render(topPlayersTemplate, {
                topPlayers: arrayOfTop10Players,
                myScore: currentUserScore
            })
            topPlayersContainer.innerHTML = html

        }).catch((e) => {
            console.log(e)
            location.href = '/'
        })
}


const getUser = () => {
    if (location.href !== myLobbyUrl && !location.href.includes('damka-game'))
        logoutFunc()
    fetch(getUserUrl).then((res) => {
        if (res.ok)
            return res.json();
        else
            throw res;
    }).then((userReturned) => {
        socket.emit('join', { username: userReturned.username, room, previousRoom: null, score: userReturned.score }, (error, socketId) => {
            localStorage.setItem(`${userReturned.username}-SocketId`, socketId)
            currentUserScore = userReturned.score
            if (error) {
                alert(error)
                location.href = "/"
            }
            renderTop10Players()
        })
    }).catch((err) => {
        console.log(err)
        location.href = '/'
    })
}

const logoutFunc = () => {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
        .then((response) => {
            console.log(response)
            if (response.ok)
                return response.json();
            else
                throw new Error(response)
        })
        .then(data => {
            console.log('Success:', data);
            sessionStorage.clear();
            location.href = '/'
        })
        .catch((error) => {
            console.log(error)
        });
}

getUser()

socket.on('usersLogged', ({ users, room }) => {
    users = users.filter((user) => user.username !== username)
    for (let i = 0; i < users.length; i++) {
        localStorage.setItem(`${users[i].username}-SocketId`, users[i].id)
        console.log(myStorage)
    }
    renderTop10Players()
    const html = Mustache.render(sidebarTemplate, {
        users,
        room
    })
    usersLoggedContainer.innerHTML = html
})

document.addEventListener('click', function (e) {
    if (e.target && e.target.id == 'invitation-button') {
        invitationButton = e.target
        const senderId = localStorage.getItem(`${username}-SocketId`)
        const recieverId = localStorage.getItem(`${e.path[1].firstElementChild.innerHTML}-SocketId`)
        socket.emit('sendInvitation', { sender: username, reciever: e.path[1].firstElementChild.innerHTML, senderId, recieverId }, () => {
            e.target.innerHTML = "Pending..."
        })
    }
});

socket.on('userLoggedOut', ({ user }) => {
    alert(user, 'logged out !!')
})

socket.on('invitation', ({ sender, reciever, senderId, recieverId }) => {

    invitation({ sender, reciever, senderId, recieverId })
})

socket.on('invitationAnswerIsNo', () => {
    invitationButton.innerHTML = "Invite to play"
})

socket.on('redirectToGamePage', ({ url, players }) => {
    console.log(players)
    const me = players[0].username === username ? players[0].isWhite : players[1].isWhite
    const myscore = players[0].username === username ? players[0].score : players[1].score
    const theOtherPlayer = players[0].username === username ? players[1].username : players[0].username

    location.href = url + username + "&player2=" + theOtherPlayer + "&isWhite=" + me + "&score=" + myscore;

})


formSocket.addEventListener('submit', (event) => {
    event.preventDefault();
    socket.emit('sendMessage', { username, room, text: inputText.value }, () => {
        console.log('Delivered')
        inputText.value = "";
    })
})


socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm a')
    })
    messagesContainer.insertAdjacentHTML('beforeend', html)
    autoScroll();
})

const invitation = ({ sender, reciever, senderId, recieverId }) => {
    const invitationModal = document.createElement('div')
    invitationModal.className = "modal block"
    const invitationModalContent = document.createElement('div')
    invitationModalContent.className = "modalCart"
    const invitationHeader = document.createElement('div')
    invitationHeader.className = "announLobby"
    invitationHeader.innerHTML = `You just invited by <b>${sender}</b> to play! \n Choose your next step:`
    const rejectInvitation = document.createElement('button');
    rejectInvitation.className = "button continueButLobby"
    rejectInvitation.innerHTML = "Reject"
    rejectInvitation.onclick = function () {
        socket.emit('invitationRejected', { sender, reciever, senderId, recieverId })
        invitationModal.remove();
    }
    const acceptInvitation = document.createElement('button');
    acceptInvitation.className = "button checkAndProButLobby"
    acceptInvitation.innerHTML = "Play !";
    acceptInvitation.addEventListener('click', (event) => {
        event.preventDefault();
        socket.emit('invitationAccepted', { sender, reciever, senderId, recieverId })
        invitationModal.remove();
    })
    invitationModalContent.appendChild(invitationHeader)
    invitationModalContent.appendChild(rejectInvitation)
    invitationModalContent.appendChild(acceptInvitation)
    invitationModal.appendChild(invitationModalContent)
    mainPage.appendChild(invitationModal)
}


function changeHeadlineColor() {
    setInterval(() => {
        topPlayersHeadline.className = 'firstHeadline';
    }, 1000);
    setInterval(() => {
        topPlayersHeadline.className = 'thirdHeadline';
    }, 2000);
}
changeHeadlineColor();

const autoScroll = () => {
    // New message element
    const $newMessage = messagesContainer.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messagesContainer.offsetHeight

    // Height of messages container
    const containerHeight = messagesContainer.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messagesContainer.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
}
