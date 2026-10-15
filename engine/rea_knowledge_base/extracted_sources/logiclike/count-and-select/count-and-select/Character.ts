class Character {
  image: HTMLCanvasElement;
  x: number;
  y: number;
  frameIndex: number = 0;
  tickCount: number = 0;
  ticksPerFrame: number = 10;
  private amountOfFrames: number;
  private delayedFrames: number = 60;

  constructor(x: number, y: number, image: HTMLCanvasElement) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.amountOfFrames = Math.floor(this.image.width / this.image.height)
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.image,
      this.image.height * this.frameIndex,
      0,
      this.image.height,
      this.image.height,
      this.x,
      this.y,
      this.image.height,
      this.image.height,
    );
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    if (Math.round(this.frameIndex + 1) === this.amountOfFrames) {
      return;
    }
    this.tickCount++;
    if (this.tickCount > this.ticksPerFrame && this.tickCount > this.delayedFrames) {
      this.tickCount = 0;
      this.delayedFrames = 0;
      this.frameIndex += this.image.width / (this.amountOfFrames * this.image.height);
    }
  }
}

export default Character;
