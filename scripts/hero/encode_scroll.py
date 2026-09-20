"""uv run --no-project --with pillow python scripts/hero/encode_scroll.py"""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[2]
frames = sorted((root / 'tmp/assembly-scroll').glob('*.png'))
if len(frames) != 25:
    raise SystemExit(f'Expected 25 frames, found {len(frames)}')
output = root / 'public/images/hero/scroll'
output.mkdir(exist_ok=True)
for frame in frames:
    image = Image.open(frame).convert('RGBA')
    image.save(output / f'{frame.stem}.webp', quality=95, method=6)
(root / 'public/images/hero/assembly-1600.webp').write_bytes((output / '00.webp').read_bytes())
print(f'{len(frames)} frames: {sum(p.stat().st_size for p in output.glob("*.webp")):,} bytes')
