import Observer from './Observer';
import { getScale } from '../../count-in-order/count-in-order/utils';
import { createImage } from './utils';
import Ball from './Ball';
import Particle from '../../find-the-number/find-the-number/Partical';

class CountAndSelect extends Observer {
  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  balls: Array<Ball> = [];

  particles: Array<Particle> = [];

  scale: number;

  private _requestAnimationFrameId: number;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ballsCount: number) {
    super();
    this.canvas = canvas;
    this.ctx = ctx;
    this.configure(ballsCount);
    this.initListeners();
  }

  configure(ballsCount: number) {
    this.scale = getScale(812, 130 * 2) * window.devicePixelRatio;
    const ITEM_WIDTH = 120 * this.scale;
    const ITEM_HEIGHT = 130 * this.scale;
    const ballsImages = [
      {
        image: createImage(require('./images/ball-blue.svg'), 112 * this.scale, 112 * this.scale),
        color: '#3ACFFE',
      },
      {
        image: createImage(require('./images/ball-green.svg'), 112 * this.scale, 112 * this.scale),
        color: '#52CC3E',
      },
      {
        image: createImage(require('./images/ball-orange.svg'), 112 * this.scale, 112 * this.scale),
        color: '#FF8855',
      },
      {
        image: createImage(require('./images/ball-pink.svg'), 112 * this.scale, 112 * this.scale),
        color: '#F47099',
      },
      {
        image: createImage(require('./images/ball-purple.svg'), 112 * this.scale, 112 * this.scale),
        color: '#8969E2',
      },
      {
        image: createImage(require('./images/ball-yellow.svg'), 112 * this.scale, 112 * this.scale),
        color: '#FFD84C',
      },
    ];
    const shadow = createImage(require('./images/shadow.svg'), 88 * this.scale, 22 * this.scale);
    const light = createImage(require('./images/light.svg'), 50 * this.scale, 40 * this.scale);
    const characterImages = [
      createImage(require('./images/squirrel.svg'), 784 * this.scale, 112 * this.scale),
      createImage(require('./images/cat.svg'), 784 * this.scale, 112 * this.scale),
      createImage(require('./images/pig.svg'), 784 * this.scale, 112 * this.scale),
      createImage(require('./images/bee.svg'), 784 * this.scale, 112 * this.scale),
      createImage(require('./images/monkey.svg'), 784 * this.scale, 112 * this.scale),
      createImage(require('./images/mole.svg'), 784 * this.scale, 112 * this.scale),
      createImage(require('./images/panda.svg'), 784 * this.scale, 112 * this.scale),
      createImage(require('./images/penguin.svg'), 784 * this.scale, 112 * this.scale),
      createImage(require('./images/koala.svg'), 784 * this.scale, 112 * this.scale),
      createImage(require('./images/lion.svg'), 784 * this.scale, 112 * this.scale),
    ];

    const dx = 5 * this.scale;
    const friction = 0.05 * this.scale;
    const frictionDistance = (dx * (dx / friction + 1)) / 2;

    if (ballsCount < 5) {
      for (let i = 0; i < ballsCount; i++) {
        const ball = new Ball(
          -ITEM_WIDTH * (i + 1),
          this.canvas.height / 2 - ITEM_HEIGHT / 2,
          dx,
          this.scale,
          friction,
          ballsImages[Math.floor(ballsImages.length * Math.random())],
          shadow,
          light,
          characterImages[Math.floor(characterImages.length * Math.random())],
          this.canvas.width / 2 + ITEM_WIDTH * (ballsCount / 2 - i - 1) - frictionDistance,
        );
        this.balls.push(ball);
      }
    } else {
      const firstRow = Math.floor(ballsCount / 2);
      const secondRow = ballsCount - firstRow;
      for (let i = 0; i < firstRow; i++) {
        const ball = new Ball(
          -ITEM_WIDTH * (i + 1),
          this.canvas.height / 2 - ITEM_HEIGHT,
          dx,
          this.scale,
          friction,
          ballsImages[Math.floor(ballsImages.length * Math.random())],
          shadow,
          light,
          characterImages[Math.floor(characterImages.length * Math.random())],
          this.canvas.width / 2 + ITEM_WIDTH * (firstRow / 2 - i - 1) - frictionDistance,
        );
        this.balls.push(ball);
      }
      for (let i = 0; i < secondRow; i++) {
        const ball = new Ball(
          this.canvas.width + ITEM_WIDTH * i,
          this.canvas.height / 2,
          -dx,
          this.scale,
          friction,
          ballsImages[Math.floor(ballsImages.length * Math.random())],
          shadow,
          light,
          characterImages[Math.floor(characterImages.length * Math.random())],
          this.canvas.width / 2 + ITEM_WIDTH * (i - secondRow / 2) + frictionDistance,
        );
        this.balls.push(ball);
      }
    }
  }

  destroy() {
    cancelAnimationFrame(this._requestAnimationFrameId);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    window.removeEventListener('mousedown', this.mouseEventListener.bind(this));
    window.removeEventListener('touchstart', this.touchEventListener.bind(this));
  }

  private addFirework(x: number, y: number, color: string) {
    const particleCount = 100;
    const power = 3 * this.scale;
    let radians = (Math.PI * 2) / particleCount;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(
        new Particle(x, y, (Math.random() * 6 + 6) * this.scale, color, {
          x: Math.cos(radians * i) * (Math.random() * power),
          y: Math.sin(radians * i) * (Math.random() * power),
        }),
      );
    }
  }

  private handleEvent({ x, y }: { x: number; y: number }) {
    this.balls.forEach((ball) => {
      if (
        Math.abs(ball.dx) < 0.01 &&
        !ball.isOpened &&
        ball.x < x &&
        ball.x + ball.image.width > x &&
        ball.y < y &&
        ball.y + ball.image.height > y
      ) {
        ball.open();
        this.emit({ name: 'number', number: this.balls.filter((ball) => ball.isOpened).length });
        this.addFirework(ball.x + ball.image.width / 2, ball.y + ball.image.height / 2, ball.color);
      }
    });
  }

  private mouseEventListener(event: MouseEvent) {
    this.handleEvent({ x: event.clientX * window.devicePixelRatio, y: event.clientY * window.devicePixelRatio });
  }

  private touchEventListener(event: TouchEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.handleEvent({
      x: event.touches[0].clientX * window.devicePixelRatio,
      y: event.touches[0].clientY * window.devicePixelRatio,
    });
  }

  initListeners() {
    window.addEventListener('touchstart', this.touchEventListener.bind(this), {
      passive: false,
    });
    window.addEventListener('mousedown', this.mouseEventListener.bind(this), {
      passive: true,
    });
  }

  start() {
    this._requestAnimationFrameId = requestAnimationFrame(this.start.bind(this));
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.balls.forEach((ball) => {
      ball.update(this.ctx);
    });
    this.particles.forEach((particle, index) => {
      if (particle.opacity > 0) {
        particle.update(this.ctx);
      } else {
        this.particles.splice(index, 1);
      }
    });
  }
}

export default CountAndSelect;
