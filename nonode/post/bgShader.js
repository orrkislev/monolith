const bgShader = {
    uniforms: {},
    vertexShader: /* glsl */`
        varying vec2 _uv;
		void main() {
            _uv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,
    fragmentShader: /* glsl */`
    precision mediump float;
    uniform bool isFog;
    uniform vec3 color;
    uniform float brightness;
    uniform float offset;
    uniform float cover;
    uniform float scale;
    uniform float opacity;
    uniform float weirdness;
    uniform float yscale;

    varying vec2 _uv;

    const mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );    

    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

    float noise(vec2 P){
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * 
        vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
    }
    
    float fbm(vec2 n) {
        float total = 0.0, amplitude = 0.1;
        for (int i = 0; i < 7; i++) {
            total += noise(n) * amplitude;
            n = m * n;
            amplitude *= 0.4;
        }
        return total;
    }
    
    void main() {
        vec2 p = _uv.xy;
        if (!isFog) {
            p.y = (1.0-p.y) * yscale;
        }
        vec2 uv = _uv * weirdness;
        float scale2 = scale + p.y;
        float q = fbm(uv * scale2 * 0.5);
        
        float r = 0.0;
        uv *= scale2;
        uv -= q - offset;
        float weight = 0.8;
        for (int i=0; i<8; i++){
            r += abs(weight*noise( uv ));
            uv = m*uv + offset;
            weight *= 0.7;
        }

        float f = 0.0;
        uv = _uv * scale2 - q + offset;
        weight = 0.7;
        for (int i=0; i<8; i++){
            f += weight*noise( uv );
            uv = m*uv + offset;
            weight *= 0.6;
        }
        
        f *= r + f;
        
        float c = 0.0;
        uv = _uv * scale2 * 2.0 - q + offset * 2.0;
        weight = 0.4;
        for (int i=0; i<7; i++){
            c += weight*noise( uv );
            uv = m*uv + offset * 2.0;
            weight *= 0.6;
        }
        uv = _uv * scale2 * 3.0 - q + offset * 3.0;
        weight = 0.4;
        for (int i=0; i<7; i++){
            c += abs(weight*noise( uv ));
            uv = m*uv + offset * 3.0;
            weight *= 0.6;
        }

        if (isFog) {
            vec3 fogColor = vec3(1.1, 1.1, 1.1) * clamp((0.9 + 1.0*c), 0.0, 1.0);
            f = cover + 8.0*f*r;
            float fogVal = clamp(f + c, 0.0, 1.0);
            float vignnete = 1. - pow(p.y, 2.);
            vec4 result = vec4(fogColor, fogVal * opacity * (1.0-p.y) * vignnete);
            gl_FragColor = result;
        } else {
            float bgVal =  mix(brightness * 0.4, brightness * 1.2, 1.0-_uv.y);
            vec3 bgColour = color * bgVal;
            vec3 cloudcolor = vec3(1.1, 1.1, 1.1) * clamp((0.65 + 0.3*c), 0.0, 1.0);
            f = cover + 8.0 * f * r;
            vec3 result = mix(bgColour, clamp(0.5 * bgColour + cloudcolor, 0.0, 1.0), clamp(f + c, 0.0, 1.0));
            result = mix(bgColour, result, opacity);
            gl_FragColor = vec4( result, 1.0 );
        }
    }
    `

};

let fogWeirdness
function getNewFogMaterial(){
    if (!fogWeirdness) fogWeirdness = random(1,15)
    return new THREE.ShaderMaterial({
        uniforms : {
            offset: { value: random(100) },
            cover: { value: random() },
            scale: { value: random()*5},
            opacity: { value: random(0.2) },
            weirdness: { value: fogWeirdness },
            yscale: { value: 1.0 },
            isFog: { value: true },
        },
        vertexShader: bgShader.vertexShader,
        fragmentShader: bgShader.fragmentShader,
        side: THREE.BackSide,
        transparent:true,
    })
}