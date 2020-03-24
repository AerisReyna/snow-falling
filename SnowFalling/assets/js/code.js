/// To "restart" canvas, clear the retangle and call the function for initializing and drawing everyting again.
// Keeps references to all flake objects so that they can be adjusted later.
var flakes = [];
// Keeps track of the direction each flake is moving.
var directionVectors = [];
// Number of flakes that will be spawned.
var numFlakes;

var framesPerSecond;
// This variable is used to translate the frame rate into something useful.
var frames;
// Factor that each flake is scaled up by when it hits the minimum size.
var scaleSize;
// How much each flake is shrunk each frame. Lower is more.
var scaleIntensity;
// How often each flake gets scaled. Lower is more.
var scaleFrequency;
// How often the flakes alter their course/speed. In terms of frames.
var wobbleFrequency;
// Smallest flakes are allowed to get.
var minimumSize;
// Largest flakes are allowed to get.
var maximumSize;
//How many points the flake have.
var flakePoints;
var flakeOuterRadius;
var flakeInnerRadius;
//Stores all the colors the user can use for random pool colors.
var colors = ["black", "white", "blue", "green", "red"];
var selectedOutline;
var selectedFill;
var selectedBackground;
var randomFillColorAll;
var randomFillColorPool;
var randomOutlineColorAll;
var randomOutlineColorPool;
var randomBackgroundColorAll;
var randomBackgroundColorPool;

var canvas = document.getElementById("myCanvas");
var screenHeight;
var screenWidth;

var addColorButton = document.getElementById("add");
addColorButton.addEventListener("click", function() {
    var addButton = document.getElementById("add-button");
    colors.push(addButton.value);
    var option = document.createElement("option");
    option.text = addButton.value;
    option.innerHTML = addButton.value;
    console.log(addButton.value)
    document.getElementById("outline").add(option);
    addButton.value = "";

});

var resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", function() {
    resetSim();
});

initSimulation();

function resetSim() {
    for (var i = 0; i < flakes.length; i++) {
        flakes[i].remove();
    }
    flakes.length = 0;
    setValues();
    generateFlakes();
}

function initSimulation() {
    clearForms();
    setValues();
    generateFlakes();
}

// This function corrects a bug in Firefox that causes filled in values to remain on refresh.
function clearForms() {
    $('input').val("");
}

// Pulls values from page's inputs and assigns default values if they don't exist.
function setValues() {
    numFlakes = document.getElementById("num-flakes").value || 500;
    framesPerSecond = document.getElementById("fps").value || 30;
    setFrameRate();
    console.log(frames)
    scaleSize = document.getElementById("scale-size").value || 45;
    scaleIntensity = document.getElementById("scale-intensity").value || .8;
    scaleFrequency = document.getElementById("scale-frequency").value || .9;
    wobbleFrequency = document.getElementById("wobble-frequency").value || 9;
    minimumSize = document.getElementById("min-size").value || 1;
    maximumSize = document.getElementById("max-size").value || 50;
    flakePoints = document.getElementById("points").value || 7;
    flakeOuterRadius = document.getElementById("outer-radius").value || 20;
    flakeInnerRadius = document.getElementById("inner-radius").value || 2;
    selectedOutline = document.getElementById("outline").value || "green";
    selectedFill = document.getElementById("fill").value || "black";
    selectedBackground = document.getElementById("background").value || "white";
    randomFillColorAll = false;
    randomFillColorPool = false;
    randomOutlineColorAll = false;
    randomOutlineColorPool = false;
    randomBackgroundColorAll = false;
    randomBackgroundColorPool = false;
    screenHeight = canvas.scrollHeight;
    screenWidth = canvas.scrollWidth;

}

function generateFlakes() {
    for (var i = 0; i < numFlakes; i++) {
        var flake = new Path.Star(new Point(Math.random() * screenWidth, 
            Math.random() * screenHeight), flakePoints, flakeOuterRadius, flakeInnerRadius);
        getColors(flake);
        flake.strokeWidth = 2;
        flake.scale(Math.random());
        flakes.push(flake);
        directionVectors.push(new Point(0, 0));
    }
}

// Return a color based on user selections. Sets booleans for randomness for later use.
function getColors(flake) {
    if (selectedFill === "random-all") {
        randomFillColorAll = true;
        flake.fillColor = getRandomColor(true);
    } else if (selectedFill === "random-pool") {
        flake.fillColor = getRandomColor(false);
        randomFillColorPool = true;
    } else {
        flake.fillColor = selectedFill;
    }
    if (selectedOutline === "random-all") {
        flake.strokeColor = getRandomColor(true);
        randomOutlineColorAll = true;
    } else if (selectedOutline === "random-pool") {
        flake.strokeColor = getRandomColor(false);
        randomOutlineColorPool = true;
    } else {
        flake.strokeColor = selectedOutline;
    }
    if (selectedBackground === "random-all") {
        randomBackgroundColorAll = true;
        canvas.style.backgroundColor = getRandomColor(true);
    } else if (selectedBackground === "random-pool") {
        canvas.style.backgroundColor = getRandomColor(false);
        randomBackgroundColorPool = true;
    } else {
        canvas.style.backgroundColor = selectedBackground;
    }
}

function onFrame(event) {
    updateFrame(event);
    updateWobble(event);
}

function updateWobble(event) {
    if (event.count % wobbleFrequency === 0) {
        for (var i = 0; i < directionVectors.length; i++) {
            if (Math.random() > .5) {
                directionVectors[i] = Math.random() * 2;
            }
            else {
                directionVectors[i] = new Point(Math.random() * -2, Math.random() * 2);
            }
        }
    }
}

function updateFrame(event) {
    if (event.count % frames === 0) {
        for (var i = 0; i < flakes.length; i++) {
            var currentFlake = flakes[i];
            updateColor(currentFlake);
            updatePosition(currentFlake, i);
        }
    }
}

function setFrameRate() {
    if (framesPerSecond == 30) {
        frames = 3;
    } else if (framesPerSecond == 1) {
        frames = 60;
    } else {
        frames = 1;
    }
}

function updatePosition(currentFlake, i) {
    currentFlake.position += directionVectors[i];
    if (currentFlake.position.x > screenWidth || currentFlake.position.x < 0) {
        var random = Math.random();
        // Keeps flakes from clustering on bottom of the screen.
        while (random < .9)
            random = Math.random();
        currentFlake.position.x = random * screenWidth;
    }
    if (currentFlake.position.y > screenHeight || currentFlake.position.y < 0) {
        currentFlake.position.y = Math.random() * screenHeight;
    }
    if (Math.random() > scaleFrequency) {
        currentFlake.scale(scaleIntensity);
    }
    if (currentFlake.bounds.width <= minimumSize) {
        currentFlake.scale(scaleSize);
    }
    while (currentFlake.bounds.width > maximumSize) {
        currentFlake.scale(scaleIntensity);
    }
}

function updateColor(currentFlake) {
    if (randomFillColorAll) {
        currentFlake.fillColor = getRandomColor(true);
    }
    else if (randomFillColorPool) {
        currentFlake.fillColor = getRandomColor(false);
    }
    if (randomOutlineColorAll) {
        currentFlake.strokeColor = getRandomColor(true);
    }
    else if (randomFillColorPool) {
        currentFlake.strokeColor = getRandomColor(false);
    }
    if (randomBackgroundColorAll) {
        canvas.style.backgroundColor = getRandomColor(true);
    }
    else if (randomBackgroundColorPool) {
        canvas.style.backgroundColor = getRandomColor(false);
    }
}

function getRandomColor(isAll) {
    if (isAll) {
        return randomColor();
    } else {
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

function randomColor() {
    return "rgb(" +
            Math.random() * 255 + ", " +
            Math.random() * 255 + ", " +
            Math.random() * 255 + ")";
}