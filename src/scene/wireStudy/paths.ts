// Five loose bundles preserve the broad horizontal field without tangling it.
const bundles = [
  [-3.9,-3.7,-3.25,-3.05,-3.3,-3.55,-3.4,-3.05,-2.8],
  [-2.15,-1.95,-1.75,-1.7,-1.95,-2.1,-1.9,-1.6,-1.45],
  [-.55,-.35,-.05,.05,-.15,-.3,-.05,.3,.4],
  [1.15,1.35,1.65,1.8,1.6,1.4,1.55,1.85,2.05],
  [2.95,3.15,3.5,3.65,3.45,3.2,3.3,3.65,3.9],
];
const depthClasses = [
  { z: -.45, brightness: .26, radius: .019 },
  { z: 0, brightness: .43, radius: .025 },
  { z: .45, brightness: .8, radius: .036 },
];
export const wireAssets = bundles.flatMap((path, bundle) =>
  [-.24, -.085, .075, .235].map((offset, strand) => {
    const depth = depthClasses[[2, 0, 1, 0][strand]];
    return {
      name: `Bundle ${bundle + 1} / strand ${strand + 1}`,
      bundle, depth: depth.z, brightness: depth.brightness, radius: depth.radius,
      points: path.map((y, i): [number, number, number] => [
        -12 + i * 3,
        y + offset * (1 + (i - 4) * .035),
        depth.z + bundle * .015,
      ]),
    };
  }),
);
