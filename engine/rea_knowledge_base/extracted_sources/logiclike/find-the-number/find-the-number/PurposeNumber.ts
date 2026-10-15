const RADIUS = 71;
const NUMBER_X_OFFSET = -15;
const NUMBER_Y_OFFSET = 17;
import {gsap} from "gsap";

class PurposeNumber {
  scale: number;
  scaleCoeff: number = 309 / 71;
  x: number;
  y: number;
  number: number;

  constructor(number, x, y, scale) {
    this.number = number;
    this.x = x;
    this.y = y;
    this.scale = scale;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, RADIUS / 2 * this.scale * this.scaleCoeff, 0, Math.PI * 2, false);
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.fillStyle = '#202552';
    ctx.font = `900 ${50 * this.scale * this.scaleCoeff}px Nunito`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(
      this.number.toString(),
      this.x + NUMBER_X_OFFSET * this.scale * this.scaleCoeff,
      this.y + NUMBER_Y_OFFSET * this.scale * this.scaleCoeff,
      RADIUS * this.scale * this.scaleCoeff,
    );
    ctx.closePath();
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx)
  }

  moveTo(x: number, y: number, onFinish: () => void) {
    gsap.to(this, {x, y, scaleCoeff: 1, duration: 1, delay: 0.5, ease: 'none'}).then(onFinish)
  }
}

export default PurposeNumber;
