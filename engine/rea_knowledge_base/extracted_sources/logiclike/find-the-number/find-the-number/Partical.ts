const gravity = 0.03
const friction = 0.99

interface Velocity {
  x: number,
  y: number,
}

class Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: Velocity;
  opacity: number = 1;

  constructor(x: number, y: number, radius: number, color: string, velocity: Velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = {
      x: velocity.x,
      y: velocity.y
    }
    this.opacity = 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
    ctx.restore()
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx)
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.velocity.y += gravity
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.opacity -= 0.025;
  }
}

export default Particle;
