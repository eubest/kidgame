import SequenceObject from "./SequenceObject";

class Trophy {
  sequenceObject: SequenceObject;

  image: HTMLCanvasElement;

  x: number;
  y: number;
  opacity: number;


  constructor(sequenceObject: SequenceObject, image: HTMLCanvasElement, scale, offset: {x: number, y: number}) {
    this.x = sequenceObject.x + offset.x * scale;
    this.y = sequenceObject.y + offset.y * scale - image.height;
    this.image = image;
    this.opacity = 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
    ctx.restore();
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
  }
}

export default Trophy;
