function touchCoords(event) {
  const { touches, changedTouches } = event;
  return (touches && touches[0]) || (changedTouches && changedTouches[0]);
}

const WIDTH = 282;
const HEIGHT = 272;
const BASE_SCALE = 4;

const getScale = () => {
  const width = Math.min(document.documentElement.clientWidth, document.body.clientWidth);
  const height = Math.min(document.documentElement.clientHeight, document.body.clientHeight);
  return Math.min(width / WIDTH, height / HEIGHT);
};

class Trace {
  dashedBrush = { size: 7, color: '#fff', dashed: true };
  userBrush = { size: 42, color: '#F5422B', dashed: false };
  placeholderBrush = { size: 42, color: '#F0BF5F', dashed: false };

  constructor(el, { name, type, userBrush, placeholderBrush }, onEvent) {
    this.el = el;
    this.shapeName = name;
    this.shapeType = type;
    this.userBrush = userBrush;
    this.placeholderBrush = placeholderBrush;
    this.onEventCallback = onEvent;
    this.init();
  }

  emit(eventName, data) {
    if (this.onEventCallback) {
      this.onEventCallback(eventName, data);
    }
  }

  insertSvgIntoDOM(svg) {
    const node = document.createElement('div');
    node.innerHTML = svg;
    const svgNode = node.children[0];
    svgNode.setAttribute('id', 'svg');
    document.body.appendChild(svgNode);
  }

  async init() {
    this.clear();
    let paths = [];

    if (this.shapeType === 'capitalLetters' || this.shapeType === 'smallLetters') {
      const svg = require(`./assets/${this.shapeType}/${this.shapeName}.svg?raw`);
      this.insertSvgIntoDOM(svg);

      const svgPaths = document.getElementsByTagName('path');
      const strokeWidth = 1;

      Array.from(svgPaths).forEach((path, index) => {
        const reverse = !!path.getAttribute('reverse');
        const scale = path.getAttribute('scale');
        let points = [];
        const totalOffset = path.getTotalLength();
        let i = 0;
        while (i <= totalOffset + strokeWidth) {
          let point = path.getPointAtLength(i);
          points.push({ x: point.x, y: point.y });
          i += strokeWidth;
        }
        paths.push({ points: reverse ? points.reverse() : points, scale: scale ? +(scale * BASE_SCALE) : BASE_SCALE });
      });
    } else {
      const traces = require(`./traces/${this.shapeType}.js`).default;
      const shapePoints = traces[this.shapeName];
      paths = shapePoints.map((p) => ({ points: p, scale: BASE_SCALE }));
    }

    this.paths = paths;
    this.activePathIndex = -1;
    this.render();
    this.onResize();
    this.initMouse();
    this.initTouch();

    window.addEventListener('resize', this.onResize.bind(this));
    setTimeout(() => {
      this.start();
    }, 1000);
  }

  clear() {
    this.el.innerHTML = '';
    this.el.setAttribute('class', 'trace');
    document.getElementById('svg')?.remove();
  }

  render() {
    this.overlayCanvas = new Canvas(WIDTH, HEIGHT);
    this.canvas = new Canvas(WIDTH, HEIGHT);
    this.el.appendChild(this.canvas.canvas);
    this.el.appendChild(this.overlayCanvas.canvas);
    this.arrow = new Image();
    this.arrow.src = './arrow.svg';
    this.arrow.className = 'arrow';
    this.arrow.draggable = false;
    this.arrowContainer = window.document.createElement('div');
    this.arrowContainer.className = 'arrow-container arrow-container--active';
    this.arrowContainer.appendChild(this.arrow);
    this.el.appendChild(this.arrowContainer);
  }

  initMouse() {
    this.arrow.addEventListener('mousedown', () => {
      let mouseMove = (e) => {
        this.onTrace({ x: e.pageX, y: e.pageY });
      };
      let mouseUp = () => {
        this.onTraceEnd();
      };
      this.removeEventHandlers = () => {
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
        this.removeEventHandlers = null;
      };
      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
      this.onTraceStart();
    });
  }

  initTouch() {
    this.arrow.addEventListener('touchstart', () => {
      let touchMove = (e) => {
        const { pageX, pageY } = touchCoords(e);
        this.onTrace({ x: pageX, y: pageY });
      };
      let touchEnd = (e) => {
        this.onTraceEnd();
      };
      this.removeEventHandlers = () => {
        document.removeEventListener('touchend', touchEnd);
        document.removeEventListener('touchmove', touchMove);
        this.removeEventHandlers = null;
      };
      document.addEventListener('touchmove', touchMove);
      document.addEventListener('touchend', touchEnd);
      this.onTraceStart();
    });
  }

  onTraceEnd() {
    this.emit('trace:end');
    if (this.removeEventHandlers) {
      this.removeEventHandlers();
    }
    this.arrowContainer.classList.add('arrow-container--active');
  }

  onTraceStart() {
    this.arrowContainer.classList.remove('arrow-container--active');
    // for paths like point in "i"
    this.emit('trace:start');
    if (this.activePathOffset === 0 && this.paths[this.activePathIndex]?.points.length < 3) {
      this.overlayCanvas.clear();
      const path = this.paths[this.activePathIndex];
      this.canvas.drawCurve(path.points, this.userBrush, path.scale);
      this.onTraceEnd();
      this.nextStep();
    }
  }

  onTrace(pagePos) {
    const pos = {
      x: (pagePos.x - this.canvasRect.left) / this.scale,
      y: (pagePos.y - this.canvasRect.top) / this.scale,
    };
    const path =
      this.paths[this.activePathIndex]?.points?.slice(this.activePathOffset, this.activePathOffset + 100) || [];
    let minDist = Infinity;
    let minIndex = -1;
    for (let i = 0; i < path.length; i++) {
      let point = path[i];
      let dx = point.x - pos.x;
      let dy = point.y - pos.y;
      let dist = dx * dx + dy * dy;
      const safeArea = this.placeholderBrush.size * this.placeholderBrush.size * 4;
      if (dist <= safeArea && minDist >= dist) {
        minDist = dist;
        minIndex = i;
      }
    }
    if (minIndex < 0) {
      return;
    }
    this.changeActivePathOffset(this.activePathOffset + minIndex);
    this.emit('trace');
  }

  changeActivePathOffset(offset) {
    if (offset === this.paths[this.activePathIndex]?.points.length - 1) {
      this.onTraceEnd();
      this.overlayCanvas.clear();
      const path = this.paths[this.activePathIndex];
      this.canvas.drawCurve(path.points, this.userBrush, path.scale);
      this.nextStep();
      return;
    }
    this.activePathOffset = offset;
    this.drawStep();
  }

  onResize() {
    this.scale = getScale();
    this.el.style.fontSize = this.scale + 'px';
    this.canvasRect = this.el.getBoundingClientRect();
    if (this.activePathIndex >= 0 && this.activePathIndex < this.paths.length) {
      this.drawStep();
    }
  }

  async start() {
    this.emit('placeholder:start');
    for (let path of this.paths) {
      await this.animate(path, this.placeholderBrush, 0.5);
      this.canvas.drawCurve(path.points, this.placeholderBrush, path.scale);
    }
    this.emit('placeholder:end');
    await this.nextStep();
  }

  async nextStep() {
    this.activePathIndex++;
    this.activePathOffset = 0;
    this.arrowContainer.style.opacity = 0;
    if (this.activePathIndex >= this.paths.length) {
      this.emit('finish');
      this.arrowContainer.remove();
      return;
    }
    this.arrowContainer.classList.remove('arrow-container--active');
    await this.animate(this.paths[this.activePathIndex], this.dashedBrush, 0.375);
    this.arrowContainer.classList.add('arrow-container--active');
    this.drawStep();
  }

  drawStep() {
    this.overlayCanvas.clear();
    const activePath = this.paths[this.activePathIndex];
    this.overlayCanvas.drawCurve(activePath?.points ?? [], this.dashedBrush, activePath?.scale);
    this.overlayCanvas.drawCurve(activePath?.points?.slice(0, this.activePathOffset) || [], this.userBrush, activePath?.scale);
    // draw circle
    const path = activePath?.points?.slice(this.activePathOffset) || 0;
    this.arrowContainer.style.opacity = 1;
    this.arrowContainer.style.left = path[0].x * this.scale + 'px';
    this.arrowContainer.style.top = path[0].y * this.scale + 'px';
    const p1 = path[0];

    let index = 1;
    let p2 = path[index];
    while (p2 && p2.x === p1.x && p2.y === p1.y) {
      p2 = path[++index];
    }
    if (p2 && p1) {
      const angleDeg = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
      this.arrow.style.transform = `rotate(${angleDeg}deg)`;
    }
  }

  async animate(path, brush, speed) {
    let start = null;
    while (true) {
      const timestamp = await new Promise(window.requestAnimationFrame);
      if (!start) {
        start = timestamp;
      }
      const offset = Math.min((timestamp - start) * speed, path.points.length);
      this.overlayCanvas.clear();
      this.overlayCanvas.drawCurve(path?.points?.slice(0, offset) || [], brush, path.scale);
      if (offset >= path?.points?.length) {
        break;
      }
    }
  }
}

class Canvas {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width * BASE_SCALE;
    this.canvas.height = height * BASE_SCALE;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawCurve(points, { size, color, dashed }, scale) {
    if (points.length === 0) {
      return;
    }
    this.ctx.beginPath();
    this.ctx.lineWidth = size * (scale || BASE_SCALE);
    this.ctx.setLineDash(dashed ? [1, 20 * BASE_SCALE] : []);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = color;
    this.ctx.moveTo(points[0].x * BASE_SCALE, points[0].y * BASE_SCALE);
    (points?.slice(0, -1) || []).forEach((point, i) => {
      if (!dashed || i % 5 === 0) {
        this.ctx.lineTo(point.x * BASE_SCALE, point.y * BASE_SCALE);
      }
    });
    const lastPoint = points[points.length - 1];
    this.ctx.lineTo(lastPoint.x * BASE_SCALE, lastPoint.y * BASE_SCALE);
    this.ctx.stroke();
  }
}

export default Trace;
