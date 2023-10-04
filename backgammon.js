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
// DEBUG BOARD
board = [[white, 2], [red, 1], [red, 1], [red, 1], [red, 1], [red, 1],
         [red, 1], [red, 1], [-1, 0], [-1, 0], [-1, 0], [white, 5],
         [red, 5], [-1, 0], [-1, 0], [-1, 0], [white, 3], [-1, 0], 
         [white, 5], [-1, 0], [-1, 0], [-1, 0], [-1, 0], [red, 2] ];
// DEFAULT BOARD LAYOUT
board = [[white, 2], [-1, 0], [-1, 0], [-1, 0], [-1, 0], [red, 5],
         [-1, 0], [red, 3], [-1, 0], [-1, 0], [-1, 0], [white, 5],
         [red, 5], [-1, 0], [-1, 0], [-1, 0], [white, 3], [-1, 0], 
         [white, 5], [-1, 0], [-1, 0], [-1, 0], [-1, 0], [red, 2]];
bar = [0, 0];

// IMPLEMENTED
// the goal of the game is to 'bear off' all your tablemen
// to 'bear off' tablemen, all 15 tablemen must be in your home area 
// the white home area is indexes 19-23
// the red home area is indexes 0-4
// each turn 2 dice are rolled, and each die represents the movement of one piece
// a move to another colors controlled point is not allowed
// if a move to another colors point only has one tablmen, then the blot (single tableman on a point) is placed on the bar
// to enter the board off the bar, the player must have a roll into the opponents home points (1-6), if no die allows this the turn is skipped
// a player is under no obligation to bear off if he can make an otherwise legal move

// UNIMPLEMENTED
// rolling doubles allows each die to be used twice
// if a move can be played, it must be played
// if a move allows another move to be played, when no other move would be possible, it must be played

const getColorAt = index => board[index][0] === red ? "r" : (board[index][0] === white ? "w" : "|");
const getPointAt = index => {
    if (index < 0 || index > board.length)
        return null;
    return board[index];
}
const getValueAt = index => {
    if (index < 0 || index > board.length)
        return null;
    return board[index][1];
}
const getHomePoints = color => board.filter((point, index) => color == white ? index >= 19 : index <= 4)
const getAllValues = (points, color) => points.reduce((acc, point) => point[0] == color ? acc + point[1] : acc, 0)
const isWinner = () => {
    if (getAllValues(board, white) == 0) return white;
    else if (getAllValues(board, red) == 0) return red;
    return -1;
}

// Returns an array of possible indexes on the board for a color 
const getAvailableTurns = color => {
    let turns = [];
    board.forEach((element, index) => {
        if (element[0] == color) turns.push(index)
    })
    return turns;
}

// Filters a list of turns to only give the legal turns for a roll
const filterLegalTurns = (color, roll) => {
    let availableTurns = getAvailableTurns(color);
    let insideHomePoints = getHomePoints(color);
    debugger
    // If the player has a point on the bar, its their only allowed move
    if (bar[color]) {
        if (board[(color == white ? -1 : 24) + (color == white ? roll : -roll)][0] != (color == white ? red : white))
            return [['Bar', roll]]; // Nested to follow convention of an array of moves [start, roll]
        return [];
    }

    // If all the tablemen are located in the players home, then any move is legal
    let total = getAllValues(board, color);
    total -= getAllValues(insideHomePoints, color);
    
    if (!total) 
        return availableTurns.map(point => [point, roll]);
    availableTurns.filter(point => color == white ? point + roll < 24 : point + roll >= 0);

    // Filter the moves available to those that don't bear off a tablemen
    let legalTurnCombos = [];

    availableTurns.forEach(turn => {
        let endValue = getPointAt(turn + roll * (color == white ? 1 : -1));
        if (endValue == null) 
            return;
        if (endValue[0] === color || endValue[0] === unassigned || endValue[1] === 1) 
            legalTurnCombos.push([turn, roll]);
    });

    return legalTurnCombos;
}

const rollDice = () => [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];

const moveTableman = (point, dist, color) => {
    if (point === "Bar") 
        // If the tableman is entering the board onto a point thats not the other players
        if (board[(color == white ? -1 : 24) + (color == white ? dist : -dist)][0] !== (color == white ? red : white)){
            board[(color == white ? -1 : 24) + (color == white ? dist : -dist)][0] = color;
            board[(color == white ? -1 : 24) + (color == white ? dist : -dist)][1]++;
            bar[color]--;
            return true;
        } else return false;

    let startPos = board[point];
    if (startPos[0] != color) return false;
    if (startPos[0] === red) dist *= -1;

    if (point + dist > 23 || point + dist < 0) {
        startPos[1]--;
        if (!startPos[1]) startPos[0] = unassigned;
        return;
    }

    let endPos = board[point + dist];
    if (endPos[0] == (color == white ? red : white) && endPos[1] > 1)
        return false;

    if (endPos[1] == 1 && endPos[0] != color) {
        bar[color == white ? red : white]++;
        endPos[0] = startPos[0];
        endPos[1] = 1;
    } else if (endPos[0] == color) { 
        endPos[1]++;
    }
    else {
        endPos[0] = startPos[0];
        endPos[1] = 1;
    }
    startPos[1]--;

    if (startPos[1] < 1) startPos[0] = unassigned;
    
    return true;
}

const displayBoard = () => {
    let boardStr = "\n1 1 1\n2 1 0 9 8 7 6 5 4 3 2 1\n";
    for (let i = 0; i < 12; i++) {
        let addStr = "";
        
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
        if (i === 5) addStr += `\n------${(bar[white] ? `w:${bar[white]}`.padEnd(6, "-") : "------") + (bar[red] ? `${bar[red]}:r`.padStart(5, "-") : "------")}------`;
        
        boardStr += `${addStr}\n`;
    }
    boardStr += '1 1 1 1 1 1 1 2 2 2 2 2\n';
    boardStr += '3 4 5 6 7 8 9 0 1 2 3 4\n';
    console.log(boardStr);
} 

const getTurnText = (turns) => {
    return turns.map((turn, i) => `${i + 1}: point ${turn[0]+1}, roll ${turn[1]}.\n`).join("");
}

const chooseTurn = (color, rolls) => {
    let turns = rolls.map(roll => filterLegalTurns(color, roll));
    turns = turns.flat(1);

    if (!turns.length) {
        console.log("No Available Moves.")
        gameLoop((color + 1) % 2);
        return;
    }

    rl.question(`Available Turns: \n${getTurnText(turns)}\nChoose a turn: `, (answer) => {
        answer = parseInt(answer);

        if (isNaN(answer) || answer > turns.length) {
            console.log("\nInvalid Input.\n");
            chooseTurn(color, rolls);
            return;
        }
        let [move, roll] = turns[answer-1];

        moveTableman(move, roll, color);
        displayBoard();

        rolls.splice(rolls.indexOf(roll), 1);
        if (rolls.length) chooseTurn(color, rolls)
        else if(!(isWinner() + 1)) gameLoop((color + 1) % 2);
    });
}

const gameLoop = (color) => {
    let winner = isWinner();
    if(winner + 1) {
        console.log(`${winner == white ? "White" : "Red"} is the Winner!`)
        rl.close();
        return;
    }

    displayBoard();
    let rolls = rollDice();
    console.log(`${color === white ? "White" : "Red"}'s turn.\n`)
    if (rolls[0] == rolls[1]) rolls = [...rolls, ...rolls];
    chooseTurn(color, rolls);
}
gameLoop(white);
// displayBoard();
// let whiteTurn = getAvailableTurns(white);
// console.log(whiteTurn);
// console.log(getAvailableTurns(red));
// let roll = rollDice();
// console.log(roll);
// let legalWhiteTurns = filterLegalTurns(white, roll[0]);
// console.log(legalWhiteTurns);
// if (legalWhiteTurns.length)
// console.log(moveTableman(legalWhiteTurns[0][0], legalWhiteTurns[0][1], white));
// legalWhiteTurns = filterLegalTurns(white, roll[1]);
// console.log(legalWhiteTurns);
// if (legalWhiteTurns.length)
// console.log(moveTableman(legalWhiteTurns[0][0], legalWhiteTurns[0][1], white));
// displayBoard();