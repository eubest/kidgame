class Point {
  x: number = 0;
  y: number = 0;
  radius: number = 0
  isActive: boolean = false;
  pathId: number = 0;
  color: string = 'transparent';
  nextPoint?: Point;
  prevPoint?: Point;
  nodes: Array<Point> = [];
  isNode: boolean = false;

  constructor(x: number, y: number, radius: number, pathId: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.isActive = false;
    this.pathId = pathId;
    this.isNode = false;
  }

  setNextPoint(nextPoint: Point) {
    this.nextPoint = nextPoint;
  }

  setPrevPoint(prevPoint: Point) {
    this.prevPoint = prevPoint;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
  }

  update(ctx: CanvasRenderingContext2D) {
    if (this.isActive) {
      this.color = 'green';
    } else {
      this.reset();
    }
    this.draw(ctx);
  }

  /** Соседние точки по линии. У первой нет prevPoint, у последней — nextPoint. */
  getNeighbours(): Array<Point> {
    return [this.nextPoint, this.prevPoint].filter((e): e is Point => !!e);
  }

  reset() {
    this.color = this.isNode ? 'blue' : 'red'
    this.isActive = false;
  }
}

export default Point;
