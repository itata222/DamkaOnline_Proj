const socket = io()

const buttonSocket = document.querySelector('#increment')
const inputText = document.getElementById('formInput');
const formSocket = document.getElementById('formSocket')
const messagesContainer = document.getElementById('messages')
const topPlayersHeadline = document.getElementById('leadersHeadline')
const usersLoggedContainer = document.getElementById('sidebar')


const messageTemplate = document.getElementById('message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

const { username } = Qs.parse(location.search, { ignoreQueryPrefix: true })

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


formSocket.addEventListener('submit', (event) => {
    event.preventDefault();
    socket.emit('sendMessage', { username, text: inputText.value }, () => {
        console.log('Delivered')
        inputText.value = "";
    })
})

socket.emit('join', { username }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm a')
    })
    messagesContainer.insertAdjacentHTML('beforeend', html)
    autoScroll();
})

socket.on('usersLogged', ({ users }) => {
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        users
    })
    usersLoggedContainer.innerHTML = html
})

