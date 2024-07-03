// 设置画布

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const para = document.querySelector('p');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// 生成随机数的函数

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomColor() {
  return (
    "rgb(" +
    random(0, 255) +
    ", " +
    random(0, 255) +
    ", " +
    random(0, 255) +
    ")"
  );
}
//设置球
function Shape(x, y, velX, velY, exists) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.exists = exists;
}

function Ball(x, y, velX, velY, color, size, exists) {

  Shape.call(this, x, y, velX, velY, exists);

  this.color = color;
  this.size = size;

}

Ball.prototype.draw = function () {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fill();
};

Ball.prototype.update = function () {
  if (this.x + this.size >= width) {
    this.velX = -this.velX;
  }

  if (this.x - this.size <= 0) {
    this.velX = -this.velX;
  }

  if (this.y + this.size >= height) {
    this.velY = -this.velY;
  }

  if (this.y - this.size <= 0) {
    this.velY = -this.velY;
  }
  this.x += this.velX;
  this.y += this.velY;
};

Ball.prototype.collisionDetect = function () {
  for (let j = 0; j < balls.length; j++) {
    if (this !== balls[j]) {
      const dx = this.x - balls[j].x;
      const dy = this.y - balls[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + balls[j].size) {
        balls[j].color = this.color = randomColor();
      }
    }
  }
};

let balls = [];

while (balls.length < 25) {
  let size = random(10, 20);
  let ball = new Ball(
    // 为避免绘制错误，球至少离画布边缘球本身一倍宽度的距离
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    randomColor(),
    size,
    true
  );
  balls.push(ball);
}

function EvilCircle(x, y, velX, velY, exists, color, size) {
  Shape.call(this, x, y, velX, velY, exists);
  this.color = color;
  this.size = size;
}


var curX;
var curY;
var pressed = false;

document.onmousemove = function (e) {
  curX = window.Event
    ? e.pageX
    : e.clientX +
    (document.documentElement.scrollLeft
      ? document.documentElement.scrollLeft
      : document.body.scrollLeft);
  curY = window.Event
    ? e.pageY
    : e.clientY +
    (document.documentElement.scrollTop
      ? document.documentElement.scrollTop
      : document.body.scrollTop);
};

canvas.onmousedown = function () {
  pressed = true;
};

canvas.onmouseup = function () {
  pressed = false;
};


EvilCircle.prototype.draw = function () {
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = this.color;
    this.x = curX;
    this.y = curY;
    ctx.arc(curX, curY, this.size, 0, 2 * Math.PI);
    ctx.stroke();
}

EvilCircle.prototype.checkBounds = function () {
  if ((this.x + this.size) >= width) {
    this.x -= this.size;
  }

  if ((this.x - this.size) <= 0) {
    this.x += this.size;
  }

  if ((this.y + this.size) >= height) {
    this.y -= this.size;
  }

  if ((this.y - this.size) <= 0) {
    this.y += this.size;
  }
}

EvilCircle.prototype.setControls = function () {
  window.onkeydown = e => {
    switch (e.key) {
      case 'a':
        this.x -= this.velX;
        break;
      case 'd':
        this.x += this.velX;
        break;
      case 'w':
        this.y -= this.velY;
        break;
      case 's':
        this.y += this.velY;
        break;
    }
  };
}

let balls_count = 25
EvilCircle.prototype.collisionDetect = function () {

  for (let j = 0; j < balls.length; j++) {
    if (balls[j].exists === true) {
      const dx = this.x - balls[j].x;
      const dy = this.y - balls[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + balls[j].size) {
        balls[j].exists = false;
        balls_count--;
        para.textContent = "还剩" + balls_count + "个球";
      }
    }
  }
}
let size = 10;
evilcircle = new EvilCircle(random(0 + size, width - size),
  random(0 + size, height - size),
  30,
  30,
  true,
  "rgb(255,255,255)",
  size,
)

function loop() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);
  evilcircle.draw();
  evilcircle.setControls();
  evilcircle.checkBounds();
  evilcircle.collisionDetect();

  for (let i = 0; i < balls.length; i++) {
    if (balls[i].exists === true) {
      balls[i].draw();
      balls[i].collisionDetect();
      balls[i].update();
    }
  }

  requestAnimationFrame(loop);
}
loop();
