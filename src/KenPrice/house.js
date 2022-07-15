import * as THREE from 'three';
import { random } from '../utils';
import { createdBlobs } from './blob';
import { scene } from './general';
import { initTrail, trail, trailPoints  } from './snake';

export async function createHouse() {
    const rayStart = new THREE.Vector3(0, 1500, 0)
    const rayDirection = new THREE.Vector3(0, -1, 0)
    const ray = new THREE.Raycaster(rayStart, rayDirection, 0, 2000)
    const intersects = ray.intersectObject(createdBlobs[0])
    if (intersects.length > 0) {
        const cubeGeo = new THREE.BoxGeometry(25, 25, 25)
        const cubeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        const cube = new THREE.Mesh(cubeGeo, cubeMat)
        cube.position.copy(intersects[0].point)
        // cube.position.y -= 75
        // cube.rotation.x = intersects[0].face.normal.x
        cube.castShadow = true
        cube.receiveShadow = true
        scene.add(cube)

        initTrail(intersects[0], new THREE.Vector2(0, -1))
        for (let i = 0; i < 200; i++) {
            trail()
            initTrail(null, new THREE.Vector2(-.5, -.5))
        }


        trailPoints.forEach((tp,i)=>{
            const curve = new THREE.CatmullRomCurve3([
                tp.point.clone(), 
                tp.point.clone().add(tp.normal.multiplyScalar(random(3,8))),
            ])
            const tubeGeo = new THREE.TubeBufferGeometry(curve, 5, 1, 4, true)
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide })
            const tube = new THREE.Mesh(tubeGeo, tubeMat)
            tube.castShadow = true
            tube.receiveShadow = true
            scene.add(tube)
        })
    }
}