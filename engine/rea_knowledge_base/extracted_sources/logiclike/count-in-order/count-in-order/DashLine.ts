import SequenceObject from "./SequenceObject";

const DASH_LINE_Y_OFFSET = 5;
const LINE_WIDTH = 3;
const LINE_DASH_OFFSET = 8;
const SPEED = 5;

class DashLine {
  startX: number;
  startY: number;

  currentX: number;
  currentY: number;

  endX: number;
  endY: number;

  angle: number;
  scale: number;

  direction: 'left' | 'right' = 'right';
  isActive: boolean = true;

  constructor(startObject: SequenceObject, endObject: SequenceObject, scale, offset: {x: number, y: number}) {
    this.scale = scale;
    this.startX = startObject.x + offset.x * scale;
    this.startY = startObject.y + offset.y * scale;
    this.endX = endObject.x + offset.x * scale;
    this.endY = endObject.y + offset.y * scale;
    this.angle = Math.atan2((this.endY - this.startY), (this.endX - this.startX));
    if (this.endX < this.startX) {
      this.direction = 'left';
    }

    this.currentX = this.startX;
    this.currentY = this.startY;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineWidth = LINE_WIDTH * this.scale;
    ctx.setLineDash([LINE_DASH_OFFSET * this.scale, LINE_DASH_OFFSET * this.scale]);
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.currentX, this.currentY);
    ctx.strokeStyle = '#FFF';
    ctx.stroke();
    ctx.closePath();
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    if (!this.isActive) {
      return;
    }
    this.currentX += Math.cos(this.angle) * SPEED * this.scale;
    this.currentY += Math.sin(this.angle) * SPEED * this.scale;
    if (
      this.direction === 'right' && this.currentX >= this.endX
      || this.direction === 'left' && this.endX >= this.currentX
    ) {
      this.isActive = false;
    }
  }
}

export default DashLine;
