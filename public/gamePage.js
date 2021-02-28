const socket = io();

import startGame from './game-logic.js';

const { room, username } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const inputText = document.getElementById('formInput');
const messagesContainer = document.getElementById('messages')
const formSocket = document.getElementById('formSocket')


const messageTemplate = document.getElementById('message-template').innerHTML

startGame();


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

formSocket.addEventListener('submit', (event) => {
    event.preventDefault();
    socket.emit('sendMessage', { username, room, text: inputText.value }, () => {
        console.log('Delivered')
        inputText.value = "";
    })
})


socket.on('message', (message) => {
    console.log('24:', message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm a')
    })
    messagesContainer.insertAdjacentHTML('beforeend', html)
    autoScroll();
})


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