let rows = 16;
let columns = 30;
let mines = 99;

let start = 0;

let board = new Array(rows);

const restartButton = document.getElementById("restart");
const optionButton = document.getElementById("options");
const options = document.forms.options;
const optionDiv = document.getElementById("optionDiv");
const mineShow = document.getElementById("count");


let current;
(function() {
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        event = event || window.event;
        current = event.target;
    }
})();



restartButton.addEventListener('click', (event) => {
    removeListeners();
    initGame();
});

optionButton.addEventListener('click', (event) => {
    optionDiv.style.display = "block";
});

options.addEventListener('click', (event) => {
    event.preventDefault();
    rows = parseInt(options.elements.rows.value);
    if (isNaN(rows) || rows === "") rows = 16;
    columns = parseInt(options.elements.columns.value);
    if (isNaN(columns) || columns === "") columns = 30;
    mines = parseInt(options.elements.mines.value);
    if (isNaN(mines) || mines === "") mines = 99;
    removeListeners();
    initGame();
});

window.onclick = function(event) {
    if (event.target === document.getElementById('winnerDiv'))
        document.getElementById('winnerDiv').style.display = "none";
    if (event.target === optionDiv)
        optionDiv.style.display = "none";
};

initGame();

function killColumns() {
    const colDiv = document.getElementById('cols');
    while (colDiv.hasChildNodes()) {
        colDiv.removeChild(colDiv.lastChild);
    }
}


function leftClick(event) {
    const lookRow = parseInt(event.target.getAttribute('row'));
    const lookCol = parseInt(event.target.getAttribute('column'));
    const target = document.getElementById(event.target.id);
    if (start === 0) {
        createBoard(lookRow, lookCol);
        start++;
    }
    if (board[lookRow][lookCol].flag === true) return;
    if (board[lookRow][lookCol].opened === true) {
        middleEvent(lookRow, lookCol);
        return;
    }
    if (board[lookRow][lookCol].mine === true) {
        target.innerText = String.fromCodePoint(0x1F4A5);
        target.classList.add("detonated");
        gameOver("lose");
        return;
    } else {
        floodFill(lookRow, lookCol);
    }
    if (checkWin()) gameOver("win");
}

function rightClick(event) {
    event.preventDefault();
    const lookRow = parseInt(event.target.getAttribute('row'));
    const lookCol = parseInt(event.target.getAttribute('column'));
    const target = document.getElementById(event.target.id);

    rightEvent(lookRow, lookCol, target);
}

function rightEvent(lookRow, lookCol, target) {
    if (board[lookRow][lookCol].opened === true) return;
    if (board[lookRow][lookCol].flag === true) {
        board[lookRow][lookCol].flag = false;
        target.innerText = '';
        target.classList.remove("flag");
        mineShow.setAttribute("count", (+mineShow.getAttribute("count") - 1));
        mineShow.innerText = "Mines: " + mineShow.getAttribute("count") + "/" + mines;
    }
    else {
        board[lookRow][lookCol].flag = true;
        target.innerText = String.fromCodePoint(0x1F6A9);
        target.classList.add("flag");
        mineShow.setAttribute("count", (+mineShow.getAttribute("count") + 1));
        mineShow.innerText = "Mines: " + mineShow.getAttribute("count") + "/" + mines;
    }
    checkNeighbours();
}

// will need mouse tracking to implement properly
function spaceBar(event) {
    if (event.key !== " ") {
        return;
    }
    event.preventDefault();
    if (!(current.classList.contains("square"))) return;
    let spaceRow = parseInt(current.getAttribute("row"));
    let spaceCol = parseInt(current.getAttribute("column"));
    
    if (board[spaceRow][spaceCol].opened === false) {
        rightEvent(spaceRow, spaceCol, current);
    } else {
        middleEvent(spaceRow, spaceCol);
    }
}

function createBoard(lookRow, lookCol) {
    let mineCount = 0;
    while (mineCount < mines) {
        let i = Math.floor(Math.random() * rows);
        let j = Math.floor(Math.random() * columns);

        let iHi = 0;
        let iLo = 0;
        let jHi = 0;
        let jLo = 0;
        if (i + 1 == rows) {
            iHi = 1;
        } if (i - 1 < 0) {
            iLo = 1;
        } if (j + 1 == columns) {
            jHi = 1;
        } if (j - 1 < 0) {
            jLo = 1;
        }
        // TODO: this is arbitrary crap - doesn't work for all cases e.g. 3x3 board w/ 1 mine and center being first tile clicked
            // stop with the shit fixes - other preventative measures needed on choosing a board probably
        if ((rows * columns - mines)/(rows*columns) > 0.7 && (rows > 3 || columns > 3)) {
            if (!iHi && i+1 == lookRow) {
                continue;
            }
            if (!iLo && i-1 == lookRow) {
                continue;
            }
            if (!jHi && j+1 == lookCol) {
                continue;
            }
            if (!jLo && j-1 == lookCol) {
                continue;
            }
            if (!iHi && !jHi && i+1 == lookRow && j+1 == lookCol) {
                continue;
            }
            if (!iHi && !jLo && i+1 == lookRow && j-1 == lookCol) {
                continue;
            }
            if (!iLo && !jHi && i-1 == lookRow && j+1 == lookCol) {
                continue;
            }
            if (!iLo && !jLo && i-1 == lookRow && j-1 == lookCol) {
                continue;
            }
        }

        if (board[i][j].mine === true) continue;
        else if (i == lookRow && j == lookCol) continue;
        else {
            board[i][j].mine = true;
            mineCount++;
            if (mineCount == mines) break;  // probably unnecessary?
        }
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            gridCheck(i, j);
        }
    }
}

function gridCheck(i,j) {
    let iHi = 0;
    let iLo = 0;
    let jHi = 0;
    let jLo = 0;
    if (i + 1 == rows) {
        iHi = 1;
    } if (i - 1 < 0) {
        iLo = 1;
    } if (j + 1 == columns) {
        jHi = 1;
    } if (j - 1 < 0) {
        jLo = 1;
    }

    if (!iHi && board[i+1][j].mine === true) {
        board[i][j].neighbours++;
    }
    if (!iLo && board[i-1][j].mine === true) {
        board[i][j].neighbours++;
    }
    if (!jHi && board[i][j+1].mine === true) {
        board[i][j].neighbours++;
    }
    if (!jLo && board[i][j-1].mine === true) {
        board[i][j].neighbours++;
    }
    if (!iHi && !jHi && board[i+1][j+1].mine === true) {
        board[i][j].neighbours++;
    }
    if (!iHi && !jLo && board[i+1][j-1].mine === true) {
        board[i][j].neighbours++;
    }
    if (!iLo && !jHi && board[i-1][j+1].mine === true) {
        board[i][j].neighbours++;
    }
    if (!iLo && !jLo && board[i-1][j-1].mine === true) {
        board[i][j].neighbours++;
    }
}

function gameOver(check) {
    //remove listeners
    removeListeners();
    if (check === "lose") {
        document.getElementById('winnerDiv').style.display = "block";
        document.getElementById('winnerContainer').innerText = "You lose";
        document.getElementById('winnerContainer').classList.add("lossEnd");
        document.getElementById('winnerContainer').classList.remove("winEnd");
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const revelation = document.getElementById("square_"+i+"_"+j);
                if (revelation.classList.contains("detonated")) continue;
                if (board[i][j].flag === true && board[i][j].mine === true) continue;
                if (board[i][j].flag === true && board[i][j].mine === false) {
                    revelation.innerText = "X";
                    revelation.classList.add("wrong", "opened");
                }
                if (board[i][j].mine === true) {
                    revelation.innerText = String.fromCodePoint(0x1F4A3);
                    revelation.classList.add("bomb");
                    revelation.classList.add("opened");
                }
            }
        }
    }
    else {
        // add flags on non revealed mines
        document.getElementById('winnerDiv').style.display = "block";
        document.getElementById('winnerContainer').innerText = "You win";
        document.getElementById('winnerContainer').classList.add("winEnd");
        document.getElementById('winnerContainer').classList.remove("lossEnd");
    }
}

function floodFill(lookRow, lookCol) {
    if (board[lookRow][lookCol].opened === true) return;
    if (board[lookRow][lookCol].flag === true) return;
    if (board[lookRow][lookCol].mine === true) return;
    let mineCount = board[lookRow][lookCol].neighbours;
    if (mineCount > 0) {
        board[lookRow][lookCol].opened = true;
        document.getElementById('square_'+lookRow+'_'+lookCol).innerText = mineCount;
        document.getElementById('square_'+lookRow+'_'+lookCol).classList.add("opened", "neighbour"+mineCount);
    } else if (mineCount == 0) {
        board[lookRow][lookCol].opened = true;
        document.getElementById('square_'+lookRow+'_'+lookCol).innerText = "";
        document.getElementById('square_'+lookRow+'_'+lookCol).classList.add("opened");

        let iHi = 0;
        let iLo = 0;
        let jHi = 0;
        let jLo = 0;
        if (lookRow + 1 == rows) {
            iHi = 1;
        } if (lookRow - 1 < 0) {
            iLo = 1;
        } if (lookCol + 1 == columns) {
            jHi = 1;
        } if (lookCol - 1 < 0) {
            jLo = 1;
        }
        if (!iHi && board[lookRow+1][lookCol].mine === false) {
            floodFill(lookRow + 1, lookCol);
        }
        if (!iLo && board[lookRow-1][lookCol].mine === false) {
            floodFill(lookRow - 1, lookCol);
        }
        if (!jHi && board[lookRow][lookCol+1].mine === false ) {
            floodFill(lookRow, lookCol + 1);
        }
        if (!jLo && board[lookRow][lookCol-1].mine === false) {
            floodFill(lookRow, lookCol - 1);
        }
        if (!iHi && !jHi && board[lookRow+1][lookCol+1].mine === false) {
            floodFill(lookRow + 1, lookCol + 1);
        }
        if (!iHi && !jLo && board[lookRow+1][lookCol-1].mine === false) {
            floodFill(lookRow + 1, lookCol - 1);
        }
        if (!iLo && !jHi && board[lookRow-1][lookCol+1].mine === false) {
            floodFill(lookRow - 1, lookCol + 1);
        }
        if (!iLo && !jLo && board[lookRow-1][lookCol-1].mine === false) {
            floodFill(lookRow - 1, lookCol - 1);
        }
    }
}

function checkWin() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (board[i][j].mine === false && board[i][j].opened === false) return 0;
        }
    }
    return 1;
}

function middleClick(event) {
    event.preventDefault();
    if (event.button !== 1) {
        return;
    }

    const lookRow = parseInt(event.target.getAttribute('row'));
    const lookCol = parseInt(event.target.getAttribute('column'));
    middleEvent(lookRow, lookCol);
}

function middleEvent(lookRow, lookCol) {
    if (board[lookRow][lookCol].opened === false || board[lookRow][lookCol].neighbours === 0) return 0;

    let iHi = 0;
    let iLo = 0;
    let jHi = 0;
    let jLo = 0;
    if (lookRow + 1 == rows) {
        iHi = 1;
    } if (lookRow - 1 < 0) {
        iLo = 1;
    } if (lookCol + 1 == columns) {
        jHi = 1;
    } if (lookCol - 1 < 0) {
        jLo = 1;
    }

    let neighbourFlagCount = 0;
    let neighbourMineCount = 0;
    let failure = 0;

    let incorrectFlag = [];
    let missedMine = [];

    if (!iHi) {
        if (board[lookRow+1][lookCol].flag === true) neighbourFlagCount++;
        if (board[lookRow+1][lookCol].mine === true) neighbourMineCount++;
        if (neighbourFlagCount != neighbourMineCount) failure++;
        if (board[lookRow+1][lookCol].flag === true && board[lookRow+1][lookCol].mine === false) incorrectFlag.push({row: lookRow+1, col: lookCol});
        if (board[lookRow+1][lookCol].flag === false && board[lookRow+1][lookCol].mine === true) missedMine.push({row: lookRow+1, col: lookCol});
    }
    if (!iLo) {
        if (board[lookRow-1][lookCol].flag === true) neighbourFlagCount++;
        if (board[lookRow-1][lookCol].mine === true) neighbourMineCount++;
        if (neighbourFlagCount != neighbourMineCount) failure++;
        if (board[lookRow-1][lookCol].flag === true && board[lookRow-1][lookCol].mine === false) incorrectFlag.push({row: lookRow-1, col: lookCol});
        if (board[lookRow-1][lookCol].flag === false && board[lookRow-1][lookCol].mine === true) missedMine.push({row: lookRow-1, col: lookCol});
    }
    if (!jHi) {
        if (board[lookRow][lookCol+1].flag === true) neighbourFlagCount++;
        if (board[lookRow][lookCol+1].mine === true) neighbourMineCount++;
        if (neighbourFlagCount != neighbourMineCount) failure++;
        if (board[lookRow][lookCol+1].flag === true && board[lookRow][lookCol+1].mine === false) incorrectFlag.push({row: lookRow, col: lookCol+1});
        if (board[lookRow][lookCol+1].flag === false && board[lookRow][lookCol+1].mine === true) missedMine.push({row: lookRow, col: lookCol+1});
    }
    if (!jLo) {
        if (board[lookRow][lookCol-1].flag === true) neighbourFlagCount++;
        if (board[lookRow][lookCol-1].mine === true) neighbourMineCount++;
        if (neighbourFlagCount != neighbourMineCount) failure++;
        if (board[lookRow][lookCol-1].flag === true && board[lookRow][lookCol-1].mine === false) incorrectFlag.push({row: lookRow, col: lookCol-1});
        if (board[lookRow][lookCol-1].flag === false && board[lookRow][lookCol-1].mine === true) missedMine.push({row: lookRow, col: lookCol-1});
    }
    if (!iHi && !jHi) {
        if (board[lookRow+1][lookCol+1].flag === true) neighbourFlagCount++;
        if (board[lookRow+1][lookCol+1].mine === true) neighbourMineCount++;
        if (neighbourFlagCount != neighbourMineCount) failure++;
        if (board[lookRow+1][lookCol+1].flag === true && board[lookRow+1][lookCol+1].mine === false) incorrectFlag.push({row: lookRow+1, col: lookCol+1});
        if (board[lookRow+1][lookCol+1].flag === false && board[lookRow+1][lookCol+1].mine === true) missedMine.push({row: lookRow+1, col: lookCol+1});
    }
    if (!iHi && !jLo) {
        if (board[lookRow+1][lookCol-1].flag === true) neighbourFlagCount++;
        if (board[lookRow+1][lookCol-1].mine === true) neighbourMineCount++;
        if (neighbourFlagCount != neighbourMineCount) failure++;
        if (board[lookRow+1][lookCol-1].flag === true && board[lookRow+1][lookCol-1].mine === false) incorrectFlag.push({row: lookRow+1, col: lookCol-1});
        if (board[lookRow+1][lookCol-1].flag === false && board[lookRow+1][lookCol-1].mine === true) missedMine.push({row: lookRow+1, col: lookCol-1});
    }
    if (!iLo && !jHi) {
        if (board[lookRow-1][lookCol+1].flag === true) neighbourFlagCount++;
        if (board[lookRow-1][lookCol+1].mine === true) neighbourMineCount++;
        if (neighbourFlagCount != neighbourMineCount) failure++;
        if (board[lookRow-1][lookCol+1].flag === true && board[lookRow-1][lookCol+1].mine === false) incorrectFlag.push({row: lookRow-1, col: lookCol+1});
        if (board[lookRow-1][lookCol+1].flag === false && board[lookRow-1][lookCol+1].mine === true) missedMine.push({row: lookRow-1, col: lookCol+1});
    }
    if (!iLo && !jLo) {
        if (board[lookRow-1][lookCol-1].flag === true) neighbourFlagCount++;
        if (board[lookRow-1][lookCol-1].mine === true) neighbourMineCount++;
        if (neighbourFlagCount != neighbourMineCount) failure++;
        if (board[lookRow-1][lookCol-1].flag === true && board[lookRow-1][lookCol-1].mine === false) incorrectFlag.push({row: lookRow-1, col: lookCol-1});
        if (board[lookRow-1][lookCol-1].flag === false && board[lookRow-1][lookCol-1].mine === true) missedMine.push({row: lookRow-1, col: lookCol-1});
    }

    if (neighbourFlagCount !== neighbourMineCount) {
        return;
    }

    if (!failure) {
        if (!iHi && board[lookRow+1][lookCol].mine === false) {
            floodFill(lookRow + 1, lookCol);
        }
        if (!iLo && board[lookRow-1][lookCol].mine === false) {
            floodFill(lookRow - 1, lookCol);
        }
        if (!jHi && board[lookRow][lookCol+1].mine === false) {
            floodFill(lookRow, lookCol + 1);
        }
        if (!jLo && board[lookRow][lookCol-1].mine === false) {
            floodFill(lookRow, lookCol - 1);
        }
        if (!iHi && !jHi && board[lookRow+1][lookCol+1].mine === false) {
            floodFill(lookRow + 1, lookCol + 1);
        }
        if (!iHi && !jLo && board[lookRow+1][lookCol-1].mine === false) {
            floodFill(lookRow + 1, lookCol - 1);
        }
        if (!iLo && !jHi && board[lookRow-1][lookCol+1].mine === false) {
            floodFill(lookRow - 1, lookCol + 1);
        }
        if (!iLo && !jLo && board[lookRow-1][lookCol-1].mine === false) {
            floodFill(lookRow - 1, lookCol - 1);
        }
    } else {
        incorrectFlag.forEach(function (element) {
            document.getElementById("square_"+element.row+"_"+element.col).innerText = 'X';
            document.getElementById("square_"+element.row+"_"+element.col).classList.add("opened", "wrong");
        });
        missedMine.forEach(function(element) {
            document.getElementById("square_"+element.row+"_"+element.col).classList.add("detonated");
            document.getElementById("square_"+element.row+"_"+element.col).innerText = String.fromCodePoint(0x1F4A5);
            
        });
        gameOver('lose');
        return;
    }
    // checkWin
    if (checkWin()) gameOver('win');
}

function initGame() {
    board = [];
    start = 0;
    for (let i = 0; i < rows; i++) {
        board[i] = new Array(columns);
        for (let j = 0; j < columns; j++) {
            board[i][j] = {opened:false, flag:false, mine:false, neighbours:0};
        }
    }
    
    const gameDiv = document.getElementById('game');
    const boardDiv = document.getElementById('board');
    const colDiv = document.getElementById("cols");
    gameDiv.style.width = columns*40 + "px";
    boardDiv.style.width = columns*40 + "px";
    boardDiv.style.height = rows*40 + "px";
    
    killColumns();
    
    for (let i = 0; i < columns; i++) {
        const newCol = document.createElement('div');
        newCol.id = "col_" + i;
        newCol.classList.add('col');
        colDiv.appendChild(newCol);
    
        for (let j = 0; j < rows; j++) {
            const newBlock = document.createElement('div');
            newBlock.classList.add('square');
            newBlock.id = "square_" + j + '_' + i;
            newBlock.style.top = j * 40 + 'px';
            newBlock.setAttribute("row", j);
            newBlock.setAttribute("column", i);
            newBlock.addEventListener('click', leftClick);
            newBlock.addEventListener('contextmenu', rightClick);
            newBlock.addEventListener("mousedown", middleClick, false);
            document.addEventListener('keydown', spaceBar);
            newCol.appendChild(newBlock);
        }
    }
    mineShow.innerText = "Mines: 0/" + mines;
    mineShow.setAttribute('count', 0);
}

function removeListeners() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const block = document.getElementById("square_" + i + "_" + j);
            if (block === undefined || block === null) break;
            block.removeEventListener('click', leftClick);
            block.removeEventListener('contextmenu', rightClick);
            block.removeEventListener("mousedown", middleClick, false);
            document.removeEventListener('keydown', spaceBar);
        }
    }
}

function checkNeighbours() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (board[i][j].opened === false) continue;

            let iHi = 0;
            let iLo = 0;
            let jHi = 0;
            let jLo = 0;
            if (i + 1 == rows) {
                iHi = 1;
            } if (i - 1 < 0) {
                iLo = 1;
            } if (j + 1 == columns) {
                jHi = 1;
            } if (j - 1 < 0) {
                jLo = 1;
            }

            let neighbourCount = 0;
            if (!iHi && board[i+1][j].flag === true) neighbourCount++;
            if (!iLo && board[i-1][j].flag === true) neighbourCount++;
            if (!jHi && board[i][j+1].flag === true) neighbourCount++;
            if (!jLo && board[i][j-1].flag === true) neighbourCount++;
            if (!iHi && !jHi && board[i+1][j+1].flag === true) neighbourCount++;
            if (!iHi && !jLo && board[i+1][j-1].flag === true) neighbourCount++;
            if (!iLo && !jHi && board[i-1][j+1].flag === true) neighbourCount++;
            if (!iLo && !jLo && board[i-1][j-1].flag === true) neighbourCount++;
            
            const block = document.getElementById("square_" + i + "_" + j);
            if (neighbourCount > board[i][j].neighbours) block.classList.add('extra');
            else block.classList.remove('extra');
        }
    }
}