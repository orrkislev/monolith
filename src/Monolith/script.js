import { init, lights, render, makeEnvMap } from './general.js'
import { terrain, monolith, more, fog, alienTerrain } from './Objects.js'
import { initTextures } from './textures.js'

export async function run() {
    await initTextures()
    init()
    lights()
    terrain()
    makeEnvMap()
    monolith()
    fog()
    more()
    alienTerrain()
    render()
}