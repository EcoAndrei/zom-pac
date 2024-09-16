import MovingDirection from "./MovingDirection.js";

export default class Enemy {
  constructor(x, y, tileSize, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;

    this.#loadImages();

    this.movingDirection = Math.floor(
      Math.random() * Object.keys(MovingDirection).length
    );

    this.directionTimerDefault = this.#random(1, 3);
    this.directionTimer = this.directionTimerDefault;

    this.scaredAboutToExpireTimerDefault = 10;
    this.scaredAboutToExpireTimer = this.scaredAboutToExpireTimerDefault;
  }

  draw(ctx, pause, zompac) {
    if (!pause) {
      this.#move();
      this.#changeDirection();
    }
    this.#setImage(ctx, zompac);
  }

  collideWith(zompac) {
    const size = this.tileSize / 2;
    if (
      this.x < zompac.x + size &&
      this.x + size > zompac.x &&
      this.y < zompac.y + size &&
      this.y + size > zompac.y
    ) {
      return true;
    } else {
      return false;
    }
  }

  #setImage(ctx, zompac) {
    if (zompac.powerDotActive) {
      this.#setImageWhenPowerDotIsActive(zompac);
    } else {
      this.image = this.normalZombie;
    }
    ctx.drawImage(this.image, this.x, this.y, this.tileSize, this.tileSize);
  }

  #setImageWhenPowerDotIsActive(zompac) {
    if (zompac.powerDotAboutToExpire) {
      this.scaredAboutToExpireTimer--;
      if (this.scaredAboutToExpireTimer === 0) {
        this.scaredAboutToExpireTimer = this.scaredAboutToExpireTimerDefault;
        if (this.image === this.scaredZombie) {
          this.image = this.scaredZombie2;
        } else {
          this.image = this.scaredZombie;
        }
      }
    } else {
      this.image = this.scaredZombie;
    }
  }

  #changeDirection() {
    this.directionTimer--;
    let newMoveDirection = null;
    if (this.directionTimer == 0) {
      this.directionTimer = this.directionTimerDefault;
      newMoveDirection = Math.floor(
        Math.random() * Object.keys(MovingDirection).length
      );
    }

    if (newMoveDirection != null && this.movingDirection != newMoveDirection) {
      if (
        Number.isInteger(this.x / this.tileSize) &&
        Number.isInteger(this.y / this.tileSize)
      ) {
        if (
          !this.tileMap.didCollideWithEnvironment(
            this.x,
            this.y,
            newMoveDirection
          )
        ) {
          this.movingDirection = newMoveDirection;
        }
      }
    }
  }

  #move() {
    if (
      !this.tileMap.didCollideWithEnvironment(
        this.x,
        this.y,
        this.movingDirection
      )
    ) {
      switch (this.movingDirection) {
        case MovingDirection.up:
          this.y -= this.velocity;
          break;
        case MovingDirection.down:
          this.y += this.velocity;
          break;
        case MovingDirection.left:
          this.x -= this.velocity;
          break;
        case MovingDirection.right:
          this.x += this.velocity;
          break;
      }
    }
  }

  #random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  #loadImages() {
    this.normalZombie = new Image();
    this.normalZombie.src = "../images/zombie.png";

    this.scaredZombie = new Image();
    this.scaredZombie.src = "../images/zombiechicken.png";

    this.scaredZombie2 = new Image();
    this.scaredZombie2.src = "../images/zombiedove.png";

    this.image = this.normalZombie;
  }
}
