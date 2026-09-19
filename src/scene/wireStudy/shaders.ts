export const vertexSource = /* glsl */`
precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 world;
uniform float motionTime;
uniform mat4 worldViewProjection;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
// Shared spatial flow; nearby strands sample nearby points in the same field.
vec2 noiseGradient(float x) {
  float cell = floor(x), t = fract(x);
  float a = fract(sin(cell * 127.1 + 13.7) * 43758.5453) * 2. - 1.;
  float b = fract(sin((cell + 1.) * 127.1 + 13.7) * 43758.5453) * 2. - 1.;
  float ease = t*t*t*(t*(t*6.-15.)+10.);
  return vec2(mix(a,b,ease), (b-a)*30.*t*t*(t-1.)*(t-1.));
}
void main() {
  vec3 p = position;
  vec2 a = noiseGradient(p.x * .12 + p.y * .10 + motionTime * .09);
  vec2 b = noiseGradient(p.x * .08 - p.y * .06 - motionTime * .06 + 8.);
  p.y += a.x * .22 + b.x * .12;
  p.z += a.x * .045;
  float dyDx = a.y * .12 * .22 + b.y * .08 * .12;
  float dyDy = a.y * .10 * .22 - b.y * .06 * .12;
  float dzDx = a.y * .12 * .045;
  float dzDy = a.y * .10 * .045;
  // Inverse-transpose Jacobian: shared flow deforms position and normal together.
  float ny = (normal.y - dzDy * normal.z) / (1. + dyDy);
  vec3 bentNormal = vec3(normal.x - dyDx * ny - dzDx * normal.z, ny, normal.z);
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
uniform float reflectionFilter;
uniform float strandBrightness;
uniform vec4 packets[6];

// Analytic studio environment: broad softbox, narrow strip, cool rim.
// Reflections follow the tube normal, rather than painted screen-space highlights.
vec3 metalSurface(vec3 n, vec3 view) {
  vec3 r = reflect(-view, n);
  // Long studio panels create continuous chrome bands along the cable.
  float keyWidth = sqrt(.38 * .38 + reflectionFilter * reflectionFilter);
  float stripWidth = sqrt(.18 * .18 + reflectionFilter * reflectionFilter);
  float key = (.38 / keyWidth) * exp(-pow((r.y - .48) / keyWidth, 2.)) * smoothstep(-.5, .5, r.z);
  float strip = (.18 / stripWidth) * exp(-pow((r.y + .58) / stripWidth, 2.)) * smoothstep(-.4, .5, r.z);
  float rim = pow(1. - max(dot(n, view), 0.), 3.);
  vec3 base = mix(vec3(.018, .025, .032), vec3(.045, .055, .062), lightTheme);
  vec3 silver = vec3(.88, .95, 1.);
  return base + key * silver * 1.5 + strip * vec3(.72, .83, .94) * .7
    + rim * vec3(.10, .15, .19);
}
vec3 palette(float value) {
  if (value >= 2.) return vec3(.28, .65, .59); // Rare muted cyan.
  return mix(vec3(1., .88, .57), vec3(.56, .84, .13), clamp(value, 0., 1.));
}
vec3 signalSurface(vec3 n, vec3 view) {
  vec3 emission = vec3(0.);
  for (int i = 0; i < 6; i++) {
    vec4 packet = packets[i];
    float behind = packet.x - vUv.x;
    float tail = exp(-max(behind, 0.) * 3.5 / max(packet.y, .01));
    float head = 1. - smoothstep(0., .085, -behind);
    float end = 1. - smoothstep(packet.y * .75, packet.y * 1.25, behind);
    vec3 color = palette(packet.z);
    float face = .25 + .75 * pow(max(dot(n, view), 0.), .65);
    emission += color * head * tail * end * packet.w * face * 3.8;
  }
  return emission * signalsVisible;
}
void main() {
  vec3 n = normalize(vNormal);
  vec3 view = vec3(0., 0., 1.); // Orthographic studio camera.
  vec3 emission = signalSurface(n, view);
  // Softly limit overlapping pulses instead of allowing isolated HDR spikes.
  emission = emission / (1. + emission / 5.);
  vec3 metal = metalSurface(n, view);
  metal = mix(metal * strandBrightness, mix(vec3(.88, .87, .82), metal, strandBrightness), lightTheme);
  gl_FragColor = vec4(metal + emission * (.55 + .45 * strandBrightness), 1.);
}`;
