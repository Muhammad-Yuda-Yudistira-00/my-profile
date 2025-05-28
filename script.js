import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const kubus = document.querySelector('.kubus');
if (!kubus) {
    console.error('Elemen .kubus tidak ditemukan di DOM!');
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight - 20);
kubus.appendChild(renderer.domElement);

// Fungsi untuk membuat tekstur dengan tulisan
function createTextTexture(text, color = '#ff0000', backgroundColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '50px Arial';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
}

// Muat tekstur gambar untuk sisi yang dapat diklik
const textureLoader = new THREE.TextureLoader();
const imageTexture = textureLoader.load(
    'image.png', // Ganti dengan path gambar yang valid
    () => console.log('Gambar berhasil dimuat'),
    undefined,
    (error) => console.error('Gagal memuat gambar:', error)
);

const imageProfile = textureLoader.load(
    'profile_2.jpg',
    () => console.log('Profile pict dimuat'),
    undefined,
    (error) => console.error('Gagal memuat profile pict:', error)
)

// Buat material untuk setiap sisi
const materials = [
    new THREE.MeshLambertMaterial({ map: imageProfile }), // 1 Sisi kanan
    new THREE.MeshLambertMaterial({ map: imageTexture }), // 2 Sisi kiri
    new THREE.MeshLambertMaterial({ map: createTextTexture('X', 'orangered', 'black') }), // 3 Sisi atas
    new THREE.MeshLambertMaterial({ map: createTextTexture('Facebook', 'black', '#0366ff') }), // 4 Sisi bawah
    new THREE.MeshLambertMaterial({ map: createTextTexture('Instagram', 'black', '#ffffff') }), // 5 Sisi depan
    new THREE.MeshLambertMaterial({ map: createTextTexture('Threads', 'black', '#ffffff') })  // 6 Sisi belakang
];

materials[0].userData = {link: 'https://www.linkedin.com/in/muhammad-yudistira-24a071258/'}
materials[1].userData = {link: 'https://github.com/Muhammad-Yuda-Yudistira-00'}
materials[2].userData = {link: 'https://x.com/Yudistira00dist'}
materials[3].userData = {link: 'https://www.facebook.com/profile.php?id=100088238884189'}
materials[4].userData = {link: 'https://www.instagram.com/yudistira00yd/'}
materials[5].userData = {link: 'https://www.threads.com/@yudistira00yd'}

// Buat geometri dan kubus
const geometry = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// Pencahayaan
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableRotate = true;
controls.enablePan = false;
controls.enableZoom = true;

camera.position.z = 4;

// Raycaster untuk deteksi klik
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    event.preventDefault(); // Cegah OrbitControls menangkap klik

    // Normalisasi koordinat mouse
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(cube);

    if (intersects.length > 0) {
        const materialIndex = intersects[0].face.materialIndex;
        const clickedMaterial = cube.material[materialIndex]
        if(clickedMaterial.userData?.link) {
            window.open(clickedMaterial.userData.link, '_blank');
        }else { 
            console.log("sisi ini tidak punya link");
        }
    } else {
        console.log('Tidak ada sisi yang diklik');
    }
}

window.addEventListener('click', onMouseClick, false);

// Efek hover untuk indikasi sisi yang dapat diklik
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cube);
    if(intersects.length > 0) {
        const materialIndex = intersects[0].face.materialIndex;
        const hoveredMaterial = cube.material[materialIndex]
        if (hoveredMaterial.userData?.link) {
            document.body.style.cursor = 'pointer';
            return
        }
        document.body.style.cursor = 'default';
    }
}
window.addEventListener('mousemove', onMouseMove, false);

// Animasi
function animate() {
    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);