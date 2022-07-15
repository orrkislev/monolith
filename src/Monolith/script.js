import { init, lights, animate, makeEnvMap, renderer, render } from './general.js'
import { terrain, ball, monolith, more } from './Objects.js'

export function run() {
    init()
    lights()

    terrain()
    makeEnvMap()
    monolith()
    more()

    animate()
}
// render()