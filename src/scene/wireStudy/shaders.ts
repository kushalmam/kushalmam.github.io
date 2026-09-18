export const vertexSource = /* glsl */`
precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 world;
uniform float motionTime;
uniform float wirePhase;
uniform mat4 worldViewProjection;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
void main() {
  vec3 p = position;
  float a = p.x * .3 + motionTime * 1.25 + wirePhase;
  float b = p.x * .16 - motionTime * .87 + wirePhase * 1.8;
  p.y += sin(a) * .44 + sin(b) * .3;
  p.z += sin(a * .7 + .8) * .16;
  float dy = cos(a) * .132 + cos(b) * .048;
  float dz = cos(a * .7 + .8) * .0336;
  // Inverse-transpose of the deformation Jacobian keeps reflections on the moving tube.
  vec3 bentNormal = vec3(normal.x - dy * normal.y - dz * normal.z, normal.yz);
  vPosition = (world * vec4(p, 1.)).xyz;
  vNormal = normalize(mat3(world) * bentNormal);
  vUv = uv;
  gl_Position = worldViewProjection * vec4(p, 1.);
}`;

export const fragmentSource = /* glsl */`
precision highp float;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
uniform vec3 eye;
uniform float lightTheme;
uniform float signalsVisible;
uniform vec4 packets[6];

// Analytic studio environment: broad softbox, narrow strip, cool rim.
// Reflections follow the tube normal, rather than painted screen-space highlights.
vec3 metalSurface(vec3 n, vec3 view) {
  vec3 r = reflect(-view, n);
  // Long studio panels create continuous chrome bands along the cable.
  float key = exp(-pow((r.y - .48) / .38, 2.)) * smoothstep(-.5, .5, r.z);
  float strip = exp(-pow((r.y + .58) / .18, 2.)) * smoothstep(-.4, .5, r.z);
  float rim = pow(1. - max(dot(n, view), 0.), 3.);
  vec3 base = mix(vec3(.018, .025, .032), vec3(.045, .055, .062), lightTheme);
  vec3 silver = vec3(.88, .95, 1.);
  return base + key * silver * 1.5 + strip * vec3(.72, .83, .94) * .7
    + rim * vec3(.10, .15, .19);
}
vec3 palette(float value) {
  float k = mod(value, 5.);
  vec3 a; vec3 b;
  if (k < 1.) { a = vec3(.46,1.,.035); b = vec3(.015,.65,1.); }
  else if (k < 2.) { a = vec3(.015,.65,1.); b = vec3(.42,.04,1.); }
  else if (k < 3.) { a = vec3(.42,.04,1.); b = vec3(1.,.035,.38); }
  else if (k < 4.) { a = vec3(1.,.035,.38); b = vec3(.015,1.,.6); }
  else { a = vec3(.015,1.,.6); b = vec3(.46,1.,.035); }
  return mix(a, b, smoothstep(.15, .85, fract(k)));
}
vec3 signalSurface(vec3 n, vec3 view) {
  vec3 emission = vec3(0.);
  for (int i = 0; i < 6; i++) {
    vec4 packet = packets[i];
    float behind = packet.x - vUv.x;
    float tail = exp(-max(behind, 0.) * 3.5 / max(packet.y, .01));
    float head = 1. - smoothstep(0., .085, -behind);
    float end = 1. - smoothstep(packet.y * 2., packet.y * 3., behind);
    vec3 color = palette(packet.z);
    float face = .25 + .75 * pow(max(dot(n, view), 0.), .65);
    emission += color * head * tail * end * packet.w * face * 3.8;
  }
  return emission * signalsVisible;
}
void main() {
  vec3 n = normalize(vNormal);
  vec3 view = vec3(0., 0., 1.); // Orthographic studio camera.
  gl_FragColor = vec4(metalSurface(n, view) + signalSurface(n, view), 1.);
}`;
