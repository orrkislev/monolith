import * as p5 from 'p5'
import { renderer } from './general'
import { random, noise, choose } from '../utils'

export function doImageProcess() {
    new p5((p) => {
        p.setup = () => {
            p.createCanvas(Math.round(p.windowWidth * random(.5, 1)), p.windowHeight)
            p.noLoop()
            p.angleMode(p.DEGREES)
            p.background(255, 0, 0)
            p.drawingContext.drawImage(renderer.domElement, p.width / 2 - renderer.domElement.width / 2, 0)
            document.body.removeChild(renderer.domElement)
        }
        p.draw = () => {
            p.loadPixels()
            const d = p.pixelDensity()

            const colorFunc = choose([p.colorCool, p.colorWarm, p.colorRainbow, p.colorFade, p.colorGray, p.colorRotate, p.colorNone])
            // const colorFunc = p.colorGray
            for (let i = 0; i < p.pixels.length; i += 4) {
                const x = (i / 4) % (p.width * d)
                const y = p.floor((i / 4) / (p.width * d))

                const [r,g,b] = colorFunc(p.pixels[i], p.pixels[i + 1], p.pixels[i + 2], i%10000==0)
                p.pixels[i] = r
                p.pixels[i + 1] = g
                p.pixels[i + 2] = b

                p.pixels[i] = Math.max(Math.min(p.pixels[i], 255), 30)
                p.pixels[i+1] = Math.max(Math.min(p.pixels[i+1], 255), 30)
                p.pixels[i+2] = Math.max(Math.min(p.pixels[i+2], 255), 30)

                let val = 0
                val = noise.noise2D(200 * x / p.width, 200 * y / p.width) * 1
                val += noise.noise2D(100 * x / p.width, 100 * y / p.width) * 1
                val += noise.noise2D(50 * x / p.width, 50 * y / p.width) * 1
                val += noise.noise2D(25 * x / p.width, 25 * y / p.width) * 1
                val += noise.noise2D(10 * x / p.width, 10 * y / p.width) * 1
                val += noise.noise2D(5 * x / p.width, 5 * y / p.width) * 1
                val += noise.noise2D(2 * x / p.width, 2 * y / p.width) * 1

                val += noise.noise2D(1000 * x / p.width, 1000 * y / p.width) * 20 - 10

                val -= noise.noise2D(.3 * x / p.width, .3 * y / p.width) ** 2 * 150

                p.pixels[i] += val
                p.pixels[i+1] += val
                p.pixels[i+2] += val
            }
            p.updatePixels()

            // for (let i = 0; i < 150; i++) {
            //     p.stroke(random() ** 2 * 255, 30)
            //     const pos = p.createVector(random()**2*p.width, random()**2*p.height)
            //     const dir = p.createVector(random(-1, 1), random(-1, 1)).mult(random(3))
            //     const startSize = random(5)
            //     const l = random(10)
            //     for (let j = 0; j < l; j++) {
            //         p.strokeWeight(p.map(j, 0, l, startSize, 0))
            //         p.line(pos.x, pos.y, pos.x, pos.y)
            //         pos.add(dir)
            //         dir.rotate(random(-25, 25))
            //     }
            // }
            // for (let i = 0; i < 6; i++) {
            //     p.stroke(random() ** 2 * 255, 2)
            //     const pos = p.createVector(random(p.width), random(p.height))
            //     const dir = p.createVector(random(-1, 1), random(-1, 1))
            //     const startSize = 3
            //     const l = random(50, 500)
            //     for (let j = 0; j < l; j++) {
            //         p.strokeWeight(p.map(j, 0, l, startSize, startSize - 2))
            //         p.line(pos.x, pos.y, pos.x, pos.y)
            //         pos.add(dir)
            //         dir.rotate(random(-5, 5))
            //     }
            // }

            // for (let i=0;i<3;i++){
            //     p.stroke(255, 30)
            //     const pos = p.createVector(random(p.width), random(p.height))
            //     if (random() < .5) pos.x = p.round(pos.x/p.width) * p.width
            //     else pos.y = p.round(pos.y/p.height) * p.height

            //     const dir = p5.Vector.sub(pos, p.createVector(p.width/2, p.height/2)).normalize().mult(-1)
            //     const startSize = 3
            //     const l = random(50, 500)
            //     for (let j = 0; j < l; j++) {
            //         p.strokeWeight(p.map(j, 0, l, startSize, startSize - 2))
            //         p.line(pos.x, pos.y, pos.x, pos.y)
            //         pos.add(dir)
            //         dir.rotate(random(-5, 5))
            //     }
            // }

            // for (let i=0;i<2;i++){
            //     const pos1 = p.createVector(0, random(p.height))
            //     const pos2 = p.createVector(p.width, random(p.height))
            //     const d = p5.Vector.dist(pos1, pos2)
            //     for (let j=0;j<d;j++){
            //         const pos = p5.Vector.lerp(pos1, pos2, j/d)
            //         p.strokeWeight(random(5) + noise.noise2D(pos.x/p.width, pos.y/p.height))
            //         p.stroke(0,noise.noise2D(50*pos.x/p.width, 50*pos.y/p.height) * 30)
            //         p.line(pos.x+2, pos.y+3, pos.x+2, pos.y+3)
            //         p.stroke(255, random(5) + noise.noise2D(pos.x/p.width, pos.y/p.height)*25)
            //         p.line(pos.x, pos.y, pos.x, pos.y)
            //         pos1.add(random(0,random(-3,3)))
            //         pos2.add(random(0,random(-3,3)))
            //     }
            // }

            p.erase()
            p.noFill()
            p.strokeWeight(100)
            p.rect(0,0,p.width,p.height,20)
            p.strokeWeight(30)
            p.rect(40,40,p.width-80,p.height-80,40)
            p.noErase()
        }

        p.colorCool = (r,g,b)=>{
            p.colorMode(p.RGB)
            const clr1 = p.color(r, g, b)
            p.colorMode(p.HSB, 360)
            const clr = p.color(p.hue(clr1), p.saturation(clr1), p.brightness(clr1))
            p.colorMode(p.RGB)
            return [p.red(clr), p.green(clr), p.blue(clr)]
        }
        p.colorGray = (r,g,b)=>{
            const clr1 = p.color(r, g, b)
            p.colorMode(p.HSB)
            const clr = p.color(p.hue(clr1), 0, p.brightness(clr1))
            p.colorMode(p.RGB)
            return [p.red(clr), p.green(clr), p.blue(clr)]
        }
        p.colorFade = (r,g,b)=>{
            const clr1 = p.color(r, g, b)
            const hue = Math.round(p.hue(clr1))
            const saturation = Math.max(Math.round(p.saturation(clr1))-20,0)
            const lightness = Math.round(p.lightness(clr1))
            const clr = p.color( `hsl(${ hue }, ${ saturation }%, ${ lightness }%)`)
            return [p.red(clr), p.green(clr), p.blue(clr)]
        }
        p.colorRotate = (r,g,b)=>{
            const clr1 = p.color(r, g, b)
            const hue = (Math.round(p.hue(clr1)) + 180) % 360
            const saturation = Math.round(p.saturation(clr1))
            const lightness = Math.round(p.lightness(clr1))
            const clr = p.color( `hsl(${ hue }, ${ saturation }%, ${ lightness }%)`)
            return [p.red(clr), p.green(clr), p.blue(clr)]
        }
        p.colorNone = (r,g,b)=>{
            return [r,g,b]
        }
        p.colorWarm = (r,g,b)=>{
            const clr1 = p.color(r, g, b)
            const clr = p.lerpColor(clr1, p.color(255,0,0), .2)
            return [p.red(clr), p.green(clr), p.blue(clr)]
        }
        p.colorRainbow = (r,g,b)=>{
            const clr1 = p.color(r, g, b)
            const hue = (Math.round(p.hue(clr1))*20) % 360
            const saturation = Math.min(Math.round(p.saturation(clr1)) + 50,100)
            const lightness = Math.round(p.lightness(clr1))
            const clr = p.color( `hsl(${ hue }, ${ saturation }%, ${ lightness }%)`)
            return [p.red(clr), p.green(clr), p.blue(clr)]
        }
    })
}