const BASE_FONT = 30;

class SequenceObject {
  x: number;
  y: number;
  endX: number;
  endY: number;
  offset: {x: number, y: number};
  image: HTMLCanvasElement;
  number: number;
  scale: number;

  constructor(x: number, y: number, number: number, image: HTMLCanvasElement, scale, offset: {x: number, y: number}) {
    this.offset = {
      x: offset.x * scale,
      y: offset.y * scale,
    };
    this.x = x
    this.y = y
    this.endX = x;
    this.endY = y;
    this.image = image;
    this.number = number;
    this.scale = scale;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = `900 ${BASE_FONT * this.scale}px Nunito`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = '#FFF'
    ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
    ctx.fillText(
      this.number.toString(),
      this.x + (this.number >= 10 ? this.offset.x - 8 * this.scale : this.offset.x),
      this.y + this.offset.y,
      this.image.width,
    );
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
  }
}

export default SequenceObject;
