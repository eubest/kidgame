import { createImage, getAssets, getScale } from './utils';
import SequenceObject from './SequenceObject';
import Animal from './Animal';
import DashLine from './DashLine';
import Observer from './Observer';
import Trophy from './Trophy';
import gsap from 'gsap';
import AnimalPreview from './AnimalPreview';
import Finger from './Finger';
import type { CountInOrderConfig, CountInOrderInput } from './types';

class CountInOrder extends Observer {
  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  dashes: Array<DashLine> = [];

  sequenceObjects: Array<SequenceObject> = [];

  animal: Animal;

  animalPreview: AnimalPreview;

  finger: Finger;

  trophy: Trophy;

  _requestAnimationFrameId: number;

  gravity: number;

  scale: number;

  // Входные поля от RN плюс ассеты из config/<type>/ (см. getAssets).
  config: CountInOrderConfig;

  isFinished: boolean = false;

  isIntro: boolean = false;

  isStartIntro: boolean = false;

  timeout: ReturnType<typeof setTimeout> | null = null;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, config: CountInOrderInput) {
    super();
    this.canvas = canvas;
    this.ctx = ctx;
    this.config = Object.assign({}, config, getAssets(config.type));
    this.configure();
    this.initListeners();
  }

  async startIntro() {
    this.isIntro = true;
    this.isStartIntro = true;
    const ITEM_WIDTH = this.config.sequenceImageWidth * this.scale;
    const ITEM_HEIGHT = this.config.sequenceImageHeight * this.scale;
    this.trophy.opacity = 0;

    let promises = [];

    if (this.sequenceObjects.length <= 5) {
      for (let i = 0; i < this.sequenceObjects.length; i++) {
        this.sequenceObjects[i].x = this.canvas.width / 2 - ITEM_WIDTH * (this.sequenceObjects.length / 2 - i);
        this.sequenceObjects[i].y = this.canvas.height;
        promises.push(
          gsap.to(this.sequenceObjects[i], { y: this.canvas.height / 2 - ITEM_HEIGHT / 2, delay: 2 * i }).then(() => {
            this.emit({ name: 'number', number: this.sequenceObjects[i].number });
          }),
        );
      }
    } else {
      const firstRow = 5;
      const secondRow = this.sequenceObjects.length - firstRow;

      for (let i = 0; i < firstRow; i++) {
        this.sequenceObjects[i].x = this.canvas.width / 2 - ITEM_WIDTH * (firstRow / 2 - i);
        this.sequenceObjects[i].y = this.canvas.height;
        promises.push(
          gsap.to(this.sequenceObjects[i], { y: this.canvas.height / 2 - ITEM_HEIGHT, delay: 2 * i }).then(() => {
            this.emit({ name: 'number', number: this.sequenceObjects[i].number });
          }),
        );
      }
      for (let i = 0; i < secondRow; i++) {
        this.sequenceObjects[firstRow + i].x = this.canvas.width / 2 - ITEM_WIDTH * (firstRow / 2 - i);
        this.sequenceObjects[firstRow + i].y = this.canvas.height;
        promises.push(
          gsap
            .to(this.sequenceObjects[firstRow + i], { y: this.canvas.height / 2, delay: 2 * (firstRow + i) })
            .then(() => {
              this.emit({ name: 'number', number: this.sequenceObjects[firstRow + i].number });
            }),
        );
      }
    }

    await Promise.all(promises);
    await this.finishIntro();
  }

  async finishIntro() {
    this.isStartIntro = false;
    let promises = [];
    for (let i = 0; i < this.sequenceObjects.length; i++) {
      promises.push(
        gsap.to(this.sequenceObjects[i], {
          x: this.sequenceObjects[i].endX,
          y: this.sequenceObjects[i].endY,
          delay: 0.1 * this.sequenceObjects.length,
        }),
      );
    }
    await Promise.all(promises);
    await gsap.to(this.trophy, { opacity: 1 });
    this.isIntro = false;
    this.emit({ name: 'introFinished' });
    this.startTimer();
  }

  configure() {
    const gameWidth =
      Math.max(...this.config.sequence.map((s) => s.x)) +
      this.config.sequenceImageWidth +
      this.config.offset.left +
      this.config.offset.right;
    const gameHeight =
      Math.max(...this.config.sequence.map((s) => s.y)) +
      this.config.sequenceImageHeight +
      this.config.offset.top +
      this.config.offset.bottom;
    this.scale = getScale(gameWidth, gameHeight) * window.devicePixelRatio;
    const sequenceImage = createImage(
      this.config.sequenceImage,
      this.config.sequenceImageWidth * this.scale,
      this.config.sequenceImageHeight * this.scale,
    );
    const character = createImage(
      this.config.animal,
      this.config.animalWidth * this.scale,
      this.config.animalHeight * this.scale,
    );
    const characterWrongSequence = createImage(
      this.config.wrongSequence,
      this.config.animalWidth * this.config.wrongImageSequenceFrames * this.scale,
      this.config.animalHeight * this.scale,
    );
    const characterFinishSequence = createImage(
      this.config.finishSequence,
      this.config.animalWidth * this.config.finishImageSequenceFrames * this.scale,
      this.config.animalHeight * this.scale,
    );
    const trophyImage = createImage(
      this.config.trophy,
      this.config.trophyWidth * this.scale,
      this.config.trophyHeight * this.scale,
    );
    const fingerImage = createImage(require('./config/finger.svg'), 100 * this.scale, 100 * this.scale);
    this.gravity = 1.5 * this.scale;
    const yOffset = (this.canvas.height - gameHeight * this.scale) / 2;
    const xOffset = (this.canvas.width - gameWidth * this.scale) / 2;

    this.sequenceObjects = this.config.sequence.map(
      (sequenceObject) =>
        new SequenceObject(
          (sequenceObject.x + this.config.offset.left) * this.scale + xOffset,
          (sequenceObject.y + this.config.offset.top) * this.scale + yOffset,
          sequenceObject.number,
          sequenceImage,
          this.scale,
          this.config.digitOffset,
        ),
    );
    this.sequenceObjects.sort((a, b) => a.number - b.number);

    this.animal = new Animal(
      this.sequenceObjects[0],
      character,
      characterWrongSequence,
      characterFinishSequence,
      this.scale,
      this.config.animalOffset,
    );
    const lastSequenceObject = this.sequenceObjects[this.sequenceObjects.length - 1];
    this.trophy = new Trophy(lastSequenceObject, trophyImage, this.scale, this.config.trophyOffset);
    this.finger = new Finger(this.sequenceObjects[0], fingerImage);
    this.finger.opacity = 0;
    this.animal.y = -character.height;
    this.animal.currentSequenceObject = null;

    const character2 = createImage(
      this.config.animal,
      this.config.animalWidth * this.scale * this.config.previewScale,
      this.config.animalHeight * this.scale * this.config.previewScale,
    );
    const characterWrongSequence2 = createImage(
      this.config.wrongSequence,
      this.config.animalWidth * this.config.wrongImageSequenceFrames * this.scale * this.config.previewScale,
      this.config.animalHeight * this.scale * this.config.previewScale,
    );
    this.animalPreview = new AnimalPreview(
      character2,
      characterWrongSequence2,
      characterFinishSequence,
      this.scale,
      this.config.animalOffset,
      this.config.angle,
    );
    this.animalPreview.x = -this.config.previewOffset.x * this.scale;
    this.animalPreview.y = this.canvas.height + this.animalPreview.image.height;
    gsap.to(this.animalPreview, {
      y: this.canvas.height - this.animalPreview.image.height + this.config.previewOffset.y * this.scale,
      duration: 0.4,
    });

    if (this.config.isIntro) {
      this.startIntro();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (gsap.isTweening(this.finger)) {
      gsap.killTweensOf(this.finger);
      gsap.to(this.finger, { opacity: 0, duration: 0.5 });
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(async () => {
      if (!this.animal.currentSequenceObject) {
        this.finger.setSequenceObject(this.sequenceObjects[0]);
      } else {
        this.finger.setSequenceObject(this.sequenceObjects[this.animal.currentSequenceObject.number]);
      }
      await gsap.to(this.finger, { opacity: 1, duration: 0.5 });
      await gsap.to(this.finger, {
        x: `-=${this.scale * 10}`,
        y: `-=${this.scale * 10}`,
        repeat: 5,
        yoyo: true,
        duration: 0.5,
      });
      await gsap.to(this.finger, { opacity: 0, duration: 0.5 });
      this.startTimer();
    }, 5000);
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

  private handleEvent({ x, y }: { x: number; y: number }) {
    if (this.isStartIntro) {
      gsap.killTweensOf(this.sequenceObjects);
      this.finishIntro();
      return;
    }
    if (this.isFinished || this.isIntro) {
      return;
    }
    this.sequenceObjects.forEach((object) => {
      if (
        !this.animal.nextSequenceObject &&
        this.animal.currentSequenceObject !== object &&
        object.x < x &&
        object.x + object.image.width > x &&
        object.y < y &&
        object.y + object.image.height > y
      ) {
        if (!this.animal.currentSequenceObject) {
          if (object.number !== 1) {
            this.animalPreview.runWrongAnimation();
            this.emit({ name: 'wrong' });
          } else if (!gsap.isTweening(this.animal)) {
            this.startTimer();
            gsap
              .to(this.animalPreview, { y: this.canvas.height + this.animalPreview.image.height, duration: 0.5 })
              .then(() =>
                gsap.to(this.animal, {
                  y:
                    this.sequenceObjects[0].y -
                    this.config.animalHeight * this.scale +
                    this.config.animalOffset.y * this.scale,
                  duration: 0.5,
                }),
              )
              .then(() => {
                this.animal.currentSequenceObject = object;
                this.emit({ name: 'number', number: object.number });
              });
          }
          return;
        }
        if (object.number !== this.animal.currentSequenceObject.number + 1) {
          this.animal.runWrongAnimation();
          this.emit({ name: 'wrong' });
          return;
        }
        this.startTimer();
        if (gsap.isTweening(this.animal)) {
          gsap.killTweensOf(this.animal);
        }
        this.emit({ name: 'number', number: object.number });
        this.animal.nextSequenceObject = object;
        this.dashes.push(
          new DashLine(
            this.animal.currentSequenceObject,
            this.animal.nextSequenceObject,
            this.scale,
            this.config.dashLineOffset,
          ),
        );
        let xDiff = Math.abs(object.x + this.animal.offset.x - this.animal.x);
        let yDiff = object.y - (this.animal.y + this.animal.image.height - this.animal.offset.y);
        let speed = xDiff / 20;
        const direction = object.x + this.animal.offset.x - this.animal.x > 0 ? 'right' : 'left';
        this.animal.velocity.x = (direction === 'right' ? 1 : -1) * speed;
        this.animal.velocity.y = (yDiff - 1) / (xDiff / speed) - (this.gravity * (xDiff / speed - 1)) / 2;
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

  start() {
    this._requestAnimationFrameId = requestAnimationFrame(this.start.bind(this));
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.dashes.forEach((dash) => {
      dash.update(this.ctx);
    });
    this.sequenceObjects.forEach((sequenceObject) => {
      sequenceObject.update(this.ctx);
    });
    if (!this.isFinished) {
      this.trophy.update(this.ctx);
    }
    this.finger.update(this.ctx);
    this.animal.update(this.ctx);
    this.animalPreview.update(this.ctx);

    if (this.animal.nextSequenceObject) {
      this.animal.velocity.y += this.gravity;
      if (
        (Math.floor(this.animal.x - (this.animal.nextSequenceObject.x + this.animal.offset.x)) >= 0 &&
          this.animal.velocity.x > 0) ||
        (Math.floor(this.animal.x - (this.animal.nextSequenceObject.x + this.animal.offset.x)) <= 0 &&
          this.animal.velocity.x < 0)
      ) {
        this.animal.velocity = { x: 0, y: 0 };
        this.animal.x = this.animal.nextSequenceObject.x + this.animal.offset.x;
        this.animal.y = this.animal.nextSequenceObject.y - this.animal.image.height + this.animal.offset.y;
        this.animal.currentSequenceObject = this.animal.nextSequenceObject;
        delete this.animal.nextSequenceObject;
        if (!this.sequenceObjects.find((seqObj) => seqObj.number > this.animal.currentSequenceObject.number)) {
          this.animal.runFinishAnimation();
          this.isFinished = true;
          this.emit({ name: 'finish' });
          clearTimeout(this.timeout);
        }
      }
    }
  }
}

export default CountInOrder;
