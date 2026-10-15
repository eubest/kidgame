import Character from "./Character";

class Ball {
  x: number;
  y: number;
  angle: number;
  scale: number;
  dx: number;

  image: HTMLCanvasElement;
  shadow: HTMLCanvasElement;
  light: HTMLCanvasElement;
  characterSprite: HTMLCanvasElement;
  character: Character;

  friction: number = 0;
  endFriction: number;
  endX: number;

  alpha: number = 1;
  isOpened: boolean = false;
  color: string;

  constructor(
    x: number,
    y: number,
    dx: number,
    scale: number,
    endFriction: number,
    ballConfig: { image: HTMLCanvasElement, color: string },
    shadow: HTMLCanvasElement,
    light: HTMLCanvasElement,
    animal: HTMLCanvasElement,
    endX: number
  ) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.angle = Math.random() * 360 * Math.PI / 180;
    this.image = ballConfig.image;
    this.color = ballConfig.color;
    this.shadow = shadow;
    this.light = light;
    this.characterSprite = animal;
    this.endX = endX;
    this.scale = scale;
    this.endFriction = endFriction;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.shadow, this.x + 12 * this.scale, this.y + this.image.height - 12 * this.scale, this.shadow.width, this.shadow.height)
    if (this.alpha) {
      ctx.save();
      ctx.translate(this.x + this.image.width / 2, this.y + this.image.height / 2);
      ctx.rotate(this.angle);
      ctx.translate(-(this.x + this.image.width / 2), -(this.y + this.image.height / 2));
      ctx.globalAlpha = this.alpha;
      ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
      ctx.restore();
      ctx.drawImage(this.light, this.x + 11 * this.scale, this.y + 7 * this.scale, this.light.width, this.light.height)
    }
    if (this.isOpened) {
      this.character.update(ctx);
    }
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    if (this.isOpened && this.alpha !== 0) {
      this.alpha = Math.max(this.alpha - 0.1, 0);
    }
    if (this.dx === 0) {
      return;
    }
    this.x += this.dx;
    this.dx = (this.dx > 0 ? 1 : -1) * (Math.max(Math.abs(this.dx) - this.friction, 0));
    this.angle += this.dx / this.scale * Math.PI / 180;
    if (
      this.friction !== this.endFriction && (
        this.dx > 0 && this.x + this.dx >= this.endX
        || this.dx < 0 && this.x + this.dx <= this.endX
      )
    ) {
      this.friction = this.endFriction;
    }
  }

  open() {
    this.isOpened = true;
    this.character = new Character(this.x, this.y, this.characterSprite);
  }
}

export default Ball;
