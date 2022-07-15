import * as THREE from 'three'
import { noise } from '../utils'
import { createdBlobs } from './blob'
import { scene } from './general'
import { SnakeGeometry } from './snakeGeometry'
import { blobTexture, earthWormTexture, waterTexture } from './textures'


const snakeRadius = 30

export function createSnake(){
    for (let i = 0; i < 350; i++) trail()

    // for (let i=0;i<30;i++) trailPoints[i].dist = (1-i/30)*50
    trailPoints = trailPoints.map(p=>p.point.add(p.normal.multiplyScalar(p.dist)))

    trailPoints = trailPoints.filter((_, i) => i % 2 == 0)
    trailPoints = trailPoints.filter((_, i) => i % 2 == 0)

    const curve = new THREE.CatmullRomCurve3(trailPoints)
    // const tubeGeo = new THREE.TubeBufferGeometry(curve, trailPoints.length * 4, snakeRadius, 32, false)
    const snakeGeo = new SnakeGeometry(curve, trailPoints.length * 4, [3,snakeRadius,snakeRadius,snakeRadius,snakeRadius,3], 32, false)
    // const snakeGeoInner = new SnakeGeometry(curve, trailPoints.length * 4, [0,25,25,25,25,0], 32, false)


    const earthWormWaterTexture = new THREE.TextureLoader().load(earthWormTexture)
    earthWormWaterTexture.repeat.x = earthWormWaterTexture.repeat.y = 3
    const earthWorm_Material = new THREE.MeshPhysicalMaterial({
        clearcoat: 1, clearcoatRoughness: 0.1,
        reflectivity: .7,
        metalness: 0.2, roughness: 0.3,
        color: 0xffffff,
        map: earthWormTexture,
        side: THREE.DoubleSide,
        bumpMap: blobTexture, bumpScale: 1.2,
    })

    const tube = new THREE.Mesh(snakeGeo, earthWorm_Material)
    tube.castShadow = true;
    tube.receiveShadow = true;
    scene.add(tube)

    // const snakeInner = new THREE.Mesh(snakeGeo, new THREE.MeshPhysicalMaterial({
    //     transmission: 1, thickness: 10, roughness: 0, color: 0xccffcc,
    // }))
    // scene.add(snakeInner)
}

export function initTrail(intersect, dir){
    if (intersect) intersection = intersect
    if (dir) trailDir = dir
}
export let trailPoints = []

let intersection = null, trailDir = null, trailDirNoiseVal = 0
export function trail() {
    if (intersection == null) {
        const ray = new THREE.Raycaster(new THREE.Vector3(500, 300, 0), new THREE.Vector3(-1, 0, 0), 1, 2000)
        const intersects = ray.intersectObject(createdBlobs[0])
        if (intersects.length > 0) {
            intersection = intersects[0]
            trailDir = new THREE.Vector2(.5, 0)
        }
    } else {
        // scene.add(new THREE.ArrowHelper(intersection.face.normal, intersection.point, 10, 0xffffff,10,10))
        const rayStart = intersection.point.clone().add(intersection.face.normal.clone().multiplyScalar(10))
        
        const raySpherical = new THREE.Spherical().setFromVector3(intersection.face.normal)
        raySpherical.phi += trailDir.x
        raySpherical.theta += trailDir.y
        trailDir.rotateAround(new THREE.Vector2(0, 0), noise.noise2D(trailDirNoiseVal, 0) * .1)
        trailDirNoiseVal += .01
        const rayDir = new THREE.Vector3().setFromSpherical(raySpherical).multiplyScalar(-1)
        const ray = new THREE.Raycaster(rayStart, rayDir, 1, 2000)
        const intersects = ray.intersectObject(createdBlobs[0])
        if (intersects.length > 0) {
            const ind = trailPoints.findIndex(p => p.point.distanceTo(intersects[0].point) < 20)
            if (ind < trailPoints.length - 30) return
            // if (intersection.point.y > 0)
                trailPoints.push({ point: intersection.point.clone(), normal: intersection.face.normal, dist: snakeRadius/2 })
            intersection = intersects[0]
        }
        // else console.log('no intersection 2')
    }
}