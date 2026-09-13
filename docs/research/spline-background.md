# Spline background research

## Recommendation

Use a restrained, data-pipeline-inspired geometry layer in the hero: thin orthogonal lanes, sparse nodes, and one slow signal pulse. This is more relevant to a data-engineering portfolio than a generic terrain scene, and it can remain a static CSS/SVG fallback with no runtime dependency. A real Spline scene should be authored in Spline and exported before it is embedded; do not invent or ship a made-up `.splinecode` URL.

## Verified implementation facts

- Spline's official Viewer is a native `<spline-viewer>` web component. The documented setup loads `https://unpkg.com/@splinetool/viewer/build/spline-viewer.js` and supplies an exported scene URL through the `url` attribute. [Exporting as Spline Viewer](https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer) · [Official Viewer examples](https://viewer.spline.design/)
- The Viewer is more flexible than an iframe: it can receive global page events such as mouse position and scroll. Public URL embeds are iframe-based and only receive local canvas events. [Exporting as Spline Viewer](https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer)
- Spline's workflow is Export → Viewer → wait for the generated URL → copy the embed snippet. The scene URL therefore comes from a Spline-authored/exported scene, not from the website code alone. [Exporting as Spline Viewer](https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer)
- For performance, Spline recommends reducing polygons, object count, materials, textures, lights, and post-processing; its Performance Panel exposes estimated export size, loading score, polygons, materials, lights, textures, and related metrics. Keep the hero to one simple embed, and prefer the Viewer when lazy-loading is useful. [How to optimize your scene](https://docs.spline.design/exporting-your-scene/how-to-optimize-your-scene)
- Play Settings can hide the scene background for transparent compositing and can constrain orbit/pan/zoom/scroll behavior. [Play Settings](https://docs.spline.design/exporting-your-scene/play-settings)
- Spline notes that 3D requires more CPU/GPU processing than traditional 2D content. A static fallback and a user-triggered scene load are therefore appropriate for a portfolio hero. [FAQ](https://docs.spline.design/basics/faq)

## Local preview

`public/spline-preview.html` intentionally shows the local orthogonal data-lane concept by default. It does not claim the SVG is a Spline scene. The controls accept an optional HTTPS scene URL and load the official Viewer script only after the user requests it; this keeps the default preview dependency-free and makes the provenance of any real 3D scene explicit.

## Limits

No relevant, verified public Spline scene URL was found in the official documentation; the documented examples demonstrate viewer capabilities but are not a portfolio-specific data pipeline. The final portfolio should use a scene URL exported from the owner's Spline file after tuning the Performance Panel and testing mobile/GPU behavior. Reduced-motion handling is implemented locally; the Spline scene itself should also have motion and camera behavior disabled or minimized in its Play Settings for users who request reduced motion.
