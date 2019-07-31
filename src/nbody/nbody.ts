import * as three from 'three';
import * as orbit from 'three/examples/jsm/controls/OrbitControls.js';

const G = 0.1

function randomVec(): three.Vector3 {
  return new three.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).multiplyScalar(2);
}

function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16 ** 6).toString(16);
}

class Body extends three.Mesh {
  velocity: three.Vector3;
  mass: number;

  constructor(
    position: three.Vector3,
    velocity: three.Vector3,
    mass: number,
    color: string
  ) {
    const geometry = new three.SphereGeometry(0.1 + 0.3 * mass, 100);
    const material = new three.MeshBasicMaterial({ color });
    super(geometry, material);

    this.position.add(position);
    this.velocity = velocity;
    this.mass = mass;
  }

  update(acceleration: three.Vector3) {
    this.position.add(this.velocity);
    this.velocity.add(acceleration);
  }
}

class Trail extends three.Line {
  geometry: three.Geometry;
  numSegments: number;
  constructor(color: string, position: three.Vector3, numSegments = 1000) {
    const material = new three.LineBasicMaterial({
      color,
    });
    const geometry = new three.Geometry();
    geometry.vertices = new Array<three.Vector3>(numSegments);
    for (let i = 0; i < numSegments; i++) {
      geometry.vertices[i] = position;
    }
    super(geometry, material);
    this.geometry = geometry;
    this.numSegments = numSegments;
  }

  update(v: three.Vector3) {
    for (let j = 1; j < this.numSegments; j++) {
      this.geometry.vertices[j - 1] = this.geometry.vertices[j];
    }
    this.geometry.vertices[this.numSegments - 1] = v.clone();
    this.geometry.verticesNeedUpdate = true;
  }
}

function simulate(
  bodies: Body[],
  lines: Trail[],
  renderer: three.WebGLRenderer,
  scene: three.Scene,
  camera: three.Camera,
  controls: orbit.OrbitControls,
) {
  requestAnimationFrame(() => simulate(bodies, lines, renderer, scene, camera, controls));
  controls.update();
  const accelerations = new Array<three.Vector3>();
  bodies.forEach(a => {
    const totalAcceleration = new three.Vector3(0, 0, 0);
    bodies.forEach(b => {
      if (a.id === b.id) return;
      const displacement = new three.Vector3(0, 0, 0);
      displacement.setX(a.position.x - b.position.x);
      displacement.setY(a.position.y - b.position.y);
      displacement.setZ(a.position.z - b.position.z);
      const distance = displacement.length();
      const acceleration = displacement
        .normalize()
        .multiplyScalar(- G * b.mass / distance ** 2);
      totalAcceleration.add(acceleration);
    });
    accelerations.push(totalAcceleration);
  });
  accelerations.forEach((a, i) => {
    const body = bodies[i];
    const line = lines[i];
    body.update(a);
    line.update(body.position);
  });
  renderer.render(scene, camera);
}

function main() {
  // Setup: Create scene, camera, and WebGL renderer.
  const scene = new three.Scene();
  const camera = new three.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 100;
  const renderer = new three.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  let controls = new orbit.OrbitControls(camera, renderer.domElement);

  // Initialize the simulation.
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

  // Run the simulation.
  simulate(bodies, lines, renderer, scene, camera, controls);
}

main()
