import { BackSide, ShaderMaterial } from "three"
import { random } from "../../utils";

const bgShader = {
    uniforms: {},
    vertexShader: /* glsl */`
        varying vec2 _uv;
		void main() {
            _uv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,
    fragmentShader: /* glsl */`
    uniform bool isFog;
    uniform vec3 color;
    uniform float brightness;
    uniform float offset;
    uniform float cover;
    uniform float scale;
    uniform float opacity;
    uniform float weirdness;

    varying vec2 _uv;

    const mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );    
    vec2 hash( vec2 p ) {
        p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
        return -1.0 + 2.0*fract(sin(p)*43758.5453123);
    }
    float noise( in vec2 p ) {
        const float K1 = 0.366025404; // (sqrt(3)-1)/2;
        const float K2 = 0.211324865; // (3-sqrt(3))/6;
        vec2 i = floor(p + (p.x+p.y)*K1);
        vec2 a = p - i + (i.x+i.y)*K2;
        vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0); //vec2 of = 0.5 + 0.5*vec2(sign(a.x-a.y), sign(a.y-a.x));
        vec2 b = a - o + K2;
        vec2 c = a - 1.0 + 2.0*K2;
        vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
        vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
        return dot(n, vec3(70.0));	
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
        uv = _uv;
        uv *= scale2;
        uv -= q - offset;
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
            float vignnete = -p.y * p.y * p.y + 1.0;
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

export { bgShader };

const fogWeirdness = random(1,15)
export function fogMaterial(){
    return new ShaderMaterial({
        uniforms : {
            offset: { value: random(100) },
            cover: { value: random() },
            scale: { value: random()*5},
            opacity: { value: random(0.2) },
            weirdness: { value: fogWeirdness },
            isFog: { value: true },
        },
        vertexShader: bgShader.vertexShader,
        fragmentShader: bgShader.fragmentShader,
        side: BackSide,
        transparent:true,
    })
}