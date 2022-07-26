import * as p5 from 'p5'
import { renderer } from './general'
import { random, noise, choose } from '../utils'
import { postShader } from './post/post'

export function doImageProcess() {
    new p5((p) => {
        let shdr = null
        p.setup = () => {
            const ratio = 3 / 4
            if (p.windowHeight / ratio < p.windowWidth) p.createCanvas(Math.round(p.windowHeight / ratio), Math.round(p.windowHeight))
            else p.createCanvas(Math.round(p.windowWidth), Math.round(p.windowWidth * ratio))

            const img = p.createGraphics(p.width, p.height, p.P2D)
            const scaleImg = p.height / renderer.domElement.height
            const scaledImgWidth = renderer.domElement.width * scaleImg
            if (random()<.5) img.drawingContext.drawImage(renderer.domElement, p.width / 2 - scaledImgWidth / 2, 0, scaledImgWidth, p.height)
            else {
                img.scale(-1,1)
                img.drawingContext.drawImage(renderer.domElement, -p.width / 2 + scaledImgWidth / 2, 0, -scaledImgWidth, p.height)
                img.resetMatrix()
            }
            document.body.removeChild(renderer.domElement)

            const grph = p.createGraphics(p.width, p.height, p.WEBGL)
            shdr = grph.createShader(postShader.vertexShader, postShader.fragmentShader)
            grph.shader(shdr)
            shdr.setUniform('tex0', img)
            shdr.setUniform('time', random(1000))
            shdr.setUniform('resolution', [p.width, p.height])
            shdr.setUniform('gray', random()<0.95)
            grph.rect(img,-p.width/2,-p.height/2, p.width, p.height)

            p.image(grph,0,0)
            
            p.stroke(255)
            p.noFill()
            p.strokeWeight(100)
            p.rect(0,0, p.width, p.height, 20)
            p.strokeWeight(30)
            p.rect(40,40, p.width - 80, p.height - 80, 40)

            fxpreview()
        }
    })
}