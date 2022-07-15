import { Vector3, CatmullRomCurve3, BufferGeometry, LineBasicMaterial, Raycaster, Line } from "three"
import { random } from "../utils"
import { createdBlobs } from "./blob"
import { scene } from "./general"

let hairMaterial
export function addHair(sum) {
    if (createdBlobs.length === 0) return
    for (let i = 0; i < sum; i++) {
        const thisBlob = createdBlobs[0]
        const r = random()*500
        const a = random(Math.PI * 2)
        const posX = r * Math.cos(a)
        const posY = r * Math.sin(a)
        const rayStart = new Vector3(posX, 1500, posY)
        const rayDirection = new Vector3(0, -1, 0)
        const ray = new Raycaster(rayStart, rayDirection, 0, 1000)
        const intersects = ray.intersectObject(thisBlob)
        if (intersects.length > 0) {
            const l = random(15)
            const ps = [
                new Vector3(0, 0, 0),
                new Vector3(random(-l, l) * .25, random(-l, l) * .25, random(-l, l) * .25),
                new Vector3(random(-l, l) * .5, random(-l, l) * .5, random(-l, l) * .5),
                new Vector3(random(-l, l) * .75, random(-l, l) * .75, random(-l, l) * .75),
            ]
            ps.forEach(p => p.add(intersects[0].point))
            const curve = new CatmullRomCurve3(ps)
            const geometry = new BufferGeometry().setFromPoints(curve.getPoints(30))
            if (!hairMaterial) hairMaterial = new LineBasicMaterial({ color: random()<0.5 ? 0x000000 : 0xffffff, transparent: true, opacity: 0.3 });
            const line = new Line(geometry, hairMaterial)
            scene.add(line)
        }
    }
}