import * as THREE from 'three'
import { scene, camera, isNight } from './general.js'
import { random, noise, choose, map } from '../utils.js';
import { blobTexture } from './textures.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector'
import { fogMaterial } from './post/bgShader';

export const terrainHeight = random(10, 100)
const valley = random() < 0.5

const withWater = random() < 0.5
const waterHeight = -100 + random(terrainHeight-5)

const withAlien = random() < 0.5
const alienType = choose(['rocks','glass'])
const isFloating = random()<.5

const twoMonoliths = random() < .2
const threeMonoliths = twoMonoliths && random() < .1
const rotatedMonolith = terrainHeight<70 ? random() < .3 : false

const withKey = rotatedMonolith ? false : random() < 0.1

const moreObject = choose(['cylinder', 'cube', false])

export function initFeatures(){
    window.$fxhashFeatures = {
        "Luminescence": isNight ? '100%' : '0%',
        "Planet": withAlien ? (isFloating ? "floating " : '') + alienType : 'Earth-like',
        "Bodies": twoMonoliths ? (threeMonoliths ? "three" : "two") : "one",
        "Photography": rotatedMonolith ? '3/4' : 'straight-on',
        "Mass": Math.ceil(terrainHeight/20)*20*650 + 'KG',
        "Radiometric Dating": choose(['unknown','unavailable','irrelevant']),
        "H2O Resistance": withWater ? '100%' : '0%',
    }
    console.log(window.$fxhashFeatures)
}


let terrainMesh
export function terrain() {
    const groundColor = choose([0xc8d77e, 0xdea68d, 0xfff689, 0x92ad13, 0xff0000])
    const material = new THREE.MeshPhysicalMaterial({
        color: groundColor,
        map: blobTexture,
        envMapIntensity: 0.2,
    })

    const planeGeometry2 = new THREE.PlaneGeometry(600, 1000, 2000, 2000)
    for (let i = 0; i < planeGeometry2.attributes.position.count; i++) {
        const x = planeGeometry2.attributes.position.getX(i)
        const y = planeGeometry2.attributes.position.getY(i)
        planeGeometry2.attributes.position.setZ(i, getTerrainHeignt(x, y, false))
    }
    terrainMesh = new THREE.Mesh(planeGeometry2, material)
    terrainMesh.receiveShadow = true
    terrainMesh.castShadow = true
    terrainMesh.rotation.x = -Math.PI / 2
    scene.add(terrainMesh)
    terrainMesh.updateWorldMatrix()

    if (withWater) {
        const seaGeometry = new THREE.PlaneGeometry(1000, 1000, 1000, 1000)
        const seaMaterial = new THREE.ShadowMaterial({})
        const seaMesh = new THREE.Mesh(seaGeometry, seaMaterial)
        seaMesh.receiveShadow = true
        seaMesh.rotation.x = -Math.PI / 2
        seaMesh.position.y = waterHeight+1
        scene.add(seaMesh)

        const mirrorBack1 = new Reflector(
            new THREE.PlaneBufferGeometry(1000, 1000), {
            color: new THREE.Color(0x333333),
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio
        })
        mirrorBack1.position.set(0, waterHeight, 0)
        mirrorBack1.rotation.x = -Math.PI / 2
        mirrorBack1.renderToScreen = true
        scene.add(mirrorBack1)
    }

    camera.position.y = Math.max(getTerrainHeignt(camera.position.x, camera.position.z) + 30, -50)
    camera.lookAt(0, 0, 0)
}

const terrainRandoms = [random() < .8, random() < .9, random() < .7, random() < .5]
const terrainVal = [random(.5,1), random(), random()]
const rotatedSinRandom = random(Math.PI * 2)
const terrainRotation = random() * Math.PI * 2
const terrainNoiseOffset = [random(10), random(10), random(10), random(10)]

function getTerrainHeignt(posx, posz, considerWater = true) {
    const cos = Math.cos(terrainRotation)
    const sin = Math.sin(terrainRotation)
    const x = posx * cos - posz * sin
    const z = posx * sin + posz * cos

    let val = 0
    if (terrainRandoms[0]) val += noise.noise2D(x / 800+terrainNoiseOffset[0], z / 800+terrainNoiseOffset[1])
    if (terrainRandoms[1]) val += noise.noise2D(x / 300, z / 300) * 0.5
    if (terrainRandoms[2]) val += noise.noise2D(x / 100, z / 100) * 0.3
    if (terrainRandoms[3]) val += Math.abs(Math.cos(rotatedSinRandom + x / 100)) / 2 + Math.abs(Math.sin(rotatedSinRandom + z / 100)) / 2
    val += noise.noise2D(x / 300 + 15, z / 300 + 8) * noise.noise2D(x*3, z*3) * 0.15 * terrainVal[0]

    if (terrainHeight > 40) {
        if (Math.abs(posx) <= 100) {
            if (posz > 0) val *= .3 + ((Math.abs(posx) / 100) ** 2) * .7
            else {
                const d = Math.sqrt(posx ** 2 + posz ** 2)
                if (d <= 100) val *= .3 + d / 100 * .7
            }
        }
    }
    if (valley) val *= map(posz,500,-500,0,1)
    val = val * terrainHeight - 100
    if (considerWater && withWater) val = Math.max(val, waterHeight)
    return val
}

export function monolith() {
    const geometry = new THREE.BoxBufferGeometry(20, 250, 40,50,50,50)
    const materialOptions = {
        color: isNight ? 0xffffff : 0x111111,
        fog: false,
        envMapIntensity: 0.1,
    }
    const material = new THREE.MeshBasicMaterial(materialOptions)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true


    if (withKey){
        const rectGeo = new THREE.PlaneBufferGeometry(1,240,15,39)
        const rectMesh = new THREE.Mesh(rectGeo, new THREE.MeshBasicMaterial({color:isNight?0x111111:0xffffff, fog:false, side:THREE.DoubleSide}))
        rectMesh.position.set(9.9+random(.2),0,0)
        rectMesh.rotation.y = Math.PI/2
        mesh.add(rectMesh)
    }

    mesh.position.set(0, -50, 0)
    mesh.rotation.y = Math.PI / 2
    if (rotatedMonolith) {
        mesh.rotation.y = Math.PI / 6
        mesh.position.x = -75
    }
    scene.add(mesh)

    if (twoMonoliths) {
        const mesh2 = mesh.clone()
        mesh2.position.set(100, -50, 300)
        scene.add(mesh2)
    }

    if (threeMonoliths) {
        const mesh3 = mesh.clone()
        mesh3.position.set(-100, -50, 500)
        if (rotatedMonolith) mesh3.position.x = 0
        scene.add(mesh3)
    }

    if (isNight) {
        const rectLight = new THREE.PointLight(0xffffff, 4, 200);
        const pos = mesh.position.clone()
        if (rotatedMonolith){
            pos.x += Math.cos(mesh.rotation.y) * 25
            pos.z += Math.sin(mesh.rotation.z) * 25
        } else pos.z -= 25
        rectLight.position.set(pos.x, getTerrainHeignt(pos.x, pos.z) + 30, pos.z);
        rectLight.castShadow = true;
        scene.add(rectLight)
    }
}

export function fog() {
    const geo = new THREE.PlaneBufferGeometry(1000, 600, 1, 1)
    for (let i = 0; i < 4; i++) {
        const mat = fogMaterial()
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.z = 200 * i + (rotatedMonolith ? 25 : 0)
        mesh.position.y = 150
        scene.add(mesh)
    }
}

export function more() {
    if (moreObject == false) return
    const obj = new THREE.Group()
    obj.position.set(0, -50, 0)

    let geometry
    if (moreObject == 'cylinder') geometry = new THREE.CylinderBufferGeometry(2, 5, 10, 8)
    else geometry = new THREE.BoxBufferGeometry(20, 20, 20, 8)

    const material = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        flatShading: true,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    obj.add(mesh)
    for (let i = 0; i < 100; i++) {
        const newObj = obj.clone()
        const x = random(-500, 500)
        const z = random(-800, 300)
        newObj.position.set(x, getTerrainHeignt(x, -z), z)
        newObj.rotation.set(random(-.3, .3), random(-3.14, 3.14), random(-.3, .3))
        if (moreObject == 'cube') newObj.rotation.set(random(-3, 3), random(-3.14, 3.14), random(-3, 3))
        scene.add(newObj)
    }

    const sphereGeometry = new THREE.SphereBufferGeometry(2, 8, 8)
    const sohereMesh = new THREE.Mesh(sphereGeometry, material)
    for (let i = 0; i < 100; i++) {
        const newObj = sohereMesh.clone()
        const x = random(-500, 500)
        const z = random(-800, 300)
        newObj.position.set(x, getTerrainHeignt(x, -z), z)
        scene.add(newObj)
    }
}

export function alienTerrain() {
    if (!withAlien) return

    let alienMesh
    if (alienType === 'rocks') {
        const geo = new THREE.SphereBufferGeometry(50, 100, 100)
        for (let i = 0; i < geo.attributes.position.count; i++) {
            const x = geo.attributes.position.getX(i)
            const y = geo.attributes.position.getY(i)
            const z = geo.attributes.position.getZ(i)
            geo.attributes.position.setY(i, y * (.5 + noise.noise2D(x / 15, z / 15) * .5) * (isFloating ? 1 : 4))
        }
        geo.attributes.position.needsUpdate = true
        alienMesh = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
            color: 0x555555, displacementMap: blobTexture, displacementScale: 10,
        }))
    } else if (alienType === 'glass') {
        const knotGeometry = new THREE.TorusKnotBufferGeometry(30, 24, 100, 32)
        alienMesh = new THREE.Mesh(knotGeometry, new THREE.MeshPhysicalMaterial({
            roughness: 0, transmission: 1, thickness: 50, color: 0x999999,
        }))
    }

    const alienMeshScale = random(.5, 1)
    alienMesh.rotation.set(random(-1.5, 1.5), random(-3.14, 3.14), random(-1.5, 1.5))
    alienMesh.castShadow = true
    alienMesh.receiveShadow = true

    const elementsSum = random(1,5)
    for (let i = 0; i < elementsSum; i++) {
        const newAlienMesh = alienMesh.clone()
        newAlienMesh.rotation.x = newAlienMesh.rotation.x + random(-.8, .8)
        newAlienMesh.rotation.y = newAlienMesh.rotation.y + random(-.8, .8)
        newAlienMesh.rotation.z = newAlienMesh.rotation.z + random(-.8, .8)
        const a = random(Math.PI)
        newAlienMesh.position.set(Math.cos(a) * 150, -100, Math.sin(a) * 150 + random(500))
        const newMeshScale = alienMeshScale * random(.5, 1.2)
        newAlienMesh.scale.set(newMeshScale, newMeshScale, newMeshScale)
        if (isFloating) newAlienMesh.position.y += getTerrainHeignt(newAlienMesh.position.x, newAlienMesh.position.z) + random(100, 300)
        scene.add(newAlienMesh)
    }
}