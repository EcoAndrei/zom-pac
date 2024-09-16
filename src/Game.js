import TileMap from "./TileMap.js";

const tileSize = 32;
const velocity = 2;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tileMap = new TileMap(tileSize);
const zompac = tileMap.getZompac(velocity);
const enemies = tileMap.getEnemies(velocity);

let gameOver = false;
let gameWin = false;
const gameOverSound = new Audio("../sounds/game_over.mp3");
const gameWinSound = new Audio("../sounds/game_win.mp3");

function gameLoop() {
  tileMap.draw(ctx);
  drawGameEnd();
  zompac.draw(ctx, pause(), enemies);
  enemies.forEach((enemy) => enemy.draw(ctx, pause(), zompac));
  checkGameOver();
  checkGameWin();
}

function checkGameWin() {
  if (!gameWin) {
    gameWin = tileMap.didWin();
    if (gameWin) {
      gameWinSound.play();
    }
  }
}

function checkGameOver() {
  if (!gameOver) {
    gameOver = isGameOver();
    if (gameOver) {
      gameOverSound.play();
    }
  }
}

function isGameOver() {
  return enemies.some(
    (enemy) => !zompac.powerDotActive && enemy.collideWith(zompac)
  );
}

function pause() {
  return !zompac.madeFirstMove || gameOver || gameWin;
}

function drawGameEnd() {
  if (gameOver || gameWin) {
    let text = "     You Win";
    if (gameOver) {
      text = "        Game Over";
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, canvas.height / 3.2, canvas.width, 140);

    ctx.font = "80px comic sans";
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, -50);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("0.5", "blue");
    gradient.addColorStop("1", "red");

    ctx.fillStyle = gradient;
    ctx.fillText(text, 20, canvas.height / 2);
  }
}

tileMap.setCanvasSize(canvas);
setInterval(gameLoop, 1000 / 75);
