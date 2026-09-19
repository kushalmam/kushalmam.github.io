"""uv run --no-project --with pillow python scripts/hero/encode_motion.py
Interpolate subpixel motion in premultiplied alpha, then encode a local VP9 video.
"""
from pathlib import Path
import subprocess
from PIL import Image

root = Path(__file__).resolve().parents[2]
frames = sorted((root / 'tmp/hero-frames').glob('frame-*.png'))
if len(frames) != 144:
    raise SystemExit(f'Expected 144 Blender frames, found {len(frames)}')
output = root / 'public/images/hero/assembly-motion.webm'
temporary = root / 'tmp/assembly-motion.webm'
encoder = subprocess.Popen([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', '700x700',
    '-framerate', '24', '-i', '-', '-an', '-c:v', 'libvpx-vp9',
    '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0', '-row-mt', '1',
    '-cpu-used', '4', '-crf', '32', '-b:v', '0', str(temporary),
], stdin=subprocess.PIPE)
try:
    current = Image.open(frames[0]).convert('RGBa')
    for index in range(len(frames)):
        following = Image.open(frames[(index + 1) % len(frames)]).convert('RGBa')
        for fraction in (0, .25, .5, .75):
            frame = Image.blend(current, following, fraction).convert('RGBA')
            encoder.stdin.write(frame.tobytes())
        current = following
finally:
    encoder.stdin.close()
if encoder.wait() != 0:
    raise SystemExit('Video encoding failed')
temporary.replace(output)
print(f'{output.name}: {output.stat().st_size:,} bytes, 24 seconds, 24 fps')
