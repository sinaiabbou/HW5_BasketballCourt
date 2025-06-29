import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create basketball court
function createBasketballCourt() {
  // Court floor - just a simple brown surface
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
  
  // Note: All court lines, hoops, and other elements have been removed
  // Students will need to implement these features

  // White lines material
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  // Center line
  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.01, 15), lineMaterial);
  centerLine.position.y = 0.11;
  scene.add(centerLine);

  // Center circle
  const centerCircle = new THREE.Mesh(new THREE.RingGeometry(1.8, 2, 32), lineMaterial);
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.y = 0.11;
  scene.add(centerCircle);

  // Three-point lines (left & right)
  function createThreePointArc(xPos, rotationAngle) {
    const arcGeometry = new THREE.RingGeometry(6.7, 6.9, 32, 1, 0, Math.PI);
    const arcMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const arc = new THREE.Mesh(arcGeometry, arcMaterial);
    arc.rotation.x = -Math.PI / 2;
    arc.rotation.z = rotationAngle;
    arc.position.set(xPos, 0.11, 0);
    scene.add(arc);
  }
  createThreePointArc(-15, -Math.PI / 2); // left side
  createThreePointArc(15, Math.PI / 2);  // right side

  // Hoops
  function createBasketballHoop(side) {
    const hoopGroup = new THREE.Group();
  
    // Pole placed just outside court boundary (±15 court edge + small offset)
    const poleX = side * 15.5; // slightly outside ±15 court limit
    const boardX = side * 14.2; // backboard closer to court center
  
    // Support pole
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 6);
    const poleMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(poleX, 3, 0);
    pole.castShadow = true;
    hoopGroup.add(pole);
  
    // Support arm (shorter length)
    const armLength = Math.abs(boardX - poleX);
    const armGeo = new THREE.BoxGeometry(0.2, 0.15, armLength);
    const armMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set((poleX + boardX) / 2, 5, 0);
    arm.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    arm.castShadow = true;
    hoopGroup.add(arm);
  
    // Backboard
    const boardGeo = new THREE.BoxGeometry(2.8, 1.6, 0.1);
    const boardMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(boardX, 5, 0);
    board.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    board.castShadow = true;
    hoopGroup.add(board);
  
    // Rim
    const rimGeo = new THREE.TorusGeometry(0.23, 0.02, 8, 16);
    const rimMat = new THREE.MeshPhongMaterial({ color: 0xff6600 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(boardX + (side < 0 ? 0.3 : -0.3), 4.5, 0);
    rim.castShadow = true;
    hoopGroup.add(rim);
  
    // Net
    const netGroup = new THREE.Group();
    const netMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const segments = 8;
    const netHeight = 0.5;
    const topR = 0.23;
    const bottomR = 0.13;
  
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const topPt = new THREE.Vector3(Math.cos(angle) * topR, 0, Math.sin(angle) * topR);
      const bottomPt = new THREE.Vector3(Math.cos(angle) * bottomR, -netHeight, Math.sin(angle) * bottomR);
      const geo = new THREE.BufferGeometry().setFromPoints([topPt, bottomPt]);
      netGroup.add(new THREE.Line(geo, netMat));
    }
  
    netGroup.position.set(boardX + (side < 0 ? 0.3 : -0.3), 4.5, 0);
    hoopGroup.add(netGroup);
  
    scene.add(hoopGroup);
  }
  
  createBasketballHoop(-1); // left hoop
  createBasketballHoop(1);  // right hoop  

  // Basketball in the center
  function createBasketball() {
    const radius = 0.24;
    const ballGeo = new THREE.SphereGeometry(radius, 64, 64);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xff7f00,
      roughness: 0.7,
      metalness: 0.05
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
  
    // Black seams using thin torus meshes
    const seamGeo = new THREE.TorusGeometry(radius, 0.005, 8, 64);
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  
    const equator = new THREE.Mesh(seamGeo, seamMat);
    const merid1 = new THREE.Mesh(seamGeo, seamMat);
    merid1.rotation.x = Math.PI / 4;
    const merid2 = new THREE.Mesh(seamGeo, seamMat);
    merid2.rotation.x = Math.PI / 2;
    const merid3 = new THREE.Mesh(seamGeo, seamMat);
    merid3.rotation.x = -Math.PI / 4;
    const meridZ = new THREE.Mesh(seamGeo, seamMat);
    meridZ.rotation.z = Math.PI / 2;
  
    // Grouping ball and seams
    const ballGroup = new THREE.Group();
    ballGroup.add(ballMesh, equator, merid1, merid2, merid3, meridZ);
    ballGroup.position.set(0, radius + 0.1, 0);
    ballGroup.castShadow = true;
    scene.add(ballGroup);
  }
  createBasketball();
}


// Create all elements
createBasketballCourt();

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// // Instructions display
// const instructionsElement = document.createElement('div');
// instructionsElement.style.position = 'absolute';
// instructionsElement.style.bottom = '20px';
// instructionsElement.style.left = '20px';
// instructionsElement.style.color = 'white';
// instructionsElement.style.fontSize = '16px';
// instructionsElement.style.fontFamily = 'Arial, sans-serif';
// instructionsElement.style.textAlign = 'left';
// instructionsElement.innerHTML = `
//   <h3>Controls:</h3>
//   <p>O - Toggle orbit camera</p>
// `;
// document.body.appendChild(instructionsElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate();