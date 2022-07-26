import { Color, UniformsUtils } from "three";
import { perlin3d } from "./shaderNoise";

const fogParsVert = `
#ifdef USE_FOG
  varying float fogDepth;
  varying vec3 vFogWorldPosition;
#endif
`;

const fogVert = `
#ifdef USE_FOG
  fogDepth = - mvPosition.z;
   vFogWorldPosition = (modelMatrix * vec4( transformed, 1.0 )).xyz;
#endif
`;

const fogFrag = `
#ifdef USE_FOG
  vec3 windDir = vec3(0.0, 0.0, time);
  vec3 scrollingPos = vFogWorldPosition.xyz + fogNoiseSpeed * windDir;  
  float noise = cnoise(fogNoiseFreq * scrollingPos.xyz);
  float vFogDepth = (1.0 - fogNoiseImpact * noise) * fogDepth;
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
#endif

`;

const fogParsFrag = `
#ifdef USE_FOG
  ${perlin3d}
	uniform vec3 fogColor;
  uniform vec3 fogNearColor;
	varying float fogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
  varying vec3 vFogWorldPosition;
  uniform float time;
  uniform float fogNoiseSpeed;
  uniform float fogNoiseFreq;
  uniform float fogNoiseImpact;
#endif
`


export default function editMaterial(material, nearColor=0x00ff00, fogNoiseFreq=.02, fogNoiseSpeed=0.5, fogNoiseImpact=.3) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace(
      `#include <fog_pars_vertex>`,
      fogParsVert
    );
    shader.vertexShader = shader.vertexShader.replace(
      `#include <fog_vertex>`,
      fogVert
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <fog_pars_fragment>`,
      fogParsFrag
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <fog_fragment>`,
      fogFrag
    );

	const uniforms = ({
		fogNearColor: { value: new Color(nearColor) },
		fogNoiseFreq: { value: fogNoiseFreq },
		fogNoiseSpeed: { value: fogNoiseSpeed },
		fogNoiseImpact: { value: fogNoiseImpact },
		time: { value: 0 }
	  });

	shader.uniforms = UniformsUtils.merge([shader.uniforms, uniforms]);
  };
}