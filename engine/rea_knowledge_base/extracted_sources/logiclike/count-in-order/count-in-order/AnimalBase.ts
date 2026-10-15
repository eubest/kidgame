class Animal {
  x: number;
  y: number;
  offset = {
    x: 0,
    y: 0,
  };
  velocity = {
    x: 0,
    y: 0,
  };
  image: HTMLCanvasElement;

  mode: 'default' | 'wrong' | 'finish' = 'default';

  wrongImageSequence: HTMLCanvasElement;
  characterFinishSequence: HTMLCanvasElement;

  wrongImageSequenceFrames: number = 0;
  finishImageSequenceFrames: number = 0;
  frameIndex: number = 0;
  tickCount: number = 0;
  ticksPerFrame: number = 10;

  constructor(image: HTMLCanvasElement, wrongSequence: HTMLCanvasElement, characterFinishSequence: HTMLCanvasElement, scale: number, offset: {x: number, y: number}) {
    this.offset = {
      x: offset.x * scale,
      y: offset.y * scale,
    };
    this.image = image;
    this.wrongImageSequence = wrongSequence;
    this.characterFinishSequence = characterFinishSequence;
    this.wrongImageSequenceFrames = Math.round(this.wrongImageSequence.width / this.image.width);
    this.finishImageSequenceFrames = Math.round(this.characterFinishSequence.width / this.image.width);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.mode === 'wrong') {
      const width = this.wrongImageSequence.width / this.wrongImageSequenceFrames;
      ctx.drawImage(
        this.wrongImageSequence,
        width * this.frameIndex,
        0,
        width,
        this.wrongImageSequence.height,
        this.x,
        this.y,
        width,
        this.wrongImageSequence.height,
      );
      return;
    }
    if (this.mode === 'finish') {
      const width = this.characterFinishSequence.width / this.finishImageSequenceFrames;
      ctx.drawImage(
        this.characterFinishSequence,
        width * this.frameIndex,
        0,
        width,
        this.wrongImageSequence.height,
        this.x,
        this.y,
        width,
        this.wrongImageSequence.height,
      );
      return;
    }
    ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;

    if (this.mode === 'default' || (this.mode === 'finish' && this.frameIndex + 1 === this.finishImageSequenceFrames)) {
      return;
    }
    if (this.mode === 'wrong' && this.frameIndex + 1 === this.wrongImageSequenceFrames) {
      this.resetAnimation();
      return;
    }
    this.tickCount++;
    if (this.tickCount > this.ticksPerFrame) {
      this.tickCount = 0;
      this.frameIndex++;
    }
  }

  resetAnimation() {
    this.mode = 'default';
    this.frameIndex = 0;
    this.tickCount = 0;
  }

  runWrongAnimation() {
    this.resetAnimation();
    this.mode = 'wrong';
  }

  runFinishAnimation() {
    this.resetAnimation();
    this.mode = 'finish';
  }
}

export default Animal;
