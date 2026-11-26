import { clamp, ease, smoothstep } from "../timeline";
import type { HeroSeaState } from "./field";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DitherInteraction {
  pointerUv?: { x: number; y: number } | null;
  hoverStrength?: number;
  ripples?: readonly { x: number; y: number; radius: number; strength: number }[];
}

export interface DitherTexOptions {
  gridW: number;
  gridH: number;
  lightMode: boolean;
  preserveColor?: boolean;
  edgeStrength?: number;
  gamma?: number;
  alphaThreshold?: number;
  reveal?: number;
  ditherAmount?: number;
  levels?: number;
  interaction?: DitherInteraction;
}

export interface PortraitDrawParams {
  rect: Rect;
  photoMix: number;
  portraitReveal: number;
  lightMode: boolean;
  ditherGridW: number;
  ditherGridH: number;
  veilCols: number;
  veilRows: number;
  veilBytes: Uint8Array | null;
  veilDirty: boolean;
}

export interface GpuDitherCanvas {
  dither(
    source: HTMLCanvasElement,
    target: HTMLCanvasElement,
    options: Omit<DitherTexOptions, "gridW" | "gridH">,
  ): boolean;
  drawCube(target: HTMLCanvasElement, clock: number, lightMode: boolean): boolean;
  warmup(): void;
}

const SCREEN_VERT_SRC = `#version 300 es
in vec2 aPos;
uniform vec4 uRect;
uniform vec2 uSize;
uniform float uFlipUvY;
out vec2 vUv;

void main() {
  vUv = vec2(aPos.x, uFlipUvY > 0.5 ? (1.0 - aPos.y) : aPos.y);
  vec2 css = uRect.xy + aPos * uRect.zw;
  vec2 ndc = vec2(
    (css.x / max(1.0, uSize.x)) * 2.0 - 1.0,
    1.0 - (css.y / max(1.0, uSize.y)) * 2.0
  );
  gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

const PASS_VERT_SRC = `#version 300 es
in vec2 aPos;
out vec2 vUv;

void main() {
  vUv = aPos;
  gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0);
}
`;

const BLIT_FRAG_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
out vec4 outColor;

void main() {
  vec4 c = texture(uTex, vUv);
  if (c.a <= 0.0) discard;
  outColor = c;
}
`;

const BAYER_GLSL = `
float bayer8x8(ivec2 p) {
  int x = p.x & 7;
  int y = p.y & 7;
  int v = x ^ y;
  int m = ((v & 1) << 5) | ((y & 1) << 4)
        | ((v & 2) << 2) | ((y & 2) << 1)
        | ((v & 4) >> 1) | ((y & 4) >> 2);
  return (float(m) + 0.5) / 64.0;
}

float p4(float x) {
  float x2 = x * x;
  return x2 * x2;
}
`;

const HERO_FRAG_SRC = `#version 300 es
precision highp float;
precision highp int;

uniform vec2 uSize;
uniform ivec2 uGridSize;
uniform float uCellSize;
uniform float uTime;
uniform float uHeroReveal;
uniform float uFoldFade;
uniform int uLightMode;
uniform vec2 uTilt;
uniform vec2 uHoverPx;
uniform int uHoverActive;
uniform float uReach;
uniform vec4 uRipples[4];
uniform int uRippleCount;
uniform float uBand;
uniform float uPushScale;

out vec4 outColor;

${BAYER_GLSL}

void main() {
  int cx = int(gl_FragCoord.x);
  int cy = uGridSize.y - 1 - int(gl_FragCoord.y);
  ivec2 cell = ivec2(cx, cy);

  if (uHeroReveal < 1.0 && uHeroReveal <= bayer8x8(cell + ivec2(3, 5))) {
    outColor = vec4(0.0);
    return;
  }

  vec2 cellCenter = (vec2(cell) + 0.5) * uCellSize;
  float sx = cellCenter.x;
  float sy = cellCenter.y;
  float u0 = sx / uSize.x;
  float v0 = sy / uSize.y;

  float quietLeft = exp(-p4((u0 - 0.3) / 0.3) - p4((v0 - 0.38) / 0.18)) * 0.3;
  float quietIntro = exp(-p4((u0 - 0.79) / 0.21) - p4((v0 - 0.65) / 0.17)) * 0.68;
  float quietNav = exp(-p4((u0 - 0.84) / 0.2) - p4((v0 - 0.06) / 0.08)) * 0.5;
  float qMask = max(0.0, 1.0 - quietLeft - quietIntro - quietNav);
  float atten = 1.0 - quietIntro * 0.52;

  float ring = 0.0;
  float pushX = 0.0;
  float pushY = 0.0;
  float invBand = 1.0 / max(1.0, uBand);

  for (int i = 0; i < 4; i++) {
    if (i >= uRippleCount) break;
    vec4 rip = uRipples[i];
    vec2 d = vec2(sx, sy) - rip.xy;
    float dist = length(d);
    float gap = abs(dist - rip.z);
    if (gap < uBand) {
      float t = gap * invBand;
      float bandFade = 1.0 - t * t * (3.0 - 2.0 * t);
      float fall = rip.w * bandFade;
      if (fall > 0.0) {
        ring = max(ring, fall);
        float invDist = dist > 0.001 ? 1.0 / dist : 1.0;
        float push = fall * uPushScale * invDist;
        pushX += d.x * push;
        pushY += d.y * push;
      }
    }
  }

  float ys = sin(v0 * 5.4 - uTime * 0.18) * 0.52;
  float tiltShiftU = uTilt.y * (v0 - 0.5) * uCellSize * 2.0;
  float u = (sx + pushX + tiltShiftU) / uSize.x;
  float vv = (sy + pushY + uTilt.x * (u - 0.5) * uCellSize * 2.0) / uSize.y;
  float a = u * 3.8 + vv * 1.65 + ys;
  float b = vv * 2.7 - u * 0.8 + sin(u * 6.0 + uTime * 0.12) * 0.28;
  float surface = sin(a * 3.5 + uTime * 0.13) + cos(b * 4.1 - uTime * 0.09) * 0.57;
  float norm = surface * 2.0833333333333335;
  float norm2 = norm * norm;
  float ridge = norm2 >= 6.0 ? 0.0 : exp(-norm2);
  float cBase = 0.5 + 0.5 * cos(a * 26.0 + b * 4.0);
  float contour = cBase * cBase * cBase;

  float rawValue = (ridge * 0.78 + contour * 0.24) * qMask;

  float hoverGlint = 0.0;
  if (uHoverActive != 0) {
    float distH = length(vec2(sx, sy) - uHoverPx);
    if (distH < uReach) {
      float s = clamp((distH - uReach * 0.2) / (uReach * 0.8), 0.0, 1.0);
      hoverGlint = (1.0 - s * s * (3.0 - 2.0 * s)) * 0.42;
    }
  }

  float minDensity = uLightMode != 0 ? 0.24 : 0.18;
  float density = clamp(rawValue * uFoldFade + ring * 0.65 + hoverGlint * 0.22, 0.0, 1.0);
  if (density <= minDensity || density <= bayer8x8(cell)) {
    outColor = vec4(0.0);
    return;
  }

  float colorT = clamp(rawValue * 1.05 + 0.08 * sin(u * 4.0 + v0 * 3.0 - uTime * 0.25), 0.0, 1.0);
  vec3 rgb;
  if (uLightMode != 0) {
    if (colorT < 0.52) {
      rgb = mix(vec3(98.0, 112.0, 110.0), vec3(42.0, 134.0, 118.0), colorT / 0.52);
    } else {
      rgb = mix(vec3(42.0, 134.0, 118.0), vec3(68.0, 168.0, 144.0), (colorT - 0.52) / 0.48);
    }
    if (hoverGlint > 0.05) {
      rgb = mix(rgb, vec3(196.0, 108.0, 76.0), hoverGlint * 0.8);
    }
    if (ring > 0.05) {
      rgb = mix(rgb, vec3(32.0, 142.0, 122.0), ring * 0.85);
    }
  } else {
    if (colorT < 0.55) {
      rgb = mix(vec3(22.0, 68.0, 92.0), vec3(56.0, 186.0, 170.0), colorT / 0.55);
    } else {
      rgb = mix(vec3(56.0, 186.0, 170.0), vec3(228.0, 242.0, 210.0), (colorT - 0.55) / 0.45);
    }
    if (hoverGlint > 0.05) {
      rgb = mix(rgb, vec3(242.0, 174.0, 114.0), hoverGlint * 0.8);
    }
    if (ring > 0.05) {
      rgb = mix(rgb, vec3(140.0, 252.0, 214.0), ring * 0.9);
    }
  }

  float baseAlpha = (uLightMode != 0 ? 110.0 : 215.0) / 255.0;
  float alpha = clamp(baseAlpha * (0.65 + 0.35 * density) * atten, 0.0, 1.0);
  vec3 normRgb = clamp(rgb / 255.0, 0.0, 1.0);
  outColor = vec4(normRgb * alpha, alpha);
}
`;

const DITHER_PASS_FRAG_SRC = `#version 300 es
precision highp float;
precision highp int;

in vec2 vUv;
uniform sampler2D uTex;
uniform ivec2 uGridSize;
uniform int uLightMode;
uniform int uPreserveColor;
uniform float uEdgeStrength;
uniform float uGamma;
uniform float uAlphaThreshold;
uniform float uReveal;
uniform float uDitherAmount;
uniform float uLevels;
uniform vec2 uPointerUv;
uniform float uHoverStrength;
uniform vec4 uLocalRipples[4];
uniform int uLocalRippleCount;

out vec4 outColor;

${BAYER_GLSL}

void sampleStraight(sampler2D tex, vec2 uv, float alphaThresh, out vec3 rgb, out float a, out float lum) {
  vec4 s = texture(tex, clamp(uv, vec2(0.0), vec2(1.0)));
  a = s.a;
  if (a < alphaThresh) {
    rgb = vec3(0.0);
    lum = 0.0;
  } else {
    rgb = clamp(s.rgb / max(a, 0.001), 0.0, 1.0);
    lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  }
}

void main() {
  int cx = clamp(int(gl_FragCoord.x), 0, uGridSize.x - 1);
  int cy = clamp(uGridSize.y - 1 - int(gl_FragCoord.y), 0, uGridSize.y - 1);
  ivec2 cell = ivec2(cx, cy);

  if (uReveal < 1.0 && (uReveal <= 0.0 || uReveal <= bayer8x8(cell + ivec2(3, 5)))) {
    outColor = vec4(0.0);
    return;
  }

  vec2 texel = 1.0 / vec2(uGridSize);
  vec2 uv = (vec2(cell) + 0.5) * texel;

  vec3 rgb;
  float a;
  float l;
  sampleStraight(uTex, uv, uAlphaThreshold, rgb, a, l);
  if (a < uAlphaThreshold) {
    outColor = vec4(0.0);
    return;
  }

  vec3 dummy;
  float a00, a10, a20, a01, a21, a02, a12, a22;
  float l00, l10, l20, l01, l21, l02, l12, l22;
  sampleStraight(uTex, uv + vec2(-texel.x, -texel.y), uAlphaThreshold, dummy, a00, l00);
  sampleStraight(uTex, uv + vec2(0.0,      -texel.y), uAlphaThreshold, dummy, a10, l10);
  sampleStraight(uTex, uv + vec2( texel.x, -texel.y), uAlphaThreshold, dummy, a20, l20);
  sampleStraight(uTex, uv + vec2(-texel.x,  0.0),     uAlphaThreshold, dummy, a01, l01);
  sampleStraight(uTex, uv + vec2( texel.x,  0.0),     uAlphaThreshold, dummy, a21, l21);
  sampleStraight(uTex, uv + vec2(-texel.x,  texel.y), uAlphaThreshold, dummy, a02, l02);
  sampleStraight(uTex, uv + vec2(0.0,       texel.y), uAlphaThreshold, dummy, a12, l12);
  sampleStraight(uTex, uv + vec2( texel.x,  texel.y), uAlphaThreshold, dummy, a22, l22);

  float gx = -l00 - 2.0 * l01 - l02 + l20 + 2.0 * l21 + l22;
  float gy = -l00 - 2.0 * l10 - l20 + l02 + 2.0 * l12 + l22;
  float agx = a21 - a01;
  float agy = a12 - a10;
  float g2 = gx * gx + gy * gy;
  float ag2 = agx * agx + agy * agy;
  float edge = (g2 == 0.0 && ag2 == 0.0)
    ? 0.0
    : clamp((g2 > 0.0 ? sqrt(g2) * 0.45 : 0.0) + (ag2 > 0.0 ? sqrt(ag2) * 0.7 : 0.0), 0.0, 1.0);

  float edgeGate = max(0.14, 0.36 - uEdgeStrength * 0.28);
  float seamLight = max(0.62, 1.0 - uEdgeStrength * 0.55);
  float seamDarkScale = max(0.48, 1.0 - uEdgeStrength * 0.9);
  float bayer = bayer8x8(cell) - 0.5;

  float hoverGlow = 0.0;
  float localRipple = 0.0;
  if (uHoverStrength > 0.005 || uLocalRippleCount > 0) {
    float aspect = float(uGridSize.x) / max(1.0, float(uGridSize.y));
    if (uHoverStrength > 0.005 && uPointerUv.x >= 0.0) {
      float dh = length((uv - uPointerUv) * vec2(aspect, 1.0));
      hoverGlow = (1.0 - smoothstep(0.03, 0.24, dh)) * uHoverStrength;
    }
    for (int i = 0; i < 4; i++) {
      if (i >= uLocalRippleCount) break;
      vec4 rip = uLocalRipples[i];
      float dr = length((uv - rip.xy) * vec2(aspect, 1.0));
      float band = 0.09;
      float gap = abs(dr - rip.z);
      if (gap < band) {
        float t = gap / band;
        localRipple = max(localRipple, rip.w * (1.0 - t * t * (3.0 - 2.0 * t)));
      }
    }
    if (hoverGlow > 0.01 || localRipple > 0.01) {
      bayer += (localRipple * 0.36 + hoverGlow * 0.16) * (bayer > 0.0 ? -1.0 : 1.0);
    }
  }

  float invLevels = 1.0 / uLevels;

  vec3 r255 = rgb * 255.0;
  float maxRGB = max(r255.r, max(r255.g, r255.b));
  float minRGB = min(r255.r, min(r255.g, r255.b));
  float sat = (maxRGB - minRGB) / max(1.0, maxRGB);

  vec3 outRgb = vec3(0.0);
  float outA = 0.0;

  if (uLightMode != 0) {
    if (l < 0.14 && sat <= 0.12) {
      if (edge > edgeGate) {
        outRgb = vec3(44.0, 48.0, 46.0);
        outA = 235.0;
      }
    } else if (uPreserveColor != 0 && sat > 0.14) {
      float liftMin = minRGB * 0.5;
      vec3 s = max(vec3(0.0), r255 - liftMin);
      float peak = max(s.r, max(s.g, s.b));
      if (peak > 205.0) s *= 205.0 / peak;
      float cLum = dot(s, vec3(0.2126, 0.7152, 0.0722));
      if (cLum > 158.0) s *= 158.0 / cLum;
      float stepVal = clamp(round((l + bayer * uDitherAmount) * uLevels) * invLevels, 0.0, 1.0);
      float lift = stepVal * 0.75;
      vec3 hi = min(vec3(242.0, 244.0, 240.0), s + (vec3(242.0, 244.0, 240.0) - s) * 0.42);
      outRgb = mix(s, hi, lift);
      if (edge > edgeGate + 0.08 && l < 0.45) {
        outRgb *= seamLight;
      }
      outA = 250.0;
    } else if (edge > edgeGate + 0.02 && l < 0.48) {
      outRgb = vec3(38.0, 42.0, 40.0);
      outA = 248.0;
    } else {
      float gTone = pow(clamp(l, 0.0, 1.0), uGamma);
      float stepVal = clamp(round((gTone + bayer * uDitherAmount) * uLevels) * invLevels, 0.0, 1.0);
      outRgb = vec3(70.0, 75.0, 72.0) + vec3(159.0, 153.0, 149.0) * stepVal;
      outA = 248.0;
    }
  } else {
    if (l < 0.14 && sat <= 0.12) {
      if (edge > edgeGate + 0.04) {
        outRgb = vec3(128.0, 138.0, 134.0);
        outA = 215.0;
      }
    } else {
      float gTone = pow(clamp(l, 0.0, 1.0), uGamma);
      float stepVal = clamp(round((gTone + bayer * uDitherAmount) * uLevels) * invLevels, 0.0, 1.0);
      float scale = 0.36 + 0.72 * stepVal;
      float seamDark = (edge > edgeGate + 0.1 && l < 0.48) ? seamDarkScale : 1.0;
      float boost = scale * seamDark;
      if (uPreserveColor != 0) {
        outRgb = min(vec3(255.0), r255 * boost);
      } else {
        float v = min(255.0, 234.0 * boost);
        outRgb = vec3(v, v, min(255.0, 227.0 * boost));
      }
      outA = 248.0;
    }
  }

  if (outA <= 0.0) {
    outColor = vec4(0.0);
    return;
  }
  if (localRipple > 0.02 || hoverGlow > 0.02) {
    vec3 accent = uLightMode != 0 ? vec3(15.0, 143.0, 107.0) : vec3(122.0, 245.0, 200.0);
    outRgb = mix(outRgb, accent, clamp(localRipple * 0.55 + hoverGlow * 0.24, 0.0, 0.65));
  }
  float alpha = outA / 255.0;
  vec3 normRgb = clamp(outRgb / 255.0, 0.0, 1.0);
  outColor = vec4(normRgb * alpha, alpha);
}
`;

const COSMIC_FRAG_SRC = `#version 300 es
precision highp float;

uniform float uClock;
uniform float uSpinBoost;

out vec4 outColor;

float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(1e-5, dot(ba, ba)), 0.0, 1.0);
  return length(pa - ba * h);
}

vec2 rot2(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

vec4 over(vec4 dst, vec3 rgb, float alpha) {
  float a = clamp(alpha, 0.0, 1.0);
  return vec4(rgb * a, a) + dst * (1.0 - a);
}

float easeCubic(float x) {
  float t = clamp(x, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x - 240.0, gl_FragCoord.y - 180.0);
  float r = length(p);

  float period = 3.6;
  float cyclePos = fract(uClock / period);
  float spinStep = floor(uClock / period);
  float detentPhase = easeCubic(cyclePos / 0.34);
  float bezelAngle = (spinStep + detentPhase) * 0.78539816339 + uSpinBoost;
  float corePop = cyclePos < 0.34
    ? 0.0
    : (cyclePos < 0.72
      ? easeCubic((cyclePos - 0.34) / 0.16)
      : 1.0 - easeCubic((cyclePos - 0.72) / 0.28));
  float wavePhase = cyclePos > 0.56 ? clamp((cyclePos - 0.56) / 0.36, 0.0, 1.0) : 0.0;

  vec4 col = vec4(0.0);

  // 32 rotating perimeter ticks
  if (r > 139.0 && r < 158.0) {
    float ang = atan(p.y, p.x) - uClock * 0.08;
    float idx = floor(mod((ang / 6.28318530718) * 32.0 + 32.5, 32.0));
    float sector = idx * (6.28318530718 / 32.0);
    bool major = mod(idx, 4.0) < 0.5;
    float innerR = major ? 142.0 : 148.0;
    vec2 dir = vec2(cos(sector), sin(sector));
    vec2 tp = rot2(p, -uClock * 0.08);
    float dTick = sdSeg(tp, dir * innerR, dir * 155.0) - (major ? 1.5 : 1.0);
    if (dTick < 1.0) {
      vec3 tickCol = major ? vec3(102.0, 240.0, 194.0) / 255.0 : vec3(82.0, 120.0, 106.0) / 255.0;
      col = over(col, tickCol, clamp(0.8 - dTick, 0.0, 1.0));
    }
  }

  // Diagonal clasp lugs & rotating bezel
  vec2 bp = rot2(p, -bezelAngle);
  for (int k = 0; k < 4; k++) {
    vec2 lp = rot2(bp, -(0.78539816339 + float(k) * 1.57079632679));
    float halfW = mix(22.0, 27.0, clamp((-104.0 - lp.y) / 18.0, 0.0, 1.0));
    float dLug = max(abs(lp.y + 113.0) - 9.0, abs(lp.x) - halfW);
    col = over(col, vec3(156.0, 176.0, 164.0) / 255.0, clamp(0.5 - dLug, 0.0, 1.0));
    col = over(col, vec3(20.0, 26.0, 22.0) / 255.0, clamp(1.75 - abs(dLug), 0.0, 1.0));
    float dSlot = max(abs(lp.y + 114.0) - 3.0, abs(lp.x) - 11.0);
    col = over(col, vec3(52.0, 70.0, 61.0) / 255.0, clamp(0.5 - dSlot, 0.0, 1.0));
  }

  // Outer bevel ring (r = 112) & slate ring (r = 102) & dark groove (r = 91)
  col = over(col, vec3(108.0, 125.0, 116.0) / 255.0, clamp(0.5 - (r - 112.0), 0.0, 1.0));
  col = over(col, vec3(20.0, 26.0, 22.0) / 255.0, clamp(2.0 - abs(r - 112.0), 0.0, 1.0));
  col = over(col, vec3(188.0, 201.0, 193.0) / 255.0, clamp(0.5 - (r - 102.0), 0.0, 1.0));
  col = over(col, vec3(20.0, 26.0, 22.0) / 255.0, clamp(1.75 - abs(r - 102.0), 0.0, 1.0));
  col = over(col, vec3(20.0, 26.0, 22.0) / 255.0, clamp(2.0 - abs(r - 91.0), 0.0, 1.0));

  // 4 emerald indicator pips at 0, 90, 180, 270 deg
  vec2 absBp = abs(bp);
  vec2 pipPt = absBp.x > absBp.y ? vec2(98.0, 0.0) : vec2(0.0, 98.0);
  float dPip = length(absBp - pipPt) - 6.0;
  col = over(col, vec3(92.0, 242.0, 132.0) / 255.0, clamp(0.5 - dPip, 0.0, 1.0));
  col = over(col, vec3(20.0, 26.0, 22.0) / 255.0, clamp(1.25 - abs(dPip), 0.0, 1.0));

  // Dial interior (r <= 84)
  float dialMask = clamp(0.5 - (r - 84.0), 0.0, 1.0);
  if (dialMask > 0.0) {
    float gt = clamp((r - 6.0) / 78.0, 0.0, 1.0);
    vec3 emCol = gt < 0.55
      ? mix(vec3(180.0, 255.0, 208.0) / 255.0, vec3(92.0, 242.0, 132.0) / 255.0, gt / 0.55)
      : mix(vec3(92.0, 242.0, 132.0) / 255.0, vec3(48.0, 184.0, 88.0) / 255.0, (gt - 0.55) / 0.45);
    if (detentPhase > 0.02 && detentPhase < 0.98) {
      float offset = -120.0 + detentPhase * 240.0;
      float dScan = sdSeg(p, vec2(offset - 70.0, -84.0), vec2(offset + 70.0, 84.0)) - 2.5;
      emCol = mix(emCol, vec3(216.0, 255.0, 232.0) / 255.0, clamp(0.5 - dScan, 0.0, 1.0));
    }

    // Hourglass chevrons
    float waistX = 10.0 + corePop * 5.0;
    vec2 mp = abs(p);
    float edgeX = mix(waistX, 62.0, clamp(mp.y / 74.0, 0.0, 1.0));
    float plateMask = clamp(0.5 - max(edgeX - mp.x, mp.y - 74.0), 0.0, 1.0);
    emCol = mix(emCol, vec3(17.0, 22.0, 19.0) / 255.0, plateMask);

    float dV = sdSeg(mp, vec2(waistX, 0.0), vec2(62.0, 74.0));
    emCol = mix(emCol, vec3(223.0, 230.0, 223.0) / 255.0, clamp(3.5 - dV, 0.0, 1.0));
    emCol = mix(emCol, vec3(14.0, 19.0, 16.0) / 255.0, clamp(1.0 - dV, 0.0, 1.0));

    col = over(col, emCol, dialMask);
  }

  // Dial border ring (r = 84)
  col = over(col, vec3(20.0, 26.0, 22.0) / 255.0, clamp(2.0 - abs(r - 84.0), 0.0, 1.0));

  // Expanding lock-in shockwave ring
  if (wavePhase > 0.0 && wavePhase < 1.0) {
    float waveR = 54.0 + wavePhase * 98.0;
    float halfW = max(0.75, 2.25 * (1.0 - wavePhase));
    float dWave = abs(r - waveR) - halfW;
    vec3 wCol = wavePhase < 0.6 ? vec3(102.0, 240.0, 194.0) / 255.0 : vec3(68.0, 194.0, 154.0) / 255.0;
    col = over(col, wCol, clamp(0.5 - dWave, 0.0, 1.0));
  }

  outColor = col;
}
`;

const PORTRAIT_FRAG_SRC = `#version 300 es
precision highp float;
precision highp int;

in vec2 vUv;
uniform sampler2D uPortraitTex;
uniform sampler2D uPortraitDitherTex;
uniform sampler2D uVeilTex;
uniform ivec2 uVeilSize;
uniform ivec2 uDitherGrid;
uniform float uPhotoMix;
uniform float uPortraitReveal;

out vec4 outColor;

${BAYER_GLSL}

void main() {
  ivec2 veilCell = clamp(ivec2(floor(vUv * vec2(uVeilSize))), ivec2(0), uVeilSize - 1);
  float veilVal = texelFetch(uVeilTex, veilCell, 0).r;
  float shown = clamp(uPhotoMix + veilVal, 0.0, 1.0);

  vec3 photoRgb = texture(uPortraitTex, vUv).rgb;
  float lum = dot(photoRgb, vec3(0.2126, 0.7152, 0.0722));
  float mid = 1.0 - abs(2.0 * uPhotoMix - 1.0);
  float shownBias = clamp(shown + (lum - 0.5) * 0.14 * mid, 0.0, 1.0);

  float b = bayer8x8(veilCell);
  float photoWeight = shown >= 0.999
    ? 1.0
    : (shown <= 0.001 ? 0.0 : smoothstep(b - 0.16, b + 0.16, shownBias));

  ivec2 cell = clamp(ivec2(floor(vUv * vec2(uDitherGrid))), ivec2(0), uDitherGrid - 1);
  float revB = bayer8x8(cell + ivec2(3, 5));
  float revealMask = uPortraitReveal >= 0.999
    ? 1.0
    : (uPortraitReveal <= 0.001 ? 0.0 : smoothstep(revB - 0.18, revB + 0.18, uPortraitReveal));
  if (revealMask <= 0.002) discard;

  vec4 photoPremul = vec4(photoRgb, 1.0);
  vec4 blended;
  if (photoWeight >= 0.999) {
    blended = photoPremul;
  } else {
    vec4 d = texelFetch(uPortraitDitherTex, ivec2(cell.x, uDitherGrid.y - 1 - cell.y), 0);
    blended = mix(d, photoPremul, photoWeight);
  }

  vec4 finalColor = blended * revealMask;
  if (finalColor.a <= 0.002) discard;
  outColor = finalColor;
}
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string,
): WebGLProgram | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) {
    if (vert) gl.deleteShader(vert);
    if (frag) gl.deleteShader(frag);
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return null;
  }
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export class GlStageRenderer {
  private gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;

  private heroProgram: WebGLProgram;
  private ditherProgram: WebGLProgram;
  private blitProgram: WebGLProgram;
  private portraitProgram: WebGLProgram;

  private fbo: WebGLFramebuffer;
  private fboTex: WebGLTexture;
  private fboW = 0;
  private fboH = 0;

  private sourceTex: WebGLTexture;
  private sourceTexW = 0;
  private sourceTexH = 0;
  private portraitTex: WebGLTexture;
  private portraitDitherTex: WebGLTexture;
  private portraitDitherFbo: WebGLFramebuffer;
  private portraitDitherW = 0;
  private portraitDitherH = 0;
  private portraitDitherLight: boolean | null = null;
  private veilTex: WebGLTexture;
  private hasPortraitTex = false;
  private veilCols = 0;
  private veilRows = 0;

  private cosmicProgram: WebGLProgram | null = null;
  private cosmicFbo: WebGLFramebuffer | null = null;
  private cosmicTex: WebGLTexture | null = null;
  private cosmicLocs: Record<string, WebGLUniformLocation | null> = {};

  private widthCss = 1;
  private heightCss = 1;
  private tiltX = 0;
  private tiltY = 0;

  private heroLocs: Record<string, WebGLUniformLocation | null>;
  private ditherLocs: Record<string, WebGLUniformLocation | null>;
  private blitLocs: Record<string, WebGLUniformLocation | null>;
  private portraitLocs: Record<string, WebGLUniformLocation | null>;

  private constructor(
    gl: WebGL2RenderingContext,
    heroProgram: WebGLProgram,
    ditherProgram: WebGLProgram,
    blitProgram: WebGLProgram,
    portraitProgram: WebGLProgram,
  ) {
    this.gl = gl;
    this.heroProgram = heroProgram;
    this.ditherProgram = ditherProgram;
    this.blitProgram = blitProgram;
    this.portraitProgram = portraitProgram;

    const vao = gl.createVertexArray();
    const quadBuf = gl.createBuffer();
    const fbo = gl.createFramebuffer();
    const fboTex = gl.createTexture();
    const sourceTex = gl.createTexture();
    const portraitTex = gl.createTexture();
    const portraitDitherTex = gl.createTexture();
    const portraitDitherFbo = gl.createFramebuffer();
    const veilTex = gl.createTexture();
    if (
      !vao ||
      !quadBuf ||
      !fbo ||
      !fboTex ||
      !sourceTex ||
      !portraitTex ||
      !portraitDitherTex ||
      !portraitDitherFbo ||
      !veilTex
    ) {
      throw new Error("Failed to allocate WebGL2 resources");
    }
    this.vao = vao;
    this.fbo = fbo;
    this.fboTex = fboTex;
    this.sourceTex = sourceTex;
    this.portraitTex = portraitTex;
    this.portraitDitherTex = portraitDitherTex;
    this.portraitDitherFbo = portraitDitherFbo;
    this.veilTex = veilTex;

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    for (const program of [heroProgram, ditherProgram, blitProgram, portraitProgram]) {
      const loc = gl.getAttribLocation(program, "aPos");
      if (loc >= 0) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      }
    }

    for (const tex of [fboTex, portraitDitherTex, veilTex]) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    for (const tex of [sourceTex, portraitTex]) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const getLocs = (program: WebGLProgram, names: readonly string[]) => {
      const out: Record<string, WebGLUniformLocation | null> = {};
      for (const name of names) {
        out[name] = gl.getUniformLocation(program, name);
      }
      return out;
    };

    this.heroLocs = getLocs(heroProgram, [
      "uSize",
      "uGridSize",
      "uCellSize",
      "uTime",
      "uHeroReveal",
      "uFoldFade",
      "uLightMode",
      "uTilt",
      "uHoverPx",
      "uHoverActive",
      "uReach",
      "uRipples[0]",
      "uRippleCount",
      "uBand",
      "uPushScale",
    ]);

    this.ditherLocs = getLocs(ditherProgram, [
      "uTex",
      "uGridSize",
      "uLightMode",
      "uPreserveColor",
      "uEdgeStrength",
      "uGamma",
      "uAlphaThreshold",
      "uReveal",
      "uDitherAmount",
      "uLevels",
      "uPointerUv",
      "uHoverStrength",
      "uLocalRipples[0]",
      "uLocalRippleCount",
    ]);

    this.blitLocs = getLocs(blitProgram, [
      "uRect",
      "uSize",
      "uFlipUvY",
      "uTex",
    ]);

    this.portraitLocs = getLocs(portraitProgram, [
      "uRect",
      "uSize",
      "uFlipUvY",
      "uPortraitTex",
      "uPortraitDitherTex",
      "uVeilTex",
      "uVeilSize",
      "uDitherGrid",
      "uPhotoMix",
      "uPortraitReveal",
    ]);
  }

  static create(canvas: HTMLCanvasElement): GlStageRenderer | null {
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl2", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "default",
      });
    } catch {
      return null;
    }
    if (!gl) return null;

    const heroProgram = createProgram(gl, PASS_VERT_SRC, HERO_FRAG_SRC);
    const ditherProgram = createProgram(gl, PASS_VERT_SRC, DITHER_PASS_FRAG_SRC);
    const blitProgram = createProgram(gl, SCREEN_VERT_SRC, BLIT_FRAG_SRC);
    const portraitProgram = createProgram(gl, SCREEN_VERT_SRC, PORTRAIT_FRAG_SRC);
    if (!heroProgram || !ditherProgram || !blitProgram || !portraitProgram) {
      if (heroProgram) gl.deleteProgram(heroProgram);
      if (ditherProgram) gl.deleteProgram(ditherProgram);
      if (blitProgram) gl.deleteProgram(blitProgram);
      if (portraitProgram) gl.deleteProgram(portraitProgram);
      return null;
    }

    try {
      return new GlStageRenderer(
        gl,
        heroProgram,
        ditherProgram,
        blitProgram,
        portraitProgram,
      );
    } catch {
      return null;
    }
  }

  private ensureFbo(w: number, h: number): void {
    const gl = this.gl;
    if (this.fboW === w && this.fboH === h) return;
    this.fboW = w;
    this.fboH = h;
    gl.bindTexture(gl.TEXTURE_2D, this.fboTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.fboTex,
      0,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private ensurePortraitDither(gridW: number, gridH: number, lightMode: boolean): void {
    if (
      !this.hasPortraitTex ||
      (this.portraitDitherW === gridW &&
        this.portraitDitherH === gridH &&
        this.portraitDitherLight === lightMode)
    ) {
      return;
    }
    const gl = this.gl;
    this.portraitDitherW = gridW;
    this.portraitDitherH = gridH;
    this.portraitDitherLight = lightMode;

    gl.bindTexture(gl.TEXTURE_2D, this.portraitDitherTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      gridW,
      gridH,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.portraitDitherFbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.portraitDitherTex,
      0,
    );

    gl.disable(gl.BLEND);
    gl.viewport(0, 0, gridW, gridH);
    gl.useProgram(this.ditherProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.portraitTex);
    const L = this.ditherLocs;
    gl.uniform1i(L["uTex"], 0);
    gl.uniform2i(L["uGridSize"], gridW, gridH);
    gl.uniform1i(L["uLightMode"], lightMode ? 1 : 0);
    gl.uniform1i(L["uPreserveColor"], 1);
    gl.uniform1f(L["uEdgeStrength"], 0.22);
    gl.uniform1f(L["uGamma"], lightMode ? 0.94 : 0.88);
    gl.uniform1f(L["uAlphaThreshold"], 40 / 255);
    gl.uniform1f(L["uReveal"], 1);
    gl.uniform1f(L["uDitherAmount"], 0.18);
    gl.uniform1f(L["uLevels"], 6);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.enable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  private blitFbo(rect: Rect): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.enable(gl.BLEND);
    gl.useProgram(this.blitProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fboTex);
    const B = this.blitLocs;
    gl.uniform4f(B["uRect"], rect.x, rect.y, rect.w, rect.h);
    gl.uniform2f(B["uSize"], this.widthCss, this.heightCss);
    gl.uniform1f(B["uFlipUvY"], 1);
    gl.uniform1i(B["uTex"], 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  resize(widthCss: number, heightCss: number): void {
    this.widthCss = Math.max(1, widthCss);
    this.heightCss = Math.max(1, heightCss);
    const gl = this.gl;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  beginFrame(lightMode = false): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (lightMode) {
      gl.clearColor(246 / 255, 245 / 255, 240 / 255, 1);
    } else {
      gl.clearColor(16 / 255, 17 / 255, 15 / 255, 1);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(this.vao);
  }

  setPortrait(image: HTMLImageElement): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.portraitTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    this.hasPortraitTex = true;
    this.portraitDitherLight = null;
  }

  drawHeroSea(state: HeroSeaState): void {
    const heroReveal = 1 - ease((state.story - 0.8) / 0.95);
    if (heroReveal <= 0.005 || this.widthCss <= 0 || this.heightCss <= 0) return;

    const gl = this.gl;
    const width = this.widthCss;
    const height = this.heightCss;
    const cellSize = width < 700 ? 3 : 4;
    const cols = Math.max(1, Math.ceil(width / cellSize));
    const rows = Math.max(1, Math.ceil(height / cellSize));
    const { time, frameDelta, hover, ripples, lightMode } = state;
    const interactive = !state.paused && !state.reducedMotion && state.story < 1.1;

    const follow = 1 - Math.exp(-6 * Math.min(0.05, frameDelta));
    const targetX =
      interactive && hover.inside ? (hover.y - 0.5) * 1.4 : Math.sin(time * 0.55) * 0.12;
    const targetY =
      interactive && hover.inside ? (hover.x - 0.5) * 1.4 : Math.sin(time * 0.4 + 1.3) * 0.2;
    this.tiltX += (targetX - this.tiltX) * follow;
    this.tiltY += (targetY - this.tiltY) * follow;

    const rippleData = new Float32Array(16);
    let rippleCount = 0;
    const band = Math.max(cellSize * 4, 28);
    if (interactive && ripples.length > 0) {
      const maxDim = Math.max(width, height);
      for (let i = 0; i < ripples.length && rippleCount < 4; i++) {
        const rip = ripples[i];
        const ageFade = 1 - smoothstep(0, 1.2, rip.age);
        if (ageFade <= 0.002) continue;
        const base = rippleCount * 4;
        rippleData[base] = rip.x * width;
        rippleData[base + 1] = rip.y * height;
        rippleData[base + 2] = rip.age * maxDim * 0.75;
        rippleData[base + 3] = ageFade;
        rippleCount++;
      }
    }

    const foldFade = 1 - ease((state.story - 0.4) / 1.2) * 0.18;
    const reach = Math.max(140, height * 0.28);

    // Compute wave & Bayer dither once per cell in FBO, then blit NEAREST to screen (64x fewer shader invocations).
    this.ensureFbo(cols, rows);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, cols, rows);
    gl.disable(gl.BLEND);
    gl.useProgram(this.heroProgram);
    const L = this.heroLocs;
    gl.uniform2f(L["uSize"], width, height);
    gl.uniform2i(L["uGridSize"], cols, rows);
    gl.uniform1f(L["uCellSize"], cellSize);
    gl.uniform1f(L["uTime"], time);
    gl.uniform1f(L["uHeroReveal"], heroReveal);
    gl.uniform1f(L["uFoldFade"], foldFade);
    gl.uniform1i(L["uLightMode"], lightMode ? 1 : 0);
    gl.uniform2f(L["uTilt"], this.tiltX, this.tiltY);
    gl.uniform2f(L["uHoverPx"], hover.x * width, hover.y * height);
    gl.uniform1i(L["uHoverActive"], interactive && hover.inside ? 1 : 0);
    gl.uniform1f(L["uReach"], reach);
    gl.uniform4fv(L["uRipples[0]"], rippleData);
    gl.uniform1i(L["uRippleCount"], rippleCount);
    gl.uniform1f(L["uBand"], band);
    gl.uniform1f(L["uPushScale"], cellSize * 1.8);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.blitFbo({ x: 0, y: 0, w: cols * cellSize, h: rows * cellSize });
  }

  drawPortrait(params: PortraitDrawParams): void {
    if (!this.hasPortraitTex || params.portraitReveal <= 0.005) return;
    const gl = this.gl;

    this.ensurePortraitDither(
      params.ditherGridW,
      params.ditherGridH,
      params.lightMode,
    );

    if (
      params.veilBytes &&
      (params.veilDirty ||
        this.veilCols !== params.veilCols ||
        this.veilRows !== params.veilRows)
    ) {
      gl.bindTexture(gl.TEXTURE_2D, this.veilTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      if (this.veilCols !== params.veilCols || this.veilRows !== params.veilRows) {
        this.veilCols = params.veilCols;
        this.veilRows = params.veilRows;
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.R8,
          params.veilCols,
          params.veilRows,
          0,
          gl.RED,
          gl.UNSIGNED_BYTE,
          params.veilBytes,
        );
      } else {
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          0,
          params.veilCols,
          params.veilRows,
          gl.RED,
          gl.UNSIGNED_BYTE,
          params.veilBytes,
        );
      }
    }

    gl.useProgram(this.portraitProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.portraitTex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.portraitDitherTex);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.veilTex);

    const L = this.portraitLocs;
    gl.uniform4f(L["uRect"], params.rect.x, params.rect.y, params.rect.w, params.rect.h);
    gl.uniform2f(L["uSize"], this.widthCss, this.heightCss);
    gl.uniform1f(L["uFlipUvY"], 0);
    gl.uniform1i(L["uPortraitTex"], 0);
    gl.uniform1i(L["uPortraitDitherTex"], 1);
    gl.uniform1i(L["uVeilTex"], 2);
    gl.uniform2i(L["uVeilSize"], Math.max(1, params.veilCols), Math.max(1, params.veilRows));
    gl.uniform2i(L["uDitherGrid"], params.ditherGridW, params.ditherGridH);
    gl.uniform1f(L["uPhotoMix"], clamp(params.photoMix));
    gl.uniform1f(L["uPortraitReveal"], clamp(params.portraitReveal));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private runDitherPass(
    boundTex: WebGLTexture,
    rect: Rect,
    options: DitherTexOptions,
  ): void {
    const gl = this.gl;
    const gridW = Math.max(1, options.gridW);
    const gridH = Math.max(1, options.gridH);
    const gamma = options.gamma ?? (options.lightMode ? 0.92 : 0.84);
    const edgeStrength = options.edgeStrength ?? 0.45;
    const alphaThreshold = (options.alphaThreshold ?? 40) / 255;
    const reveal = options.reveal ?? 1;
    const ditherAmount = options.ditherAmount ?? 0.22;
    const levels = Math.max(2, Math.round(options.levels ?? 4));

    this.ensureFbo(gridW, gridH);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, gridW, gridH);
    gl.disable(gl.BLEND);

    gl.useProgram(this.ditherProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, boundTex);

    const L = this.ditherLocs;
    gl.uniform1i(L["uTex"], 0);
    gl.uniform2i(L["uGridSize"], gridW, gridH);
    gl.uniform1i(L["uLightMode"], options.lightMode ? 1 : 0);
    gl.uniform1i(L["uPreserveColor"], options.preserveColor === false ? 0 : 1);
    gl.uniform1f(L["uEdgeStrength"], edgeStrength);
    gl.uniform1f(L["uGamma"], gamma);
    gl.uniform1f(L["uAlphaThreshold"], alphaThreshold);
    gl.uniform1f(L["uReveal"], reveal);
    gl.uniform1f(L["uDitherAmount"], ditherAmount);
    gl.uniform1f(L["uLevels"], levels);

    const inter = options.interaction;
    if (inter?.pointerUv && (inter.hoverStrength ?? 0) > 0) {
      gl.uniform2f(L["uPointerUv"], inter.pointerUv.x, inter.pointerUv.y);
      gl.uniform1f(L["uHoverStrength"], inter.hoverStrength ?? 0);
    } else {
      gl.uniform2f(L["uPointerUv"], -1, -1);
      gl.uniform1f(L["uHoverStrength"], 0);
    }

    const ripData = new Float32Array(16);
    const rips = inter?.ripples;
    let ripCount = 0;
    if (rips && rips.length > 0) {
      for (let i = 0; i < rips.length && ripCount < 4; i++) {
        const rp = rips[i];
        if (rp.strength <= 0.005) continue;
        const base = ripCount * 4;
        ripData[base] = rp.x;
        ripData[base + 1] = rp.y;
        ripData[base + 2] = rp.radius;
        ripData[base + 3] = rp.strength;
        ripCount++;
      }
    }
    gl.uniform4fv(L["uLocalRipples[0]"], ripData);
    gl.uniform1i(L["uLocalRippleCount"], ripCount);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.blitFbo(rect);
  }

  private ensureCosmicPipeline(): boolean {
    if (this.cosmicProgram && this.cosmicFbo && this.cosmicTex) return true;
    const gl = this.gl;
    const prog = createProgram(gl, PASS_VERT_SRC, COSMIC_FRAG_SRC);
    const fbo = gl.createFramebuffer();
    const tex = gl.createTexture();
    if (!prog || !fbo || !tex) {
      if (prog) gl.deleteProgram(prog);
      return false;
    }
    const posLoc = gl.getAttribLocation(prog, "aPos");
    if (posLoc >= 0) {
      gl.bindVertexArray(this.vao);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 480, 360, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.cosmicProgram = prog;
    this.cosmicFbo = fbo;
    this.cosmicTex = tex;
    this.cosmicLocs = {
      uClock: gl.getUniformLocation(prog, "uClock"),
      uSpinBoost: gl.getUniformLocation(prog, "uSpinBoost"),
    };
    return true;
  }

  warmup(): void {
    this.ensureCosmicPipeline();
  }

  drawCosmicRecomp(
    rect: Rect,
    clock: number,
    spinBoost: number,
    options: Omit<DitherTexOptions, "gridW" | "gridH">,
  ): boolean {
    if (!this.ensureCosmicPipeline()) return false;
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.cosmicFbo);
    gl.viewport(0, 0, 480, 360);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(this.vao);
    gl.useProgram(this.cosmicProgram);
    gl.uniform1f(this.cosmicLocs["uClock"], clock);
    gl.uniform1f(this.cosmicLocs["uSpinBoost"], spinBoost);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.runDitherPass(this.cosmicTex!, rect, {
      ...options,
      gridW: 320,
      gridH: 240,
    });
    return true;
  }

  drawDitheredSource(
    source: HTMLCanvasElement,
    rect: Rect,
    options: DitherTexOptions,
    uploadSource = true,
  ): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sourceTex);
    if (uploadSource) {
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      if (this.sourceTexW !== source.width || this.sourceTexH !== source.height) {
        this.sourceTexW = source.width;
        this.sourceTexH = source.height;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      } else {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
      }
    }

    this.runDitherPass(this.sourceTex, rect, options);
  }
}

const CUBE_VERT_SRC = `#version 300 es
in vec3 aPos;
in vec3 aCenter;
in vec2 aTileUv;
in float aShade;

uniform int uCurrent;
uniform float uFraction;
uniform float uYaw;
uniform float uTilt;

out vec2 vTileUv;
out float vShade;

const int MOVE_AXIS[6] = int[6](1, 0, 2, 2, 0, 1);
const float MOVE_DIR[6] = float[6](1.0, 1.0, 1.0, -1.0, -1.0, -1.0);

vec3 rotateAxis(vec3 p, int axis, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  if (axis == 0) return vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
  if (axis == 1) return vec3(p.z * s + p.x * c, p.y, p.z * c - p.x * s);
  return vec3(p.x * c - p.y * s, p.x * s + p.y * c, p.z);
}

void main() {
  vec3 pos = aPos;
  vec3 center = aCenter;
  for (int step = 0; step < 6; step++) {
    if (step > uCurrent) break;
    int axis = MOVE_AXIS[step];
    float coord = axis == 0 ? center.x : (axis == 1 ? center.y : center.z);
    if (coord > 0.5) {
      float frac = step < uCurrent ? 1.0 : uFraction;
      float angle = MOVE_DIR[step] * 1.57079632679 * frac;
      center = rotateAxis(center, axis, angle);
      pos = rotateAxis(pos, axis, angle);
    }
  }

  float cy = cos(uYaw);
  float sy = sin(uYaw);
  float ct = cos(uTilt);
  float st = sin(uTilt);
  float rx = pos.x * cy + pos.z * sy;
  float rz = -pos.x * sy + pos.z * cy;
  float camY = pos.y * ct - rz * st;
  float camZ = pos.y * st + rz * ct;

  vTileUv = aTileUv;
  vShade = aShade;
  gl_Position = vec4(
    rx * (55.0 / 200.0),
    -((camY * 55.0 - 7.0) / 150.0),
    -camZ * 0.15,
    1.0
  );
}
`;

const CUBE_FRAG_SRC = `#version 300 es
precision highp float;

in vec2 vTileUv;
in float vShade;
out vec4 outColor;

void main() {
  float edge = max(abs(vTileUv.x), abs(vTileUv.y));
  float border = smoothstep(0.392, 0.415, edge);
  vec3 fill = vec3(vShade, min(1.0, vShade + 3.0 / 255.0), max(0.0, vShade - 7.0 / 255.0));
  vec3 stroke = vec3(31.0 / 255.0, 38.0 / 255.0, 34.0 / 255.0);
  outColor = vec4(mix(fill, stroke, border), 1.0);
}
`;

function buildCubeMeshData(): Float32Array {
  const faces: {
    n: [number, number, number];
    u: [number, number, number];
    v: [number, number, number];
    shade: number;
  }[] = [
    { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], shade: 186 },
    { n: [1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], shade: 118 },
    { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1], shade: 236 },
    { n: [0, 0, -1], u: [1, 0, 0], v: [0, 1, 0], shade: 146 },
    { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], shade: 162 },
    { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1], shade: 92 },
  ];
  const quadVerts: [number, number][] = [
    [-0.44, -0.44],
    [0.44, -0.44],
    [0.44, 0.44],
    [-0.44, -0.44],
    [0.44, 0.44],
    [-0.44, 0.44],
  ];
  const data = new Float32Array(54 * 6 * 9);
  let ptr = 0;
  for (const face of faces) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cx = face.n[0] * 1.5 + face.u[0] * (col - 1) + face.v[0] * (row - 1);
        const cy = face.n[1] * 1.5 + face.u[1] * (col - 1) + face.v[1] * (row - 1);
        const cz = face.n[2] * 1.5 + face.u[2] * (col - 1) + face.v[2] * (row - 1);
        const shade = Math.round(face.shade * (0.78 + ((row + col * 2) % 3) * 0.1)) / 255;
        for (const [u, v] of quadVerts) {
          data[ptr++] = cx + face.u[0] * u + face.v[0] * v;
          data[ptr++] = cy + face.u[1] * u + face.v[1] * v;
          data[ptr++] = cz + face.u[2] * u + face.v[2] * v;
          data[ptr++] = cx;
          data[ptr++] = cy;
          data[ptr++] = cz;
          data[ptr++] = u;
          data[ptr++] = v;
          data[ptr++] = shade;
        }
      }
    }
  }
  return data;
}

export function createGpuDitherCanvas(width: number, height: number): GpuDitherCanvas | null {
  const glCanvas = document.createElement("canvas");
  glCanvas.width = width;
  glCanvas.height = height;
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = glCanvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "default",
    });
  } catch {
    return null;
  }
  if (!gl) return null;

  const program = createProgram(gl, PASS_VERT_SRC, DITHER_PASS_FRAG_SRC);
  const vao = gl.createVertexArray();
  const quadBuf = gl.createBuffer();
  const tex = gl.createTexture();
  if (!program || !vao || !quadBuf || !tex) {
    if (program) gl.deleteProgram(program);
    return null;
  }

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, "aPos");
  if (posLoc >= 0) {
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  }

  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.disable(gl.BLEND);

  const loc = {
    uTex: gl.getUniformLocation(program, "uTex"),
    uGridSize: gl.getUniformLocation(program, "uGridSize"),
    uLightMode: gl.getUniformLocation(program, "uLightMode"),
    uPreserveColor: gl.getUniformLocation(program, "uPreserveColor"),
    uEdgeStrength: gl.getUniformLocation(program, "uEdgeStrength"),
    uGamma: gl.getUniformLocation(program, "uGamma"),
    uAlphaThreshold: gl.getUniformLocation(program, "uAlphaThreshold"),
    uReveal: gl.getUniformLocation(program, "uReveal"),
    uDitherAmount: gl.getUniformLocation(program, "uDitherAmount"),
    uLevels: gl.getUniformLocation(program, "uLevels"),
    uPointerUv: gl.getUniformLocation(program, "uPointerUv"),
    uHoverStrength: gl.getUniformLocation(program, "uHoverStrength"),
    uLocalRippleCount: gl.getUniformLocation(program, "uLocalRippleCount"),
  };

  let texW = 0;
  let texH = 0;

  interface CubePipeline {
    program: WebGLProgram;
    vao: WebGLVertexArrayObject;
    fbo: WebGLFramebuffer;
    tex: WebGLTexture;
    locs: {
      uCurrent: WebGLUniformLocation | null;
      uFraction: WebGLUniformLocation | null;
      uYaw: WebGLUniformLocation | null;
      uTilt: WebGLUniformLocation | null;
    };
  }
  let cubePipe: CubePipeline | null | undefined;

  function ensureCubePipeline(): CubePipeline | null {
    if (cubePipe !== undefined) return cubePipe;
    if (!gl) {
      cubePipe = null;
      return null;
    }
    const cProg = createProgram(gl, CUBE_VERT_SRC, CUBE_FRAG_SRC);
    const cVao = gl.createVertexArray();
    const cVbo = gl.createBuffer();
    const cFbo = gl.createFramebuffer();
    const cTex = gl.createTexture();
    const cDepth = gl.createRenderbuffer();
    if (!cProg || !cVao || !cVbo || !cFbo || !cTex || !cDepth) {
      if (cProg) gl.deleteProgram(cProg);
      cubePipe = null;
      return null;
    }

    gl.bindVertexArray(cVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, cVbo);
    gl.bufferData(gl.ARRAY_BUFFER, buildCubeMeshData(), gl.STATIC_DRAW);
    const stride = 9 * 4;
    const bindAttr = (name: string, size: number, offsetFloats: number) => {
      const aLoc = gl!.getAttribLocation(cProg, name);
      if (aLoc >= 0) {
        gl!.enableVertexAttribArray(aLoc);
        gl!.vertexAttribPointer(aLoc, size, gl!.FLOAT, false, stride, offsetFloats * 4);
      }
    };
    bindAttr("aPos", 3, 0);
    bindAttr("aCenter", 3, 3);
    bindAttr("aTileUv", 2, 6);
    bindAttr("aShade", 1, 8);

    gl.bindTexture(gl.TEXTURE_2D, cTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 400, 300, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindRenderbuffer(gl.RENDERBUFFER, cDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 400, 300);

    gl.bindFramebuffer(gl.FRAMEBUFFER, cFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cTex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, cDepth);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    cubePipe = {
      program: cProg,
      vao: cVao,
      fbo: cFbo,
      tex: cTex,
      locs: {
        uCurrent: gl.getUniformLocation(cProg, "uCurrent"),
        uFraction: gl.getUniformLocation(cProg, "uFraction"),
        uYaw: gl.getUniformLocation(cProg, "uYaw"),
        uTilt: gl.getUniformLocation(cProg, "uTilt"),
      },
    };
    return cubePipe;
  }

  function runDitherPass(
    boundTex: WebGLTexture,
    target: HTMLCanvasElement,
    options: Omit<DitherTexOptions, "gridW" | "gridH">,
  ): boolean {
    if (!gl) return false;
    const targetCtx = target.getContext("2d");
    if (!targetCtx) return false;
    const gridW = Math.max(1, target.width);
    const gridH = Math.max(1, target.height);
    if (glCanvas.width !== gridW || glCanvas.height !== gridH) {
      glCanvas.width = gridW;
      glCanvas.height = gridH;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gridW, gridH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, boundTex);

    gl.useProgram(program);
    gl.uniform1i(loc.uTex, 0);
    gl.uniform2i(loc.uGridSize, gridW, gridH);
    gl.uniform1i(loc.uLightMode, options.lightMode ? 1 : 0);
    gl.uniform1i(loc.uPreserveColor, options.preserveColor === false ? 0 : 1);
    gl.uniform1f(loc.uEdgeStrength, options.edgeStrength ?? 0.45);
    gl.uniform1f(loc.uGamma, options.gamma ?? (options.lightMode ? 0.92 : 0.84));
    gl.uniform1f(loc.uAlphaThreshold, (options.alphaThreshold ?? 40) / 255);
    gl.uniform1f(loc.uReveal, options.reveal ?? 1);
    gl.uniform1f(loc.uDitherAmount, options.ditherAmount ?? 0.22);
    gl.uniform1f(loc.uLevels, Math.max(2, Math.round(options.levels ?? 4)));
    gl.uniform2f(loc.uPointerUv, -1, -1);
    gl.uniform1f(loc.uHoverStrength, 0);
    gl.uniform1i(loc.uLocalRippleCount, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    const prevSmooth = targetCtx.imageSmoothingEnabled;
    targetCtx.imageSmoothingEnabled = false;
    targetCtx.clearRect(0, 0, gridW, gridH);
    targetCtx.drawImage(glCanvas, 0, 0);
    targetCtx.imageSmoothingEnabled = prevSmooth;
    return true;
  }

  return {
    dither(source, target, options) {
      if (gl.isContextLost()) return false;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      if (texW !== source.width || texH !== source.height) {
        texW = source.width;
        texH = source.height;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      } else {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
      }
      return runDitherPass(tex, target, options);
    },

    drawCube(target, clock, lightMode) {
      if (gl.isContextLost()) return false;
      const pipe = ensureCubePipeline();
      if (!pipe) return false;

      const duration = 1.8;
      const moveCount = 6;
      const cycle = (clock % (duration * moveCount)) / duration;
      const current = Math.floor(cycle);
      const fraction = ease(clamp((cycle - current) / 0.75));
      const yaw = -0.55 + Math.sin((cycle / moveCount) * Math.PI * 2) * 0.14;
      const tilt = 0.52;

      gl.bindFramebuffer(gl.FRAMEBUFFER, pipe.fbo);
      gl.viewport(0, 0, 400, 300);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.bindVertexArray(pipe.vao);
      gl.useProgram(pipe.program);
      gl.uniform1i(pipe.locs.uCurrent, current);
      gl.uniform1f(pipe.locs.uFraction, fraction);
      gl.uniform1f(pipe.locs.uYaw, yaw);
      gl.uniform1f(pipe.locs.uTilt, tilt);
      gl.drawArrays(gl.TRIANGLES, 0, 54 * 6);
      gl.disable(gl.DEPTH_TEST);

      return runDitherPass(pipe.tex, target, {
        lightMode,
        preserveColor: true,
        edgeStrength: 0.42,
        ditherAmount: 0.22,
      });
    },

    warmup() {
      if (!gl.isContextLost()) {
        ensureCubePipeline();
      }
    },
  };
}
