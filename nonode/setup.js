let bottomText = ''

const isNight = random() < 0.25
const terrainHeight = random(10, 100)
const valley = random() < 0.5
const withWater = true//random() < 0.5
const waterHeight = -100 + random(terrainHeight - 5) / 2
const withAlien = random() < 0.5
const alienType = choose(['rocks', 'glass'])
const isFloating = random() < .5
const twoMonoliths = random() < .2
const threeMonoliths = twoMonoliths && random() < .1
const rotatedMonolith = terrainHeight < 70 ? random() < .3 : false
const withKey = rotatedMonolith ? false : random() < 0.1
const moreObject = choose(['cylinder', 'cube', false])

function initFeatures() {
    window.$fxhashFeatures = {
        "Luminescence": isNight ? '100%' : '0%',
        "Planet": withAlien ? (isFloating ? "floating " : '') + alienType : 'Earth-like',
        "Bodies": twoMonoliths ? (threeMonoliths ? "three" : "two") : "one",
        "Photography": rotatedMonolith ? '3/4' : 'front',
        "Mass": Math.ceil(terrainHeight / 20) ** 2 * 20 * 650 + 'kg',
        "Radiometric Dating": choose(['unknown', 'unavailable', 'irrelevant']),
        "H2O Resistance": withWater ? '100%' : '0%',
    }

    if (window.$fxhashFeatures['Bodies'] == "one") bottomText += 'MONOLITH      |'
    if (window.$fxhashFeatures['Bodies'] == "two") bottomText += '2 MONOLITHS      |'
    if (window.$fxhashFeatures['Bodies'] == "three") bottomText += '3 MONOLITHS      |'
    bottomText += `      ${window.$fxhashFeatures['Mass'].toUpperCase()}      |`
    if (isNight) bottomText += `     LUMINESCENT      |`
    bottomText += `      ${Math.round(random(-100, 1500))} K°      |`
    bottomText += `      ${window.$fxhashFeatures['Radiometric Dating'].toUpperCase()} DATE      `
    if (withWater) bottomText += `|      H2O RESISTANT      `

    console.log(window.$fxhashFeatures)
}

let canvas
async function setup() {
    // ---------------------- INIT CANVAS
    const ratio = 3 / 4
    if (windowHeight / ratio < windowWidth) 
        canvas = createCanvas(round(windowHeight / ratio), round(windowHeight), WEBGL)
    else canvas = createCanvas(round(windowWidth), round(windowWidth * ratio), WEBGL)
    noiseSeed(random(99999))

    initFeatures()

    await initTextures()
    init3D()
    lights()
    terrain()
    makeEnvMap()
    monolith()
    fog()
    more()
    alienTerrain()
    render()

    processImage()
}