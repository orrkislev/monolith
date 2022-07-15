import * as p5 from 'p5'
import * as THREE from 'three'
import { renderer, camera, scene } from './general'
import { random, noise, choose } from '../utils'
import * as paper from 'paper'

export function postProcess() {
    paper.setup()
    new p5((p) => {
        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight)
            p.noLoop()
            p.noStroke()
            p.angleMode(p.DEGREES)
            p.background(255, 0, 0)
            p.drawingContext.drawImage(renderer.domElement, 0, 0, p.width, p.height)
            document.body.removeChild(renderer.domElement)
        }
        p.draw = () => {
            return
            const newLayer = p.createGraphics(p.width, p.height)
            newLayer.stroke(255, 0, 0)

            let pos
            for (let y = 0; y < p.height; y += 1) {
                for (let x = 0; x < p.width; x += 1) {
                    const c = p.get(x, y)
                    if (c[0] > 0) {
                        pos = [x, y]
                        break
                    }
                }
                if (pos) break
            }
            const path = new paper.Path()
            const startPos = [...pos]

            const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
            let dirStart = 0

            for (let i = 0; i < 10000; i++) {
                path.add(new Point(pos[0], pos[1]))
                // newLayer.line(pos[0],pos[1],pos[0],pos[1])

                let foundBlack = false
                for (let dI = 0; dI < dirs.length; dI++) {
                    const d = dirs[(dirStart + dI + dirs.length) % dirs.length]
                    const x = pos[0] + d[0]
                    const y = pos[1] + d[1]
                    if (x < 0 || x >= p.width || y < 0 || y >= p.height) continue
                    const c = p.get(x, y)
                    if (c[0] == 0) foundBlack = true
                    else if (c[0] > 0) {
                        pos = [x, y]
                        dirStart = (dirStart + dI - 2 + dirs.length) % dirs.length
                        break
                    }
                }
                if (pos[0] == startPos[0] && pos[1] == startPos[1]) break
            }
            path.closePath()
            path.simplify(1)
            path.smooth()


            p.stroke(255, 0, 0)
            for (let i = 0; i < path.length; i++) {
                const point = path.getPointAt(i)
                p.strokeWeight(noise.noise2D(point.x / 100, point.y / 100) * 2 + 2)
                p.line(point.x, point.y, point.x, point.y)
            }
        }
    })
}



