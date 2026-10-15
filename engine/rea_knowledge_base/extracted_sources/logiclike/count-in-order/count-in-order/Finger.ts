import SequenceObject from "./SequenceObject";

class Finger {
  image: HTMLCanvasElement;
  x: number;
  y: number;
  opacity: number;

  constructor(sequenceObject: SequenceObject, image: HTMLCanvasElement) {
    this.image = image;
    this.opacity = 0;
    this.setSequenceObject(sequenceObject);
  }

  setSequenceObject(sequenceObject: SequenceObject) {
    this.x = sequenceObject.x + sequenceObject.image.width / 2;
    this.y = sequenceObject.y + sequenceObject.image.height / 4;
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

export default Finger;
