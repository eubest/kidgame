import Observer from './Observer';
import { getScale, distance, findNearestPoint } from './utils';
import Point from './Point';

class OneLine extends Observer {
  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  MOUSE: { x: number; y: number } = { x: 0, y: 0 };

  // Реальное значение выставляет configure() из конструктора.
  scale: number = 0;

  private requestAnimationFrameId: number = 0;
  private abortController = new AbortController();

  NODES: Array<Point> = [];
  PATH_POINTS_MAP: { [pathId: number]: Array<Point> } = {};
  POINTS: Array<Point> = [];
  RADIUS: number = 0;

  activePathId: number = 0;
  finishedPaths: Array<number> = [];
  activePoints: Array<Point> = [];
  activeNodes: Array<Point> = [];
  isDrawing: boolean = false;
  strokeColor: string = '#60D97E';
  isFinished: boolean = false;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    super();
    this.canvas = canvas;
    this.ctx = ctx;
    this.configure();
    this.initListeners();
  }

  configure() {
    // querySelector, а не getElementById: элемент — корневой <svg> вставленной разметки
    // (см. insertSvgIntoDOM в game.ts), поэтому тип задаётся параметром, без приведения.
    const svg = document.querySelector<SVGSVGElement>('#svg');
    if (!svg) {
      return;
    }
    let paths = document.getElementsByTagName('path');
    const gameHeight = svg.height.baseVal.value;
    const gameWidth = svg.width.baseVal.value;
    this.scale = getScale(gameWidth, gameHeight) * window.devicePixelRatio;
    const yOffset = (this.canvas.height - gameHeight * this.scale) / 2;
    const xOffset = (this.canvas.width - gameWidth * this.scale) / 2;
    const strokeWidth = Number(paths[0]?.getAttribute('stroke-width'));
    this.RADIUS = (strokeWidth / 2) * this.scale;

    Array.from(paths).forEach((path, index) => {
      let points = [];
      const totalOffset = path.getTotalLength();
      let i = 0;
      while (i <= totalOffset + strokeWidth) {
        let point = path.getPointAtLength(i);
        points.push({ x: point.x, y: point.y });
        i += strokeWidth;
      }
      points = points.map(
        (p) => new Point(p.x * this.scale + xOffset, p.y * this.scale + yOffset, this.RADIUS, index + 1),
      );
      for (let i = 1; i < points.length; i++) {
        points[i].prevPoint = points[i - 1];
        points[i - 1].nextPoint = points[i];
      }
      points[0].isNode = true;
      points[points.length - 1].isNode = true;
      this.NODES.push(points[0], points[points.length - 1]);
      this.PATH_POINTS_MAP[index + 1] = points;
      this.POINTS.push(...points);
    });
    for (let i = 0; i < this.NODES.length; i++) {
      let nodeI = this.NODES[i];
      for (let j = 0; j < this.NODES.length; j++) {
        let nodeJ = this.NODES[j];
        if (nodeI === nodeJ || nodeJ.pathId === nodeI.pathId) {
          continue;
        }
        if (!nodeI.nodes.includes(nodeJ) && distance(nodeI.x, nodeI.y, nodeJ.x, nodeJ.y) < this.RADIUS) {
          nodeI.nodes.push(nodeJ);
          nodeJ.nodes.push(nodeI);
        }
      }
    }
  }

  reset() {
    this.isFinished = false;
    this.strokeColor = '#60D97E';
    this.finishedPaths = [];
    this.activePoints = [];
    this.activeNodes = [];
    this.activePathId = 0;
    this.POINTS.forEach((p) => {
      p.reset();
    });
  }

  initListeners() {
    const { signal } = this.abortController;
    window.addEventListener(
      'touchstart',
      (e) => {
        const onTouchMove = (e: TouchEvent) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleEvent({
            x: e.touches[0].clientX * window.devicePixelRatio,
            y: e.touches[0].clientY * window.devicePixelRatio,
          });
        };

        onTouchMove(e);
        this.isDrawing = true;
        window.addEventListener('touchmove', onTouchMove, { passive: false, signal });
        window.addEventListener(
          'touchend',
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.touches.length !== 0) {
              return;
            }
            this.onFinish();
            window.removeEventListener('touchmove', onTouchMove);
          },
          { passive: false, signal },
        );
      },
      { passive: false, signal },
    );

    window.addEventListener('mousedown', (e) => {
      const onMouseMove = (event: MouseEvent) => {
        this.handleEvent({ x: event.x * window.devicePixelRatio, y: event.y * window.devicePixelRatio });
      };

      onMouseMove(e);
      this.isDrawing = true;
      window.addEventListener('mousemove', onMouseMove, { passive: true, signal });
      window.addEventListener(
        'mouseup',
        () => {
          this.onFinish();
          window.removeEventListener('mousemove', onMouseMove);
        },
        { once: true, signal },
      );
    }, { signal });
  }

  stop() {
    cancelAnimationFrame(this.requestAnimationFrameId);
    this.abortController.abort();
  }

  handleEvent(e: { x: number; y: number }) {
    this.MOUSE.x = e.x;
    this.MOUSE.y = e.y;
  }

  onFinish() {
    if (!this.isDrawing || this.isFinished) {
      return;
    }
    this.isDrawing = false;
    this.isFinished = true;
    if (this.finishedPaths.length === Object.keys(this.PATH_POINTS_MAP).length) {
      this.strokeColor = '#60D97E';
      this.emit({ name: 'success' });
      return;
    }
    if (this.activePoints.length > 1) {
      this.strokeColor = '#FF6565';
      this.emit({ name: 'fail' });
      return;
    }
    this.reset();
  }

  start() {
    this.requestAnimationFrameId = requestAnimationFrame(this.start.bind(this));
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.activePoints.length) {
      this.ctx.beginPath();
      this.ctx.lineWidth = this.RADIUS * 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.moveTo(this.activePoints[0].x, this.activePoints[0].y);
      for (let i = 1; i < this.activePoints.length; i++) {
        const point = this.activePoints[i];
        this.ctx.lineTo(point.x, point.y);
      }
      this.ctx.stroke();
      this.ctx.closePath();
    }

    if (!this.isDrawing || this.isFinished) {
      return;
    }

    if (this.finishedPaths.length === Object.keys(this.PATH_POINTS_MAP).length) {
      this.onFinish();
      return;
    }

    let nearestPoint = findNearestPoint(
      this.POINTS.filter((p) => !this.finishedPaths.includes(p.pathId)),
      this.MOUSE,
    );
    if (this.activePathId === 0) {
      let node = this.activePoints[this.activePoints.length - 1];
      if (!node) {
        node = findNearestPoint(this.NODES, nearestPoint);
        if (distance(node.x, node.y, this.MOUSE.x, this.MOUSE.y) < this.RADIUS * 4) {
          node.isActive = true;
          this.activePoints.push(node);
          this.activePathId = node.pathId;
        }
      } else {
        const nodes = [...node.nodes, node];
        if (nodes.every((n) => n.isActive)) {
          this.onFinish();
          return;
        }
        // Отдельная переменная, а не переприсваивание `node`: узла нужного пути среди
        // соседей может не оказаться, и тогда активная точка остаётся прежней.
        const nodeOnNearestPath = nodes.find((n) => n.pathId === nearestPoint.pathId);
        if (nodeOnNearestPath) {
          nodeOnNearestPath.isActive = true;
          this.activePoints[this.activePoints.length - 1] = nodeOnNearestPath;
          this.activePathId = nodeOnNearestPath.pathId;
        }
      }
    }

    if (this.activePathId) {
      const lastActivePoint = this.activePoints[this.activePoints.length - 1];

      let point = nearestPoint;
      if (point.pathId !== this.activePathId) {
        const nodes = this.NODES.filter((node) => node.pathId === this.activePathId);
        const nearestNode = nodes.every((node) => node.nodes.some((n) => n.pathId === point.pathId))
          ? findNearestPoint(nodes, this.MOUSE)
          : nodes.find((node) => node.nodes.some((n) => n.pathId === point.pathId));
        if (nearestNode) {
          point = findNearestPoint([...lastActivePoint.getNeighbours()], nearestNode);
        } else {
          point = findNearestPoint([lastActivePoint, ...lastActivePoint.getNeighbours()], this.MOUSE);
        }
      } else {
        point = findNearestPoint([lastActivePoint, ...lastActivePoint.getNeighbours()], this.MOUSE);
      }
      if (!point.isActive) {
        point.isActive = true;
        this.activePoints.push(point);
        if (point.isNode && this.PATH_POINTS_MAP[this.activePathId].every((p) => p.isActive)) {
          this.finishedPaths.push(this.activePathId);
          this.activePathId = 0;
        }
      } else {
        const lastPoint = this.activePoints[this.activePoints.length - 1];
        if (lastPoint !== point && (lastPoint === point.nextPoint || lastPoint === point.prevPoint)) {
          lastPoint.isActive = false;
          this.activePoints.splice(this.activePoints.length - 1, 1);
          if (point.isNode && !this.finishedPaths.includes(point.pathId)) {
            point.isActive = false;
            this.activePathId = 0;
          }
        }
      }
    }
  }
}

export default OneLine;
