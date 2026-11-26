import { clamp, ease } from "../timeline";
import { renderBayerDither } from "./dither";
import { createGpuDitherCanvas, type GpuDitherCanvas } from "./glStage";

interface HobbyScratch {
  source: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
}

const hobbyScratch = new WeakMap<HTMLCanvasElement, HobbyScratch>();
let gpuDitherer: GpuDitherCanvas | null | undefined;

export function resetHobbyCaches(): void {
  // Retained for theme-change cache hook compatibility.
}

export function buildHobbyArt(
  target: HTMLCanvasElement,
  clock = 0,
  lightMode = false,
): void {
  const kind = target.dataset.hobby;
  if (target.width !== 280 || target.height !== 204) {
    target.width = 280;
    target.height = 204;
  }

  if (gpuDitherer === undefined) {
    gpuDitherer = createGpuDitherCanvas(280, 204);
  }
  if (kind === "cube" && gpuDitherer && gpuDitherer.drawCube(target, clock, lightMode)) {
    return;
  }

  let scratch = hobbyScratch.get(target);
  if (!scratch) {
    const source = document.createElement("canvas");
    source.width = 400;
    source.height = 300;
    scratch = {
      source,
      ctx: source.getContext("2d"),
    };
    hobbyScratch.set(target, scratch);
  }
  const { source, ctx: c } = scratch;
  if (!c) return;
  c.clearRect(0, 0, 400, 300);

  function polygon(
    vertices: [number, number][],
    fill: string,
    stroke = "#181e1b",
    lineWidth = 3,
  ) {
    c!.beginPath();
    vertices.forEach(([x, y], i) => (i ? c!.lineTo(x, y) : c!.moveTo(x, y)));
    c!.closePath();
    c!.fillStyle = fill;
    c!.fill();
    if (lineWidth > 0) {
      c!.strokeStyle = stroke;
      c!.lineWidth = lineWidth;
      c!.lineJoin = "round";
      c!.stroke();
    }
  }

  const edgeStrength = kind === "gundam" ? 0.55 : 0.42;
  if (kind === "gundam") {
    // Neck & collar base
    polygon(
      [
        [156, 246],
        [244, 246],
        [256, 286],
        [144, 286],
      ],
      "#303733",
      "#141916",
      3,
    );
    c.strokeStyle = "#6c766e";
    c.lineWidth = 3;
    for (let row = 0; row < 3; row++) {
      c.beginPath();
      c.moveTo(158 - row * 3, 258 + row * 10);
      c.lineTo(242 + row * 3, 258 + row * 10);
      c.stroke();
    }

    // Protruding angular ear pods & recessed vertical vents
    polygon(
      [
        [98, 128],
        [124, 114],
        [128, 224],
        [102, 232],
        [92, 198],
        [92, 152],
      ],
      "#bcc3bb",
      "#181e1b",
      3,
    );
    polygon(
      [
        [276, 114],
        [302, 128],
        [308, 152],
        [308, 198],
        [298, 232],
        [272, 224],
      ],
      "#8d978f",
      "#181e1b",
      3,
    );
    polygon(
      [
        [99, 150],
        [114, 146],
        [114, 206],
        [100, 208],
      ],
      "#363f3a",
      "#181e1b",
      2,
    );
    polygon(
      [
        [286, 146],
        [301, 150],
        [300, 208],
        [286, 206],
      ],
      "#29302c",
      "#181e1b",
      2,
    );

    // Main helmet dome (left lit facet, right shaded facet)
    polygon(
      [
        [118, 108],
        [136, 62],
        [170, 44],
        [200, 42],
        [200, 126],
        [114, 134],
      ],
      "#efeee3",
      "#181e1b",
      3,
    );
    polygon(
      [
        [200, 42],
        [230, 44],
        [264, 62],
        [282, 108],
        [286, 134],
        [200, 126],
      ],
      "#b7c0b8",
      "#181e1b",
      3,
    );

    // Cheek guards / jaw flanges framing the mask
    polygon(
      [
        [114, 134],
        [142, 128],
        [152, 226],
        [168, 248],
        [132, 244],
        [114, 212],
      ],
      "#dde0d6",
      "#181e1b",
      3,
    );
    polygon(
      [
        [258, 128],
        [286, 134],
        [286, 212],
        [268, 244],
        [232, 248],
        [248, 226],
      ],
      "#9fa8a0",
      "#181e1b",
      3,
    );

    // Forehead Vulcan ports
    for (const [vx, fill] of [
      [154, "#242c27"],
      [246, "#1f2622"],
    ] as const) {
      c.beginPath();
      c.arc(vx, 78, 6.5, 0, Math.PI * 2);
      c.fillStyle = fill;
      c.fill();
      c.strokeStyle = "#6c766e";
      c.lineWidth = 2;
      c.stroke();
    }

    // Tall Mohawk crest / main camera housing
    polygon(
      [
        [182, 24],
        [218, 24],
        [222, 114],
        [178, 114],
      ],
      "#ecebe0",
      "#181e1b",
      3,
    );
    polygon(
      [
        [200, 24],
        [218, 24],
        [222, 114],
        [200, 114],
      ],
      "#c5ccc3",
      "#181e1b",
      2,
    );
    // Main camera bezel + illuminated sensor
    polygon(
      [
        [187, 32],
        [213, 32],
        [214, 62],
        [186, 62],
      ],
      "#232a26",
      "#141916",
      2,
    );
    polygon(
      [
        [190, 36],
        [210, 36],
        [210, 56],
        [190, 56],
      ],
      "#c8d9bf",
      "#181e1b",
      1.5,
    );

    // Recessed dark visor cavity + brow overhang
    polygon(
      [
        [136, 130],
        [178, 118],
        [222, 118],
        [264, 130],
        [254, 168],
        [200, 156],
        [146, 168],
      ],
      "#141916",
      "#0d100e",
      3,
    );

    // Twin glowing gold eyes inside shadow band
    polygon(
      [
        [149, 140],
        [182, 134],
        [180, 151],
        [152, 155],
      ],
      "#f6e27a",
      "#141916",
      2,
    );
    polygon(
      [
        [218, 134],
        [251, 140],
        [248, 155],
        [220, 151],
      ],
      "#ebd56c",
      "#141916",
      2,
    );

    // Sculpted split faceplate (mask)
    polygon(
      [
        [146, 168],
        [184, 156],
        [200, 156],
        [200, 240],
        [176, 240],
        [152, 224],
      ],
      "#f2f2e8",
      "#181e1b",
      3,
    );
    polygon(
      [
        [200, 156],
        [216, 156],
        [254, 168],
        [248, 224],
        [224, 240],
        [200, 240],
      ],
      "#c4cbc0",
      "#181e1b",
      3,
    );

    // Iconic two parallel horizontal dark mouth vents
    c.strokeStyle = "#181e1b";
    c.lineWidth = 5;
    c.lineCap = "round";
    for (const my of [204, 220]) {
      c.beginPath();
      c.moveTo(178, my);
      c.lineTo(222, my);
      c.stroke();
    }

    // Cheek guard exhaust slits
    c.strokeStyle = "#1c231f";
    c.lineWidth = 4;
    for (let i = 0; i < 2; i++) {
      c.beginPath();
      c.moveTo(124, 178 + i * 16);
      c.lineTo(138, 172 + i * 16);
      c.stroke();
      c.beginPath();
      c.moveTo(276, 178 + i * 16);
      c.lineTo(262, 172 + i * 16);
      c.stroke();
    }

    // Trapezoidal red chin guard
    polygon(
      [
        [182, 238],
        [218, 238],
        [214, 266],
        [186, 266],
      ],
      "#ba5d4f",
      "#181e1b",
      3,
    );

    // Wide sweeping V-fin blades + central crimson pentagonal crest
    polygon(
      [
        [24, 30],
        [186, 108],
        [184, 128],
        [154, 122],
        [52, 54],
      ],
      "#f4f0dc",
      "#181e1b",
      3,
    );
    polygon(
      [
        [376, 30],
        [348, 54],
        [246, 122],
        [216, 128],
        [214, 108],
      ],
      "#dad5bf",
      "#181e1b",
      3,
    );
    polygon(
      [
        [184, 98],
        [216, 98],
        [220, 120],
        [200, 142],
        [180, 120],
      ],
      "#ba5d4f",
      "#181e1b",
      3,
    );
    polygon(
      [
        [189, 104],
        [211, 104],
        [212, 113],
        [188, 113],
      ],
      "#dc8374",
      "#181e1b",
      0,
    );
  } else if (kind === "cube") {
    const moves = [
      { axis: 1, angle: 1 },
      { axis: 0, angle: 1 },
      { axis: 2, angle: 1 },
      { axis: 2, angle: -1 },
      { axis: 0, angle: -1 },
      { axis: 1, angle: -1 },
    ];
    const duration = 1.8;
    const cycle = (clock % (duration * moves.length)) / duration;
    const current = Math.floor(cycle);
    const fraction = ease(clamp((cycle - current) / 0.75));
    const yaw = -0.55 + Math.sin((cycle / moves.length) * Math.PI * 2) * 0.14;
    const tilt = 0.52;

    function rotate(
      p: [number, number, number],
      axis: number,
      angle: number,
    ): [number, number, number] {
      const q: [number, number, number] = [...p];
      const a = (axis + 1) % 3;
      const b = (axis + 2) % 3;
      q[a] = p[a] * Math.cos(angle) - p[b] * Math.sin(angle);
      q[b] = p[a] * Math.sin(angle) + p[b] * Math.cos(angle);
      return q;
    }

    function camera([x, y, z]: [number, number, number]): [number, number, number] {
      const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
      const rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
      return [
        rx,
        y * Math.cos(tilt) - rz * Math.sin(tilt),
        y * Math.sin(tilt) + rz * Math.cos(tilt),
      ];
    }

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
    const tiles: { corners: [number, number, number][]; depth: number; shade: number }[] =
      [];

    for (const face of faces) {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          let center: [number, number, number] = [
            face.n[0] * 1.5 + face.u[0] * (col - 1) + face.v[0] * (row - 1),
            face.n[1] * 1.5 + face.u[1] * (col - 1) + face.v[1] * (row - 1),
            face.n[2] * 1.5 + face.u[2] * (col - 1) + face.v[2] * (row - 1),
          ];
          let normal: [number, number, number] = [...face.n];
          let corners: [number, number, number][] = [
            [-0.44, -0.44],
            [0.44, -0.44],
            [0.44, 0.44],
            [-0.44, 0.44],
          ].map(([u, v]) => [
            center[0] + face.u[0] * u + face.v[0] * v,
            center[1] + face.u[1] * u + face.v[1] * v,
            center[2] + face.u[2] * u + face.v[2] * v,
          ]);
          for (let step = 0; step <= current; step++) {
            const move = moves[step];
            if (center[move.axis] > 0.5) {
              const angle =
                ((move.angle * Math.PI) / 2) * (step < current ? 1 : fraction);
              center = rotate(center, move.axis, angle);
              normal = rotate(normal, move.axis, angle);
              corners = corners.map((p) => rotate(p, move.axis, angle));
            }
          }
          if (camera(normal)[2] < 0.01) continue;
          corners = corners.map(camera);
          const shade = Math.round(face.shade * (0.78 + ((row + col * 2) % 3) * 0.1));
          tiles.push({
            corners,
            depth: corners.reduce((sum, p) => sum + p[2], 0) / 4,
            shade,
          });
        }
      }
    }
    tiles
      .sort((a, b) => a.depth - b.depth)
      .forEach(({ corners, shade }) =>
        polygon(
          corners.map(([x, y]) => [200 + x * 55, 157 - y * 55]),
          `rgb(${shade},${shade + 3},${shade - 7})`,
          "#1f2622",
          3.5,
        ),
      );
  } else {
    c.save();
    c.translate(180, 124);
    c.rotate(-0.25);

    // Handle + metallic collar ferrule
    c.strokeStyle = "#181e1b";
    c.lineWidth = 36;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(64, 62);
    c.lineTo(138, 136);
    c.stroke();
    c.strokeStyle = "#8e9b93";
    c.lineWidth = 28;
    c.beginPath();
    c.moveTo(64, 62);
    c.lineTo(138, 136);
    c.stroke();
    c.strokeStyle = "#cbd3ca";
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(68, 56);
    c.lineTo(132, 120);
    c.stroke();

    // Lens body & crisp outer rim
    const glass = c.createRadialGradient(-28, -30, 8, 0, 0, 86);
    glass.addColorStop(0, "#d4dcd3");
    glass.addColorStop(0.55, "#7c8d86");
    glass.addColorStop(1, "#303a37");
    c.fillStyle = glass;
    c.beginPath();
    c.ellipse(0, 0, 85, 80, 0, 0, Math.PI * 2);
    c.fill();

    // Fingerprint / mystery ridges inside lens
    c.strokeStyle = "#1b2320";
    c.lineWidth = 4.5;
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.ellipse(4, 4, 14 + i * 9, 18 + i * 8, 0.25, 0.4, 4.5);
      c.stroke();
    }

    // Specular highlight arc
    c.strokeStyle = "#eef2ea";
    c.lineWidth = 5;
    c.beginPath();
    c.ellipse(0, 0, 65, 60, -0.2, 3.3, 4.7);
    c.stroke();

    // Crisp rim outline
    c.strokeStyle = "#e3e5dc";
    c.lineWidth = 12;
    c.beginPath();
    c.ellipse(0, 0, 85, 80, 0, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = "#181e1b";
    c.lineWidth = 3;
    c.stroke();

    c.restore();
  }

  if (
    gpuDitherer &&
    gpuDitherer.dither(source, target, {
      lightMode,
      preserveColor: true,
      edgeStrength,
      ditherAmount: 0.22,
    })
  ) {
    return;
  }

  renderBayerDither(source, target, {
    cellSize: 1,
    ditherAmount: 0.22,
    lightMode,
    preserveColor: true,
    edgeStrength,
  });
}
