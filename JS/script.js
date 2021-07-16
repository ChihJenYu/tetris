const cubeSize = 1; // width 1 unit and height 1 unit
const rows = 20; // unit of cubes
const cols = 10;
const ShapeEnum = Object.freeze({
    ZShape: 0, // red
    LShape: 1, // orange
    QShape: 2, // yellow
    SShape: 3, // green
    IShape: 4, // light blue
    JShape: 5, // indigo
    TShape: 6 // purple
})
const DirEnum = Object.freeze({
    East: 0,
    North: 1,
    West: 2,
    South: 3
})
const fallSpeed = 800; // ms

let curShape = -1;
let nextShape = Math.floor(Math.random() * 7);
let cubeUsed = 0;
let lineCleared = 0;
let score = 0;
let paused = false;
let started = false;

let coveredCoord = [[0, 0], [0, 0], [0, 0], [0, 0]];

// utility functions
{
    function pause() {
        paused = true;
    }
    
    function resume() {
        paused = false;
    }

    $("button.start").on("click", function() {
        if (!started) {
            started = true;
            randomShape();
        }
    });
    
    $("button.resume").on("click", function() {
        resume();
    });
    
    $("button.pause").on("click", function() {
        pause();
    });
    
    function leftmostCube() {
        let leftmostIndex = -1;
        let minX = cols + 1;
        for (let i = 0; i < 4; i++) {
            if (coveredCoord[i][1] <= minX) {
                minX = coveredCoord[i][1];
                leftmostIndex = i;
            }
        }
        return leftmostIndex;
    }
    
    function rightmostCube() {
        let rightmostIndex = -1;
        let maxX = -1;
        for (let i = 0; i < 4; i++) {
            if (coveredCoord[i][1] >= maxX) {
                maxX = coveredCoord[i][1];
                rightmostIndex = i;
            }
        }
        return rightmostIndex;
    }
    
    function lowestCube() {
        let lowestIndex = -1;
        let maxY = -1;
        for (let i = 0; i < 4; i++) {
            if (coveredCoord[i][0] >= maxY) {
                maxY = coveredCoord[i][0];
                lowestIndex = i;
            }
        }
        return lowestIndex;
    }
}

let shapes = [
    // ZShape
    [[[0, 0], [0, 1], [1, 1], [1, 2]],
    [[2, 0], [1, 0], [1, 1], [0, 1]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[2, 0], [1, 0], [1, 1], [0, 1]]],

    // LShape
    [[[0, 0], [1, 0], [2, 0], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [0, 2]],
    [[2, 1], [1, 1], [0, 1], [0, 0]],
    [[0, 2], [0, 1], [0, 0], [1, 0]]],

    // QShape
    [[[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]]],

    // SShape
    [[[1, 0], [1, 1], [0, 1], [0, 2]],
    [[2, 1], [1, 1], [1, 0], [0, 0]],
    [[1, 0], [1, 1], [0, 1], [0, 2]],
    [[2, 1], [1, 1], [1, 0], [0, 0]]],

    // IShape
    [[[0, 0], [1, 0], [2, 0], [3, 0]],
    [[3, 0], [3, 1], [3, 2], [3, 3]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[3, 0], [3, 1], [3, 2], [3, 3]]],

    // JShape
    [[[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 2], [0, 0], [0, 1], [0, 2]],
    [[0, 1], [2, 0], [1, 0], [0, 0]],
    [[0, 0], [1, 2], [1, 1], [1, 0]]],

    // TShape
    [[[0, 0], [0, 1], [0, 2], [1, 1]],
    [[2, 0], [1, 0], [0, 0], [1, 1]],
    [[1, 2], [1, 1], [1, 0], [0, 1]],
    [[0, 1], [1, 1], [2, 1], [1, 0]]]
]

let beginningDir = DirEnum.East; // 0

function renderShape(shape, coveredCoord) {
    if (shape == 0) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).addClass("z-cube rendered");
        }
    }
    else if (shape == 1) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).addClass("l-cube rendered");
        }
    }
    else if (shape == 2) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).addClass("q-cube rendered");
        }
    }
    else if (shape == 3) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).addClass("s-cube rendered");
        }
    }
    else if (shape == 4) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).addClass("i-cube rendered");
        }
    }
    else if (shape == 5) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).addClass("j-cube rendered");
        }
    }
    else if (shape == 6) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).addClass("t-cube rendered");
        }
    }

}

function renderNextShape(shape) {
    if (shape == 0) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).addClass("z-cube rendered");
        }
    }
    else if (shape == 1) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).addClass("l-cube rendered");
        }
    }
    else if (shape == 2) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).addClass("q-cube rendered");
        }
    }
    else if (shape == 3) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).addClass("s-cube rendered");
        }
    }
    else if (shape == 4) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).addClass("i-cube rendered");
        }
    }
    else if (shape == 5) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).addClass("j-cube rendered");
        }
    }
    else if (shape == 6) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).addClass("t-cube rendered");
        }
    }
}

function undrawShape(shape, coveredCoord) {
    if (shape == 0) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).removeClass("z-cube rendered");
        }
    }
    else if (shape == 1) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).removeClass("l-cube rendered");
        }
    }
    else if (shape == 2) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).removeClass("q-cube rendered");
        }
    }
    else if (shape == 3) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).removeClass("s-cube rendered");
        }
    }
    else if (shape == 4) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).removeClass("i-cube rendered");
        }
    }
    else if (shape == 5) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).removeClass("j-cube rendered");
        }
    }
    else if (shape == 6) {
        for (let i = 0; i < 4; i++) {
            $(`.viz-area .cube:nth-of-type(${10 * coveredCoord[i][0] + coveredCoord[i][1] + 1})`).removeClass("t-cube rendered");
        }
    }
}

function undrawNextShape(shape) {
    if (shape == 0) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).removeClass("z-cube rendered");
        }
    }
    else if (shape == 1) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).removeClass("l-cube rendered");
        }
    }
    else if (shape == 2) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).removeClass("q-cube rendered");
        }
    }
    else if (shape == 3) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).removeClass("s-cube rendered");
        }
    }
    else if (shape == 4) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).removeClass("i-cube rendered");
        }
    }
    else if (shape == 5) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).removeClass("j-cube rendered");
        }
    }
    else if (shape == 6) {
        for (let i = 0; i < 4; i++) {
            $(`.next-shape-window .cube:nth-of-type(${5 * (shapes[shape][DirEnum.East][i][0] + 1) + shapes[shape][0][i][1] + 4})`).removeClass("t-cube rendered");
        }
    }
}

function randomShape() {
    beginningDir = DirEnum.East;
    curShape = nextShape;
    let x = Math.floor(Math.random() * 10);
    createShape(curShape, x);
    nextShape = Math.floor(Math.random() * 7);

    if (overlap(coveredCoord)) {
        score = updateScore(0, true);
        $(".current-score").text(score);
        gameOver();
        return;
    }

    else {
        undrawNextShape(curShape);
        renderShape(curShape, coveredCoord);
        renderNextShape(nextShape);
        cubeUsed++;
        move(curShape);
        fall(curShape).then(() => {
            let clearLineCnt = clearLine();
            score = updateScore(clearLineCnt, false)
            $(".current-score").text(score);
            $(".lines-cleared").text(lineCleared);
            randomShape();
        });
    }
}

function createShape(shape, x) {
    if (shape == 0 || shape == 3 || shape == 6) {
        if (x + 2 > cols - 1) {
            x -= (x + 2 - cols + 1);
        }
    }

    else if (shape == 1 || shape == 2 || shape == 5) {
        if (x + 1 > cols - 1) {
            x -= (x + 1 - cols + 1);
        }
    }

    for (let i = 0; i < 4; i++) {
        coveredCoord[i][0] = shapes[shape][DirEnum.East][i][0];
        coveredCoord[i][1] = shapes[shape][DirEnum.East][i][1];
        coveredCoord[i][1] += x;
    }
    
}

function fall(shape) {
    let promise = new Promise((resolve, reject) => {
        let interval = setInterval(() => {
            if (!paused) {
                undrawShape(shape, coveredCoord);
                for (let i = 0; i < 4; i++) {
                    coveredCoord[i][0] += 1;
                }
                // move(shape);
                if(overlap(coveredCoord)) {
                    for (let i = 0; i < 4; i++) {
                        coveredCoord[i][0] -= 1;
                    }
                    stopMoving();
                    resolve();
                    clearInterval(interval);
                }
                renderShape(shape, coveredCoord);
            }
        }, fallSpeed);
    })
    return promise;
}

function move(shape) {
        $(window).unbind("keypress").on("keypress", function(event) {
            if (!paused) {
                undrawShape(shape, coveredCoord);
                if (event.key == "a") {
                    if (!(coveredCoord[leftmostCube()][1] - 1 < 0 || collide(coveredCoord))) {
                        for (let i = 0; i < 4; i++) {
                            coveredCoord[i][1] -= 1;
                        }
        
                        if (overlap(coveredCoord)) {
                            for (let i = 0; i < 4; i++) {
                                coveredCoord[i][1] += 1;
                            }
                        }
                    }
                    renderShape(shape, coveredCoord);
                }
        
                else if (event.key == "s") {
                    if (!collide(coveredCoord)) {
                        for (let i = 0; i < 4; i++) {
                            coveredCoord[i][0] += 1;
                        }
                    }
        
                    renderShape(shape, coveredCoord);
                }
        
                else if (event.key == "d") {
                    if (!(coveredCoord[rightmostCube()][1] + 1 > cols - 1 || collide(coveredCoord))) {
                        for (let i = 0; i < 4; i++) {
                            coveredCoord[i][1] += 1;
                        }
        
                        if (overlap(coveredCoord)) {
                            for (let i = 0; i < 4; i++) {
                                coveredCoord[i][1] -= 1;
                            }
                        }
                    } 
                    renderShape(shape, coveredCoord);    
                }
                
                else if (event.key == "w") {
        
                    let previousDir = beginningDir;
                    let nextDir = DirEnum.South;
        
                    if (previousDir == DirEnum.East) {
                        nextDir = DirEnum.South;
                    }
                    else {
                        nextDir = previousDir - 1;
                    }
        
                    if (!collide(coveredCoord)) {
                        for (let i = 0; i < 4; i++) {
                            coveredCoord[i][0] += (shapes[shape][nextDir][i][0] - shapes[shape][previousDir][i][0]);
                            coveredCoord[i][1] += (shapes[shape][nextDir][i][1] - shapes[shape][previousDir][i][1]);    
                        }
            
                        while (outOfBound(coveredCoord)) {
                            for (let i = 0; i < 4; i++) {
                                coveredCoord[i][1]--;
                            }
                        }
                        beginningDir = nextDir;
                    }
        
                    renderShape(shape, coveredCoord);
                }
            }

    
        })
}

function stopMoving() {
    $(window).unbind("keypress");
}

// return true if CURRENT coords collide with occupied block or bottom
function collide(coords) {
    for (let i = 0; i < 4; i++) {
        if (coords[i][0] == rows - 1) {
            return true;
        }

        // if the block below contains the class ".rendered"
        else if ($(`.viz-area .cube:nth-of-type(${10 * (coords[i][0] + 1) + coords[i][1] + 1})`).hasClass("rendered")) {
            return true;
        }
    }
}

// return true if CURRENT coords overlap with occupied block or bottom
function overlap(coords) {
    for (let i = 0; i < 4; i++) {
        if (coords[i][0] >= rows) {
            return true;
        }
        
        else if ($(`.viz-area .cube:nth-of-type(${10 * (coords[i][0]) + coords[i][1] + 1})`).hasClass("rendered")) {
            return true;
        }

    }
}

// return true if CURRENT coords will exceed left/right bound
function outOfBound(coords) {
    for (let i = 0; i < 4; i++) {
        if (coords[i][1] < 0) {
            return true;
        }
        else if (coords[i][1] >= cols) {
            return true;
        }
    }
}

// returns lines cleared
function clearLine() {
    let clearLineCnt = 0;
    for (let i = rows - 1; i >= 0; i--) {
        let renderedBlockCnt = 0;
        for (let j = 0; j < cols; j++) {
            if ($(`.viz-area .cube:nth-of-type(${10 * i + j + 1})`).hasClass("rendered")) {
                renderedBlockCnt++;
            }
        }
        if (renderedBlockCnt == cols) {
            removeLine(i);
            clearLineCnt++;
        }
    }
    for (let i = 0; i < clearLineCnt; i++) {
        prependLine();
    }

    lineCleared += clearLineCnt;
    return clearLineCnt;
}

function removeLine(rowIdx) {
    // start from block no. (rowIdx * 10)
    for (let i = 0; i < 10; i++) {
        $(`.viz-area .cube:nth-of-type(${10 * rowIdx + 1})`).remove();
    }
}

function prependLine() {
    $('<div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube"></div><div class="cube "></div>').prependTo($(".viz-area"));
}

function updateScore(clearLineCnt, isFinal=false) {
    let newScore = 0;
    if (!isFinal) {
        if (clearLineCnt != 0) {
            newScore = Math.floor(score + 10 * Math.pow(1.6, clearLineCnt));
        }
        else {
            newScore = score;
        }
    }
    else {
        newScore = score + 10 * cubeUsed;
    }
    return newScore;
}

let style = {
    "display": "flex",
    "flex-direction": "column",
    "align-items": "center",
    "justify-content": "center"
}

function gameOver() {
    $(".game-over").css(style);
}