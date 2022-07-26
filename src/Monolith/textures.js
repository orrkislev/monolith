import * as THREE from 'three'
import * as p5 from 'p5'
import { random, noise} from '../utils'

export let blobTexture, waterTexture, earthWormTexture

export async function initTextures() {
    await createTexture()
    // await createWaterTexture()
    // await createEarthWormTexture()
}

async function createTexture() {
    if (blobTexture) return blobTexture
    return new Promise((resolve, reject) => {
        new p5((p) => {
            p.setup = () => {
                p.noiseSeed(random(99999))
                const canvas = p.createCanvas(2048, 2048)
                p.background(255)
                p.strokeWeight(4)
                p.colorMode(p.HSB)
                const startHue = 0 // random(360)
                for (let x = 0; x < p.width; x += 2) {
                    for (let y = 0; y < p.height; y += 2) {
                        p.stroke(((startHue + random(120)) % 360) * p.noise(x / 100, y / 100), random(60, 100), 100)
                        p.line(x, y, x, y)
                    }
                }
                if (random()<.3)
                    for (let i=0;i<300;i++){
                        p.stroke(random(360), random(60, 100), 100)
                        p.strokeWeight(1)
                        p.line(random(p.width), random(p.height), random(p.width), random(p.height))
                    }
                p.colorMode(p.RGB)
                if (random()<.3)
                    for (let i=0;i<1000;i++){
                        p.stroke(0, random(40))
                        p.strokeWeight(random(10,50))
                        p.point(random(p.width), random(p.height))
                    }
                p.filter(p.GRAY)
                blobTexture = new THREE.CanvasTexture(p.canvas);
                blobTexture.wrapS = THREE.RepeatWrapping;
                blobTexture.wrapT = THREE.RepeatWrapping;
                blobTexture.repeat.x = 5
                blobTexture.repeat.y = 5
                canvas.remove()
                resolve(blobTexture)
            }
        })
    })
}

async function createWaterTexture() {
    if (waterTexture) return waterTexture
    return new Promise((resolve, reject) => {
        new p5((p) => {
            p.setup = () => {
                p.noiseSeed(random(99999))
                const canvas = p.createCanvas(2048, 2048)
                p.background(255)
                p.strokeWeight(4)
                for (let x = 0; x < p.width; x += 2) {
                    for (let y = 0; y < p.height; y += 2) {
                        p.stroke(noise.noise2D(x / 100, y / 100) * 255)
                        p.line(x, y, x, y)
                    }
                }
                waterTexture = new THREE.CanvasTexture(p.canvas);
                waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping
                waterTexture.repeat.x = waterTexture.repeat.y = 4
                canvas.remove()
                resolve(waterTexture)
            }
        })
    })
}

async function createEarthWormTexture() {
    if (earthWormTexture) return earthWormTexture
    return new Promise((resolve, reject) => {
        new p5((p) => {
            p.setup = () => {
                p.noiseSeed(random(99999))
                const canvas = p.createCanvas(256, 256)
                p.background(255)
                p.strokeWeight(4)
                // p.colorMode(p.HSB)
                const c1 = p.color(255)
                const c2 = p.color(0)
                for (let x = 0; x < p.width; x += 2) {
                    for (let y = 0; y < p.height; y += 2) {
                        const d = p.abs(x-p.height/2)/(p.height/2)
                        p.stroke(p.lerpColor(c1, c2, random(d)))
                        p.line(x, y, x, y)
                    }
                }
                earthWormTexture = new THREE.CanvasTexture(p.canvas);
                earthWormTexture.wrapS = THREE.RepeatWrapping;
                earthWormTexture.wrapT = THREE.RepeatWrapping;
                earthWormTexture.repeat.x = 60
                earthWormTexture.repeat.y = 3
                canvas.remove()
                resolve(earthWormTexture)
            }
        })
    })
}