import { init, animate, render, scene } from "./general";
import { blob } from "./blob";
import { postProcess } from "./imageProcess";
import { softBodyTest } from "./viscosity";
import * as THREE from 'three';
import { createSnake } from "./snake";
import { createHouse } from "./house";

export function run() {
    main()
}

async function main() {
    await init()
    // softBodyTest()
    const blob1 = await blob(50)
    // createSnake()
    createHouse()
    // const blob2 = await blob(50)
    // blob1.rotateZ(Math.PI)


    // const geometry2 = new THREE.IcosahedronGeometry(200, 15);
    // const material2 = new THREE.MeshPhysicalMaterial({
    //     roughness: 0, transmission: .9, thickness: 200, color: 0xff00ff,
    // });
    // const mesh2 = new THREE.Mesh(geometry2, material2);
    // mesh2.position.y += 400
    // scene.add(mesh2);

    // blob1.position.y+=100


    animate()
    // render()
    // postProcess()
}