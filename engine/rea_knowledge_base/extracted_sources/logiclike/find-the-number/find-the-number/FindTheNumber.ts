import Observer from './Observer';
import { getScale } from '../../count-in-order/count-in-order/utils';
import Particle from './Partical';
import FallenObject from './FallenObject';
import Animal from './Animal';
import { createImage } from './utils';
import { gsap } from 'gsap';
import PurposeNumber from './PurposeNumber';

// Конфиг игры: RN присылает загаданное число сообщением type: 'config'.
export type FindTheNumberConfig = {
  number: number;
};

class FindTheNumber extends Observer {
  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  scale: number;

  particles: Array<Particle> = [];

  fallenObjects: Array<FallenObject> = [];

  animal: Animal;

  purposeNumber: PurposeNumber;

  _requestAnimationFrameId: number;

  // ReturnType, а не number: под @types/node setInterval возвращает Timeout, а в
  // браузере (где бандл и работает) — число.
  _interval: ReturnType<typeof setInterval>;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, config: FindTheNumberConfig) {
    super();
    this.canvas = canvas;
    this.ctx = ctx;
    this.configure(config);
    this.initListeners();
  }

  configure(config: FindTheNumberConfig) {
    const gameWidth = 812;
    const gameHeight = 375;
    this.scale = getScale(gameWidth, gameHeight) * window.devicePixelRatio;
    const squirrel = createImage(require('../assets/squirrel.svg'), 281 * this.scale, 360 * this.scale);
    const eatSprite = createImage(require('../assets/squirrel-eat.svg'), 1686 * this.scale, 360 * this.scale);

    this.animal = new Animal(0, this.canvas.height - squirrel.height, squirrel, eatSprite);
    this.purposeNumber = new PurposeNumber(config.number, this.canvas.width / 2, this.canvas.height / 2, this.scale);
    this.purposeNumber.moveTo(
      this.animal.image.width / 2,
      this.canvas.height - squirrel.height + 50 * this.scale,
      this.runFallenObjects.bind(this),
    );
  }

  addFirework(x: number, y: number) {
    const particleCount = 20;
    const power = 4.5 * this.scale;
    let radians = (Math.PI * 2) / particleCount;
    const particleColors = [`#FF9900`, '#DDCA1F', '#BC4400'];

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(
        new Particle(
          x,
          y,
          (Math.random() * 6 + 6) * this.scale,
          particleColors[Math.floor(Math.random() * particleColors.length)],
          {
            x: Math.cos(radians * i) * (Math.random() * power),
            y: Math.sin(radians * i) * (Math.random() * power),
          },
        ),
      );
    }
  }

  private handleEvent({ x, y }: { x: number; y: number }) {
    this.fallenObjects.forEach((fallenObject) => {
      if (
        fallenObject.isActive &&
        fallenObject.x < x &&
        fallenObject.x + fallenObject.image.width > x &&
        fallenObject.y < y &&
        fallenObject.y + fallenObject.image.height > y
      ) {
        if (fallenObject.number === this.purposeNumber.number) {
          fallenObject.isActive = false;
          this.addFirework(
            fallenObject.x + fallenObject.image.width / 2,
            fallenObject.y + fallenObject.image.height / 2,
          );
          this.animal.runEatAnimation();
          this.emit({ name: 'consume' });
        } else {
          gsap
            .fromTo(fallenObject, { x: '+=-10', duration: 0.1 }, { x: '+=20', duration: 0.1 })
            .yoyo(true)
            .repeat(3)
            .then(() => {
              gsap.to(fallenObject, { x: '+=10', duration: 0.1 });
            });
        }
      }
    });
  }

  private mouseEventListener(event: MouseEvent) {
    this.handleEvent({ x: event.clientX * window.devicePixelRatio, y: event.clientY * window.devicePixelRatio });
  }

  private touchEventListener(event: TouchEvent) {
    event.preventDefault();
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

  destroy() {
    cancelAnimationFrame(this._requestAnimationFrameId);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    window.removeEventListener('mousedown', this.mouseEventListener.bind(this));
    window.removeEventListener('touchstart', this.touchEventListener.bind(this));
  }

  start() {
    this._requestAnimationFrameId = requestAnimationFrame(this.start.bind(this));
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.animal.update(this.ctx);
    this.fallenObjects.forEach((fallenObject, index) => {
      fallenObject.update(this.ctx);
      if (fallenObject.y > this.canvas.height || fallenObject.opacity <= 0) {
        setTimeout(() => {
          this.fallenObjects.splice(index, 1);
        });
      }
    });
    this.particles.forEach((particle, index) => {
      if (particle.opacity > 0) {
        particle.update(this.ctx);
      } else {
        this.particles.splice(index, 1);
      }
    });
    this.purposeNumber.update(this.ctx);
  }

  runFallenObjects() {
    const images = [
      createImage(require('../assets/acorn-yellow.svg'), 140 * this.scale, 140 * this.scale),
      createImage(require('../assets/acorn-brown.svg'), 140 * this.scale, 140 * this.scale),
      createImage(require('../assets/acorn-orange.svg'), 140 * this.scale, 140 * this.scale),
    ];
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, this.purposeNumber.number, this.purposeNumber.number];

    this._interval = setInterval(() => {
      const image = images[Math.floor(Math.random() * images.length)];
      const obj = new FallenObject(
        Math.random() * (this.canvas.width - image.width - this.animal.image.width) + this.animal.image.width,
        -image.height,
        3 * this.scale,
        image,
        numbers[Math.floor(Math.random() * numbers.length)],
        '#FFF',
        this.scale,
      );
      this.fallenObjects.push(obj);
    }, 1000);
  }
}

export default FindTheNumber;
