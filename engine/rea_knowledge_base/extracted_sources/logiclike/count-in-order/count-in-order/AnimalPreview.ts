import AnimalBase from "./AnimalBase";

class AnimalPreview extends AnimalBase {

  angle: number = 0;

  update(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.image.width / 2, this.y + this.image.height / 2);
    ctx.rotate(this.angle / 180 * Math.PI);
    ctx.translate(-(this.x + this.image.width / 2), -(this.y + this.image.height / 2));
    super.update(ctx);
    ctx.restore()
  }


  constructor(image: HTMLCanvasElement, wrongSequence: HTMLCanvasElement, characterFinishSequence: HTMLCanvasElement, scale: number, offset: {x: number, y: number}, angle: number) {
    super(image, wrongSequence, characterFinishSequence, scale, offset)
    this.angle = angle;
  }
}

export default AnimalPreview;
