const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let game = {
  state: 'title',
  gravity: 0.2,
  maxVelocity: 8,
  minVelocity: -5,
  ballColor: '#F24405',
  pegColor: '#348888',
  pegColorLit: '#FA7F08',
  lives: 5,
  score: 0,
  scoreMultiplier: 1,
  numberOfLitPegs: 8,
  currentLevel: 1
}

let keysPressed = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  Enter: false
};

document.addEventListener('keydown', (event) => {
  if (event.key in keysPressed) {
    keysPressed[event.key] = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key in keysPressed) {
    keysPressed[event.key] = false;
  }
});

const ball = {
  x: 390,
  y: 22,
  radius: 20,
  xVelocity: 0,
  yVelocity: 0,
  gravity: game.gravity,
  released: false
}

// const pegRadius = 20;

function updateMovingBall() {

  // Update circle A's position
  if (ball.yVelocity < game.maxVelocity){
    ball.yVelocity += ball.gravity;
  };
  
  ball.x += ball.xVelocity;
  ball.y += ball.yVelocity;

  for (let i = 0; i < levels[game.currentLevel].pegs.length;i++){

    if (levels[game.currentLevel].pegs[i].active){

      // Distance between centre of both levels[game.currentLevel].pegs
      const dx = ball.x - levels[game.currentLevel].pegs[i].x;
      const dy = ball.y - levels[game.currentLevel].pegs[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Bounce off peg if they collide
      if (distance <= ball.radius + levels[game.currentLevel].pegRadius) {
        const angle = Math.atan2(dy, dx);
        const targetX = levels[game.currentLevel].pegs[i].x + Math.cos(angle) * (ball.radius + levels[game.currentLevel].pegRadius);
        const targetY = levels[game.currentLevel].pegs[i].y + Math.sin(angle) * (ball.radius + levels[game.currentLevel].pegRadius);

        const normalX = ball.x - targetX;
        const normalY = ball.y - targetY;
        const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
        const normalizedNormalX = normalX / normalLength;
        const normalizedNormalY = normalY / normalLength;

        const dotProduct = ball.xVelocity * normalizedNormalX + ball.yVelocity * normalizedNormalY;
        ball.xVelocity -= 2 * dotProduct * normalizedNormalX;
        ball.yVelocity -= 2 * dotProduct * normalizedNormalY;

        // Make peg disappear
        levels[game.currentLevel].pegs[i].active = false;

        // Increase score
        if (!levels[game.currentLevel].pegs[i].glowing) {
          game.score = game.score + (100 * game.scoreMultiplier);
        } else {
          game.score = game.score + (1000 * game.scoreMultiplier);
          levels[game.currentLevel].currentLitPegs--;
        }
        game.scoreMultiplier++;
      } 

    }

    // Bounce off left side of screen ...
    if (ball.x - ball.radius < 0) {
      ball.xVelocity = Math.abs(ball.xVelocity)
    }
    // ... and right side of screen
    if (ball.x + ball.radius > canvas.width) {
      ball.xVelocity = -Math.abs(ball.xVelocity)
    }

    // Reset ball if off bottom of screen
    if (ball.y > canvas.height + 400) {
      if (game.lives > 1 && game.state != 'levelComplete'){
        resetBall();
        game.state = 'playerControlsBall';
        game.lives--;
        game.scoreMultiplier = 1; 
      } else {
        game.state = 'gameOver'
      }
    }

    if (levels[game.currentLevel].currentLitPegs == 0) {
      game.state = 'levelComplete'
    }

  }

}

// Move ball back to top of screen
function resetBall(){
  ball.x =  390;
  ball.y =  22;
  ball.xVelocity =  0;
  ball.yVelocity = 0;
  ball.gravity = game.gravity;
  ball.released = false;
}

// Manage player controls for moving ball before firing
function letPlayerMoveBall(){
  if (keysPressed.ArrowLeft) {
    ball.x = ball.x - 2;
  }
  if (keysPressed.ArrowRight) {
    ball.x = ball.x + 2;
  }
  if (keysPressed.ArrowDown) {
    game.state = 'ballMoving';
  }
}

// Controls on title screen
function title(){
  if (keysPressed.ArrowLeft || keysPressed.ArrowRight) {
    game.state = 'playerControlsBall';
  }
}

// Load next level
function nextLevel(){
  if (keysPressed.ArrowRight) {
    game.currentLevel ++;
    selectLitPegs();
    game.state = 'playerControlsBall'
    ball.radius = levels[game.currentLevel].pegRadius;
  }
}

function update() {

  if (game.state == 'playerControlsBall'){
    letPlayerMoveBall();
  } else if (game.state == 'ballMoving' || game.state == 'levelComplete') {
    updateMovingBall();
  } else if (game.state == 'title') {
    title();
  }

  if (game.state == 'levelComplete') {
    nextLevel();
    resetBall();
  }
  
}

// Utility function to shuffle an array, used in selectLitPegs()
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// Randomise which pegs are 'lit'
function selectLitPegs(){
  shuffle(levels[game.currentLevel].pegs);
  for (let i = 0; i < levels[game.currentLevel].initialLitPegs; i++) {
    levels[game.currentLevel].pegs[i].glowing = true;
  } 
}

// Draw screen
function draw() {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw Score
  ctx.font = "30px 'Caprasimo', sans-serif";
  ctx.fillStyle = '#348888';
  let currentScore = 'Score: ' + game.score;
  ctx.fillText(currentScore,10,590)
  
  // Draw lives  
  ctx.fillText('Balls: ',500,590)
  for (let i = 0; i < game.lives; i++){
    ctx.beginPath();
    ctx.arc(610 + (40 * i), 576, 15, 0, Math.PI * 2);
    ctx.fillStyle = game.ballColor;
    ctx.fill();
    ctx.closePath();    
  }
  
  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = game.ballColor;
  ctx.fill();
  ctx.closePath();

  // Draw levels[game.currentLevel].pegs
  for (let i = 0; i < levels[game.currentLevel].pegs.length;i++){
    if (levels[game.currentLevel].pegs[i].active){
      ctx.beginPath();
      ctx.arc(levels[game.currentLevel].pegs[i].x, levels[game.currentLevel].pegs[i].y, levels[game.currentLevel].pegRadius, 0, Math.PI * 2);

      if (!levels[game.currentLevel].pegs[i].glowing) {
        ctx.fillStyle = game.pegColor;
      } else {
        ctx.fillStyle = game.pegColorLit;
      }
      ctx.fill();
      ctx.closePath();
    }
  }

  if (game.state == 'gameOver') {
    ctx.fillStyle = '#348888';
    ctx.rect(200, 190, 390, 220);
    ctx.fill();
    ctx.fillStyle = '#9EF8EE';
    ctx.font = "60px 'Caprasimo', sans-serif";
    ctx.fillText('Game Over',230, 260)
    ctx.font = "40px 'Caprasimo', sans-serif";
    ctx.fillText('Score',340, 320)
    ctx.font = "40px 'Borel', sans-serif";
    ctx.fillText(game.score,320, 370)
  }

  if (game.state == 'levelComplete') {
    ctx.fillStyle = '#348888';
    ctx.rect(200, 190, 390, 220);
    ctx.fill();
    ctx.fillStyle = '#9EF8EE';
    ctx.font = "46px 'Caprasimo', sans-serif";
    ctx.fillText('Level Complete',220, 240)
    ctx.fillStyle = '#9EF8EE';
    ctx.font = "40px 'Caprasimo', sans-serif";
    ctx.fillText('Score:',220, 290)
    ctx.fillText(game.score,360, 290)
    ctx.fillText('Next level',300, 390)    // Right arrow
    ctx.fillStyle = '#FA7F08';
    let xOffset = 290;
    let yOffset = -75;
    ctx.beginPath();
    ctx.moveTo(230 + xOffset,440 + yOffset);
    ctx.lineTo(260 + xOffset,440 + yOffset);
    ctx.lineTo(260 + xOffset,430 + yOffset);
    ctx.lineTo(280 + xOffset,450 + yOffset);
    ctx.lineTo(260 + xOffset,470 + yOffset);
    ctx.lineTo(260 + xOffset,460 + yOffset);
    ctx.lineTo(230 + xOffset,460 + yOffset);
    ctx.lineTo(230 + xOffset,439 + yOffset);
    ctx.strokeStyle = '#9EF8EE';
    ctx.lineWidth = 3;
    ctx.stroke(); // Render the path
  }

  if (game.state == 'title') {
    ctx.fillStyle = '#348888';
    ctx.rect(100, 100, 600, 400);
    ctx.fill();
    ctx.fillStyle = '#9EF8EE';
    ctx.font = "70px 'Caprasimo', sans-serif";
    ctx.fillText('Pegchinko!',210, 220);
    ctx.font = "30px 'Caprasimo', sans-serif";
    ctx.fillText('Clear all the ',210, 290);
    ctx.fillStyle = '#FA7F08';
    ctx.fillText('orange pegs',410, 290);
    ctx.fillStyle = '#9EF8EE';
    ctx.fillText('to complete the level.',240, 330);
    ctx.font = "24px 'Caprasimo', sans-serif";
    ctx.fillText('Start/Move ball',180, 390);
    ctx.fillText('Drop ball',480, 390);

    ctx.beginPath();
    // Left arrow
    let xOffset = 60;
    let yOffset = -20;
    ctx.moveTo(200 + xOffset,440 + yOffset);
    ctx.lineTo(170 + xOffset,440 + yOffset);
    ctx.lineTo(170 + xOffset,430 + yOffset);
    ctx.lineTo(150 + xOffset,450 + yOffset);
    ctx.lineTo(170 + xOffset,470 + yOffset);
    ctx.lineTo(170 + xOffset,460 + yOffset);
    ctx.lineTo(200 + xOffset,460 + yOffset);
    ctx.lineTo(200 + xOffset,439 + yOffset);

    // Right arrow
    ctx.moveTo(230 + xOffset,440 + yOffset);
    ctx.lineTo(260 + xOffset,440 + yOffset);
    ctx.lineTo(260 + xOffset,430 + yOffset);
    ctx.lineTo(280 + xOffset,450 + yOffset);
    ctx.lineTo(260 + xOffset,470 + yOffset);
    ctx.lineTo(260 + xOffset,460 + yOffset);
    ctx.lineTo(230 + xOffset,460 + yOffset);
    ctx.lineTo(230 + xOffset,439 + yOffset);

    // Down arrow
    ctx.moveTo(530,430 + yOffset);
    ctx.lineTo(530,460 + yOffset);
    ctx.lineTo(520,460 + yOffset);
    ctx.lineTo(540,480 + yOffset);
    ctx.lineTo(560,460 + yOffset);
    ctx.lineTo(550,460 + yOffset);
    ctx.lineTo(550,430 + yOffset);
    ctx.lineTo(529,430 + yOffset);

    ctx.strokeStyle = '#9EF8EE';
    ctx.lineWidth = 3;
    ctx.stroke(); // Render the path

  }

  requestAnimationFrame(loop);

}

// Main game loop
function loop(){
  update();
  draw();
}

function init(){
  selectLitPegs()
  ball.radius = levels[game.currentLevel].pegRadius;
  console.log('Starting level ' + game.currentLevel)
}

init()
loop()