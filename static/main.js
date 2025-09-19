import * as THREE from 'three';

// --- Global Variables ---
const videoElement = document.getElementById('live-video');
const canvasElement = document.getElementById('three-canvas');
let renderer, scene, camera, torsoMesh;

// --- Initialize the 3D Scene ---
function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;

    renderer = new THREE.WebGLRenderer({ canvas: canvasElement, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 2, 5);
    scene.add(directionalLight);

    // This is our placeholder for the 3D clothing.
    const torsoGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.3); // W, H, D
    const torsoMaterial = new THREE.MeshStandardMaterial({
        color: 0x1E90FF, // Dodger Blue
        transparent: true,
        opacity: 0.8
    });
    torsoMesh = new THREE.Mesh(torsoGeometry, torsoMaterial);
    scene.add(torsoMesh);
}

// --- Initialize MediaPipe Pose ---
function initMediaPipe() {
    const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
    });
    pose.onResults(onPoseResults);

    // Start the webcam
    const webcam = new Camera(videoElement, {
        onFrame: async () => {
            await pose.send({ image: videoElement });
        },
        width: 1280,
        height: 720
    });
    webcam.start();
}

// --- The Core Logic: Update 3D model on Pose results ---
function onPoseResults(results) {
    if (results.poseWorldLandmarks && torsoMesh) {
        const landmarks = results.poseWorldLandmarks;

        // Get key body landmarks
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];

        if (leftShoulder.visibility > 0.7 && rightShoulder.visibility > 0.7) {
            // Calculate torso center position
            const torsoCenterX = (leftShoulder.x + rightShoulder.x) / 2;
            const torsoCenterY = (leftShoulder.y + leftHip.y) / 2;
            
            // The position is mirrored because the video is mirrored.
            torsoMesh.position.x = -torsoCenterX;
            torsoMesh.position.y = -torsoCenterY;
            torsoMesh.position.z = (leftShoulder.z + rightShoulder.z) / 2;
            
            // You would add rotation and mesh deformation logic here for a real model.
        }
    }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// --- Start Everything ---
initThree();
initMediaPipe();
animate();