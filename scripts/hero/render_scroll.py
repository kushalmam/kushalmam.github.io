"""Render crisp, fixed-camera assembly states for scroll-driven playback.

Blender --background --python scripts/hero/render_scroll.py
HERO_FRAME_START / HERO_FRAME_END allow interrupted renders to resume.
"""
import os
from pathlib import Path
import bpy

ROOT = Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT / 'scripts/hero/assembly.blend'))
scene = bpy.context.scene
scene.frame_set(1)
# Freeze every animation source before comparing or rendering.
for obj in scene.objects:
    obj.animation_data_clear()
    if obj.data and hasattr(obj.data, 'animation_data_clear'):
        obj.data.animation_data_clear()
assembly = bpy.data.objects['Assembly motion']
assembly.rotation_euler = (0, 0, 0)
parts = [obj for obj in scene.objects if obj.type == 'MESH']
rest = {obj.name: obj.location.copy() for obj in parts}

scene.render.resolution_x = scene.render.resolution_y = 1600
scene.cycles.samples = 96
scene.cycles.adaptive_threshold = .01
scene.cycles.use_denoising = True
preferences = bpy.context.preferences.addons['cycles'].preferences
try:
    preferences.compute_device_type = 'METAL'
    preferences.get_devices()
    if any(device.type == 'METAL' for device in preferences.devices):
        for device in preferences.devices:
            device.use = device.type == 'METAL'
        scene.cycles.device = 'GPU'
except TypeError:
    pass  # CPU Cycles remains a portable fallback.
scene.render.use_motion_blur = False
scene.camera.data.dof.use_dof = False
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
output = ROOT / 'tmp/assembly-scroll'
output.mkdir(parents=True, exist_ok=True)

for frame in range(int(os.environ.get('HERO_FRAME_START', '0')),
                   int(os.environ.get('HERO_FRAME_END', '24')) + 1):
    expansion = frame / 24
    for obj in parts:
        obj.location = rest[obj.name].copy()
        z = rest[obj.name].z
        if obj.name.startswith('Optical layer'):
            offset = (int(obj.name[-2:]) - 1) * .075
        elif obj.name.startswith('Internal alignment pin'):
            offset = round((z + .53) / .225) * .075
        elif obj.name == 'Upper machined shell':
            offset = .53
        elif obj.name == 'Floating cover interface':
            offset = .76
        elif obj.name == 'Lime functional insert':
            offset = .53
        else:
            offset = 0
        obj.location.z += offset * expansion
    scene.render.filepath = str(output / f'{frame:02}.png')
    bpy.ops.render.render(write_still=True)
