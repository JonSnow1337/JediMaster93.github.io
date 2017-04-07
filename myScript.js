

class Rectangle {
    constructor(cntxt, x, y) {
        this.context = cntxt
        this.x = x
        this.y = y
        this.checked = false;
    }
    draw() {
        if (this.checked) {
            let normalisedPosition = ((this.x + 1) * (this.y + 1)) / (myCanvas.width * myCanvas.height)
            let colourDec = Math.round(normalisedPosition * parseInt("BBBBBB", 16));
            let maxVal = parseInt("FFFFFF", 16)
            colourDec = maxVal - colourDec
            let colourHex = colourDec.toString(16).toUpperCase()
            console.log(colourHex)
            this.context.fillStyle = "#" + colourHex
            this.context.fillRect(this.x, this.y, RECT_HEIGHT, RECT_WIDTH)
        } else {
            //clear previous filled rect
            this.context.fillStyle = "#FFFFFF"
            this.context.fillRect(this.x, this.y, RECT_HEIGHT, RECT_WIDTH)
        }
    }
    onclick() {
        if (this.checked) {
            this.checked = false;
        }
        else {
            this.checked = true;
        }
        this.draw()
    }

}




function drawGrid() {
    myContext.strokeStyle = BORDER_COLOUR
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid.length; j++) {
            myContext.rect(i * RECT_HEIGHT, j * RECT_WIDTH, RECT_HEIGHT, RECT_WIDTH);
        }
    }
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function getLiveNeighbours(x, y) {
    var liveNeighbours = 0;
    if (grid[x + 1][y + 1].checked) {
        liveNeighbours++;
    }
    if (grid[x - 1][y + 1].checked) {
        liveNeighbours++;
    }
    if (grid[x - 1][y - 1].checked) {
        liveNeighbours++;
    }
    if (grid[x + 1][y - 1].checked) {
        liveNeighbours++;
    }

    if (grid[x + 1][y].checked) {
        liveNeighbours++;
    }
    if (grid[x - 1][y].checked) {
        liveNeighbours++;
    }
    if (grid[x][y - 1].checked) {
        liveNeighbours++;
    }
    if (grid[x][y + 1].checked) {
        liveNeighbours++;
    }
    return liveNeighbours;
}


//game of life loop
/*Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
Any live cell with two or three live neighbours lives on to the next generation.
Any live cell with more than three live neighbours dies, as if by overpopulation.
Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.*/
function gameOfLifeLoop() {
    var cellsToDie = [];
    var cellsToReproduce = [];

    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            var cell = grid[i][j]
            try {
                var neigbourCount = getLiveNeighbours(i, j);

            } catch (e) {
                // console.log(i + "," + j)

                continue

            }
            // console.log(neigbourCount)
            // console.log(cell.checked)
            if (cell.checked) {

                //live cell
                if (neigbourCount < 2) {
                    cellsToDie.push(cell)
                }
                if (neigbourCount > 3) {
                    cellsToDie.push(cell)
                }
            } else {
                //dead cells
                if (neigbourCount == 3) {
                    cellsToReproduce.push(cell)
                }
            }
        }
    }
    for (var i = 0; i < cellsToDie.length; i++) {
        cellsToDie[i].checked = false;
        cellsToDie[i].draw()

    }
    for (var i = 0; i < cellsToReproduce.length; i++) {

        cellsToReproduce[i].checked = true;
        cellsToReproduce[i].draw()

        playNote(cellsToReproduce[i].x, cellsToReproduce[i].y)
    }
    //  myContext.clearRect(0,0,myCanvas.width,myCanvas.height)
    myContext.beginPath();
    drawGrid();
    myContext.stroke();
}
function generateNoteScale(baseSteps, octaves) {
    //generates notes and octaves based on stuff
    //starts from C0(16.35)
    let notes = []
    let baseNotes = []
    let allNotes = []
    //this calculates first 12 notes with halfpitches and everyyhing
    for (var i = 0; i < 12; i++) {
        notes.push(16.35 * Math.pow(Math.pow(2, 1 / 12), i))
    }
    //var cmajBaseSteps = [0,2,4,5,7,9,11]
    //this removes pitches that are not in steps(scale)
    for (var i = 0; i < notes.length; i++) {
        if (baseSteps.includes(i)) {
            baseNotes.push(notes[i])
        }
    }
    //this generates octaves from baseNotes
     for (var i = 0; i < octaves; i++) {
        for (var j = 0; j < baseSteps.length; j++) {
            allNotes.push(baseNotes[j] * Math.pow(2, i + 1))

        }
    }
    console.log(allNotes)
    return allNotes

}
function getNearestFromArray(input, array) {
    let delta = 0;
    let prevDelta = 0;
    for (var i = 0; i < array.length; i++) {
        delta = Math.abs(input - array[i])
        if (i == 0) {
            prevDelta = delta
            continue
        }
        if (prevDelta < delta) {
            return array[i - 1]
        }
        prevDelta = delta

    }
}
function playNote(x, y) {
    //plays note based on x/y values of canvas
    let val = x * y
    //normalise value
    val = val / (myCanvas.width * myCanvas.height)
    //i wanna have notes in 0-1000 range so i multipy normalised by 1000
    let note = val * MAX_NOTE_FREQUENCY
    // console.log(note)
    note = getNearestFromArray(note, scale)
    polySynth.triggerAttackRelease((note), NOTE_DURATION_SEC)
}

function userChangeBlock(evt) {
    var mousePos = getMousePos(myCanvas, evt);
    var rect = grid[Math.floor(mousePos.x / RECT_WIDTH)][Math.floor(mousePos.y / RECT_HEIGHT)]
    rect.onclick()
    myContext.stroke()
    playNote(rect.x, rect.y)

}
var polySynth = new Tone.PolySynth(50, Tone.Synth).toMaster();
polySynth.volume.value = -15

var myCanvas = document.getElementById("canvas");
var myContext = myCanvas.getContext("2d");
var scale = generateNoteScale([0, 2, 4, 5, 7, 9, 11], 8)

var RECT_WIDTH = 30
var RECT_HEIGHT = RECT_WIDTH
var GRID_SIZE = 50
var MAX_NOTE_FREQUENCY = 1500
var step = {
    "c": 0,
    "csharp": 1,
    "d": 2,
    "dsharp": 3,
    "e": 4,
    "f": 5,
    "g": 6,
    "gsharp": 7,
    "a": 8,
    "asharp": 9,
    "b": 10


}


var BORDER_COLOUR = "#777673" //gray
var ALIVE_COLOUR = "#000000" //white
var DEAD_COLOUR = "#FFFFFF" //black

var INTERVAL_UPDATE_MILIS = 500
var NOTE_DURATION_SEC = INTERVAL_UPDATE_MILIS / 1000


var grid = Array(GRID_SIZE);
for (var i = 0; i < grid.length; i++) {
    grid[i] = Array(GRID_SIZE);
}


for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
        grid[i][j] = new Rectangle(myContext, i * RECT_WIDTH, j * RECT_HEIGHT)
    }
}
myCanvas.addEventListener('mousemove', function (evt) {
    if (evt.which == 1) {
        userChangeBlock(evt)
    }

}, false);
myCanvas.addEventListener('mousedown', function (evt) {
    userChangeBlock(evt)


}, false);


var buttonStart = document.getElementById("btnStart")
var buttonPause = document.getElementById("btnPause")
var buttonCMaj = document.getElementById("btnCMaj")
var buttonAMin = document.getElementById("btnAMin")
var buttonFMaj = document.getElementById("btnFMaj")

var intervalRef = 0
buttonStart.onclick = function () {
    intervalRef = setInterval(gameOfLifeLoop, INTERVAL_UPDATE_MILIS)
    console.log(intervalRef)
}
buttonPause.onclick = function () {
    clearInterval(intervalRef)
    console.log(intervalRef)

}

buttonCMaj.onclick = function () {
    scale = generateNoteScale([step["d"],step["fsharp"],step["a"],step["csharp"]], 5)

}
buttonFMaj.onclick = function () {
    scale = generateNoteScale([step["b"],step["d"],step["fsharp"]], 8)

}
buttonAMin.onclick = function () {
    scale = generateNoteScale([step["e"],step["gsharp"],step["b"],step["fsharp"]], 6)
}

drawGrid();
myContext.stroke();
//0,2,4,5,7,9,11 these are c major scale steps starting from C
//this produced neato colours
   /*let normalisedPosition = ((this.x + 1) * (this.y + 1)) /(myCanvas.width * myCanvas.height)
    let colourDec = Math.round(normalisedPosition * parseInt("BBBBBB", 16));
    let maxVal = parseInt("FFFFFF", 16)
    colourDec = maxVal - colourDec
    let colourHex = colourDec.toString(16).toUpperCase()
    console.log(colourHex)
    this.context.fillStyle = "#" + colourHex
    this.context.fillRect(this.x, this.y, RECT_HEIGHT, RECT_WIDTH)*/