const board = document.getElementById('board');
const headline = document.getElementById('headline');
const whiteTurnText = document.querySelector(".white-turn");
const blackTurnText = document.querySelector(".black-turn");

let whitesPieces = [];
let blacksPieces = [];
let selectedPiecesList = [];
let piecesCantMove = [];
let unAvailableCells = [];
let piecesIndexesPossibleToJump = [];
let cellsFront = [];

let thereIsPossibleJumpMove = false;

const boardBack = [
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
console.log(cellsFront)
console.log(boardBack)
function changeHeadlineColor() {
    setInterval(() => {
        headline.className = 'secondHeadline';
    }, 10000);
    setInterval(() => {
        headline.className = 'thirdHeadline';
    }, 20000);
}

//---------------------------------------------------------//
const focusOnPiece = (event) => {
    focusedPieceIndex = event.target.parentElement.index;
    definePlayerPieces();
}
function playerFocusedOnPiece() {
    if (whiteTurn)
        for (let i = 0; i < whitesPieces.length; i++)
            whitesPieces[i].addEventListener('focus', focusOnPiece)
    else
        for (let i = 0; i < blacksPieces.length; i++)
            blacksPieces[i].addEventListener('focus', focusOnPiece)
}
function definePlayerPieces() {
    if (whiteTurn)
        playerPieces = whitesPieces;
    else
        playerPieces = blacksPieces;

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
    selectedPiece.indexOfBoardPiece = focusedPieceIndex;
    selectedPiece.isWhite = boardBack[focusedPieceIndex].isWhite;
    isPieceKing();
}

function isPieceKing() {
    if (boardBack[focusedPieceIndex].isKing)
        selectedPiece.isKing = true;
    else
        selectedPiece.isKing = false;
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
    console.log(unAvailableCells)
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
}
function removeBorder(event) {
    event.target.classList.remove('focusInvalid');
}
function addAndRemoveEventListenerExcept(arrayOfPossibleJumperPieces) {
    let playerIndex = 0;
    let first = arrayOfPossibleJumperPieces[0];
    for (let i = 0; i < playerPieces.length; i++, playerIndex++) {
        if (playerPieces[i].parentElement.index === first)
            continue;
        playerPieces[playerIndex].removeEventListener('focus', focusOnPiece);
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
    let numbersOfStuckedPieces = 1;
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
    console.log(directionOfJumpMoves)

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
    console.log(boardBack)
    removeEventListener();
    updateBoardHtml();
}

function updateBoardHtml() {
    console.log(cellsFront)
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
    let winState = document.getElementsByClassName('win')[0];
    let drawState = document.getElementsByClassName('draw')[0];
    checkPossibilityForDraw();
    if (whitesPieces.length === 0 || WhiteIsStuck) {
        winState.classList.remove('none');
        winState.innerHTML = "Black WON &#128081";
        whiteTurnText.className = "white-turn";
        blackTurnText.className = "black-turn";
        whiteTurnText.innerHTML = "BLACK";
        blackTurnText.innerHTML = "WON !!!";
    }
    else if (blacksPieces.length === 0 || BlackIsStuck) {
        winState.classList.remove('none');
        winState.innerHTML = "White WON &#128081";
        whiteTurnText.className = "white-turn";
        blackTurnText.className = "black-turn";
        whiteTurnText.innerHTML = "WHITE";
        blackTurnText.innerHTML = "WON !!!";
    }
    else if (draw === true) {
        drawState.classList.remove('none');
        drawState.innerHTML = "!!!  DRAW  !!!";
        whiteTurnText.className = "white-turn none";
        blackTurnText.className = "black-turn none";
    }
    else {
        changePlayer();
    }
}
function checkPossibilityForDraw() {
    if ((blacksPieces.length <= 2 && whitesPieces.length < 2) || (whitesPieces.length <= 2 && blacksPieces.length < 2))
        draw = true;
}
function changePlayer() {
    if (whiteTurn) {
        whiteTurn = false;
        whiteTurnText.classList.add('none');
        blackTurnText.classList.remove('none');
    }
    else {
        whiteTurn = true;
        blackTurnText.classList.add('none');
        whiteTurnText.classList.remove('none');
    }
    selectedPiecesList = [];
    piecesCantMove = [];
    numbersOfStuckedPieces = 1;
    thereIsPossibleJumpMove = false;
    piecesIndexesPossibleToJump = [];
    resetSelectedPiece();
    playerFocusedOnPiece();
}

function play() {
    createBoard();
    changeHeadlineColor();
    playerFocusedOnPiece();
}

play();