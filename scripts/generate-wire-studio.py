"""Generate an original linear HDR studio panorama (no third-party assets).
Run: uv run scripts/generate-wire-studio.py
"""
import math
from pathlib import Path

width, height = 512, 256
pixels = bytearray()
for y in range(height):
    latitude = (y + 0.5) / height * math.pi
    for x in range(width):
        longitude = (x + 0.5) / width * math.tau
        dx = math.sin(latitude) * math.cos(longitude)
        dy = math.cos(latitude)
        dz = math.sin(latitude) * math.sin(longitude)
        key = 4.0 * math.exp(-((dy - .48) / .25) ** 8) * math.exp(-((dz - .68) / .5) ** 8)
        strip = 2.5 * math.exp(-((dy + .5) / .10) ** 4) * math.exp(-((dz - .4) / .65) ** 8)
        rim = 1.8 * math.exp(-((dx + .8) / .15) ** 4) * math.exp(-(dy / .8) ** 8)
        rgb = [.065 + key + strip * .74 + rim * .7,
               .075 + key * .96 + strip * .86 + rim * .82,
               .09 + key * .88 + strip + rim]
        mantissa, exponent = math.frexp(max(rgb))
        scale = mantissa * 256 / max(rgb)
        pixels.extend([min(255, int(c * scale)) for c in rgb] + [exponent + 128])
path = Path(__file__).resolve().parents[1] / 'public/environments/wire-studio.hdr'
path.write_bytes(f'#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y {height} +X {width}\n'.encode() + pixels)
