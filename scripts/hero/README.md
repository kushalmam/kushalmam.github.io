# Assembly hero

Original Blender geometry, materials, camera, and lighting. No third-party models,
textures, hosted scenes, or image-generation services are used. All typography is HTML.

`assembly.blend` holds the editable assembly and a 24-second mechanical loop:
±4° around Blender's vertical Z axis (web Y), and phase-offset optical-layer shifts
of at most .028 scene units from the initial pose. No full rotation or camera tilt.
Neutral silver, graphite and clear acrylic materials isolate the lime insert.

```sh
# Rebuild the scene, animation keyframes, and high-quality static poster.
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/hero/render.py
# Also render 144 offline animation frames, using the same camera and lighting.
HERO_ANIMATION=1 /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/hero/render.py
uv run --no-project --with pillow python scripts/hero/optimize.py
uv run --no-project --with pillow python scripts/hero/encode_motion.py
```

Blender needs normal device access even for CPU background rendering. Pillow and
FFmpeg/libvpx are authoring dependencies only. The motion exporter blends the small
subpixel changes in premultiplied alpha, including the loop seam, to produce a 24fps
transparent VP9 WebM. Only optimized WebP posters and the WebM in `public/images/hero/`
ship with the website; source frames remain in gitignored `tmp/hero-frames/`.

`AssemblyVisual.tsx` adds a 6px total vertical drift and mouse-only parallax capped
at ±2.5px horizontally and ±1.5px vertically. Motion pauses offscreen, in hidden
documents, and through the caption's pause button. Reduced-motion visits do not
load the video. Playback errors or missing alpha support retain the poster.

The 700px video serves desktop and mobile; static images have 700px and 1400px
sources. No GLB, Spline connection, or client-side 3D renderer is required.
