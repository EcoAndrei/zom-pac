import MovingDirection from "./MovingDirection.js";

export default class Zompac {
  constructor(x, y, tileSize, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;

    this.currentMovingDirection = null;
    this.requestedMovingDirection = null;

    this.zompacAnimationTimerDefault = 10;
    this.zompacAnimationTimer = null;

    this.zompacRotation = this.Rotation.right;
    this.brainSound = new Audio("/sounds/waka.wav");

    this.powerDotSound = new Audio("/sounds/power_dot.mp3");
    this.powerDotActive = false;
    this.powerDotAboutToExpire = false;
    this.timers = [];

    this.eatGhostSound = new Audio("/sounds/eating_ghost.mp3");

    this.madeFirstMove = false;

    document.addEventListener("keydown", this.#keydown);

    this.#loadZomPacImages();
  }

  Rotation = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
  };

  draw(ctx, pause, enemies) {
    if (!pause) {
      this.#move();
      this.#animate();
    }
    this.#eatBrain();
    this.#eatsoare();
    this.#eatGhost(enemies);

    const size = this.tileSize / 2;

    ctx.save();
    ctx.translate(this.x + size, this.y + size);
    ctx.rotate((this.zompacRotation * 90 * Math.PI) / 180);
    ctx.drawImage(
      this.zompacImages[this.zompacImageIndex],
      -size,
      -size,
      this.tileSize,
      this.tileSize
    );

    ctx.restore();

    // ctx.drawImage(
    //   this.zompacImages[this.zompacImageIndex],
    //   this.x,
    //   this.y,
    //   this.tileSize,
    //   this.tileSize
    // );
  }

  #loadZomPacImages() {
    const zompacImage1 = new Image();
    zompacImage1.src = "/images/pac0.png";

    const zompacImage2 = new Image();
    zompacImage2.src = "/images/pac1.png";

    const zompacImage3 = new Image();
    zompacImage3.src = "/images/pac2.png";

    const zompacImage4 = new Image();
    zompacImage4.src = "/images/pac1.png";

    this.zompacImages = [
      zompacImage1,
      zompacImage2,
      zompacImage3,
      zompacImage4,
    ];

    this.zompacImageIndex = 1;
  }

  #keydown = (event) => {
    //up
    if (event.keyCode == 38) {
      if (this.currentMovingDirection == MovingDirection.down)
        this.currentMovingDirection = MovingDirection.up;
      this.requestedMovingDirection = MovingDirection.up;
      this.madeFirstMove = true;
    }
    //down
    if (event.keyCode == 40) {
      if (this.currentMovingDirection == MovingDirection.up)
        this.currentMovingDirection = MovingDirection.down;
      this.requestedMovingDirection = MovingDirection.down;
      this.madeFirstMove = true;
    }
    //left
    if (event.keyCode == 37) {
      if (this.currentMovingDirection == MovingDirection.right)
        this.currentMovingDirection = MovingDirection.left;
      this.requestedMovingDirection = MovingDirection.left;
      this.madeFirstMove = true;
    }
    //right
    if (event.keyCode == 39) {
      if (this.currentMovingDirection == MovingDirection.left)
        this.currentMovingDirection = MovingDirection.right;
      this.requestedMovingDirection = MovingDirection.right;
      this.madeFirstMove = true;
    }
  };

  #move() {
    if (this.currentMovingDirection !== this.requestedMovingDirection) {
      if (
        Number.isInteger(this.x / this.tileSize) &&
        Number.isInteger(this.y / this.tileSize)
      ) {
        if (
          !this.tileMap.didCollideWithEnvironment(
            this.x,
            this.y,
            this.requestedMovingDirection
          )
        )
          this.currentMovingDirection = this.requestedMovingDirection;
      }
    }

    if (
      this.tileMap.didCollideWithEnvironment(
        this.x,
        this.y,
        this.currentMovingDirection
      )
    ) {
      this.zompacAnimationTimer = null;
      this.zompacImageIndex = 1;
      return;
    } else if (
      this.currentMovingDirection != null &&
      this.zompacAnimationTimer == null
    ) {
      this.zompacAnimationTimer = this.zompacAnimationTimerDefault;
    }

    switch (this.currentMovingDirection) {
      case MovingDirection.up:
        this.y -= this.velocity;
        this.zompacRotation = this.Rotation.up;
        break;
      case MovingDirection.down:
        this.y += this.velocity;
        this.zompacRotation = this.Rotation.down;
        break;
      case MovingDirection.left:
        this.x -= this.velocity;
        this.zompacRotation = this.Rotation.left;
        break;
      case MovingDirection.right:
        this.x += this.velocity;
        this.zompacRotation = this.Rotation.right;
        break;
    }
  }

  #animate() {
    if (this.zompacAnimationTimer == null) {
      return;
    }
    this.zompacAnimationTimer--;
    if (this.zompacAnimationTimer == 0) {
      this.zompacAnimationTimer = this.zompacAnimationTimerDefault;
      this.zompacImageIndex++;
      if (this.zompacImageIndex == this.zompacImages.length)
        this.zompacImageIndex = 0;
    }
  }

  #eatBrain() {
    if (this.tileMap.eatBrain(this.x, this.y) && this.madeFirstMove) {
      this.brainSound.play();
    }
  }

  #eatsoare() {
    if (this.tileMap.eatPowerDot(this.x, this.y)) {
      this.powerDotSound.play();
      this.powerDotActive = true;
      this.powerDotAboutToExpire = false;
      this.timers.forEach((timer) => clearTimeout(timer));
      this.timers = [];

      let powerDotTimer = setTimeout(() => {
        this.powerDotActive = false;
        this.powerDotAboutToExpire = false;
      }, 1000 * 6);

      this.timers.push(powerDotTimer);

      let powerDotAboutToExpireTimer = setTimeout(() => {
        this.powerDotAboutToExpire = true;
      }, 1000 * 3);

      this.timers.push(powerDotAboutToExpireTimer);
    }
  }

  #eatGhost(enemies) {
    if (this.powerDotActive) {
      const collideEnemies = enemies.filter((enemy) => enemy.collideWith(this));
      collideEnemies.forEach((enemy) => {
        enemies.splice(enemies.indexOf(enemy), 1);
        this.eatGhostSound.play();
      });
    }
  }
}
