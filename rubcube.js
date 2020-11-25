r = 3; // Number of rows, columns, planes in the cube
l = 40; // Lenght of each side of each cubie
t = 250; //Oppacity (0=totally transparent, 255=solid)
speed = 5;
cube = [];
cColors = {
  top: "#fff",
  bot: "#FDEF13",
  fro: "#36CD11",
  bac: "#0005B5",
  lef: "#F02C2C",
  rig: "#F77C21",
  white: "#fff"
};

xp = [0, 0, 0, 0, 0, 0, 0, 0, 0];
yp = [0, 0, 0, 0, 0, 0, 0, 0, 0];
zp = [0, 0, 0, 0, 0, 0, 0, 0, 0];

cw = [6, 3, 0, 7, 4, 1, 8, 5, 2];
ccw = [2, 5, 8, 1, 4, 7, 0, 3, 6];

m = 0;
turning = false;
needResort = false;
tempCubies = [];
tempOrder = [];
sortOrder = null;
keyBuffer = [];
rewinder = [];

var helpCanvas = null;
var helpText = "- Click and drag the cube to rotate it \n"
helpText += "- Use the keys 'q', 'w', 'e' to rotat the X axis \n"
helpText += "- Use the keys 'a', 's', 'd' to rotat the Y axis \n"
helpText += "- Use the keys 'z', 'x', 'c' to rotat the Z axis \n"
helpText += "- Holding shift to rotate in the other direction \n"
helpText += "- 'r' rewinds the cube to original position \n"


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  helpCanvas = createGraphics(285, 110);
  helpCanvas.background(0);
  helpCanvas.fill(204);
  helpCanvas.textSize(14);
  helpCanvas.text(helpText, 5, 15);
  x = y = z = 0;
  for (z = 0; z < r; z++) {
    for (y = 0; y < r; y++) {
      for (x = 0; x < r; x++) {
        cube.push(new Cubie(cColors.top, cColors.bot, cColors.fro,
          cColors.bac, cColors.lef, cColors.rig,
          x, y, z));
      }
    }
  }

  zp[0] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  zp[1] = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  zp[2] = [18, 19, 20, 21, 22, 23, 24, 25, 26];

  yp[0] = [0, 1, 2, 9, 10, 11, 18, 19, 20];
  yp[1] = [3, 4, 5, 12, 13, 14, 21, 22, 23];
  yp[2] = [6, 7, 8, 15, 16, 17, 24, 25, 26];

  xp[0] = [18, 9, 0, 21, 12, 3, 24, 15, 6];
  xp[1] = [19, 10, 1, 22, 13, 4, 25, 16, 7];
  xp[2] = [20, 11, 2, 23, 14, 5, 26, 17, 8];
}

function draw() {
  background(0);
  image(helpCanvas, -windowWidth / 2, -windowHeight / 2);
  orbitControl();
  turning = false;
  for (a = 0; a < cube.length; a++) {
    if (a >= 0) cube[a].draw();
    if (cube[a].turning) {
      turning = true;
    }
  }

  if (!turning && needResort) {
    reSort();
    needResort = false;
  }
  if (keyBuffer.length > 0) waitingToTurn();
}

function keyTyped() {
  var dir = 1;
  if (keyIsDown(SHIFT)) dir = -1;
  keyBuffer.push({
    key: key,
    dir: dir
  });
  rewinder.push({
    key: key,
    dir: -dir
  });
}

function waitingToTurn() {
  if (!turning && !needResort && keyBuffer.length > 0) {
    var next = keyBuffer.shift();
    if (next) callToTurn(next.key.toLowerCase(), next.dir);
  }
}

function rewind() {
  b = rewinder.length;
  for(c=0; c<=b; c++){
    keyBuffer.push(rewinder.pop());
  }
}

function callToTurn(key, dir) {
  switch (key) {
    case 'q':
      turnCube("x", 0, dir);
      break;
    case 'w':
      turnCube("x", 1, dir);
      break;
    case 'e':
      turnCube("x", 2, dir);
      break;
    case 'a':
      turnCube("y", 0, dir);
      break;
    case 's':
      turnCube("y", 1, dir);
      break;
    case 'd':
      turnCube("y", 2, dir);
      break;
    case 'z':
      turnCube("z", 0, dir);
      break;
    case 'x':
      turnCube("z", 1, dir);
      break;
    case 'c':
      turnCube("z", 2, dir);
      break;
    case 'r':
      rewind();
  }


  if (key === 'p' || key == 'P') {
    for (a = 0; a < 27; a++) {
      print(a, cube[a].myPos());
    }
  }
}

// axis -> "x", "y", "z"
// layer -> from 0 to (r-1)
// dir -> 1=clockwise; -1=counter-clockwise
function turnCube(axis, layer, dir) {
  needResort = true;
  tempCubies = [];
  if (dir == -1) sortOrder = ccw;
  if (dir == 1) sortOrder = cw;

  switch (axis) {
    case "x":
      for (a = 0; a < 9; a++) {
        cube[xp[layer][a]].turn("x", dir * PI / 2);
        tempCubies.push(cube[xp[layer][a]]);
      }
      tempOrder = xp[layer];

      break;
    case "y":
      for (a = 0; a < 9; a++) {
        cube[yp[layer][a]].turn("y", dir * PI / 2);
        tempCubies.push(cube[yp[layer][a]]);
      }
      tempOrder = yp[layer];
      break;
    case "z":
      for (a = 0; a < 9; a++) {
        cube[zp[layer][a]].turn("z", dir * PI / 2);
        tempCubies.push(cube[zp[layer][a]]);
      }
      tempOrder = zp[layer];
      break;
  }
}

function reSort() {
  for (a = 0; a < 9; a++) {
    cube[tempOrder[a]] = tempCubies[sortOrder[a]];
    cube[tempOrder[a]].turnX = 0;
    cube[tempOrder[a]].turnY = 0;
    cube[tempOrder[a]].turnZ = 0;
  }
  needResort = false;
}

class Cubie {
  constructor(cTop, cBot, cFro, cBac, cLef, cRig, px, py, pz) {
    cTop = color(cTop);
    cTop.setAlpha(t);
    cBot = color(cBot);
    cBot.setAlpha(t);
    cFro = color(cFro);
    cFro.setAlpha(t);
    cBac = color(cBac);
    cBac.setAlpha(t);
    cLef = color(cLef);
    cLef.setAlpha(t);
    cRig = color(cRig);
    cRig.setAlpha(t);

    this.cTop = cTop;
    this.cBot = cBot;
    this.cFro = cFro;
    this.cBac = cBac;
    this.cLef = cLef;
    this.cRig = cRig;
    this.px = px; // position in the grid
    this.py = py;
    this.pz = pz;
    this.cx = 0; //Change in angle (radians)
    this.cy = 0;
    this.cz = 0;

    this.r = r;
    this.l = l;

    this.turnX = 0;
    this.turnY = 0;
    this.turnZ = 0;

    this.turning = false;
    this.toTurnAxis = null;
    this.toTurnDir = 0;
  }

  myPos() {
    return (this.px + this.py * r + this.pz * r * r);
  }

  draw() {
    push();
    var m = (this.r * this.l) / 2;

    // Center the window
    translate(m, m, m);

    //Rotate to the current position
    rotateX(this.cx);
    rotateY(this.cy);
    rotateZ(this.cz);

    // Move the windows to the center of the cubie being drown
    translate(this.l * (this.px - this.r / 2 + 0.5),
      this.l * (this.py - this.r / 2 + 0.5),
      this.l * (this.pz - this.r / 2 + 0.5));

    //Draw the back plane
    translate(0, 0, -this.l / 2);
    fill(this.cBac);
    square(-this.l / 2, -this.l / 2, this.l);
    translate(0, 0, this.l / 2);

    //Draw the top plane
    rotateX(-PI / 2);
    translate(0, 0, -this.l / 2);
    fill(this.cTop);
    square(-this.l / 2, -this.l / 2, this.l);
    translate(0, 0, this.l / 2);

    //Draw the front plane
    rotateX(-PI / 2);
    translate(0, 0, -this.l / 2);
    fill(this.cFro);
    square(-this.l / 2, -this.l / 2, this.l);
    translate(0, 0, this.l / 2);

    //Draw the bottom plane
    rotateX(-PI / 2);
    translate(0, 0, -this.l / 2);
    fill(this.cBot);
    square(-this.l / 2, -this.l / 2, this.l);
    translate(0, 0, this.l / 2);

    //Draw the right plane
    rotateY(-PI / 2);
    translate(0, 0, -this.l / 2);
    fill(this.cRig);
    square(-this.l / 2, -this.l / 2, this.l);
    translate(0, 0, this.l / 2);

    //Draw the Left plane
    rotateY(PI);
    translate(0, 0, -this.l / 2);
    fill(this.cLef);
    square(-this.l / 2, -this.l / 2, this.l);
    translate(0, 0, this.l / 2);

    pop();

    if (abs(this.turnX) + abs(this.turnY) + abs(this.turnZ) > 0) {
      this.turning = true;
      this._turn();
    } else {
      this.turning = false;
    }

    if (this.turning == false && this.toTurnAxis != null) {
      this._finishTurn();
    }
  }

  _finishTurn() {
    var temp;
    if (this.toTurnAxis == "x") {
      temp = this.py;
      if (this.toTurnDir == 1) {
        this.py = 2 - this.pz;
        this.pz = temp;
      } else {
        this.py = this.pz;
        this.pz = 2 - temp;
      }
    }
    if (this.toTurnAxis == "y") {
      temp = this.px;
      if (this.toTurnDir == 1) {
        this.px = 2 - this.pz;
        this.pz = temp;
      } else {
        this.px = this.pz;
        this.pz = 2 - temp;
      }
    }
    if (this.toTurnAxis == "z") {
      temp = this.px;
      if (this.toTurnDir == 1) {
        this.px = 2 - this.py;
        this.py = temp;
      } else {
        this.px = this.py;
        this.py = 2 - temp;
      }
    }
    this.rColor(this.toTurnAxis, this.toTurnDir);
    this.toTurnAxis = null;
    this.toTurnDir = 0;
    this.cx = 0;
    this.cy = 0;
    this.cz = 0;
  }

  rColor(axis, dir) {
    var topTemp, froTemp;
    if (axis == "x") {
      topTemp = this.cTop;
      if (dir == 1) {
        this.cTop = this.cFro;
        this.cFro = this.cBot;
        this.cBot = this.cBac;
        this.cBac = topTemp;
      }
      if (dir == -1) {
        this.cTop = this.cBac;
        this.cBac = this.cBot;
        this.cBot = this.cFro;
        this.cFro = topTemp;
      }
    }

    if (axis == "y") {
      froTemp = this.cFro;
      if (dir == 1) {
        this.cFro = this.cRig;
        this.cRig = this.cBac;
        this.cBac = this.cLef;
        this.cLef = froTemp;
      }
      if (dir == -1) {
        this.cFro = this.cLef;
        this.cLef = this.cBac;
        this.cBac = this.cRig;
        this.cRig = froTemp;
      }
    }

    if (axis == "z") {
      topTemp = this.cTop;
      if (dir == 1) {
        this.cTop = this.cLef;
        this.cLef = this.cBot;
        this.cBot = this.cRig;
        this.cRig = topTemp;
      }
      if (dir == -1) {
        this.cTop = this.cRig;
        this.cRig = this.cBot;
        this.cBot = this.cLef;
        this.cLef = topTemp;
      }
    }

  }

  turn(axis, ang) {
    //axis -> "x", "y", "z"
    //ang -> angle in radians
    //print("Turn: ", this.myPos(), axis, ang);
    switch (axis) {
      case "x":
        this.turnX = ang;
        break;
      case "y":
        this.turnY = ang;
        break;
      case "z":
        this.turnZ = ang;
        break;
    }
    this.toTurnAxis = axis;
    if (ang < 0) {
      this.toTurnDir = -1;
    } else {
      this.toTurnDir = 1;
    }

  }

  _turn() {
    turning = true;
    if (this.turnX != 0) {
      this.cx = this.cx + this.turnX * frameRate() / (1000 / speed);
      this.turnX -= this.turnX * frameRate() / (1000 / speed);
      if (abs(this.turnX) < PI / 360) {
        this.cx = this.cx + this.turnX;
        this.turnX = 0;
        this.cx = (round((this.cx + 2 * PI) / (PI / 2)) % 4) * PI / 2;
      }
    }

    if (this.turnY != 0) {
      this.cy = this.cy - this.turnY * frameRate() / (1000 / speed);
      this.turnY -= this.turnY * frameRate() / (1000 / speed);
      if (abs(this.turnY) < PI / 90) {
        this.cy = this.cy + this.turnY;
        this.turnY = 0;
        this.cy = (round((this.cy + 2 * PI) / (PI / 2)) % 4) * PI / 2;
      }
    }

    if (this.turnZ != 0) {
      this.cz = this.cz + this.turnZ * frameRate() / (1000 / speed);
      this.turnZ -= this.turnZ * frameRate() / (1000 / speed);
      if (abs(this.turnZ) < PI / 90) {
        this.cz = this.cz - this.turnZ;
        this.turnZ = 0;
        this.cz = (round((this.cz + 2 * PI) / (PI / 2)) % 4) * PI / 2;
      }
    }
  }
}
