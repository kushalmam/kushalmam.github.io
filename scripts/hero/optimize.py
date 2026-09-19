"""UV_CACHE_DIR=/tmp/portfolio-uv uv run --with pillow scripts/hero/optimize.py"""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[2]
source = Image.open(root / 'scripts/hero/assembly-master.png')
for size in (700, 1400):
    output = root / f'public/images/hero/assembly-{size}.webp'
    source.resize((size, size), Image.Resampling.LANCZOS).save(output, quality=85, method=6)
    print(f'{output.name}: {output.stat().st_size:,} bytes')
