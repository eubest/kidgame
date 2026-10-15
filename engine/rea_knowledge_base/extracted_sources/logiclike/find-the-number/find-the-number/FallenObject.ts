class FallenObject {
  x: number;
  y: number;
  dy: number;
  image: HTMLCanvasElement;
  number: number;
  color: string;
  isActive: boolean = true;
  opacity: number = 1;
  scale: number;

  constructor(x: number, y: number, dy: number, image: HTMLCanvasElement, number: number, color: string, scale: number) {
    this.x = x
    this.y = y
    this.dy = dy;
    this.image = image;
    this.number = number;
    this.color = color;
    this.scale = scale;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.font = `900 ${68 * this.scale}px Nunito`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = '#FFF'
    ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
    ctx.fillText(this.number.toString(), this.x + this.scale * 47, this.y + this.scale * 100, this.image.width);
    ctx.restore()
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx)
    if (this.isActive) {
      this.y += this.dy;
    } else {
      this.opacity -= 0.1;
    }
  }
}

export default FallenObject;
