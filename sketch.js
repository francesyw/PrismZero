var listBtn;
var speakBtn;
var PZ = new p5.Speech();
var voices = []
var len = 500.0;
var count = 0;
var triPoly = [];
var font;
var letters = [];
var string = "abcdefghijklmnopqrstuvwxyz";
var vowel = "aeiou";
var vIndex = [1,2,7,8,9,10,12,14,17,21,22,23,29,42,44,53,55,56,57,61];
var lookup = {};
var prism;
var credits;

function preload() {
  font = loadFont('./assets/Pecita.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  voices = PZ.voices;
  noCursor();
  // collideDebug(true);
  
  // make prism
  var x1 = width / 2.0;
  var y1 = 0.5 * (height - len * sin(radians(60.0)));
  var x2 = 0.5 * (width - len);
  var y2 = y1 + len * sin(radians(60.0));
  var x3 = 0.5 * (width + len);
  var y3 = y2;
  triPoly[0] = createVector(x1, y1);
  triPoly[1] = createVector(x2, y2);
  triPoly[2] = createVector(x3, y3);
  prism = new Prism();
  // Buttons
  // listBtn = createButton('List Voices');
  // listBtn.position(width / 10, height / 10);
  // listBtn.mousePressed(doList);

  var first = new Box("o", 0, height / 4, 4, 1, false);
  first.tr=255;
  first.tg=255;
  letters.push(first);
  lookup[first.id] = first;
  
  credits = new Credits();
}

function draw() {
  background(0,35);
  prism.display();

  for (var i = 0; i < letters.length; i++) {
    letters[i].move();
    letters[i].display();
    if (letters[i].tAlpha <= 5) {
      letters.splice(letters.indexOf(lookup[letters[i].id]), 1);
    }else{
      letters[i].detect();
    }
  }

  if (letters.length > 60) {
    letters.splice(0, 1);
  }
  
  if (letters.length < 5) {
    prism.pAlpha--;
    if (prism.pAlpha < 5) {
      background(0);
      credits.display();
      credits.cAlpha++;
    }
  }
}

function Prism() {
  this.pAlpha = 255;
  this.pr = 255;
  this.pg = 255;
  this.display = function() {
    noFill();
    stroke(color(this.pr, this.pg, 255, this.pAlpha));
    strokeWeight(5);
    triangle(triPoly[0].x, triPoly[0].y, triPoly[1].x, triPoly[1].y, triPoly[2].x, triPoly[2].y);
  }
}

function Box(cha, x, y, vx, vy, isIn) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.cha = cha;
  var bbox = font.textBounds(cha, this.x, this.y, 50);
  var offset = this.y - bbox.y;
  this.width = bbox.w;
  this.height = bbox.h;
  this.hit = false;
  this.isIn = isIn;
  count += 1;
  this.id = str(count);
  this.tAlpha = 255;
  this.tr = random(250);
  this.tg = random(255);

  this.move = function() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) {
      this.x = 0;
      this.vx = -this.vx;
    }

    if (this.y < 0) {
      this.y = 0;
      this.vy = -this.vy;
    }

    if (this.x > width - bbox.w) {
      this.x = width - bbox.w;
      this.vx = -this.vx;
    }

    if (this.y > height - bbox.h) {
      this.y = height - bbox.h;
      this.vy = -this.vy;
    }
  }

  this.display = function() {
    // rect(this.x, this.y - offset + bbox.h, bbox.w, bbox.h);
    noStroke();
    fill(color(this.tr,this.tg,255, this.tAlpha));
    this.tAlpha -= 0.5;
    textSize(50);
    textFont(font);
    text(cha, this.x, this.y + bbox.h);

    // fill(255, 0, 0);
    this.hit = collideRectPoly(this.x, this.y, this.width, this.height, triPoly, true);
  }

  this.detect = function() {
    if (this.hit && !this.isIn) {
      this.isIn = true;
      
      if (millis() < 150000) { 
        prism.pr = random(250);
        prism.pg = random(255);
        breed(this.x, this.y, this.vx, this.vy);  
      } else {
        PZ.stop();
      }
      letters.splice(letters.indexOf(lookup[this.id]), 1);
    } else if (!this.hit && this.isIn) {
      this.isIn = false;
      this.tr=255;
      this.tg=255;
      prism.pr = 255;
      prism.pg = 255;
    }
  }
}

function breed(x, y, vx, vy) {
  var words = "";
  for (var i = 0; i < 5; i++) {
    var s;
    if (i == 1) {
      s = vowel[floor(random(4))];
    } else {
      s = string[floor(random(25))];
    }
    words += s;
    var newOne = new Box(s, x, y, vx / abs(vx) * random(0.5, 3.5), vy / abs(vy) * random(0.5, 3.5), true);
    letters.push(newOne);
    lookup[newOne.id] = newOne;
  }
  speakOut(words);
}

function doList() {
  PZ.listVoices();
}

function speakOut(words) {
  var v = Math.floor(random(vIndex.length));
  // print(vIndex[v]);
  PZ.setRate(random(0.3, 1.3));
  PZ.setVoice(vIndex[v]); //1?,26-,29x,55?
  PZ.speak(words);
}

function Credits() {
  this.cAlpha = 0;
  this.display = function() {
    noStroke();
    fill(this.cAlpha);
    textSize(90);
    textAlign(CENTER);
    textLeading(75);
    text("PRISM\nO", width/2, height*1.3/3);
    textSize(30);
    text("by Frances Yuan Wang", width/2, height*1.8/3);
  }
  
}


