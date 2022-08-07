let terrainTexture, waterTexture

async function initTextures() {
    await createTerrainTexture()
    await createWaterTexture()
}


function createTerrainTexture() {
    if (terrainTexture) return terrainTexture
    return new Promise((resolve, reject) => {
        const txtr = createGraphics(2048, 2048)
        txtr.background(255)
        txtr.strokeWeight(4)
        txtr.colorMode(HSB)
        const startHue = 0
        for (let x = 0; x < width; x += 2) {
            for (let y = 0; y < height; y += 2) {
                txtr.stroke(((startHue + random(120)) % 360) * noise(x / 100, y / 100), random(60, 100), 100)
                txtr.line(x, y, x, y)
            }
        }
        if (random() < .3)
            for (let i = 0; i < 300; i++) {
                txtr.stroke(random(360), random(60, 100), 100)
                txtr.strokeWeight(1)
                txtr.line(random(txtr.width), random(txtr.height), random(txtr.width), random(txtr.height))
            }
        txtr.colorMode(txtr.RGB)
        if (random() < .3)
            for (let i = 0; i < 1000; i++) {
                txtr.stroke(0, random(40))
                txtr.strokeWeight(random(10, 50))
                txtr.point(random(width), random(height))
            }
        txtr.filter(GRAY)
        terrainTexture = new THREE.CanvasTexture(txtr.elt);
        terrainTexture.wrapS = THREE.RepeatWrapping;
        terrainTexture.wrapT = THREE.RepeatWrapping;
        terrainTexture.repeat.x = 5
        terrainTexture.repeat.y = 5
        txtr.remove()
        resolve(terrainTexture)
    })
}

async function createWaterTexture() {
    if (waterTexture) return waterTexture
    return new Promise((resolve, reject) => {
                const txtr = createGraphics(2048, 2048)
                txtr.background(255)
                txtr.strokeWeight(4)
                for (let x = 0; x < width; x += 2) {
                    for (let y = 0; y < height; y += 2) {
                        txtr.stroke(noise(x / 100, y / 100) * 255)
                        txtr.line(x, y, x, y)
                    }
                }
                waterTexture = new THREE.CanvasTexture(txtr.elt);
                waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping
                waterTexture.repeat.x = waterTexture.repeat.y = random(4, 40)
                txtr.remove()
                resolve(waterTexture)
    })
}