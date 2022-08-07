let shdr2 = null
let img = null

function processImage() {
    noSmooth()

    img = createGraphics(width, height, P2D)
    img.noSmooth()
    const scaleImg = height / renderer.domElement.height
    const scaledImgWidth = renderer.domElement.width * scaleImg
    if (random() < .5) img.drawingContext.drawImage(renderer.domElement, width / 2 - scaledImgWidth / 2, 0, scaledImgWidth, height)
    else {
        img.scale(-1, 1)
        img.drawingContext.drawImage(renderer.domElement, -width / 2 + scaledImgWidth / 2, 0, -scaledImgWidth, height)
        img.resetMatrix()
    }
    document.body.removeChild(renderer.domElement)

    const shdr = createShader(postShader.vertexShader, postShader.fragmentShader)
    shader(shdr)
    shdr.setUniform('tex0', img)
    shdr.setUniform('time', random(1000))
    shdr.setUniform('resolution', [width, height])
    shdr.setUniform('gray', random() < 0.92)
    rect(img, -width / 2, -height / 2, width, height)

    img.image(get(), 0, 0)

    img.stroke(255)
    img.noFill()
    const scl = width / 2000
    img.strokeWeight(100 * scl)
    img.rect(0, 0, width, height, 20 * scl)
    img.strokeWeight(30 * scl)
    img.rect(40 * scl, 40 * scl, width - 80 * scl, height - 80 * scl, 40 * scl)
    img.textFont('Helvetica')
    img.fill(0)
    img.noStroke()
    img.textSize(14 * scl)
    img.textAlign(CENTER, CENTER)
    img.text(bottomText, width / 2, height - 30 * scl)


    shdr2 = createShader(revealShader.vertexShader, revealShader.fragmentShader)
    shader(shdr2)

    clear()
    document.getElementById('loading').style.display = 'none'
}

const revealNoiseOffset = random(1000)
function draw() {
    clear()
    shdr2.setUniform('tex0', img)
    shdr2.setUniform('noiseOffset', revealNoiseOffset)
    shdr2.setUniform('exposure', frameCount / 200)
    rect(img, -width / 2, -height / 2, width, height)
    const val = (frameCount / 200) * 255
    document.body.style.backgroundColor = `rgb(${val}, ${val}, ${val})`
    if (frameCount == 200) {
        noLoop()
        fxpreview()
    }
}