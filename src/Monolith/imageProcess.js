import * as p5 from 'p5'
import { renderer } from './general'
import { random, noise, choose } from '../utils'
import { postShader, revealShader } from './post/post'
import { bottomText } from './Objects'

export function doImageProcess() {
    new p5((p) => {
        let shdr2 = null
        let img = null
        let revealNoiseOffset = random(1000)
        p.setup = () => {
            const ratio = 3 / 4
            let canvas
            if (p.windowHeight / ratio < p.windowWidth) canvas = p.createCanvas(Math.round(p.windowHeight / ratio), Math.round(p.windowHeight), p.WEBGL)
            else canvas = p.createCanvas(Math.round(p.windowWidth), Math.round(p.windowWidth * ratio), p.WEBGL)
            canvas.elt.style.display = 'none'
            document.getElementsByTagName("main")[0].appendChild(canvas.elt);


            p.noSmooth()

            img = p.createGraphics(p.width, p.height, p.P2D)
            img.noSmooth()
            const scaleImg = p.height / renderer.domElement.height
            const scaledImgWidth = renderer.domElement.width * scaleImg
            if (random() < .5) img.drawingContext.drawImage(renderer.domElement, p.width / 2 - scaledImgWidth / 2, 0, scaledImgWidth, p.height)
            else {
                img.scale(-1, 1)
                img.drawingContext.drawImage(renderer.domElement, -p.width / 2 + scaledImgWidth / 2, 0, -scaledImgWidth, p.height)
                img.resetMatrix()
            }
            document.body.removeChild(renderer.domElement)

            const shdr = p.createShader(postShader.vertexShader, postShader.fragmentShader)
            p.shader(shdr)
            shdr.setUniform('tex0', img)
            shdr.setUniform('time', random(1000))
            shdr.setUniform('resolution', [p.width, p.height])
            shdr.setUniform('gray', random() < 0.92)
            p.rect(img, -p.width / 2, -p.height / 2, p.width, p.height)

            img.image(p.get(), 0, 0)

            img.stroke(255)
            img.noFill()
            const scl = p.width / 2000
            img.strokeWeight(100 * scl)
            img.rect(0, 0, p.width, p.height, 20 * scl)
            img.strokeWeight(30 * scl)
            img.rect(40 * scl, 40 * scl, p.width - 80 * scl, p.height - 80 * scl, 40 * scl)
            img.textFont('Helvetica')
            img.fill(0)
            img.noStroke()
            img.textSize(20 * scl)
            img.textAlign(p.CENTER, p.CENTER)
            img.text(bottomText, p.width / 2, p.height - 30 * scl)
            

            shdr2 = p.createShader(revealShader.vertexShader, revealShader.fragmentShader)
            p.shader(shdr2)

            p.clear()
            canvas.elt.style.display = 'block'
            document.getElementById('loading').style.display = 'none'
        }
        p.draw = () => {
            p.clear()
            shdr2.setUniform('tex0', img)
            shdr2.setUniform('noiseOffset', revealNoiseOffset)
            revealNoiseOffset += 0.0001
            shdr2.setUniform('exposure', p.frameCount / 200)
            p.rect(img, -p.width / 2, -p.height / 2, p.width, p.height)
            const val = (p.frameCount / 200) * 255
            document.body.style.backgroundColor = `rgb(${val}, ${val}, ${val})`
            if (p.frameCount == 200) {
                p.noLoop()
                fxpreview()
            }
        }
    })
}
