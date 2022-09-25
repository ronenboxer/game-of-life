'use strict'

const ROWS_AMOUNT = 60;
const COLS_AMOUNT = 60;
const SPEED_INPUT = document.querySelector('.speed');
const SPEED_MIN = +SPEED_INPUT.min;
const SPEED_MAX = +SPEED_INPUT.max;
const SPEED_RANNGE = SPEED_MAX - SPEED_MIN;

var speedLog = document.querySelector('label');
var isOn = false;
var intervalId;
var isThisGeneration = true;
var isKillModeOn = false;
var isCountingGeneration = true;
var isStuck = false;
var isHorInfinite = false;
var isVerInfinite = false;

var gBoard = [];
var gOneGenAgo;
var gTwoGensAgo;
var gThreeGensAgo;
var gFourGensAgo;
var gFiveGensAgo;
var gSixGenAgo;
var numOfAlive;
var numOfAliveOneGenAgo;
var numOfAliveTwoGenAgo;
var numOfGeneration;
var speed = SPEED_MIN + SPEED_MAX - +(SPEED_INPUT.value);

var gStates = ['living', 'super', 'dead', 'born', 'dying'];
//     { state: 'living', color: 'green' },
//     { state: 'born', color: 'yellow' },
//     { state: 'dying', color: 'red' },
//     { state: 'dead', color: 'gray' }
// ];

onClearBoard();


function onClearBoard() {
    numOfGeneration = 0;
    isCountingGeneration = true;
    isStuck = false;
    numOfAlive = 0;
    gOneGenAgo = null;
    gTwoGensAgo = null;
    gThreeGensAgo = null;
    gFourGensAgo = null;
    gFiveGensAgo = null;
    gSixGenAgo = null;
    numOfAlive = 0;
    numOfGeneration = 0;
    pause();
    gBoard = [];
    for (var i = 0; i < ROWS_AMOUNT; i++) {
        gBoard[i] = [];
        for (var j = 0; j < COLS_AMOUNT; j++) {
            gBoard[i][j] = 'dead';
        }
    }
    renderVillage();
}

function renderVillage(board) {
    numOfAlive = 0;
    var newBoardStr = `<table>\n`;
    for (var i = 0; i < ROWS_AMOUNT; i++) {
        newBoardStr += '<tr>\n';
        for (var j = 0; j < COLS_AMOUNT; j++) {
            if (!gBoard[i][j]) gBoard[i][j] = 'dead'
            var className = gBoard[i][j];
            if (className !== 'dead' && className !== 'dying') numOfAlive++;
            newBoardStr += `<td class="${className}" `;
            newBoardStr += `data-row="${i}" data-col="${j}" `;
            newBoardStr += `onclick="switchState(this, ${i}, ${j})"</td>\n`;
        }
        newBoardStr += `</tr>\n`;
    }
    newBoardStr += `</table>`;
    var elVillage = document.querySelector('.village');
    elVillage.innerHTML = newBoardStr;
    printInfo();
}

function onToggleGame(elBttn) {
    isOn = !isOn;
    if (isOn && numOfAlive && !isStuck) {
        elBttn.innerText = `Pause`;

        start()
    } else {
        elBttn.innerText = `Start`;
        pause();
    }
}

function start() {
    intervalId = setInterval(() => {
        if (isThisGeneration) nextGeneration();
        else currGeneration();
        isThisGeneration = !isThisGeneration;
    }, speed);
}

function currGeneration() {
    for (var i = 0; i < ROWS_AMOUNT; i++) {
        for (var j = 0; j < COLS_AMOUNT; j++) {
            var currState = gBoard[i][j];
            if (currState === 'super' || currState === 'living' || currState === 'dead') continue;
            var nextState = (currState === 'born') ? 'living' : 'dead';
            gBoard[i][j] = nextState;
            var elPerson = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            elPerson.classList.remove(`${currState}`);
            elPerson.classList.add(`${nextState}`);
        }
    }
    if (!numOfAlive) pause();
}

function nextGeneration() {
    numOfAliveTwoGenAgo = numOfAliveOneGenAgo;
    numOfAliveOneGenAgo = numOfAlive;
    if (isCountingGeneration) {
        if (compareGeneration(gBoard, gTwoGensAgo) ||
            compareGeneration(gBoard, gThreeGensAgo) ||
            compareGeneration(gBoard, gFourGensAgo) ||
            compareGeneration(gBoard, gFiveGensAgo) ||
            compareGeneration(gBoard, gSixGenAgo)) isCountingGeneration = false;
        if (compareGeneration(gBoard, gOneGenAgo)) {
            pause();
            isStuck = true;
        }
    }
    gSixGenAgo = gFiveGensAgo;
    gFiveGensAgo = gFourGensAgo;
    gFourGensAgo = gThreeGensAgo;
    gThreeGensAgo = gTwoGensAgo;
    gTwoGensAgo = gOneGenAgo;
    gOneGenAgo = gBoard;
    if (isCountingGeneration) numOfGeneration++;
    var newBoard = [];
    for (var i = 0; i < ROWS_AMOUNT; i++) {
        newBoard[i] = [];
        for (var j = 0; j < COLS_AMOUNT; j++) {
            var currState = gBoard[i][j];
            var neighboursCount = getNumOfNeighbours(i, j);
            var nextState = getNextState(neighboursCount, currState);
            if (nextState === currState) {
                newBoard[i][j] = nextState;
                continue;
            }
            if (nextState === 'born') numOfAlive++;
            else if (nextState === 'dying') numOfAlive--;
            if (currState === 'super') {
                newBoard[i][j] = 'super';
                continue;
            }
            newBoard[i][j] = nextState;
            var elPerson = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            elPerson.classList.remove(`${currState}`);
            elPerson.classList.add(`${nextState}`);
        }
    }
    gBoard = newBoard;
    printInfo();
}

function getNextState(neighboursCount, currState) {
    if (currState === 'living') {
        if (neighboursCount < 2 || neighboursCount > 3) return 'dying';
    } else if (currState === 'dead') {
        if (neighboursCount === 3) return 'born';
    } else if (currState === 'born') {
        if (neighboursCount < 2 || neighboursCount > 3) return 'dying';
    } else if (currState === 'dying') {
        if (neighboursCount === 3) return 'born';
    }
    return currState;
}

function getNumOfNeighbours(rowIdx, colIdx) {
    var neighboursCount = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        var currRow = i;
        if (isVerInfinite) currRow = (currRow + ROWS_AMOUNT) % ROWS_AMOUNT;
        if (currRow === -1 || currRow === ROWS_AMOUNT) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            var currCol = j;
            if (isHorInfinite) currCol = (currCol + COLS_AMOUNT) % COLS_AMOUNT;
            if (currCol === -1 || currCol === COLS_AMOUNT) continue;
            if (currRow === rowIdx && currCol === colIdx) continue;
            if (gBoard[currRow][currCol] === 'living' || gBoard[currRow][currCol] === 'born') neighboursCount++;
        }
    }
    return neighboursCount;
}


function pause() {
    clearInterval(intervalId);
    isOn = false;
    document.querySelector(`.start`).innerText = 'Start';
}

function switchState(elPerson, rowIdx, colIdx) {
    if (isKillModeOn) {
        killNeighbours(rowIdx, colIdx);
    } else {
        isStuck = false;
        isCountingGeneration = true;
        var currState = gBoard[rowIdx][colIdx];
        elPerson.classList.remove(`${currState}`);
        var idxOfState = gStates.indexOf(currState);
        idxOfState++;
        idxOfState %= 3;
        var nextState = gStates[idxOfState];
        if (nextState !== 'dead') {
            if (currState === 'dead' || currState === 'dying') numOfAlive++;
        } else if (currState !== 'dead' && currState !== 'dying') numOfAlive--;
        elPerson.classList.add(`${nextState}`);
        gBoard[rowIdx][colIdx] = nextState;
        printInfo();
    }
}

function onKillMode(elBttn) {
    if (!isKillModeOn) {
        elBttn.classList.remove(`kill-off`);
        elBttn.classList.add(`kill-on`);
    } else {
        elBttn.classList.remove(`kill-on`);
        elBttn.classList.add(`kill-off`);
    }

    isKillModeOn = !isKillModeOn;
}

function killNeighbours(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        var currRow = i;
        if (isVerInfinite) currRow = (currRow + ROWS_AMOUNT) % ROWS_AMOUNT;
        if (currRow === -1 || currRow === ROWS_AMOUNT) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            var currCol = j;
            if (isHorInfinite) currCol = (currCol + COLS_AMOUNT) % COLS_AMOUNT;
            if (currCol === -1 || currCol === COLS_AMOUNT) continue;
            if (currRow === rowIdx && currCol === colIdx) continue;
            var currState = gBoard[currRow][currCol];
            if (currState === 'dead' || currState === 'super') continue;
            gBoard[currRow][currCol] = 'dead';
            numOfAlive--;
            var elPerson = document.querySelector(`[data-row="${currRow}"][data-col="${currCol}"]`);
            elPerson.classList.remove(`${currState}`);
            elPerson.classList.add(`dead`);
        }
    }
    printInfo();
}

function onRandom() {
    numOfGeneration = 0;
    isCountingGeneration = true;
    isStuck = false;
    numOfAlive = 0;
    gOneGenAgo = null;
    gTwoGensAgo = null;
    gThreeGensAgo = null;
    gFourGensAgo = null;
    gFiveGensAgo = null;
    gSixGenAgo = null;
    numOfAlive = 0;
    numOfGeneration = 0;
    pause();
    gBoard = [];
    for (var i = 0; i < ROWS_AMOUNT; i++) {
        gBoard[i] = [];
        for (var j = 0; j < COLS_AMOUNT; j++) {
            gBoard[i][j] = (Math.random() > 0.78) ? 'living' : 'dead';
            if (gBoard[i][j] === 'living') numOfAlive++;
        }
    }
    renderVillage();

}

function onSave() {
    if (numOfAlive) {
        localStorage.removeItem('Board');
        localStorage.setItem('Board', JSON.stringify(gBoard));
        localStorage.setItem('numOfAlive', numOfAlive);
    }
}

function onLoad() {
    var prevBoard = JSON.parse(localStorage.getItem('Board'));
    if (!prevBoard) return;
    pause();
    isStuck = false;
    var tempNum = localStorage.getItem("numOfAlive");
    if (!tempNum) tempNum = 0;
    numOfAlive = tempNum;
    numOfGeneration = 0;
    gOneGenAgo = null;
    gTwoGensAgo = null;
    gThreeGensAgo = null;
    gFourGensAgo = null;
    gFiveGensAgo = null;
    gSixGenAgo = null;
    gBoard = prevBoard;
    isCountingGeneration = true;
    renderVillage();
}

function printInfo() {
    var elInfo = document.querySelectorAll('.info span');
    if (numOfAlive) {
        elInfo[0].innerText = numOfAlive;
        elInfo[1].innerText = numOfGeneration;
    } else {
        numOfGeneration = 0;
        elInfo[0].innerText = '';
        elInfo[1].innerText = '';
    }
}

function compareGeneration(gen1, gen2) {
    if (numOfAlive !== numOfAliveTwoGenAgo) return false;
    if (!gen1 || !gen2) return false;
    if (gen2.length !== gen1.length) return false;
    if (gen1[0].length !== gen2[0].length) return false;
    for (var i = 0; i < gen1.length; i++) {
        for (var j = 0; j < gen1[i].length; j++) {
            if (gen2[i][j] !== gen1[i][j]) return false;
        }
    }
    return true;
}

function onChangeSpeed(elInput) {
    speed = SPEED_MIN + SPEED_MAX - (+elInput.value);
    var speedInPercentage = parseInt(100 * (elInput.value - SPEED_MIN) / SPEED_RANNGE) + '%'
    speedLog.innerText = 'Speed ' + speedInPercentage;
    clearInterval(intervalId);
    if (isOn) start();
}

function onChangeHorBorder() {
    isHorInfinite = !isHorInfinite;
}

function onChangeVerBorder() {
    isVerInfinite = !isVerInfinite;
}