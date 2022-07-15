import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { postProcess } from './imageProcess';
import { random } from '../utils';
import { initTextures } from './textures';
import { addHair } from './hair';
import { updatePhysics } from './viscosity';


export let scene, renderer, camera, effectRender
let controls, clock

export async function init() {
    await initTextures()
    clock = new THREE.Clock()


    document.body.style.background = "radial-gradient(circle, rgba(204,194,204,1) 0%, rgba(100,110,110,1) 62%, rgba(31,31,31,1) 100%)"
    document.body.style.background = 
        "radial-gradient(circle, #F3904F 0%, #3B4371 62%, #1F1F1F 100%)"
        

    scene = new THREE.Scene();

    if (true){
        camera = new THREE.OrthographicCamera(-500,500, 1000, 0, 1, 10000);
        camera.position.set(0,50,-1500);
    } else {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.set(- 500, 500, 1500);
        camera.lookAt(scene.position);
    }

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    renderer.setSize(Math.min(window.innerWidth, window.innerHeight),Math.min(window.innerWidth, window.innerHeight));
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.minDistance = 500;
    controls.maxDistance = 5000;
    controls.target.set(0, 50, 0);
    controls.maxPolarAngle = Math.PI/2
    controls.minPolarAngle = controls.maxPolarAngle
    controls.autoRotate = true
    controls.autoRotateSpeed = 1
    controls.maxZoom = 3
    controls.minZoom = 1
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.update();

    lights()
}

let lightGroup
export function lights() {
    lightGroup = new THREE.Group()
    scene.add(lightGroup)

    const sun = new THREE.DirectionalLight( 0x772200, .5 );
	sun.position.set( -500, 200, 0 );
	sun.castShadow = true;
	sun.shadow.camera.near = 1;
	sun.shadow.camera.far = 10000;
	sun.shadow.camera.left = -1000;
	sun.shadow.camera.right = 1000;
	sun.shadow.camera.top = 1000;
	sun.shadow.camera.bottom = -1000;
	sun.shadow.bias = -0.002;
	sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
    lightGroup.add(sun)

    // const light2 = new THREE.PointLight(0xaa7744, .5);
    // light2.position.set(300, 1000, 0);
    // light2.castShadow = true;
    // light2.shadow.camera.near = 1;
	// light2.shadow.camera.far = 10000;
	// light2.shadow.camera.left = -1000;
	// light2.shadow.camera.right = 1000;
	// light2.shadow.camera.top = 1000;
	// light2.shadow.camera.bottom = -1000;
	// light2.shadow.bias = -0.002;
	// light2.shadow.mapSize.width = light2.shadow.mapSize.height = 2048;
    // lightGroup.add(light2)


    const ambientLight = new THREE.AmbientLight(0x222222,.5);
    lightGroup.add(ambientLight)
}

let frameCount = 0
let keepRotating = true
let lastTime = 0
let hpf = 10
let totalHair = 0
export function animate() {
    if (totalHair<100000){
        const delta = (performance.now() - lastTime) / 1000
        const fps = 1 / delta
        if (fps < 60) hpf = Math.max(hpf - 1, 1)
        else hpf = hpf + 1
        lastTime = performance.now()
        addHair(hpf)
        totalHair += hpf
        // if (frameCount%50 == 0) console.log(fps, hpf, totalHair)
    }

    // trail()

    frameCount++
    requestAnimationFrame(animate)
    if (keepRotating && controls.autoRotateSpeed < 6) controls.autoRotateSpeed += random(.05)
    else {
        if (keepRotating) {
            keepRotating = false
            console.log("stopped rotating")
        }
        controls.autoRotateSpeed = controls.autoRotateSpeed * 0.999
        if (controls.autoRotateSpeed < 0.3) controls.autoRotate = false
    }
    // if (frameCount<50) requestAnimationFrame(animate)
    // else postProcess()
    render()
}

export function render() {
    controls.update()
    renderer.render(scene, camera)
}