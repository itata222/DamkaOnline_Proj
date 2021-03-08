const socket = io();
const { room, username, player2, isWhite, score } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const isWhiteBoolean = isWhite === 'true' ? true : false

socket.emit('join', { username, room, previousRoom: 'lobby', score, isWhite }, () => {

})
console.log(username)
const inputText = document.getElementById('formInput');
const messagesContainer = document.getElementById('messages')
const formSocket = document.getElementById('formSocket')
const forfeitButton = document.getElementById('forfeitButton')
const mainPage = document.getElementById('gamePageContainer')
const gameArea = document.getElementById('gameArea')

const messageTemplate = document.getElementById('message-template').innerHTML

const changeUsersScores = '/change-users-score';

const getUserUrl = '/get-user?username=' + username

fetch(getUserUrl).then((res) => {
    if (res.ok)
        return res.json();
    else
        throw res;
}).then((userReturned) => {
    socket.emit('join', { username: userReturned.username, room, previousRoom: 'lobby', score: userReturned.score, isWhite }, (error) => {
        if (error) {
            alert(error)
            location.href = "/"
        }
    })
}).catch((err) => {
    console.log(err)
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

forfeitButton.addEventListener('click', (event) => {
    event.preventDefault();
    enterLobbyError('Are you sure you want to FORFEIT?')
})

socket.on('forfeit', ({ loser, winner }) => {
    console.log('123')
    const errorModal = document.createElement('div')
    errorModal.className = "modal block"
    const errorModalContent = document.createElement('div')
    errorModalContent.className = "modalCart modalCart-phone"
    const errorHeader = document.createElement('div')
    errorHeader.className = "announ"
    errorHeader.innerHTML = "Your opponnent has quitted so... you WON !!!"
    errorModalContent.appendChild(errorHeader)
    errorModal.appendChild(errorModalContent)
    mainPage.appendChild(errorModal)
    window.onclick = function (e) {
        if (e.target == errorModal)
            errorModal.remove();
    }
    const data = { winner, loser }
    fetch(changeUsersScores, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then((res) => {
        if (res.ok)
            return res.json();
        else
            throw new Error(res)
    }).then((resJson) => {
        console.log(resJson)
        setTimeout(() => {
            location.href = `/lobby.html?username=${winner}&room=lobby`
        }, 3000);
    }).catch((err) => {
        console.log(err)
    })
})


const enterLobbyError = (message) => {
    // console.log(room)
    const errorModal = document.createElement('div')
    errorModal.className = "modal block"
    const errorModalContent = document.createElement('div')
    errorModalContent.className = "modalCart modalCart-phone"
    const errorHeader = document.createElement('div')
    errorHeader.className = "announ"
    errorHeader.innerHTML = message
    const YESButton = document.createElement('button');
    YESButton.className = "forfeitButtons"
    YESButton.innerHTML = "YES"
    YESButton.onclick = function () {
        socket.emit('sendForfeit', { loser: username, winner: player2, room }, () => {
            location.href = `/lobby.html?username=${username}&room=lobby`
        })
    }
    const NOButton = document.createElement('button');
    NOButton.className = "forfeitButtons"
    NOButton.innerHTML = "NO"
    NOButton.onclick = function () {
        errorModal.remove();
    }

    window.onclick = function (e) {
        if (e.target == errorModal)
            errorModal.remove();
    }
    errorModalContent.appendChild(errorHeader)
    errorModalContent.appendChild(YESButton)
    errorModalContent.appendChild(NOButton)
    errorModal.appendChild(errorModalContent)
    mainPage.appendChild(errorModal)
}


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

const board = document.getElementById('board');
const headline = document.getElementById('headline');
const whiteTurnText = document.querySelector(".white-turn");
const isUserTheWhites = isWhiteBoolean
const whitePlayer = isUserTheWhites ? username : player2

let whitesPieces = [];
let blacksPieces = [];
let selectedPiecesList = [];
let piecesCantMove = [];
let unAvailableCells = [];
let piecesIndexesPossibleToJump = [];
let cellsFront = [];
let numbersOfStuckedPieces;

let boardBack = [
    null, { isWhite: true, isKing: false }, null, { isWhite: true, isKing: false }, null, { isWhite: true, isKing: false }, null, { isWhite: true, isKing: false },
    { isWhite: true, isKing: false }, null, { isWhite: true, isKing: false }, null, { isWhite: true, isKing: false }, null, { isWhite: true, isKing: false }, null,
    null, { isWhite: true, isKing: false }, null, { isWhite: true, isKing: false }, null, { isWhite: true, isKing: false }, null, { isWhite: true, isKing: false },
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    { isWhite: false, isKing: false }, null, { isWhite: false, isKing: false }, null, { isWhite: false, isKing: false }, null, { isWhite: false, isKing: false }, null,
    null, { isWhite: false, isKing: false }, null, { isWhite: false, isKing: false }, null, { isWhite: false, isKing: false }, null, { isWhite: false, isKing: false },
    { isWhite: false, isKing: false }, null, { isWhite: false, isKing: false }, null, { isWhite: false, isKing: false }, null, { isWhite: false, isKing: false }, null
];

let tabIndexOrder = 0;
let playerPieces;
let focusedPieceIndex;
let index = 0;
let directionOfJumpMoves = 0;
let draw = false;
let WhiteIsStuck = false;
let BlackIsStuck = false;
let whiteTurn = true;
let winner, loser;

whiteTurnText.innerHTML = (whiteTurn && isUserTheWhites) ? 'Your Turn' : 'Opponent Turn'
let myTurn = (isUserTheWhites && whiteTurn) || (!isUserTheWhites && !whiteTurn)

let selectedPiece = {
    indexOfBoardPiece: -1,
    timesPieceFound: 0,
    isKing: false,
    isWhite: true,
    seventhSpace: false,
    ninthSpace: false,
    fourteenthSpace: false,
    eighteenthSpace: false,
    twentyEightSpace: false,
    thirtySixSpace: false,
    fourtyTwoSpace: false,
    fiftyFourSpace: false,
    thirtyTwoSpace: false,
    fortySixSpace: false,
    minusSeventhSpace: false,
    minusNinthSpace: false,
    minusFourteenthSpace: false,
    minusEighteenthSpace: false,
    minustwentyEightSpace: false,
    minusthirtySixSpace: false,
    minusfourtyTwoSpace: false,
    minusfiftyFourSpace: false,
    minusthirtyTwoSpace: false,
    minusfortySixSpace: false,
    rightWay: false
}

function createBoard() {
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            const square = document.createElement('div')
            const Piece = document.createElement('div');
            if (i % 2 === 0) {
                square.className = j % 2 === 0 ? 'cell white' : 'cell black';
                square.index = index;
            } else {
                square.className = j % 2 === 0 ? 'cell black' : 'cell white';
                square.index = index;
            }
            board.appendChild(square)
            if (square.className === 'cell black') {
                if (i <= 3) {
                    Piece.className = 'white-piece';
                    Piece.tabIndex = tabIndexOrder + "";
                    whitesPieces.push(Piece);
                    tabIndexOrder++;
                }
                else if (i <= 8 && i >= 6) {
                    Piece.className = 'black-piece';
                    Piece.tabIndex = tabIndexOrder + "";
                    blacksPieces.push(Piece);
                    tabIndexOrder++;
                }
                else {
                    Piece.className = 'empty';
                }
                cellsFront.push(square)
                square.appendChild(Piece);
            }
            else
                cellsFront.push(null)
            index++;
        }
    }
}

function changeHeadlineColor() {
    setInterval(() => {
        headline.className = 'secondHeadline';
    }, 10000);
    setInterval(() => {
        headline.className = 'thirdHeadline';
    }, 20000);
}

const changeControl = function (event) {
    event.stopPropagation();
    event.preventDefault();
}

//---------------------------------------------------------//

createBoard();

function startGame() {
    myTurn = (isUserTheWhites && whiteTurn) || (!isUserTheWhites && !whiteTurn)

    if (!myTurn) {
        console.log('my turn: False!', myTurn)
        gameArea.addEventListener('click', changeControl, true)
    }
    else {
        console.log('my turn: True!', myTurn)
        gameArea.removeEventListener('click', changeControl, true)
    }

    playerClickedOnCell();

}

function playerClickedOnCell() {
    for (let i = 0; i < cellsFront.length; i++)
        if (cellsFront[i] != null)
            cellsFront[i].addEventListener('click', clickedOnCell)
}
const clickedOnCell = (event) => {
    clickedCellIndex = event.target.parentElement.index;
    if (clickedCellIndex)
        definePlayerPieces();
}
function definePlayerPieces() {
    if (whiteTurn)
        playerPieces = whitesPieces;
    else {
        playerPieces = blacksPieces;
    }
    resetSelectedPiece();
    getSelectedPiece();
}
function resetSelectedPiece() {
    selectedPiece = {
        indexOfBoardPiece: -1,
        timesPieceFound: 0,
        isKing: false,
        isWhite: true,
        seventhSpace: false,
        ninthSpace: false,
        fourteenthSpace: false,
        eighteenthSpace: false,
        twentyEightSpace: false,
        thirtySixSpace: false,
        fourtyTwoSpace: false,
        fiftyFourSpace: false,
        thirtyTwoSpace: false,
        fortySixSpace: false,
        minusSeventhSpace: false,
        minusNinthSpace: false,
        minusFourteenthSpace: false,
        minusEighteenthSpace: false,
        minustwentyEightSpace: false,
        minusthirtySixSpace: false,
        minusfourtyTwoSpace: false,
        minusfiftyFourSpace: false,
        minusthirtyTwoSpace: false,
        minusfortySixSpace: false,
        rightWay: false
    }
}
function getSelectedPiece() {
    selectedPiece.indexOfBoardPiece = clickedCellIndex;
    selectedPiece.isWhite = boardBack[clickedCellIndex].isWhite;

    if ((myTurn && isUserTheWhites && selectedPiece.isWhite) || (myTurn && !selectedPiece.isWhite && !isUserTheWhites))
        isPieceKing();
}
function isPieceKing() {
    if (boardBack[clickedCellIndex].isKing)
        selectedPiece.isKing = true;
    else
        selectedPiece.isKing = false;

    console.log(selectedPiece.isKing, selectedPiece.isWhite)

    saveUnAvailableCells();
    getAvailableSpaces();
}
function saveUnAvailableCells() {
    unAvailableCells = [];
    let index = 0;
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            if (i % 2 === 0 && j % 2 === 0) {
                unAvailableCells.push(index)
            } else if (i % 2 !== 0 && j % 2 !== 0) {
                unAvailableCells.push(index)
            }
            index++;
        }
    }
}
function isAvailableCell(cellIndex) {
    for (let i = 0; i < unAvailableCells.length; i++) {
        if (cellIndex === unAvailableCells[i])
            return false;
    }
    return true;
}
function getAvailableSpaces() {

    if (whiteTurn) {
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 7) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 7 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 7] === null)
            selectedPiece.seventhSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 9) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 9 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 9] === null)
            selectedPiece.ninthSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 7) && selectedPiece.isWhite && selectedPiece.isKing && selectedPiece.indexOfBoardPiece - 7 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 7] === null)
            selectedPiece.minusSeventhSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 9) && selectedPiece.isWhite && selectedPiece.isKing && selectedPiece.indexOfBoardPiece - 9 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 9] === null)
            selectedPiece.minusNinthSpace = true;
    }
    else {
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 7) && !selectedPiece.isWhite && selectedPiece.isKing && selectedPiece.indexOfBoardPiece + 7 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 7] === null)
            selectedPiece.seventhSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 9) && !selectedPiece.isWhite && selectedPiece.isKing && selectedPiece.indexOfBoardPiece + 9 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 9] === null)
            selectedPiece.ninthSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 7) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 7 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 7] === null)
            selectedPiece.minusSeventhSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 9) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 9 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 9] === null)
            selectedPiece.minusNinthSpace = true;
    }
    checkAvailableJumpSpaces();
}
function checkAvailableJumpSpaces() {
    if (whiteTurn) {
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 14) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 14 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 14] === null && boardBack[selectedPiece.indexOfBoardPiece + 7] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 7].isWhite)
            selectedPiece.fourteenthSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 18) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 18 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 18] === null && boardBack[selectedPiece.indexOfBoardPiece + 9] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 9].isWhite)
            selectedPiece.eighteenthSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 14) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 14 >= 0 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece - 14] === null && boardBack[selectedPiece.indexOfBoardPiece - 7] !== null && !boardBack[selectedPiece.indexOfBoardPiece - 7].isWhite)
            selectedPiece.minusFourteenthSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 18) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 18 >= 0 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece - 18] === null && boardBack[selectedPiece.indexOfBoardPiece - 9] !== null && !boardBack[selectedPiece.indexOfBoardPiece - 9].isWhite)
            selectedPiece.minusEighteenthSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 28) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 28 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 28] === null && boardBack[selectedPiece.indexOfBoardPiece + 7] !== null &&
            !boardBack[selectedPiece.indexOfBoardPiece + 7].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 21] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 21].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece + 14] === null)
            selectedPiece.twentyEightSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 36) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 36 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 36] === null && boardBack[selectedPiece.indexOfBoardPiece + 9] !== null &&
            !boardBack[selectedPiece.indexOfBoardPiece + 9].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 27] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 27].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece + 18] === null)
            selectedPiece.thirtySixSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 28) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 28 >= 0 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece - 28] === null && boardBack[selectedPiece.indexOfBoardPiece - 21] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece - 7] !== null && !boardBack[selectedPiece.indexOfBoardPiece - 7].isWhite && !boardBack[selectedPiece.indexOfBoardPiece - 21].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece - 14] === null)
            selectedPiece.minustwentyEightSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 36) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 36 >= 0 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece - 36] === null && boardBack[selectedPiece.indexOfBoardPiece - 9] !== null &&
            !boardBack[selectedPiece.indexOfBoardPiece - 9].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 27] !== null && !boardBack[selectedPiece.indexOfBoardPiece - 27].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece - 18] === null)
            selectedPiece.minusthirtySixSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 42) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 42 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 28] === null && boardBack[selectedPiece.indexOfBoardPiece + 7] !== null &&
            !boardBack[selectedPiece.indexOfBoardPiece + 7].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 21] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 21].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 35] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece + 14] === null && boardBack[selectedPiece.indexOfBoardPiece + 42] === null && !boardBack[selectedPiece.indexOfBoardPiece + 35].isWhite)
            selectedPiece.fourtyTwoSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 54) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 54 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 36] === null && boardBack[selectedPiece.indexOfBoardPiece + 9] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 9].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece + 18] === null && boardBack[selectedPiece.indexOfBoardPiece + 27] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 27].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 54] === null &&
            boardBack[selectedPiece.indexOfBoardPiece + 45] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 45].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 45] !== null)
            selectedPiece.fiftyFourSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 42) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 42 >= 0 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece - 28] === null && boardBack[selectedPiece.indexOfBoardPiece - 7] !== null &&
            !boardBack[selectedPiece.indexOfBoardPiece - 7].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 21] !== null && !boardBack[selectedPiece.indexOfBoardPiece - 21].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 14] === null &&
            boardBack[selectedPiece.indexOfBoardPiece - 42] === null && boardBack[selectedPiece.indexOfBoardPiece - 35] !== null && !boardBack[selectedPiece.indexOfBoardPiece - 35].isWhite)
            selectedPiece.minusfourtyTwoSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 54) && selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 54 >= 0 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece - 36] === null && boardBack[selectedPiece.indexOfBoardPiece - 9] !== null &&
            !boardBack[selectedPiece.indexOfBoardPiece - 9].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 18] === null && boardBack[selectedPiece.indexOfBoardPiece - 27] !== null &&
            !boardBack[selectedPiece.indexOfBoardPiece - 27].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 54] === null && boardBack[selectedPiece.indexOfBoardPiece - 45] !== null && !boardBack[selectedPiece.indexOfBoardPiece - 45].isWhite)
            selectedPiece.minusfiftyFourSpace = true;

        if (selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 32 >= 0 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece - 32] === null &&
            boardBack[selectedPiece.indexOfBoardPiece - 9] !== null && !boardBack[selectedPiece.indexOfBoardPiece - 9].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 18] === null &&
            boardBack[selectedPiece.indexOfBoardPiece - 25] !== null && !boardBack[selectedPiece.indexOfBoardPiece - 25].isWhite) {
            selectedPiece.minusthirtyTwoSpace = true;
            selectedPiece.rightWay = false;
        }
        if (selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 32 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 32] === null &&
            boardBack[selectedPiece.indexOfBoardPiece + 7] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 7].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 14] === null &&
            boardBack[selectedPiece.indexOfBoardPiece + 23] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 23].isWhite) {
            selectedPiece.thirtyTwoSpace = true;
            selectedPiece.rightWay = false;
        }
        if (selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 32 >= 0 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece - 32] === null && boardBack[selectedPiece.indexOfBoardPiece - 7] !== null &&
            !boardBack[selectedPiece.indexOfBoardPiece - 7].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 14] === null && boardBack[selectedPiece.indexOfBoardPiece - 23] !== null && !boardBack[selectedPiece.indexOfBoardPiece - 23].isWhite) {
            selectedPiece.minusthirtyTwoSpace = true;
            selectedPiece.rightWay = true;
        }
        if (selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 32 <= 63 && boardBack[selectedPiece.indexOfBoardPiece + 32] === null && boardBack[selectedPiece.indexOfBoardPiece + 9] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece + 18] === null && boardBack[selectedPiece.indexOfBoardPiece + 25] !== null && !boardBack[selectedPiece.indexOfBoardPiece + 25].isWhite && !boardBack[selectedPiece.indexOfBoardPiece + 9].isWhite) {
            selectedPiece.thirtyTwoSpace = true;
            selectedPiece.rightWay = true;
        }
    }
    else {
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 14) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 14 <= 63 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece + 14] === null && boardBack[selectedPiece.indexOfBoardPiece + 7] !== null && boardBack[selectedPiece.indexOfBoardPiece + 7].isWhite)
            selectedPiece.fourteenthSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 18) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 18 <= 63 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece + 18] === null && boardBack[selectedPiece.indexOfBoardPiece + 9] !== null && boardBack[selectedPiece.indexOfBoardPiece + 9].isWhite)
            selectedPiece.eighteenthSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 14) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 14 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 14] === null && boardBack[selectedPiece.indexOfBoardPiece - 7] !== null && boardBack[selectedPiece.indexOfBoardPiece - 7].isWhite)
            selectedPiece.minusFourteenthSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 18) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 18 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 18] === null && boardBack[selectedPiece.indexOfBoardPiece - 9] !== null && boardBack[selectedPiece.indexOfBoardPiece - 9].isWhite)
            selectedPiece.minusEighteenthSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 28) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 28 <= 63 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece + 28] === null && boardBack[selectedPiece.indexOfBoardPiece + 7] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece + 7].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 21] !== null && boardBack[selectedPiece.indexOfBoardPiece + 21].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece + 14] === null)
            selectedPiece.twentyEightSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 36) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 36 <= 63 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece + 36] === null && boardBack[selectedPiece.indexOfBoardPiece + 9] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece + 9].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 27] !== null && boardBack[selectedPiece.indexOfBoardPiece + 27].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece + 18] === null)
            selectedPiece.thirtySixSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 28) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 28 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 28] === null && boardBack[selectedPiece.indexOfBoardPiece - 21] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece - 7] !== null && boardBack[selectedPiece.indexOfBoardPiece - 7].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 21].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece - 14] === null)
            selectedPiece.minustwentyEightSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 36) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 36 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 36] === null && boardBack[selectedPiece.indexOfBoardPiece - 9] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece - 9].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 27] !== null && boardBack[selectedPiece.indexOfBoardPiece - 27].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece - 18] === null)
            selectedPiece.minusthirtySixSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 42) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 42 <= 63 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece + 28] === null && boardBack[selectedPiece.indexOfBoardPiece + 7] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece + 7].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 21] !== null && boardBack[selectedPiece.indexOfBoardPiece + 21].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 35] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece + 14] === null && boardBack[selectedPiece.indexOfBoardPiece + 42] === null && boardBack[selectedPiece.indexOfBoardPiece + 35].isWhite)
            selectedPiece.fourtyTwoSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece + 54) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 54 <= 63 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece + 36] === null &&
            boardBack[selectedPiece.indexOfBoardPiece + 9] !== null && boardBack[selectedPiece.indexOfBoardPiece + 9].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 18] === null &&
            boardBack[selectedPiece.indexOfBoardPiece + 27] !== null && boardBack[selectedPiece.indexOfBoardPiece + 27].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 54] === null &&
            boardBack[selectedPiece.indexOfBoardPiece + 45] !== null && boardBack[selectedPiece.indexOfBoardPiece + 45].isWhite)
            selectedPiece.fiftyFourSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 42) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 42 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 28] === null && boardBack[selectedPiece.indexOfBoardPiece - 7] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece - 7].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 21] !== null && boardBack[selectedPiece.indexOfBoardPiece - 21].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 14] === null &&
            boardBack[selectedPiece.indexOfBoardPiece - 42] === null && boardBack[selectedPiece.indexOfBoardPiece - 35] !== null && boardBack[selectedPiece.indexOfBoardPiece - 35].isWhite)
            selectedPiece.minusfourtyTwoSpace = true;
        if (isAvailableCell(selectedPiece.indexOfBoardPiece - 54) && !selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 54 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 36] === null && boardBack[selectedPiece.indexOfBoardPiece - 9] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece - 9].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 18] === null && boardBack[selectedPiece.indexOfBoardPiece - 27] !== null &&
            boardBack[selectedPiece.indexOfBoardPiece - 27].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 54] === null && boardBack[selectedPiece.indexOfBoardPiece - 45] !== null && boardBack[selectedPiece.indexOfBoardPiece - 45].isWhite)
            selectedPiece.minusfiftyFourSpace = true;

        if (!selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 32 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 32] === null &&
            boardBack[selectedPiece.indexOfBoardPiece - 9] !== null && boardBack[selectedPiece.indexOfBoardPiece - 9].isWhite && boardBack[selectedPiece.indexOfBoardPiece - 18] === null &&
            boardBack[selectedPiece.indexOfBoardPiece - 25] !== null && boardBack[selectedPiece.indexOfBoardPiece - 25].isWhite) {
            selectedPiece.minusthirtyTwoSpace = true;
            selectedPiece.rightWay = false;
        }
        if (!selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 32 <= 63 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece + 32] === null &&
            boardBack[selectedPiece.indexOfBoardPiece + 7] !== null && boardBack[selectedPiece.indexOfBoardPiece + 7].isWhite && boardBack[selectedPiece.indexOfBoardPiece + 14] === null &&
            boardBack[selectedPiece.indexOfBoardPiece + 23] !== null && boardBack[selectedPiece.indexOfBoardPiece + 23].isWhite) {
            selectedPiece.thirtyTwoSpace = true;
            selectedPiece.rightWay = false;
        }
        if (!selectedPiece.isWhite && selectedPiece.indexOfBoardPiece - 32 >= 0 && boardBack[selectedPiece.indexOfBoardPiece - 32] === null && boardBack[selectedPiece.indexOfBoardPiece - 7] !== null && boardBack[selectedPiece.indexOfBoardPiece - 7].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece - 14] === null && boardBack[selectedPiece.indexOfBoardPiece - 23] !== null && boardBack[selectedPiece.indexOfBoardPiece - 23].isWhite) {
            selectedPiece.minusthirtyTwoSpace = true;
            selectedPiece.rightWay = true;
        }
        if (!selectedPiece.isWhite && selectedPiece.indexOfBoardPiece + 32 <= 63 && selectedPiece.isKing && boardBack[selectedPiece.indexOfBoardPiece + 32] === null && boardBack[selectedPiece.indexOfBoardPiece + 9] !== null && boardBack[selectedPiece.indexOfBoardPiece + 9].isWhite &&
            boardBack[selectedPiece.indexOfBoardPiece + 18] === null && boardBack[selectedPiece.indexOfBoardPiece + 25] !== null && boardBack[selectedPiece.indexOfBoardPiece + 25].isWhite) {
            selectedPiece.thirtyTwoSpace = true;
            selectedPiece.rightWay = true;
        }
    }
    playerMustMakeJumpMovesIfPossible();
}
function playerMustMakeJumpMovesIfPossible() {
    let foundPossibility = false;
    for (let i = 0; i < 64; i++) {
        foundPossibility = false;
        if (playerPieces[0].className.includes('white-piece') &&
            ((i + 14 <= 63 && boardBack[i] !== null && boardBack[i].isWhite && boardBack[i + 7] !== null && !boardBack[i + 7].isWhite && boardBack[i + 14] === null && isAvailableCell(i + 14)) ||
                (i + 18 <= 63 && boardBack[i] !== null && boardBack[i].isWhite && boardBack[i + 9] !== null && !boardBack[i + 9].isWhite && boardBack[i + 18] === null && isAvailableCell(i + 18)) ||
                (i - 14 >= 0 && boardBack[i] !== null && boardBack[i].isWhite && boardBack[i - 7] !== null && boardBack[i].isKing && !boardBack[i - 7].isWhite && boardBack[i - 14] === null && isAvailableCell(i - 14)) ||
                (i - 18 >= 0 && boardBack[i] !== null && boardBack[i].isWhite && boardBack[i - 9] !== null && boardBack[i].isKing && !boardBack[i - 9].isWhite && boardBack[i - 18] === null && isAvailableCell(i - 18))))
            foundPossibility = true;
        else if (playerPieces[0].className.includes('black-piece') &&
            ((i + 14 <= 63 && boardBack[i] !== null && !boardBack[i].isWhite && boardBack[i + 7] !== null && boardBack[i].isKing && boardBack[i + 7].isWhite && boardBack[i + 14] === null && isAvailableCell(i + 14)) ||
                (i + 18 <= 63 && boardBack[i] !== null && !boardBack[i].isWhite && boardBack[i + 9] !== null && boardBack[i].isKing && boardBack[i + 9].isWhite && boardBack[i + 18] === null && isAvailableCell(i + 18)) ||
                (i - 14 >= 0 && boardBack[i] !== null && !boardBack[i].isWhite && boardBack[i - 7] !== null && boardBack[i - 7].isWhite && boardBack[i - 14] === null && isAvailableCell(i - 14)) ||
                (i - 18 >= 0 && boardBack[i] !== null && !boardBack[i].isWhite && boardBack[i - 9] !== null && boardBack[i - 9].isWhite && boardBack[i - 18] === null && isAvailableCell(i - 18))))
            foundPossibility = true;

        if (foundPossibility) {
            selectedPiece.seventhSpace = false;
            selectedPiece.ninthSpace = false;
            selectedPiece.minusSeventhSpace = false;
            selectedPiece.minusNinthSpace = false;
            piecesIndexesPossibleToJump.push(i);
        }
    }
    if (piecesIndexesPossibleToJump.length > 0)
        addAndRemoveEventListenerExcept(piecesIndexesPossibleToJump);
    checkPieceConditions();
}
function addBorder(event) {
    event.target.classList.add('focusInvalid');
    console.log(event.target.className)
}
function removeBorder(event) {
    event.target.classList.remove('focusInvalid');
    console.log(event.target.className)

}
function addAndRemoveEventListenerExcept(arrayOfPossibleJumperPieces) {
    let playerIndex = 0;
    let first = arrayOfPossibleJumperPieces[0];
    for (let i = 0; i < playerPieces.length; i++, playerIndex++) {
        if (playerPieces[i].parentElement.index === first)
            continue;
        playerPieces[playerIndex].addEventListener('focus', addBorder);
        playerPieces[playerIndex].addEventListener('blur', removeBorder);
    }
}
function checkPieceConditions() {

    if (selectedPiece.isKing)
        givePieceBorderAndCountStackedPieces();
    else {
        if (whiteTurn) {
            selectedPiece.minusSeventhSpace = false;
            selectedPiece.minusNinthSpace = false;
            selectedPiece.minusFourteenthSpace = false;
            selectedPiece.minusEighteenthSpace = false;
            selectedPiece.minustwentyEightSpace = false;
            selectedPiece.minusthirtySixSpace = false;
            selectedPiece.minusfourtyTwoSpace = false;
            selectedPiece.minusthirtySixSpace = false;
            selectedPiece.minusthirtyTwoSpace = false;
        } else {
            selectedPiece.seventhSpace = false;
            selectedPiece.ninthSpace = false;
            selectedPiece.fourteenthSpace = false;
            selectedPiece.eighteenthSpace = false;
            selectedPiece.twentyEightSpace = false;
            selectedPiece.thirtySixSpace = false;
            selectedPiece.fourtyTwoSpace = false;
            selectedPiece.thirtySixSpace = false;
            selectedPiece.thirtyTwoSpace = false;
        }
        givePieceBorderAndCountStackedPieces();
    }
}
function givePieceBorderAndCountStackedPieces() {
    const selectedPieceOnBoard = cellsFront[selectedPiece.indexOfBoardPiece].childNodes[0];
    console.log(selectedPieceOnBoard)
    numbersOfStuckedPieces = 1;
    if (selectedPiece.seventhSpace || selectedPiece.ninthSpace || selectedPiece.fourteenthSpace || selectedPiece.eighteenthSpace ||
        selectedPiece.minusSeventhSpace || selectedPiece.minusNinthSpace || selectedPiece.minusFourteenthSpace || selectedPiece.minusEighteenthSpace ||
        selectedPiece.minustwentyEightSpace || selectedPiece.minusthirtySixSpace || selectedPiece.minusfourtyTwoSpace || selectedPiece.minusthirtySixSpace ||
        selectedPiece.twentyEightSpace || selectedPiece.thirtySixSpace || selectedPiece.fourtyTwoSpace || selectedPiece.thirtySixSpace ||
        selectedPiece.thirtyTwoSpace || selectedPiece.minusthirtyTwoSpace) {

        selectedPieceOnBoard.classList.add('focusValid');
        numbersOfStuckedPieces = 0;
    }
    else {
        piecesCantMove.push(selectedPiece);
        if (whiteTurn === selectedPiece.isWhite)
            for (let i = 0; i < piecesCantMove.length - 1; i++) {
                if (piecesCantMove[i] === undefined)
                    continue;
                if (selectedPiece.pieceId === piecesCantMove[i].pieceId)
                    delete piecesCantMove[i];
                else
                    numbersOfStuckedPieces++;
            }
        selectedPieceOnBoard.classList.add('focusInvalid');

    }
    selectedPieceOnBoard.addEventListener('blur', resetBorders);

    if (numbersOfStuckedPieces === playerPieces.length) {
        if (playerPieces[0].className.includes('white-piece'))
            WhiteIsStuck = true;
        else
            BlackIsStuck = true;
        gameOver();
    }
    givePossibleCellsBorder();
}
function resetBorders() {
    for (let i = 0; i < cellsFront.length; i++) {
        if (cellsFront[i] == null) continue;
        if (cellsFront[i].className.includes('cell__possible-cell'))
            cellsFront[i].classList.remove('cell__possible-cell');
        if (cellsFront[i].childNodes[0].className.includes("focusValid"))
            cellsFront[i].childNodes[0].classList.remove('focusValid');
        if (cellsFront[i].childNodes[0].className.includes("focusInvalid"))
            cellsFront[i].childNodes[0].classList.remove('focusInvalid');
    }
}
function givePossibleCellsBorder() {
    selectedPiecesList.push(selectedPiece);

    if (selectedPiece.seventhSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece + 7].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece + 7].addEventListener("click", makeMove);
    }
    if (selectedPiece.ninthSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece + 9].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece + 9].addEventListener("click", makeMove);
    }
    if (selectedPiece.fourteenthSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece + 14].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece + 14].addEventListener("click", makeMove);
    }
    if (selectedPiece.eighteenthSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece + 18].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece + 18].addEventListener("click", makeMove);
    }
    if (selectedPiece.minusSeventhSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece - 7].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece - 7].addEventListener("click", makeMove);
    }
    if (selectedPiece.minusNinthSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece - 9].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece - 9].addEventListener("click", makeMove);
    }
    if (selectedPiece.minusFourteenthSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece - 14].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece - 14].addEventListener("click", makeMove);
    }
    if (selectedPiece.minusEighteenthSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece - 18].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece - 18].addEventListener("click", makeMove);
    }
    if (selectedPiece.twentyEightSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece + 28].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece + 28].addEventListener("click", makeMove);
    }
    if (selectedPiece.thirtySixSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece + 36].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece + 36].addEventListener("click", makeMove);
    }
    if (selectedPiece.fourtyTwoSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece + 42].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece + 42].addEventListener("click", makeMove);
    }
    if (selectedPiece.fiftyFourSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece + 54].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece + 54].addEventListener("click", makeMove);
    }
    if (selectedPiece.minustwentyEightSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece - 28].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece - 28].addEventListener("click", makeMove);
    }
    if (selectedPiece.minusthirtySixSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece - 36].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece - 36].addEventListener("click", makeMove);
    }
    if (selectedPiece.minusfourtyTwoSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece - 42].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece - 42].addEventListener("click", makeMove);
    }
    if (selectedPiece.minusfiftyFourSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece - 54].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece - 54].addEventListener("click", makeMove);
    }
    if (selectedPiece.thirtyTwoSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece + 32].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece + 32].addEventListener("click", makeMove);
    }
    if (selectedPiece.minusthirtyTwoSpace) {
        cellsFront[selectedPiece.indexOfBoardPiece - 32].classList.add('cell__possible-cell');
        cellsFront[selectedPiece.indexOfBoardPiece - 32].addEventListener("click", makeMove);
    }

}
function makeMove() {
    const currentSelectedPiece = selectedPiecesList[selectedPiecesList.length - 1];
    boardBack[currentSelectedPiece.indexOfBoardPiece] = null;
    let parsedIndexOfCellTo = this.index;
    directionOfJumpMoves = currentSelectedPiece.indexOfBoardPiece - parsedIndexOfCellTo;

    if (directionOfJumpMoves > 9 || directionOfJumpMoves < -9) {//means its a jump move
        if (directionOfJumpMoves === 14) {
            boardBack[currentSelectedPiece.indexOfBoardPiece - 7] = null;
        }
        else if (directionOfJumpMoves === 18) {
            boardBack[currentSelectedPiece.indexOfBoardPiece - 9] = null;
        }
        else if (directionOfJumpMoves === -14) {
            boardBack[currentSelectedPiece.indexOfBoardPiece + 7] = null;
        }
        else if (directionOfJumpMoves === -18) {
            boardBack[currentSelectedPiece.indexOfBoardPiece + 9] = null;
        }
        else if (directionOfJumpMoves === 28) {
            boardBack[currentSelectedPiece.indexOfBoardPiece - 7] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece - 21] = null;
        }
        else if (directionOfJumpMoves === -28) {
            boardBack[currentSelectedPiece.indexOfBoardPiece + 7] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece + 21] = null;
        }
        else if (directionOfJumpMoves === 36) {
            boardBack[currentSelectedPiece.indexOfBoardPiece - 9] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece - 27] = null;
        }
        else if (directionOfJumpMoves === -36) {
            boardBack[currentSelectedPiece.indexOfBoardPiece + 9] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece + 27] = null;
        }
        else if (directionOfJumpMoves === 42) {
            boardBack[currentSelectedPiece.indexOfBoardPiece - 7] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece - 21] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece - 35] = null;
        }
        else if (directionOfJumpMoves === -42) {
            boardBack[currentSelectedPiece.indexOfBoardPiece + 7] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece + 21] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece + 35] = null;
        }
        else if (directionOfJumpMoves === 54) {
            boardBack[currentSelectedPiece.indexOfBoardPiece - 9] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece - 27] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece - 45] = null;
        }
        else if (directionOfJumpMoves === -54) {
            boardBack[currentSelectedPiece.indexOfBoardPiece + 9] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece + 27] = null;
            boardBack[currentSelectedPiece.indexOfBoardPiece + 45] = null;
        }
        else if (directionOfJumpMoves === -32) {
            currentSelectedPiece.rightWay ? boardBack[currentSelectedPiece.indexOfBoardPiece + 9] = null : boardBack[currentSelectedPiece.indexOfBoardPiece + 7] = null;
            currentSelectedPiece.rightWay ? boardBack[currentSelectedPiece.indexOfBoardPiece + 25] = null : boardBack[currentSelectedPiece.indexOfBoardPiece + 23] = null;
        }
        else if (directionOfJumpMoves === 32) {
            currentSelectedPiece.rightWay ? boardBack[currentSelectedPiece.indexOfBoardPiece - 7] = null : boardBack[currentSelectedPiece.indexOfBoardPiece - 9] = null;
            currentSelectedPiece.rightWay ? boardBack[currentSelectedPiece.indexOfBoardPiece - 23] = null : boardBack[currentSelectedPiece.indexOfBoardPiece - 25] = null;
        }
    }
    if (whiteTurn) {
        if (parsedIndexOfCellTo >= 56 && parsedIndexOfCellTo <= 63 || currentSelectedPiece.isKing) //if piece become king
            currentSelectedPiece.isKing = true;
        boardBack[parsedIndexOfCellTo] = { isWhite: true, isKing: currentSelectedPiece.isKing };
    }
    else {
        if (parsedIndexOfCellTo >= 0 && parsedIndexOfCellTo <= 7 || currentSelectedPiece.isKing) //if piece become king
            currentSelectedPiece.isKing = true;
        boardBack[parsedIndexOfCellTo] = { isWhite: false, isKing: currentSelectedPiece.isKing };
    }
    whitesPieces = document.getElementsByClassName("white-piece");
    blacksPieces = document.getElementsByClassName("black-piece");
    removeEventListener();
    updateBoardHtml();
}
function updateBoardHtml() {
    for (let i = 0; i < boardBack.length; i++) {
        let cell;
        if (cellsFront[i] !== null) {
            cell = cellsFront[i]
            if (boardBack[i] !== null && boardBack[i].isWhite && !boardBack[i].isKing)
                cell.innerHTML = `<div class="white-piece" tabindex="${i}"></div>`;
            else if (boardBack[i] !== null && boardBack[i].isWhite && boardBack[i].isKing)
                cell.innerHTML = `<div class="white-piece king" tabindex="${i}"></div>`;
            else if (boardBack[i] !== null && !boardBack[i].isWhite && !boardBack[i].isKing)
                cell.innerHTML = `<div class="black-piece" tabindex="${i}"></div>`;
            else if (boardBack[i] !== null && !boardBack[i].isWhite && boardBack[i].isKing)
                cell.innerHTML = `<div class="black-piece king" tabindex="${i}"></div>`;
            else
                cell.innerHTML = "<div class='empty'></div>";
        }
    }
    gameOver();
}
function removeEventListener() {
    const cellsWithEventListeners = document.querySelectorAll('.cell');
    for (let i = 0; i < cellsWithEventListeners.length; i++) {
        cellsWithEventListeners[i].removeEventListener('click', makeMove);
    }
    for (let i = 0; i < playerPieces.length; i++) {
        playerPieces[i].removeEventListener('focus', addBorder);
        playerPieces[i].removeEventListener('blur', removeBorder);
    }
    resetBorders();
}
function gameOver() {
    document.removeEventListener('click', changeControl, true)

    checkPossibilityForDraw();

    moveMade();

    if (whitesPieces.length === 11 || WhiteIsStuck) {
        winner = isUserTheWhites ? player2 : username
        loser = isUserTheWhites ? username : player2
        updateScore({ winner, loser })
        socket.emit('checkersSocket', { room, winner, loser })
    }
    else if (blacksPieces.length === 11 || BlackIsStuck) {
        winner = isUserTheWhites ? username : player2
        loser = isUserTheWhites ? player2 : username
        updateScore({ winner, loser })
        socket.emit('checkersSocket', { room, winner, loser })

    }
    else if (draw === true) {
        whiteTurnText.innerHTML = "!!!  DRAW  !!!";
        socket.emit('checkersSocket', { room, winner, loser })
    }
}
function checkPossibilityForDraw() {
    if ((blacksPieces.length <= 2 && whitesPieces.length < 2) || (whitesPieces.length <= 2 && blacksPieces.length < 2))
        draw = true;
}
function moveMade() {
    socket.emit('move made', ({ boardBack, room }))
}

function updateBoardUi(board) {
    boardBack = board
    for (let i = 0; i < boardBack.length; i++) {
        let cell;
        if (cellsFront[i] !== null) {
            cell = cellsFront[i]
            if (boardBack[i] !== null && boardBack[i].isWhite && !boardBack[i].isKing)
                cell.innerHTML = `<div class="white-piece" tabindex="${i}"></div>`;
            else if (boardBack[i] !== null && boardBack[i].isWhite && boardBack[i].isKing)
                cell.innerHTML = `<div class="white-piece king" tabindex="${i}"></div>`;
            else if (boardBack[i] !== null && !boardBack[i].isWhite && !boardBack[i].isKing)
                cell.innerHTML = `<div class="black-piece" tabindex="${i}"></div>`;
            else if (boardBack[i] !== null && !boardBack[i].isWhite && boardBack[i].isKing)
                cell.innerHTML = `<div class="black-piece king" tabindex="${i}"></div>`;
            else
                cell.innerHTML = "<div class='empty'></div>";
        }
    }
}
function changeTurn() {

    if (whiteTurn) {
        whiteTurn = false;
        whiteTurnText.innerHTML = (!whiteTurn && !isUserTheWhites && !whiteTurnText.innerHTML.includes('!')) ? 'Your Turn' : 'Opponent Turn'
    }
    else {
        whiteTurn = true;
        whiteTurnText.innerHTML = (whiteTurn && isUserTheWhites && !whiteTurnText.innerHTML.includes('!')) ? 'Your Turn' : 'Opponent Turn'
    }
    selectedPiecesList = [];
    piecesCantMove = [];
    numbersOfStuckedPieces = 1;
    piecesIndexesPossibleToJump = [];
    resetSelectedPiece();
    startGame();
}

const updateScore = (data) => {
    fetch(changeUsersScores, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then((res) => {
        if (res.ok)
            return res.json();
        else
            throw new Error(res)
    }).then((resJson) => {
        console.log('succeedddddd')
    }).catch((err) => {
        console.log(err)
    })
}

socket.on('update board', (boardBack) => {
    updateBoardUi(boardBack)
    changeTurn()
})


socket.on('redirectToLobbyPage', ({ url, winner }) => {
    whiteTurnText.innerHTML = `${winner.toUpperCase()} WON ! &#128081`;
    setTimeout(() => {
        console.log(winner, username)
        location.href = url + username
    }, 5000);
})

startGame()