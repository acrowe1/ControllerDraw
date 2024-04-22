let port;
let joyX = 0, joyY = 0, sw = 0;
let connectButton;
let circleX, circleY; 
let speed = 0.005; 
let dragging = false;
let colors;
let selectedColor;
const size = 10;
let synth;
let clearButton;
let saveButton;

function setup() {
  port = createSerial(); 
  createCanvas(1000, 1000);
  circleX = width / 2; 
  circleY = height / 2; 
  selectedColor = color('white');
  
  // Start Tone.js context
  Tone.start();
  
  synth = new Tone.Synth().toDestination();

  colors = [new ColorSquare(0, 0, color('red')),
            new ColorSquare(0, 20, color('orange')),
            new ColorSquare(0, 40, color('yellow')),
            new ColorSquare(0, 60, color('limegreen')),
            new ColorSquare(0, 80, color('lightblue')),
            new ColorSquare(0, 100, color('blue')),
            new ColorSquare(0, 120, color('magenta')),
            new ColorSquare(0, 140, color('brown')),
            new ColorSquare(0, 160, color('white')),
            new ColorSquare(0, 180, color('black'))];

  clearButton = createButton('Clear');
  clearButton.position(1, 200);
  clearButton.mousePressed(clearCanvas);

  saveButton = createButton('Save');
  saveButton.position(1, 225);
  saveButton.mousePressed(saveCanvasToFile);

  connectButton = createButton("Connect");
  connectButton.position(1, 250);
  connectButton.mousePressed(connect);

  let usedPorts = usedSerialPorts(); 
  if (usedPorts.length > 0) {
    port.open(usedPorts[0], 57600);
  }
  frameRate(90);
}

function draw() {
  let characters = port.available(); 
  if (characters > 0) {
    let str = port.read(characters);
    let lines = str.split("\n"); 
    let latest = ""; 
    if (lines.length > 0) {
      let lastIndex = lines.length > 1 ? lines.length-2 : lines.length-1;
      latest = lines[lastIndex];
    }

    let values = latest.split(",");
    if (values.length > 2) {
      joyX = Number(values[0]); 
      joyY = Number(values[1]); 
      sw = Number(values[2]); 
    }
  }
  
  circleX += joyX * speed;
  circleY += joyY * speed;

  circleX = constrain(circleX, size / 2, width - size / 2);
  circleY = constrain(circleY, size / 2, height - size / 2);

  for (let i = 0; i < colors.length; i++) {
    colors[i].draw();
  }

  stroke(selectedColor);
  fill(selectedColor);

  for (let i = 0; i < colors.length; i++) {
    if (colors[i].isCircleOver()) {
      selectedColor = colors[i].fill;
      break;
    }
  }

  if (sw == 1) {
    dragging = true;
    playNote();
  } else if (sw != 1) {
    dragging = false;
  }

  if (dragging) {
    circle(circleX, circleY, size);
    set(circleX, circleY, selectedColor);
  } 

  stroke('black');
  circle(circleX, circleY, 10);
}

function playNote() {
  let noteFreq = Tone.Frequency(map(circleY, 0, height, 48, 72), "midi");
  synth.triggerAttackRelease(noteFreq, "8n");
}

function clearCanvas() {
  background(255);
}

function saveCanvasToFile() {
  saveCanvas('beautifulWorkOfArt', 'png');
}

function connect() {
  if (!port.opened()) {
    port.open('Arduino', 57600);
  } else {
    port.close();
  }
}

class ColorSquare {
  constructor(x, y, fill) {
    this.x = x;
    this.y = y;
    this.fill = fill;
  }

  draw() {
    stroke(225);
    fill(this.fill);
    square(this.x, this.y, 20);
  }

  isCircleOver() {
    return circleX > this.x && circleX < this.x + 20 && circleY > this.y && circleY < this.y + 20;
  }
}
