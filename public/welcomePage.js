const mainPage = document.getElementById('mainPage')
const loginForm = document.getElementById('loginform')
const joinForm = document.getElementById('joinform')
const loginUsername = document.getElementById('username-login')
const loginPassword = document.getElementById('password-login')
const joinUsername = document.getElementById('username-join')
const joinPassword = document.getElementById('password-join')

const loginUrl = `/login`
const joinUrl = `/create-user`

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = loginUsername.value
    const password = loginPassword.value
    const room = 'lobby'
    data = { username, password, room }
    fetch(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            // console.log('Success:', data);
            if (data.status) {
                loginUsername.value = "";
                loginPassword.value = "";
                enterLobbyError('Unable to login')
            }
            else
                location.href = `/lobby.html?username=${username}&room=lobby`
        })
        .catch((error) => {
            console.error('Error:', error);
        });
})

joinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = joinUsername.value
    const password = joinPassword.value
    const room = 'lobby'
    data = { username, password, room }
    fetch(joinUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            if (data.code === 11000) {
                joinUsername.value = "";
                enterLobbyError('Username already exist')
            }
            else
                location.href = `/lobby.html?username=${username}&room=lobby`
        })
        .catch((error) => {
            console.error('Error:', error);
        });
})

const enterLobbyError = (message) => {
    const errorModal = document.createElement('div')
    errorModal.className = "modal block"
    const errorModalContent = document.createElement('div')
    errorModalContent.className = "modalCart modalCart-phone"
    const errorHeader = document.createElement('div')
    errorHeader.className = "announ"
    errorHeader.innerHTML = message
    const errorButton = document.createElement('button');
    errorButton.className = "continueBut"
    errorButton.innerHTML = "Ok...TRY AGAIN"
    errorButton.onclick = function () {
        errorModal.remove();
    }
    window.onclick = function (e) {
        if (e.target == errorModal)
            errorModal.remove();
    }
    errorModalContent.appendChild(errorHeader)
    errorModalContent.appendChild(errorButton)
    errorModal.appendChild(errorModalContent)
    mainPage.appendChild(errorModal)
}
