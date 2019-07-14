class Particle {
  // Position.
  x: number;
  y: number;
  // Velocity.
  vx: number;
  vy: number;
  // Other attributes.
  color: string;
  radius: number;
  boxSize: number;

  constructor(radius: number, boxSize: number) {
    this.x = Math.random() * boxSize;
    this.y = Math.random() * boxSize;
    this.vx = 10 * (2 * Math.random() - 1);
    this.vy = 10 * (2 * Math.random() - 1);
    this.color = '#' + Math.floor(Math.random() * 16 ** 6).toString(16);
    this.radius = radius;
    this.boxSize = boxSize;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.098;
    if (this.x >= this.boxSize - this.radius || this.x <= this.radius) {
      this.vx *= -1;
    }
    if (this.y >= this.boxSize - this.radius || this.y <= this.radius) {
      this.vy *= -1;
    }
  }
}

function main() {
  const canvasSize = 600;
  const numParticles = 100;

  const canvas = document.getElementById('my_canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const particles = new Array<Particle>();
  for (let i = 0; i < numParticles; i++) {
    const b = new Particle(10, canvasSize);
    particles.push(b);
  }

  function loop() {
    context.fillStyle = '#f0ffff';
    context.fillRect(0, 0, canvasSize, canvasSize);
    particles.forEach(b => {
      b.update();
      b.draw(context);
    });

    requestAnimationFrame(loop);
  }

  loop();
}

main();
