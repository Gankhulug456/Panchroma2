const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
camera.position.z = 20;
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const canvasContainer = document.getElementById('three-js-canvas-container');
canvasContainer.appendChild(renderer.domElement);
function onWindowResize() {
    camera.aspect = canvasContainer.offsetWidth / canvasContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
}
window.addEventListener('resize', onWindowResize, false);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Textures

const loader = new THREE.TextureLoader();
const materials = [
    'images/1.png', 'images/2.png', 'images/3.png', 'images/4.png',
    'images/5.png', 'images/6.png', 'images/7.png', 'images/8.png'
].map(image => {
    const texture = loader.load(image);
    texture.encoding = THREE.sRGBEncoding;
    return new THREE.MeshBasicMaterial({ map: texture, transparent: true});
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Object properties
const objects = [];
const geometry = new THREE.PlaneGeometry(3, 3);
const sizes = [
  { width: 10, height: 10 }, { width: 7, height: 7 }, { width: 9, height: 9},
  { width: 9, height: 9 }, { width: 2, height: 2 }, { width: 3, height: 3 },
  { width: 2, height: 2 }, { width: 2, height: 2 }
];
const positions = [
  { x: -7, y: 5 }, { x: 4, y: 5 }, { x: -10, y: -5 },
  { x: 3, y: -5 }, { x: 9, y: 0 }, { x: -5, y: -10 },
  { x: -2, y: 10 }, { x: -15, y: 0 }
];

materials.forEach((material, index) => {
  const geometry = new THREE.PlaneGeometry(sizes[index].width, sizes[index].height);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(positions[index].x, positions[index].y, 0);
  mesh.velocity = new THREE.Vector3();
  scene.add(mesh);
  objects.push(mesh);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Interactions
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove, false);
const startTime = Date.now(); 
function animate() {
  requestAnimationFrame(animate);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects);

  // Collision detection and response
  for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
          const obj1 = objects[i];
          const obj2 = objects[j];
          const distance = obj1.position.distanceTo(obj2.position);
          const size1 = sizes[i].width / 2; // Assuming square objects for simplicity
          const size2 = sizes[j].width / 2;
          if (distance < size1 + size2) {
              // Simple collision response: move objects apart
              const direction = new THREE.Vector3().subVectors(obj1.position, obj2.position).normalize();
              obj1.velocity.add(direction);
              obj2.velocity.sub(direction);
          }
      }
  }

  objects.forEach(obj => {
      if (intersects.find(intersect => intersect.object === obj)) {
          const intersect = intersects.find(intersect => intersect.object === obj);
          const forceDirection = new THREE.Vector3().subVectors(obj.position, intersect.point).normalize();
          obj.velocity.addScaledVector(forceDirection, 0.5);
      }
      // Update position based on velocity
      obj.position.add(obj.velocity);

      // Boundary checks
      const maxX = window.innerWidth / 65;
      const maxY = window.innerHeight / 65;
      if (obj.position.x > maxX || obj.position.x < -maxX) {
          obj.velocity.x *= -0.9;
          obj.position.x = Math.sign(obj.position.x) * maxX;
      }
      if (obj.position.y > maxY || obj.position.y < -maxY) {
          obj.velocity.y *= -0.9;
          obj.position.y = Math.sign(obj.position.y) * maxY;
      }
      // Apply damping
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // Convert milliseconds to seconds
  
      // Determine the damping factor based on elapsed time
      let dampingFactor = 0.8;
      if (elapsedTime > 1) {
          dampingFactor = 0.94;
      }
      
      obj.velocity.multiplyScalar(dampingFactor);
  });

  renderer.render(scene, camera);
}

animate();
console.log("running");

