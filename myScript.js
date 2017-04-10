

class Rectangle {
    constructor(cntxt, x, y) {
        this.context = cntxt
        this.x = x
        this.y = y
        this.checked = false;
        this.normalisedLocation = (this.x * this.y) / (myCanvas.width * myCanvas.height);
        this.color = Please.make_color({
            golden: true, //disable default
            hue: 0, //set your hue manually
            saturation: 0.5 + this.normalisedLocation,
            value: 0.5 + this.normalisedLocation
        });
    }
    draw() {
        if (this.checked) {
            /*let normalisedPosition = ((this.x + 1) * (this.y + 1)) / (myCanvas.width * myCanvas.height)
            let colourDec = Math.round(normalisedPosition * parseInt("BBBBBB", 16));
            let maxVal = parseInt("FFFFFF", 16)
            colourDec = maxVal - colourDec
            let colourHex = colourDec.toString(16).toUpperCase()
            console.log(colourHex)
            this.context.fillStyle = "#" + colourHex*/
            this.context.fillStyle = this.color;
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
        for (var j = 0; j < grid[i].length; j++) {
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
    let noteList = []
    for (var i = 0; i < cellsToReproduce.length; i++) {

        cellsToReproduce[i].checked = true;
        cellsToReproduce[i].draw()
        note = calculateNote(cellsToReproduce[i].x, cellsToReproduce[i].y)
        noteList.push(note)

        // playNote(cellsToReproduce[i].x, cellsToReproduce[i].y)
    }
    polySynth.triggerAttackRelease((noteList), NOTE_DURATION_SEC)
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
function calculateNote(x, y) {
    //plays note based on x/y values of canvas
    let val = x * y
    //normalise value
    val = val / (myCanvas.width * myCanvas.height)
    //i wanna have notes in 0-1000 range so i multipy normalised by 1000
    let note = val * MAX_NOTE_FREQUENCY
    // console.log(note)
    note = getNearestFromArray(note, scale)
    return note
    // polySynth.triggerAttackRelease((note), NOTE_DURATION_SEC)
}

function userChangeBlock(evt) {
    var mousePos = getMousePos(myCanvas, evt);
    let x = Math.floor(mousePos.x / RECT_WIDTH)
    let y = Math.floor(mousePos.y / RECT_HEIGHT)
    if(x <GRID_SIZE_X && y < GRID_SIZE_Y){
    var rect = grid[x][y]
        rect.onclick()
        myContext.stroke()
        polySynth.triggerAttackRelease(calculateNote(rect.x, rect.y), NOTE_DURATION_SEC)
        console.log("onclick")

    }


}

function setIntervalUpdateTime(milis){
      INTERVAL_UPDATE_MILIS = milis
      NOTE_DURATION_SEC = INTERVAL_UPDATE_MILIS / 1000

    clearInterval(intervalRef)
    intervalRef = setInterval(gameOfLifeLoop, INTERVAL_UPDATE_MILIS)


}

var polySynth = new Tone.PolySynth(1000, Tone.Synth).toMaster();
polySynth.volume.value = -15

var myCanvas = document.getElementById("canvas");
var myContext = myCanvas.getContext("2d");
var scale = generateNoteScale([0, 2, 4, 5, 7, 9, 11], 8)

myContext.canvas.height = window.innerHeight - window.innerHeight * 0.3
//myContext.canvas.width = window.innerWidth - window.innerWidth * 0.4

  myContext.canvas.style.width ='100%';
 // myContext.canvas.style.height= window.innerHeight;
  // ...then set the internal size to match
  myContext.canvas.width  = canvas.offsetWidth;
//  myContext.canvas.height = canvas.offsetHeight;

var RECT_WIDTH = 30
var RECT_HEIGHT = RECT_WIDTH
//var GRID_SIZE = Math.min(Math.floor(myCanvas.width / RECT_HEIGHT),Math.floor(myCanvas.height / RECT_HEIGHT))
var GRID_SIZE_X = Math.floor(myCanvas.width / RECT_HEIGHT)
var GRID_SIZE_Y = Math.floor(myCanvas.height / RECT_HEIGHT)
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


var grid = Array(GRID_SIZE_X);
for (var i = 0; i < GRID_SIZE_X; i++) {
    grid[i] = Array(GRID_SIZE_Y);
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
myCanvas.addEventListener('click', function (evt) {
    userChangeBlock(evt)


}, false);
myCanvas.addEventListener('mousewheel',function(evt){
    if(altDown){
        
        setIntervalUpdateTime(INTERVAL_UPDATE_MILIS + (30 * evt.wheelDelta /Math.abs(evt.wheelDelta) ) )
        console.log(INTERVAL_UPDATE_MILIS)
        //console.log(evt.wheelDelta);

    }

});
var altDown = false;
window.onkeydown = function(e){
     if(e.keyCode == 18){
        altDown = true;
    }
}
window.onkeyup = function(e){
    if(e.keyCode == 18){
        altDown = false;
    }
}


var buttonStart = document.getElementById("btnStart")
var buttonPause = document.getElementById("btnPause")
var buttonSpeedUp = document.getElementById("btnSpeedUp")
var buttonSpeedDown = document.getElementById("btnSpeedDown")

/*var buttonCMaj = document.getElementById("btnCMaj")
var buttonAMin = document.getElementById("btnAMin")
var buttonFMaj = document.getElementById("btnFMaj")*/


var intervalRef = 0
var gameStarted = false;
buttonStart.onclick = function () {
    if (!gameStarted) {
        intervalRef = setInterval(gameOfLifeLoop, INTERVAL_UPDATE_MILIS)
        console.log(intervalRef)
        gameStarted = true;
    }
}
buttonPause.onclick = function () {
    clearInterval(intervalRef)
    console.log(intervalRef)
    gameStarted = false;

}
buttonSpeedUp.onclick = function () {
     if(INTERVAL_UPDATE_MILIS > 50){
         setIntervalUpdateTime(INTERVAL_UPDATE_MILIS - 10 )
//document.getElementById("intervalInfo").innerHTML = "Interval Update Rate :" + INTERVAL_UPDATE_MILIS;

     }

}
buttonSpeedDown.onclick = function () {
      setIntervalUpdateTime(INTERVAL_UPDATE_MILIS + 10 )
//document.getElementById("intervalInfo").innerHTML = "Interval Update Rate :" + INTERVAL_UPDATE_MILIS;


}

 /*
buttonCMaj.onclick = function () {
    scale = generateNoteScale([step["d"], step["fsharp"], step["a"], step["csharp"]], 5)

}
buttonFMaj.onclick = function () {
    scale = generateNoteScale([step["b"], step["d"], step["fsharp"]], 8)

}
buttonAMin.onclick = function () {
    scale = generateNoteScale([step["e"], step["gsharp"], step["b"], step["fsharp"]], 6)
}
*/

drawGrid();
myContext.stroke();
//document.getElementById("intervalInfo").innerHTML = "Interval Update Rate :" + INTERVAL_UPDATE_MILIS;
