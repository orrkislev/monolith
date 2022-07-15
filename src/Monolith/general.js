import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js'
import { bgShader } from './post/bgShader.js'
import { random, noise } from '../utils.js'
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js'
import { doImageProcess } from './imageProcess.js'

const debug = false

export let scene, renderer, camera
let controls, composer, cameraGroup
let bgScene, bgCamera

export async function init() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0xbbbbbb)
    scene.fog = new THREE.Fog(0xbbbbbb, 500, 1700)

    camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 4000)

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true})
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    initPostProcess()

    document.body.appendChild(renderer.domElement)

    if (debug){
        controls = new OrbitControls(camera, renderer.domElement)
        controls.update()
    }
    background()
}

function background() {
    bgScene = new THREE.Scene()
    // orthographic camera
    bgCamera = new THREE.OrthographicCamera(
        window.innerWidth / -2, window.innerWidth / 2,
        window.innerHeight / 2, window.innerHeight / -2,
        -1000, 1000
    )
    bgCamera.position.z = 1000
    bgCamera.updateProjectionMatrix()
    // background
    const geometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight, 1, 1)
    const material = new THREE.ShaderMaterial({
        uniforms: {
            vTime: { value: random(100) },
            cloudcover: { value: random() },
            cloudscale: { value: random() },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        vertexShader: bgShader.vertexShader,
        fragmentShader: bgShader.fragmentShader
    })
    const mesh = new THREE.Mesh(geometry, material)
    bgScene.add(mesh)
}


function initPostProcess() {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(new ShaderPass(VignetteShader))
}

export function lights() {
    const light = new THREE.DirectionalLight(0xbbbbbb, 5)
    light.position.set(400, 50, 400)
    light.castShadow = true
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 1000
    const shadowSize = 2048
    light.shadow.camera.left = -shadowSize
    light.shadow.camera.right = shadowSize
    light.shadow.camera.top = shadowSize
    light.shadow.camera.bottom = -shadowSize
    scene.add(light)
}

export function render() {
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(bgScene, bgCamera);
    renderer.render(scene, camera)
}

export function animate() {
    if (debug){
        requestAnimationFrame(animate)
        controls.update()
    }

    // composer.render()
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(bgScene, bgCamera);
    renderer.render(scene, camera)

    if (!debug) doImageProcess()
}

export function makeEnvMap() {
    scene.background = new THREE.Color(0x333333)
    // const gen = new PMREMGenerator(renderer)
    // const envMap = gen.fromScene(scene,0,1,8000)
    // scene.environment = envMap
    // scene.background = envMap
    // gen.dispose()

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();

    const CCtarget = new THREE.WebGLCubeRenderTarget(4096, {
        // format: THREE.RGBEFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        encoding: THREE.sRGBEncoding
    });

    const CC = new THREE.CubeCamera(1, 3000, CCtarget);

    CC.update(renderer, scene);

    const envtex = pmremGenerator.fromCubemap(CCtarget.texture).texture;
    scene.background = null
    scene.environment = envtex
}