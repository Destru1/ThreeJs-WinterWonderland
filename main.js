import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

let particles;
let positions = [],
  velocities = [];
const numberOfSnowFlakes = 15000;

const maxRange = 1000,
  minRange = maxRange / 2;
const minHeight = 150;

const geometry = new THREE.BufferGeometry();
const textureLoader = new THREE.TextureLoader();

init();
loadModels();

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(9, 4, 14);
  controls.update();

  const light = new THREE.HemisphereLight(0xfffffb, 0x080820, 1);
  scene.add(light);

  window.addEventListener("resize", onWindowResize);
}

function loadModels() {
  const mainModelPath = "./models/street.glb";
  loadModel(mainModelPath, (gltf) => {
    scene.add(gltf.scene);
  });

  const carModelPath = "./models/car.glb";
  loadModel(carModelPath, (gltf) => {
    const car = gltf.scene;
    scene.add(car);
    car.position.set(6, 0, 6);
    car.rotateY(-11);
    animateCar(car);
  });

  const dogModelPath = "./models/dog.glb";
  loadModel(dogModelPath, (gltf) => {
    const dog = gltf.scene;
    scene.add(dog);
    dog.position.set(-4, 0, 2);
    dog.rotateY(30);
    animateDog(dog);
  });
}

function loadModel(modelPath, callback) {
  const loader = new GLTFLoader();
  loader.load(modelPath, callback);
}

function animateCar(carModel) {
  animateModel(carModel, 0.015, 6);
}

function animateDog(dogModel) {
  animateModel(dogModel, 0.005, 4);
}

function animateModel(model, speed, distance) {
  let movingForward = true;

  function animate() {
    requestAnimationFrame(animate);

    if (movingForward) {
      model.position.x += speed;
    } else {
      model.position.x -= speed;
    }

    if (Math.abs(model.position.x) > distance) {
      movingForward = !movingForward;
      model.rotateY(Math.PI);
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

function addSnowFlakes() {
  for (let i = 0; i < numberOfSnowFlakes; i++) {
    positions.push(
      Math.floor(Math.random() * maxRange - minRange),
      Math.floor(Math.random() * minRange + minHeight),
      Math.floor(Math.random() * maxRange - minRange)
    );
    velocities.push(
      Math.floor(Math.random() * 6 - 3) * 0.1,
      Math.floor(Math.random() * 5 + 0.12) * 0.18,
      Math.floor(Math.random() * 6 - 3) * 0.1
    );

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute(
      "velocity",
      new THREE.Float32BufferAttribute(velocities, 3)
    );
  }

  const flake = new THREE.PointsMaterial({
    size: 5,
    map: textureLoader.load("sprites/snowflake.png"),
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    opacity: 0.9,
  });
  particles = new THREE.Points(geometry, flake);
  scene.add(particles);
}

addSnowFlakes();
function animate() {
  requestAnimationFrame(animate);
  updateParticles();
  controls.update();
  renderer.render(scene, camera);
}

function updateParticles() {
  for (let i = 0; i < numberOfSnowFlakes * 3; i += 3) {
    particles.geometry.attributes.position.array[i] -=
      particles.geometry.attributes.velocity.array[i];
    particles.geometry.attributes.position.array[i + 1] -=
      particles.geometry.attributes.velocity.array[i + 1];
    particles.geometry.attributes.position.array[i + 2] -=
      particles.geometry.attributes.velocity.array[i + 2];

    if (particles.geometry.attributes.position.array[i + 1] < 0) {
      particles.geometry.attributes.position.array[i] = Math.floor(
        Math.random() * maxRange - minRange
      );
      particles.geometry.attributes.position.array[i + 1] = Math.floor(
        Math.random() * minRange + minHeight
      );
      particles.geometry.attributes.position.array[i + 2] = Math.floor(
        Math.random() * maxRange - minRange
      );
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
animate();
