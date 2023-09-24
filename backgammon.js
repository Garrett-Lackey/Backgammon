const readline = require('node:readline');

// Define ability to get console inputs
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

// Constant Variables
const unassigned = -1;
const red        =  0;
const white      =  1;

// Global Variables
// Contains 24 points with an array to show ownership and amount located 
board = [[white, 2], [-1, 0], [-1, 0], [-1, 0], [-1, 0], [red, 5],
         [-1, 0], [red, 3], [-1, 0], [-1, 0], [-1, 0], [white, 5],
         [red, 5], [-1, 0], [-1, 0], [-1, 0], [white, 3], [-1, 0], 
         [white, 5], [-1, 0], [-1, 0], [-1, 0], [-1, 0], [red, 2] ];
bar = [];

// the goal of the game is to 'bear off' all your tablemen
// to 'bear off' tablemen, all 15 tablemen must be in your home area 
// the white home area is indexes 19-23
// the red home area is indexes 0-4
// each turn 2 dice are rolled, and each die represents the movemenet of one piece
// rolling doubles allows each die to be used twice
// if a move can be played, it must be played
// if a move allows another move to be played, when no other move would be possible, it must be played
// a move to another colors controlled point is not allowed
// if a move to another colors point only has one tablmen, then the blot (single tableman on a point) is placed on the bar
// to enter the board off the bar, the player must have a roll into the opponents home points (1-6), if no die allows this the turn is skipped
// a player is under no obligation to bear off if he can make an otherwise legal move

const getColorAt = index => board[index][0] === red ? "r" : (board[index][0] === white ? "w" : "|");
const getValueAt = index => board[index][1];

const getAvailableTurns = color => {
    let turns = [];
    board.forEach((element, index) => {
        if (element[0] == color) turns.push(index)
    })
    return turns;
}

const rollDice = () => [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];

const moveTableman = (point, dist, team) => {
    let startPos = board[point];
    if (startPos[0] != team) return false;
    if (startPos[0] === red) dist *= -1;

    let endPos = board[point + dist];
    if ((startPos[0] != endPos[0] || endPos[0] != unassigned) && endPos[1] > 1)
        return false;

    if (endPos[1] == 1 && endPos[0] != team) {
        bar.push (endPos);
        endPos[0] = startPos[0];
        endPos[1] = 1;
    } else if (endPos[0] == team) { 
        endPos[1]++;
    }
    else {
        endPos[0] = startPos[0];
        endPos[1] = 1;
    }
    startPos[1]--;
    console.log(startPos, endPos);

    if (startPos[1] < 1) startPos[0] = unassigned;
    
    return true;
}

const displayBoard = () => {
    let boardStr = "";
    for (let i = 0; i < 12; i++) {
        let addStr = "";
        debugger
        if (i === 0) {
            for (let j = 11; j >= 0; j--)
                addStr += `${getColorAt(j)} `;
        } else if (i === 11) {
            for (let j = 12; j < 24; j++)
                addStr += `${getColorAt(j)} `;
        } else if (i < 6) {
            for (let j = 11; j >= 0; j--) {
                let currentValue = getValueAt(j);
                addStr += `${currentValue >= i ? (currentValue > 5 && i === 5 ? currentValue : '*'):' '} `.slice(0,2);
            }
        } else {
            for (let j = 12; j < 24; j++) {
                let currentValue = getValueAt(j);
                addStr += `${currentValue >= 11 - i ? (currentValue > 5 && i === 6 ? currentValue : '*'):' '} `.slice(0,2);
            }
        }
        if (i === 5) addStr += '\n-----------------------';
        debugger
        boardStr += `${addStr}\n`;
    }
    console.log(boardStr);
} 

displayBoard();
let whiteTurn = getAvailableTurns(white);
console.log(whiteTurn);
console.log(getAvailableTurns(red));
let roll = rollDice();
console.log(roll);
console.log(moveTableman(whiteTurn[0], roll[0], white));
console.log(moveTableman(whiteTurn[0], roll[1], white));
displayBoard();
rl.close();