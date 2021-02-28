const socket = io()

const buttonSocket = document.querySelector('#increment')
const inputText = document.getElementById('formInput');
const formSocket = document.getElementById('formSocket')
const messagesContainer = document.getElementById('messages')
const topPlayersHeadline = document.getElementById('leadersHeadline')
const usersLoggedContainer = document.getElementById('sidebar')
const mainPage = document.getElementById('mainpage-lobby')
const rejectButton = document.getElementsByClassName('continueBut')[0]
const playButton = document.getElementsByClassName('checkAndProBut')[0]
let invitationButton;


const messageTemplate = document.getElementById('message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

socket.on('usersLogged', ({ users, room }) => {
    users = users.filter((user) => user.username !== username)

    const html = Mustache.render(sidebarTemplate, {
        users,
        room
    })
    usersLoggedContainer.innerHTML = html
})

document.addEventListener('click', function (e) {
    if (e.target && e.target.id == 'invitation-button') {
        invitationButton = e.target
        socket.emit('sendInvitation', { sender: username, reciever: e.path[1].firstElementChild.innerHTML }, () => {
            e.target.innerHTML = "Pending..."
        })
    }
});

socket.on('invitation', ({ sender, reciever }) => {
    console.log('49: sender:', sender, '----  reciever:', reciever)
    invitation({ sender, reciever })
})

socket.on('invitationAnswerIsNo', ({ sender, reciever }) => {
    console.log('54: sender:', sender, '----  reciever:', reciever)
    invitationButton.innerHTML = "Invite to play"
})

socket.on('redirectToGamePage', (gamePageUrl) => {
    window.location.href = gamePageUrl + username;
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

const invitation = ({ sender, reciever }) => {
    console.log('sender:', sender, '----  reciever:', reciever)
    const invitationModal = document.createElement('div')
    invitationModal.className = "modal block"
    const invitationModalContent = document.createElement('div')
    invitationModalContent.className = "modalCart"
    const invitationHeader = document.createElement('div')
    invitationHeader.className = "announ"
    invitationHeader.innerHTML = `You just invited by <b>${username}</b> to play! \n Choose your next step:`
    const rejectInvitation = document.createElement('button');
    rejectInvitation.className = "button continueBut"
    rejectInvitation.innerHTML = "Reject"
    rejectInvitation.onclick = function () {
        socket.emit('invitationRejected', { sender, reciever })
        invitationModal.remove();
    }
    const acceptInvitation = document.createElement('button');
    acceptInvitation.className = "button checkAndProBut"
    acceptInvitation.innerHTML = "Play !";
    acceptInvitation.addEventListener('click', (event) => {
        event.preventDefault();
        socket.emit('invitationAccepted', { sender, reciever })
        invitationModal.remove();
    })
    invitationModalContent.appendChild(invitationHeader)
    invitationModalContent.appendChild(rejectInvitation)
    invitationModalContent.appendChild(acceptInvitation)
    invitationModal.appendChild(invitationModalContent)
    mainPage.appendChild(invitationModal)
}


// function changeHeadlineColor() {
//     setInterval(() => {
//         topPlayersHeadline.className = 'firstHeadline';
//     }, 1000);
//     setInterval(() => {
//         topPlayersHeadline.className = 'thirdHeadline';
//     }, 2000);
// }
// changeHeadlineColor();

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