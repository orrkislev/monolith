import * as THREE from 'three'
import { scene, camera } from './general.js'
import { random, noise, choose } from '../utils.js';

const withWater = random() < 0.5

export function terrain() {
    const groundColor = choose([0xc8d77e, 0xdea68d, 0xfff689, 0x92ad13])
    const material = new THREE.MeshStandardMaterial({ color: groundColor })

    const planeGeometry2 = new THREE.PlaneGeometry(1000, 1000, 2000, 2000)
    for (let i = 0; i < planeGeometry2.attributes.position.count; i++) {
        const x = planeGeometry2.attributes.position.getX(i)
        const y = planeGeometry2.attributes.position.getY(i)
        const zOffset = getZ(x, y)
        planeGeometry2.attributes.position.setZ(i, zOffset)
    }
    const planeMesh2 = new THREE.Mesh(planeGeometry2, material)
    planeMesh2.receiveShadow = true
    planeMesh2.castShadow = true
    planeMesh2.rotation.x = -Math.PI / 2
    planeMesh2.position.y = -100
    scene.add(planeMesh2)

    if (withWater){
        const seaGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1)
        const seaMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff, roughness: .2 , transmission: 0.5, thickness: 300 })
        const seaMesh = new THREE.Mesh(seaGeometry, seaMaterial)
        seaMesh.receiveShadow = true
        seaMesh.rotation.x = -Math.PI / 2
        seaMesh.position.y = -80
        scene.add(seaMesh)
    }

    const radius = 600
    const angle = Math.PI * 2 * random()
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    camera.position.set(x, getZ(x, y), y)
    camera.lookAt(0, 0, 0)
}

const terrainRandoms = [random()<.8, random()<.9,random()<.7,random()<.5,random()<.4,random()<.5,random()<.5]
function getZ(x, y) {
    let val = 0
    if (terrainRandoms[0]) val += noise.noise2D(x / 800, y / 800)
    if (terrainRandoms[1]) val += noise.noise2D(x / 100, y / 100) * 0.3
    if (terrainRandoms[2]) val += Math.abs(Math.sin(x / 100))
    if (terrainRandoms[3]) val += noise.noise2D((x + 200) / 800, (y - 200) / 800) * Math.abs(Math.sin(y / 20)) * noise.noise2D(x / 1, y / 1) * .5
    if (terrainRandoms[4])  val += noise.noise2D(x / 10, y / 10) * ((noise.noise2D((x + 100) / 500, (y + 100) / 500)) ** 2) * .5
    if (terrainRandoms[5]) val += noise.noise2D(x / 1, y / 1) * ((noise.noise2D((x + 400) / 800, (y + 400) / 800)) ** 2) * .3
    if (terrainRandoms[5]) val += noise.noise2D(x / 1, y / 1) * 0.5
    return val * 20
}

export function ball(pos, size, res = 6) {
    const geometry = new THREE.SphereBufferGeometry(size, res, res)
    const material = new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.position.set(pos.x, pos.y, pos.z)
    scene.add(mesh)
    return mesh
}

export function monolith() {
    // return
    let geometry 
    const r = choose(['monolith', 'sphere'])
    if (r == 'monolith') geometry = new THREE.BoxBufferGeometry(20, 250, 40)
    else if (r == 'sphere') geometry = new THREE.SphereBufferGeometry(60, 32, 32)
    const material = new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff, 
        roughness: 0.1, metalness: 1.0, 
        transmission: 0.5, thickness: 40, 
        clearcoat: 1, clearcoatRoughness: 0.5 
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.position.set(0, -50, 0)
    mesh.rotation.set(random(-.1, .1), random(-3.14, 3.14), random(-.1, .1))
    scene.add(mesh)
}

export function more() {

    
    // for (let i=0;i<50;i++){
    //     const geometry = cylinder(10,10,20)
    //     const mesh = createMesh(geometry, new THREE.MeshStandardMaterial({color: 0xdea68d}))
    //     const x = random(-500,500)
    //     const y = random(-500,500)
    //     const z = getZ(x,y)
    //     mesh.position.set(x,z-100,y)
    //     mesh.rotation.set(Math.PI/2,0,random(-3.14,3.14))
    // }
}



function revolve(ps) {
    const curve = new THREE.CatmullRomCurve3(ps)
    const points = curve.getPoints(50)
    const geometry = new THREE.LatheGeometry(points, 50)
    return geometry
}
function cylinder(r1, r2, h, hollow = false) {
    const ps = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(r1 - .5, 0, 0),
        new THREE.Vector3(r1, .5, 0),
        new THREE.Vector3(r2, h-0.5, 0),
    ]
    if (hollow){
        ps.push(new THREE.Vector3(r2-.5,h,0))
        ps.push(new THREE.Vector3(r1-1,1.5,0))
        ps.push(new THREE.Vector3(r1-2,1,0))
        ps.push(new THREE.Vector3(0,1,0))
    } else {
        ps.push(new THREE.Vector3(r2-.5,h,0))
        ps.push(new THREE.Vector3(0,h,0))
    }
    return revolve(ps)
}
function createMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
    return mesh
}