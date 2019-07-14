import * as three from 'three';

function randomVec(): three.Vector3 {
  return new three.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2);
}

function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16 ** 6).toString(16);
}

class Body extends three.Mesh {
  velocity: three.Vector3;
  mass: number;

  constructor(position: three.Vector3, velocity: three.Vector3, mass: number, color: string) {
    const geometry = new three.SphereGeometry(0.1 + 0.3 * mass, 100);
    const material = new three.MeshBasicMaterial({color});
    super(geometry, material);

    this.position.add(position);
    this.velocity = velocity;
    this.mass = mass;
  }
}

class Trail extends three.Line {
  geometry: three.Geometry;
  num_segments: number;
  constructor(color: string, position: three.Vector3, num_segments = 1000) {
    const material = new three.LineBasicMaterial({
      color,
    });
    const geometry = new three.Geometry();
    geometry.vertices = new Array<three.Vector3>(num_segments);
    for (let i = 0; i < num_segments; i++){
      geometry.vertices[i] = position;
    }
    super(geometry, material);
    this.geometry = geometry;
    this.num_segments = num_segments;
  }

  update(v: three.Vector3) {
    for (let j = 1; j < this.num_segments; j++) {
      this.geometry.vertices[j - 1] = this.geometry.vertices[j]; 
    }
    this.geometry.vertices[this.num_segments - 1] = v.clone();
    this.geometry.verticesNeedUpdate = true;
  }
}

const scene = new three.Scene();
const camera = new three.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 100;

const renderer = new three.WebGLRenderer();
renderer.setSize(800, 800);
document.body.appendChild(renderer.domElement);

const NUM_PARTICLES = 10;

const lines = new Array<Trail>();
const bodies = new Array<Body>();
for (let i = 0; i < NUM_PARTICLES; i++) {
  const position = randomVec().multiplyScalar(20);
  const velocity = randomVec().multiplyScalar(0.1);
  const mass = Math.random();
  const color = randomColor();
  const body = new Body(position, velocity, mass, color);
  bodies.push(body);
  scene.add(body);
  const line = new Trail(color, position);
  scene.add(line);
  lines.push(line);
}

window.addEventListener('click', (e: MouseEvent)  => {
  camera.position.z /= 2;
  camera.lookAt(0, 0, -1)
 });

 window.addEventListener('contextmenu', (e: MouseEvent)  => {
  e.preventDefault();
  camera.position.z *= 2;
 });
 
function simulate() {
  requestAnimationFrame(simulate);
  const accelerations = new Array<three.Vector3>();
  bodies.forEach(a => {
    const totalAcceleration = new three.Vector3(0, 0, 0,);
    bodies.forEach(b => {
      if (a.id == b.id) return;
      const displacement = new three.Vector3(0, 0, 0);
      displacement.setX(a.position.x - b.position.x);
      displacement.setY(a.position.y - b.position.y);
      displacement.setZ(a.position.z - b.position.z);
      const distance = displacement.length();
      const acceleration = displacement.normalize().multiplyScalar(- 0.1 * b.mass / distance**2);
      totalAcceleration.add(acceleration);
    });
    accelerations.push(totalAcceleration);
  });
  bodies.forEach((b, i) => {
    b.position.add(b.velocity);
    b.velocity.add(accelerations[i]);
    lines[i].update(b.position);
  });
  renderer.render(scene, camera);
}
simulate();
