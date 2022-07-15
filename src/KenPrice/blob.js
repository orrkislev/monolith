import * as THREE from 'three'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'
import { scene } from './general.js'
import { random } from '../utils'
import { blobTexture, waterTexture } from './textures.js';


export let createdBlobs = []
export let m_c, allBalls = []

const resolution = 140
const isolation = 50


function getBlobMaterial() {
    let material = new THREE.MeshPhysicalMaterial({
        clearcoat: .5, clearcoatRoughness: .7,
        // clearcoat: 1, clearcoatRoughness: 0.6, clearcoatRoughnessMap: waterTexture,
        reflectivity: .7,
        metalness: 0.2, roughness: .4,
        // metalness: 0, roughness: 0,
        color: 0xffffff,
        map: blobTexture,
        bumpMap: blobTexture, bumpScale: 1.2,
        side: THREE.DoubleSide,
    });

    return material
}



export async function blob(sumBalls) {
    allBalls = []
    m_c = new MarchingCubes(resolution, getBlobMaterial(), true, true, 100000);
    m_c.isolation = isolation;
    // randomMountain()
    randomDrops(sumBalls)

    
    m_c.addPlaneY(2, 50);

    m_c.update()
    for (let i = 0; i < m_c.geometry.attributes.uv.count; i++) {
        const normalY = m_c.geometry.attributes.normal.getY(i)
        if (Math.abs(normalY) < 10) {
            const u = m_c.geometry.attributes.uv.getX(i)
            const v = m_c.geometry.attributes.uv.getY(i)
            m_c.geometry.attributes.uv.setX(i, u + (1 - normalY / 10) * random(-.01, .01) * .5)
            m_c.geometry.attributes.uv.setY(i, v + (1 - normalY / 10) * random(-.01, .01) * .5)
        }
    }

    m_c.castShadow = true;
    m_c.receiveShadow = true;
    m_c.scale.set(700, 700, 700)
    m_c.position.y += 550
    scene.add(m_c);
    m_c.updateWorldMatrix()
    createdBlobs.push(m_c)

    return m_c
}

// function newShape() {
//     for (let a = 0; a < 360; a += 30) {
//         const ps = [
//             new THREE.Vector3(.2, .15, .2),
//             new THREE.Vector3(.3, .25, .3),
//             new THREE.Vector3(.5, .35, .5),
//             new THREE.Vector3(.5, .5, .5),
//         ]
//         ps.forEach(p => {
//             p.x = Math.cos(a * Math.PI / 180) * (p.x - 0.5) + 0.5 + random(-0.05, 0.05)
//             p.z = Math.sin(a * Math.PI / 180) * (p.z - 0.5) + 0.5 + random(-0.05, 0.05)
//         })
//         const path = new THREE.CatmullRomCurve3(ps)
//         const points = path.getPoints(60)
//         for (let i = 0; i < points.length; i++) {
//             const point = points[i]
//             const r = map(i, 0, points.length, 10, 1) / 100 + random(.01)
//             addBall(point.x, point.y, point.z, r, 10)
//         }
//     }
//     const ps = [
//         new THREE.Vector3(.5, .3, .5),
//         new THREE.Vector3(.5, .5, .5),
//         new THREE.Vector3(.6, .8, .6),
//         new THREE.Vector3(.3, .4, .6),
//         new THREE.Vector3(.1, .2, .7),
//     ]
//     const path = new THREE.CatmullRomCurve3(ps)
//     const points = path.getPoints(60)
//     for (let i = 0; i < points.length; i++) {
//         const point = points[i]
//         const r = map(i, 0, points.length, 20, 5) / 100 + random(.01)
//         addBall(point.x, point.y, point.z, r, 10)
//     }
// }

function randomDrops(sumBalls) {
    for (let i = 0; i < sumBalls; i++) {
        const a = random(360)
        const x = Math.cos(a * Math.PI / 180) * random(.1) + .5
        const z = Math.sin(a * Math.PI / 180) * random(.1) + .5
        const strengh = random(.05, .1)
        dropBall(x, z, strengh, 10)
    }
}

function randomMountain() {
    for (let y = 0; y < .5; y += .05) {
        for (let a = 0; a < 360; a += 15) {
            const radius = map(y, 0, .5, 30, 0) / 100
            const x = Math.cos(a * Math.PI / 180) * radius + .5
            const z = Math.sin(a * Math.PI / 180) * radius + .5
            const s = map(y, 0, 0.5, 7, 2) / 100 + random(-0.1, .1)
            addBall(x, y + random(.2), z, s, 10, false)
        }
    }
}

function dropBall(x, z, strengh, subtract) {
    const ballPos = new THREE.Vector3(x, 0, z)
    if (allBalls.length > 0) {
        let tries = 0
        while (tries++ < 100) {
            const closest = allBalls.reduce((a, b) => a.pos.distanceTo(ballPos) < b.pos.distanceTo(ballPos) ? a : b)
            if (closest.pos.distanceTo(ballPos) < (strengh + closest.strengh) / 3) {
                ballPos.y += 0.01
            } else {
                addBall(x, ballPos.y, z, strengh, subtract)
                return
            }
        }
    } else {
        addBall(x, ballPos.y, z, strengh, subtract)
    }
}

export function addBall(x, y, z, strengh, subtract, withTiny = true) {
    allBalls.push({ pos: new THREE.Vector3(x, y, z), strengh: strengh, subtract: subtract })
    m_c.addBall(x, y, z, strengh, subtract)

    if (withTiny && random() < .5) {
        for (let i = 0; i < 3; i++) {
            const u = (Math.random() - 0.5) * 2;
            const t = Math.random() * Math.PI * 2;
            const f = Math.sqrt(1 - u ** 2);
            m_c.addBall(
                x + f * Math.cos(t) * strengh * .5,
                y + f * Math.sin(t) * strengh * .5,
                z + u * strengh * .5,
                strengh / 10, subtract
            )
        }
    }
}

function map(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}