import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Player, Idle, Walk_forward, Walk_forward_left, Walk_forward_right, Walk_backward, Walk_backward_left, Walk_backward_right, Walk_left, Walk_right, Run_forward, Run_forward_left, Run_forward_right, Run_backward, Run_backward_left, Run_backward_right, Run_left, Run_right } from './references.js';

// GLOBAL VARIABLES
let currentAction = 'Idle';
let walkDirection = new THREE.Vector3();
let rotateAngle = new THREE.Vector3(0, 1, 0);
let rotateQuarternion = new THREE.Quaternion();
let cameraTarget = new THREE.Vector3();
let fadeDuration = 0.2;
let velocity = 0;
let runVelocity = 8;
let walkVelocity = 2;

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 2;
camera.position.z = -5;
camera.position.x = 0;

// RENDERER
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 15;
orbitControls.enablePan = false;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
cameraTarget.x = 0;
cameraTarget.y = 1;
cameraTarget.z = 0;
orbitControls.target = cameraTarget;
orbitControls.update();

// LIGHTS
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
directionalLight.position.set(-100, 100, 100);
directionalLight.target.position.set(0, 0, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.25);
scene.add(ambientLight);

// FLOOR
const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(20, 20, 10, 10),
          new THREE.MeshStandardMaterial({
              color: 0x808080,
            }));
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// MODEL & ANIMATIONS
let model;
let mixer;
const animationsMap = new Map();
const manager = new THREE.LoadingManager();
const loader = new FBXLoader(manager);
loader.load(Player, (fbx) => {
        model = fbx;
        model.scale.setScalar(0.01);
        model.traverse(c => {
          c.castShadow = true;
        });
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    const animloader = new FBXLoader(manager);
    // LOAD ANIMATIONS
    animloader.load(Idle, (anim) => {        
        animationsMap.set('Idle', mixer.clipAction(anim.animations[0]));
        animationsMap.get(currentAction).play();
    });
    animloader.load(Walk_forward, (anim) => {
        animationsMap.set('Walk_forward', mixer.clipAction(anim.animations[0]));
    });    
    animloader.load(Walk_forward_left, (anim) => {
        animationsMap.set('Walk_forward_left', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Walk_forward_right, (anim) => {
        animationsMap.set('Walk_forward_right', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Walk_backward, (anim) => {
        animationsMap.set('Walk_backward', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Walk_backward_left, (anim) => {
        animationsMap.set('Walk_backward_left', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Walk_backward_right, (anim) => {
        animationsMap.set('Walk_backward_right', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Walk_left, (anim) => {
        animationsMap.set('Walk_left', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Walk_right, (anim) => {
        animationsMap.set('Walk_right', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Run_forward, (anim) => {
        animationsMap.set('Run_forward', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Run_forward_left, (anim) => {
        animationsMap.set('Run_forward_left', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Run_forward_right, (anim) => {
        animationsMap.set('Run_forward_right', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Run_backward, (anim) => {
        animationsMap.set('Run_backward', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Run_backward_left, (anim) => {
        animationsMap.set('Run_backward_left', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Run_backward_right, (anim) => {
        animationsMap.set('Run_backward_right', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Run_left, (anim) => {
        animationsMap.set('Run_left', mixer.clipAction(anim.animations[0]));
    });
    animloader.load(Run_right, (anim) => {
        animationsMap.set('Run_right', mixer.clipAction(anim.animations[0]));
    });
});

// CONTROLS
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false
};
document.addEventListener('keydown', (event) => {
    switch(event.keyCode) {
        case 87: // w
            keys.forward = true;
        break;
        case 65: // a
            keys.left = true;
        break;
        case 83: // s
            keys.backward = true;
        break;
        case 68: // d
            keys.right = true;
        break;
        case 16: // shift
            keys.shift = true;
        break;
    }
}, false);

document.addEventListener('keyup', (event) => {
    switch(event.keyCode) {
        case 87: // w
            keys.forward = false;
        break;
        case 65: // a
            keys.left = false;
        break;
        case 83: // s
            keys.backward = false;
        break;
        case 68: // d
            keys.right = false;
        break;
        case 16: // shift
            keys.shift = false;
        break;
    }
}, false);

// CLOCK
const clock = new THREE.Clock();

// ANIMATE
function animate() {
    const delta = clock.getDelta();
    orbitControls.update();
    update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

document.body.appendChild(renderer.domElement);
animate();

// UPDATE ANIMATIONS
function update(delta) {

    // UUSIKSI !!!
    var play = 'Idle';
    if (keys.forward) {
        play = 'Walk_forward';
        if (keys.shift) {
            play = 'Run_forward';
        }
        if (keys.left) {
            play = 'Walk_forward_left';
            if (keys.shift) {
                play = 'Run_forward_left';
            }
        }
        else if (keys.right) {
            play = 'Walk_forward_right';
            if (keys.shift) {
                play = 'Run_forward_right';
            }
        }
    }
    else if (keys.backward) {
        play = 'Walk_backward';
        if (keys.shift) {
            play = 'Run_backward';
        }
        if (keys.left) {
            play = 'Walk_backward_left';
            if (keys.shift) {
                play = 'Run_backward_left';
            }
        }
        else if (keys.right) {
            play = 'Walk_backward_right';
            if (keys.shift) {
                play = 'Run_backward_right';
            }
        }
    }
    else if (keys.left) {
        play = 'Walk_left';
        if (keys.shift) {
            play = 'Run_left';
        }
    }
    else if (keys.right) {
        play = 'Walk_right';
        if (keys.shift) {
            play = 'Run_right';
        }
    }

    if (currentAction != play) {
        const toPlay = animationsMap.get(play);
        const current = animationsMap.get(currentAction);

        current.fadeOut(fadeDuration);
        toPlay.reset().fadeIn(fadeDuration).play();

        currentAction = play;
        
    }

    if (mixer) {
        mixer.update(delta);
    }

    if (model) {
        // Calculate towards camera direction
        var angleYCameraDirection = Math.atan2(
            (camera.position.x - model.position.x),
            (camera.position.z - model.position.z)
        );
        // Diagonal movement angle offset
        var directionOffset = Math.PI; // w

        // Rotate model
        rotateQuarternion.setFromAxisAngle(rotateAngle, angleYCameraDirection + directionOffset);
        model.quaternion.rotateTowards(rotateQuarternion, 0.75);

        // Calculate direction
        camera.getWorldDirection(walkDirection);

        // Run / Walk velocity
        switch(currentAction) {
            case 'Walk_forward':
                walkDirection.y = 0;
                velocity = walkVelocity;
            break;
            case 'Walk_forward_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 4);
                walkDirection.y = 0;
                velocity = walkVelocity;
            break;
            case 'Walk_forward_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 4);
                walkDirection.y = 0;
                velocity = walkVelocity;
            break;
            case 'Walk_backward':
                walkDirection.y = 0;
                velocity = -walkVelocity;
            break;
            case 'Walk_backward_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 4 + Math.PI / 2);
                walkDirection.y = 0;
                velocity = walkVelocity;
            break;
            case 'Walk_backward_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 4 - Math.PI / 2);
                walkDirection.y = 0;
                velocity = walkVelocity;
            break;
            case 'Walk_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 2);
                walkDirection.y = 0;
                velocity = walkVelocity;
            break;
            case 'Walk_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 2);
                walkDirection.y = 0;
                velocity = walkVelocity;
            break;
            case 'Run_forward':
                velocity = runVelocity;
            break;
            case 'Run_forward_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 4);
                walkDirection.y = 0;
                velocity = runVelocity;
            break;
            case 'Run_forward_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 4);
                walkDirection.y = 0;
                velocity = runVelocity;
            break;
            case 'Run_backward':
                velocity = -runVelocity;
            break;
            case 'Run_backward_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 4 + Math.PI / 2);
                walkDirection.y = 0;
                velocity = runVelocity;
            break;
            case 'Run_backward_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 4 - Math.PI / 2);
                walkDirection.y = 0;
                velocity = runVelocity;
            break;
            case 'Run_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 2);
                walkDirection.y = 0;
                velocity = runVelocity;
            break;
            case 'Run_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 2);
                walkDirection.y = 0;
                velocity = runVelocity;
            break;
            default:
                velocity = 0;
            break;
        }
        

        // Move model & camera
        const moveX = walkDirection.x * velocity * delta;
        const moveZ = walkDirection.z * velocity * delta;
        model.position.x += moveX;
        model.position.z += moveZ;

        // Move camera
        camera.position.x += moveX;
        camera.position.z += moveZ;

        // Update camera target
        cameraTarget.x = model.position.x;
        cameraTarget.y = model.position.y + 1;
        cameraTarget.z = model.position.z;
        orbitControls.target = cameraTarget;
    }
}

