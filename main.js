import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { RapierPhysics } from 'three/examples/jsm/Addons.js';
import { RapierHelper } from 'three/examples/jsm/helpers/RapierHelper.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { TGALoader } from 'three/addons/loaders/TGALoader.js'
import { Player, Rifle, Idle, Walk_forward, Walk_forward_left, Walk_forward_right, Walk_backward, Walk_backward_left, Walk_backward_right, Walk_left, Walk_right, Run_forward, Run_forward_left, Run_forward_right, Run_backward, Run_backward_left, Run_backward_right, Run_left, Run_right } from './references.js';

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
let physics;
let physicsHelper;
let characterController;
let player;

// STATS
const stats = Stats();
document.body.appendChild(stats.dom);

// MANAGER
const manager = new THREE.LoadingManager();
manager.addHandler( /\.tga$/i, new TGALoader() );

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;
camera.position.z = -15;
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
orbitControls.maxDistance = 5;
orbitControls.enablePan = false;
orbitControls.minPolarAngle = Math.PI / 2.5;
orbitControls.maxPolarAngle = Math.PI / 2.5;
cameraTarget.x = 0;
cameraTarget.y = 1;
cameraTarget.z = 0;
orbitControls.target = cameraTarget;
orbitControls.update();

// LIGHTS
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0, 12.5, 12.5);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.25);
scene.add(ambientLight);

// GROUND MESH
const groundGeo = new THREE.BoxGeometry(50, 0.5, 50);
const groundMat = new THREE.MeshBasicMaterial({color: 'Gray'});
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.position.y = - 0.25;
groundMesh.userData.physics = { mass: 0 };
scene.add(groundMesh);

// MODEL CHARACTER & ANIMATIONS
let modelCharacter;
let mixer;
let rightHand;
const animationsMap = new Map();
const FBXloader1 = new FBXLoader(manager);
FBXloader1.load(Player, (fbx) => {
    modelCharacter = fbx;
    modelCharacter.scale.setScalar(0.01);
    modelCharacter.traverse(c => {
        if (c.name === 'mixamorigRightHand') {
            rightHand = c;
        }
    });
    scene.add(modelCharacter);
    mixer = new THREE.AnimationMixer(modelCharacter);
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

// MODEL RIFLE
let modelRifle;
const FBXloader2 = new FBXLoader(manager);
FBXloader2.load(Rifle, (fbx) => {
    modelRifle = fbx;
    modelRifle.scale.setScalar(0.01);
    scene.add(modelRifle);
});

// CONTROLS
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false
};

// KEYDOWN EVENTLISTENER
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

// KEYUP EVENTLISTENER
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

initPhysics();

// CLOCK
const clock = new THREE.Clock();

// ANIMATE
function animate() {
    stats.update();
    if ( physicsHelper ) {
        physicsHelper.update();
    }
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

    if (modelCharacter) {
        // Calculate towards camera direction
        var angleYCameraDirection = Math.atan2(
            (camera.position.x - modelCharacter.position.x),
            (camera.position.z - modelCharacter.position.z)
        );
        // Diagonal movement angle offset
        var directionOffset = Math.PI; // w

        // Rotate modelCharacter
        rotateQuarternion.setFromAxisAngle(rotateAngle, angleYCameraDirection + directionOffset);
        modelCharacter.quaternion.rotateTowards(rotateQuarternion, 0.75);

        // Calculate direction
        camera.getWorldDirection(walkDirection);

        // Run / Walk velocity
        switch(currentAction) {
            case 'Walk_forward':
                velocity = walkVelocity;
            break;
            case 'Walk_forward_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 4);
                velocity = walkVelocity;
            break;
            case 'Walk_forward_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 4);
                velocity = walkVelocity;
            break;
            case 'Walk_backward':
                walkDirection.y = 0;
                velocity = -walkVelocity;
            break;
            case 'Walk_backward_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 4 + Math.PI / 2);
                velocity = walkVelocity;
            break;
            case 'Walk_backward_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 4 - Math.PI / 2);
                velocity = walkVelocity;
            break;
            case 'Walk_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 2);
                velocity = walkVelocity;
            break;
            case 'Walk_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 2);
                velocity = walkVelocity;
            break;
            case 'Run_forward':
                velocity = runVelocity;
            break;
            case 'Run_forward_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 4);

                velocity = runVelocity;
            break;
            case 'Run_forward_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 4);
                velocity = runVelocity;
            break;
            case 'Run_backward':
                velocity = -runVelocity;
            break;
            case 'Run_backward_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 4 + Math.PI / 2);
                velocity = runVelocity;
            break;
            case 'Run_backward_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 4 - Math.PI / 2);
                velocity = runVelocity;
            break;
            case 'Run_left':
                walkDirection.applyAxisAngle(rotateAngle, Math.PI / 2);
                velocity = runVelocity;
            break;
            case 'Run_right':
                walkDirection.applyAxisAngle(rotateAngle, -Math.PI / 2);
                velocity = runVelocity;
            break;
            default:
                velocity = 0;
            break;
        }
        

        // Move modelCharacter & camera
        if (characterController) {
            const moveX = walkDirection.x * velocity * delta;
            const moveZ = walkDirection.z * velocity * delta;
            const moveVector = new THREE.Vector3(moveX, 0, moveZ);
            characterController.computeColliderMovement( player.userData.collider, moveVector );
            const translation = characterController.computedMovement();
            const position = player.userData.collider.translation();
            position.x += translation.x;
            position.y += translation.y;
            position.z += translation.z;
            player.userData.collider.setTranslation(position);
            // Sync Three.js mesh with Rapier collider
            player.position.set(position.x, position.y, position.z);
            modelCharacter.position.x = player.position.x;
            modelCharacter.position.y = player.position.y - 1;
            modelCharacter.position.z = player.position.z;

            // Move camera
            camera.position.x += moveX;
            camera.position.z += moveZ;

            // Update camera target
            cameraTarget.x = player.position.x;
            cameraTarget.y = player.position.y + 1;
            cameraTarget.z = player.position.z;
            orbitControls.target = cameraTarget;
        }

        if (rightHand && modelRifle) {
            rightHand.getWorldPosition(modelRifle.position);            
            modelRifle.setRotationFromQuaternion(modelCharacter.quaternion);
            modelRifle.rotateX(-Math.PI / 2);
        }

    }
}

function addCharacterController() {

    // Character Capsule
    const geometry = new THREE.CapsuleGeometry( 0.4, 1, 8, 8 );
    const material = new THREE.MeshStandardMaterial( { color: 0x0000ff } );
    player = new THREE.Mesh( geometry, material );
    player.visible = false;
    player.position.set( 0, 1, 0 );
    scene.add( player );

    // Rapier Character Controller
    characterController = physics.world.createCharacterController( 0.01 );
    characterController.setApplyImpulsesToDynamicBodies( true );
    characterController.setCharacterMass( 3 );
    const colliderDesc = physics.RAPIER.ColliderDesc.capsule( 0.5, 0.4 ).setTranslation( 0, 1, 0 );
    player.userData.collider = physics.world.createCollider( colliderDesc );

}

async function initPhysics() {

    //Initialize physics engine using the script in the jsm/physics folder
    physics = await RapierPhysics();

    //Optionally display collider outlines
    physicsHelper = new RapierHelper( physics.world );
    scene.add( physicsHelper );

    physics.addScene( scene );

    addCharacterController( );

}

// TEST BOX
let fixed = true; // true = box and false = ball
const geometry = ( fixed ) ? new THREE.BoxGeometry( 15, 15, 5 ) : new THREE.SphereGeometry( 0.25 );
const material = new THREE.MeshStandardMaterial( { color: fixed ? 0xFF0000 : 0x00FF00 } );

const mesh = new THREE.Mesh( geometry, material );

mesh.position.set( 15, 0, 15 );

mesh.rotation.set(Math.PI / 3, 0, 0);

mesh.userData.physics = { mass: fixed ? 0 : 0.5, restitution: fixed ? 0 : 0.3 };

scene.add( mesh );