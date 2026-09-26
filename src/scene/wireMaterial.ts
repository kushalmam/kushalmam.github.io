import * as THREE from "three";

/** Keep interaction uniforms available before Three compiles the physical shader. */
export function createWireMaterial(strand: number) {
  const uniforms = {
    uDark: { value: 0 }, uStrand: { value: strand }, uProgress: { value: 0 }, uScroll: { value: 0 },
    uMotion: { value: 1 }, uEnergy: { value: 0 }, uPointer: { value: new THREE.Vector2(10000, 10000) },
    uPointerStrength: { value: 0 }, uFocusY: { value: 10000 }, uFocusStrength: { value: 0 },
    uSignal: { value: new THREE.Vector3() },
  };
  const material = Object.assign(new THREE.MeshPhysicalMaterial({
    color: "#34695e", metalness: .58, roughness: .34,
    anisotropy: .35, clearcoat: .32, clearcoatRoughness: .3,
    side: THREE.FrontSide,
  }), { uniforms });
  material.customProgramCacheKey = () => "sculpted-wire-pbr-v1";
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = declarations + deformation + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("#include <beginnormal_vertex>", `
      #include <beginnormal_vertex>
      // Cofactors apply the inverse-transpose deformation to the normal.
      // Include cursor bending, so the reflected studio panels bend with the wire.
      vec3 origin = wireDeform(position);
      vec3 jx = (wireDeform(position + vec3(.2,0.,0.)) - origin) / .2;
      vec3 jy = (wireDeform(position + vec3(0.,.2,0.)) - origin) / .2;
      vec3 jz = vec3(0.,0.,1.);
      objectNormal = normalize(cross(jy,jz) * normal.x + cross(jz,jx) * normal.y + cross(jx,jy) * normal.z);
      #ifdef USE_TANGENT
        objectTangent = normalize(jx * tangent.x + jy * tangent.y + jz * tangent.z);
      #endif
    `).replace("#include <begin_vertex>", `
      vec3 transformed = wireDeform(position);
      vWirePosition = transformed;
      vWireUv = uv;
    `);
    shader.fragmentShader = declarations + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace("#include <roughnessmap_fragment>", `
      #include <roughnessmap_fragment>
      // Fine longitudinal brushing, filtered before it becomes subpixel shimmer.
      float brushPhase = vWireUv.y * 360. + sin(vWireUv.x * 90.) * .6;
      float brushFilter = 1. - smoothstep(.4, 2., fwidth(brushPhase));
      roughnessFactor = clamp(roughnessFactor + sin(brushPhase) * .035 * brushFilter
        + sin(vWireUv.x * 170. + uStrand) * .018, .22, .48);
    `).replace("#include <emissivemap_fragment>", `
      #include <emissivemap_fragment>
      float band = exp(-pow((vWireUv.x - uProgress) / .0045, 2.));
      float spill = exp(-length(vWirePosition - uSignal) / 30.);
      float activeStrand = 1. - step(.5, uStrand);
      vec3 mint = mix(vec3(.22,.65,.39), vec3(.35,.8,.6), uDark);
      float focus = exp(-pow((vWirePosition.y - uFocusY) / 66., 2.)) * uFocusStrength;
      totalEmissiveRadiance += (mint * (band * mix(.18, 1.4, activeStrand)
        + spill * mix(.04,.15,activeStrand)) + vec3(.06,.12,.10) * focus) * uMotion;
    `);
  };
  return material;
}
export type WireMaterial = ReturnType<typeof createWireMaterial>;

const declarations = /* glsl */`
  uniform float uDark, uStrand, uProgress, uScroll, uMotion, uEnergy;
  uniform vec2 uPointer;
  uniform float uPointerStrength, uFocusY, uFocusStrength;
  uniform vec3 uSignal;
  varying vec3 vWirePosition;
  varying vec2 vWireUv;
`;
const deformation = /* glsl */`
  vec3 wireDeform(vec3 p) {
    float flow = uMotion * (1.2 + uEnergy * 2.3);
    vec2 away = p.xy - uPointer;
    // Smooth bounded displacement, including at the exact cursor position.
    float proximity = exp(-dot(away, away) / 10000.);
    p.xy += away * proximity * uPointerStrength * uMotion * .18;
    p.x += sin(p.y * .006 + uScroll * .002) * flow;
    p.z += sin(p.y * .009 + uScroll * .003) * flow * .8;
    return p;
  }
`;
