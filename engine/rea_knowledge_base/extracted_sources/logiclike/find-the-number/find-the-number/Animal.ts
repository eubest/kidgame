class Animal {
  x: number;
  y: number;

  currentSprite: HTMLCanvasElement;

  image: HTMLCanvasElement;

  eatSprite: HTMLCanvasElement;

  tickCount: number = 0;

  frameIndex: number = 0;

  ticksPerFrame: number = 2;

  constructor(x: number, y: number, image: HTMLCanvasElement, eatSprite: HTMLCanvasElement) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.eatSprite = eatSprite;
    this.currentSprite = image;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.currentSprite,
      this.image.width * this.frameIndex,
      0,
      this.image.width,
      this.image.height,
      this.x,
      this.y,
      this.image.width,
      this.image.height,
    );
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    if (this.currentSprite === this.image) {
      return;
    }
    this.tickCount++;
    if (this.tickCount > this.ticksPerFrame) {
      this.tickCount = 0;
      if (this.frameIndex < Math.floor(this.currentSprite.width / this.image.width) - 1) {
        this.frameIndex++;
      } else {
        this.frameIndex = 0;
        this.currentSprite = this.image;
      }
    }
  }

  runEatAnimation() {
    this.frameIndex = 0;
    this.currentSprite = this.eatSprite;
  }
}

export default Animal;
