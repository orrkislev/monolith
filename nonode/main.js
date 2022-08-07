let scene, renderer, camera, sun

async function init3D() {
    scene = new THREE.Scene()
    if (isNight) scene.fog = new THREE.FogExp2(0x000000, 0.0012)
    else scene.fog = new THREE.FogExp2(0x555555, 0.0012)

    camera = new THREE.PerspectiveCamera(25, 2, 0.1, 4000)
    camera.position.z = -600

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setSize(2000,1000)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(renderer.domElement)

    
    // ---------------------- CLOUDS -------------------------------------------------

    const geometry = new THREE.BoxBufferGeometry(1500, 600, 1000)
    let uniforms = {
        color: { value: new THREE.Color(0xb6ddf0) },
        brightness: { value: random(.3,1) },
        offset: { value: random(100) },
        cover: { value: random() },
        scale: { value: random()*5},
        opacity: { value: random(0.5, 1) },
        weirdness: { value: (random()**2)*14+1 },
        yscale: { value: random()*random()*10 },
        isFog: { value: false },
    }
    if (isNight){
        uniforms.cover.value = 0
        uniforms.opacity.value =  .2
    }
    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: bgShader.vertexShader,
        fragmentShader: bgShader.fragmentShader,
        side: THREE.BackSide
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = 100
    scene.add(mesh)
}

function makeEnvMap(){
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();

    const CCtarget = new THREE.WebGLCubeRenderTarget(4096, {
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        encoding: THREE.sRGBEncoding
    });
    const CC = new THREE.CubeCamera(1, 3000, CCtarget);
    CC.position.y = 100
    CC.update(renderer, scene);
    const envtex = pmremGenerator.fromCubemap(CCtarget.texture).texture;
    scene.background = null
    scene.environment = envtex
}

function lights() {
    if (terrainHeight < 50 && random()<.3) return

    let sunIntensity = isNight ? 1 : random(10,20)
    sun = new THREE.DirectionalLight(0xffffff, sunIntensity)
    const r = random(-Math.PI)
    sun.position.set(400 * Math.cos(r), 50, 400 * Math.sin(r))
    sun.castShadow = true
    sun.shadow.mapSize.width = 4096
    sun.shadow.mapSize.height = 4096
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 1400
    const shadowSize = 1000
    sun.shadow.camera.left = -shadowSize
    sun.shadow.camera.right = shadowSize
    sun.shadow.camera.top = shadowSize
    sun.shadow.camera.bottom = -shadowSize
    scene.add(sun)
}

function render() {
    renderer.render(scene, camera)
}