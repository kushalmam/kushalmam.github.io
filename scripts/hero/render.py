"""Original portfolio sculpture. Run with Blender --background --python this_file.
No external models, textures, fonts, or hosted assets are used.
"""
import bpy
import os
import math
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


def material(name, color, metallic=0, roughness=.3, transmission=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Transmission Weight'].default_value = transmission
    bsdf.inputs['IOR'].default_value = 1.46
    return mat

shell = material('Ceramic blasted aluminium', (.62, .63, .65), .8, .22)
graphite = material('Matte graphite chassis', (.027, .028, .030), .65, .26)
acrylic = material('Smoked optical acrylic', (.79, .81, .84), .0, .07, .94)
steel = material('Satin steel fixings', (.48, .50, .53), .85, .19)
lime = material('Lime internal ceramic', (.48, 1.0, .018), .15, .28)


def box(name, location, scale, mat, bevel=.06):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Machined edge radius', 'BEVEL')
        mod.width = bevel
        mod.segments = 5
        obj.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
    return obj


def ring(name, z, thickness, mat, size=(3.7, 3.15), opening=(2.4, 1.85), shift=0):
    obj = box(name, (shift, 0, z), (*size, thickness), mat, 0)
    tool = box('Aperture tool', (shift+.08, -.06, z), (*opening, thickness+2), mat, .15)
    bpy.context.view_layer.objects.active = tool
    bpy.ops.object.modifier_apply(modifier='Machined edge radius')
    bpy.context.view_layer.objects.active = obj
    cut = obj.modifiers.new('Through aperture', 'BOOLEAN')
    cut.operation = 'DIFFERENCE'
    cut.object = tool
    bpy.ops.object.modifier_apply(modifier=cut.name)
    bpy.data.objects.remove(tool, do_unlink=True)
    mod = obj.modifiers.new('Soft precision edges', 'BEVEL')
    mod.width = min(.065, thickness*.24)
    mod.segments = 4
    obj.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
    return obj

# A single assembly: a dense base, aligned optical layers, and an open shell.
box('Solid lower chassis', (0, 0, -.95), (3.72, 3.17, .40), graphite, .12)
box('Inset lower sole', (0, 0, -1.19), (3.4, 2.85, .1), steel, .055)
for i in range(6):
    ring(f'Optical layer {i+1:02}', -.61 + i*.225, .125, acrylic)
    # Paired standoffs make the separation and dependency of layers legible.
    for x in [-1.59, 1.59]:
        for y in [-1.30, 1.30]:
            bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=.045, depth=.225, location=(x,y,-.53+i*.225))
            bpy.context.object.name = 'Internal alignment pin'
            bpy.context.object.data.materials.append(steel)
ring('Upper machined shell', .98, .34, shell)
ring('Floating cover interface', 1.38, .12, graphite, size=(3.69,3.14))
# One colored internal component, recessed within the assembly.
box('Lime functional insert', (-.40, .48, .77), (1.18, .26, .22), lime, .055)
box('Internal matte cartridge', (-.34, .18, -.62), (1.35, 1.4, .16), graphite, .045)
for x in [-.80, -.59, -.38, -.17, .04]:
    box('Cartridge relief', (x, .20, -.51), (.055, 1.02, .05), steel, .012)
# A discreet bank of machined recesses on the front of the base.
for x in [-1.2,-.98,-.76,-.54,-.32]:
    box('Base interface recess', (x,-1.586,-.94), (.095,.008,.11), steel, .01)

world = bpy.data.worlds.new('Studio world')
bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (.40,.40,.40,1)
world.node_tree.nodes['Background'].inputs[1].default_value = .45


def area(name, location, power, color, size, target=(0,0,0)):
    bpy.ops.object.light_add(type='AREA', location=location)
    lamp = bpy.context.object
    lamp.name = name
    lamp.data.energy = power
    lamp.data.color = color
    lamp.data.shape = 'DISK'
    lamp.data.size = size
    lamp.rotation_euler = (Vector(target)-lamp.location).to_track_quat('-Z','Y').to_euler()

area('Large silk key', (1,-4,7), 1500, (1,1,1), 5)
area('Soft cool edge', (2,4,4), 1900, (.91,.95,1), 4)
area('Left material fill', (-5,-1,2), 900, (1,.98,.95), 3)
bpy.ops.object.camera_add(location=(6.3,-8.2,6.0))
camera = bpy.context.object
camera.rotation_euler = (Vector((0,0,.1))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 6.35
bpy.context.scene.camera = camera
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 10
scene.cycles.transmission_bounces = 8
scene.render.resolution_x = 1400
scene.render.resolution_y = 1400
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'AgX'
scene.render.filepath = os.path.join(ROOT, 'scripts/hero/assembly-master.png')
# One restrained 24-second cycle, also retained in the editable Blender source.
assembly = bpy.data.objects.new('Assembly motion', None)
scene.collection.objects.link(assembly)
parts = [obj for obj in scene.objects if obj.type == 'MESH']
for part in parts:
    part.parent = assembly
layers = [obj for obj in parts if obj.name.startswith('Optical layer')]
base_heights = {obj.name: obj.location.z for obj in layers}
scene.render.fps = 6
scene.frame_start = 1
scene.frame_end = 144
for frame in range(1, 146):
    phase = (frame - 1) / 144 * math.tau
    # Blender's Z up-axis becomes the vertical Y axis in web coordinates.
    assembly.rotation_euler.z = math.radians(4) * math.sin(phase)
    assembly.keyframe_insert(data_path='rotation_euler', frame=frame)
    for index, layer in enumerate(layers):
        layer.location.z = base_heights[layer.name] + .014 * (math.sin(phase + index*.55) - math.sin(index*.55))
        layer.keyframe_insert(data_path='location', frame=frame)
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, 'scripts/hero/assembly.blend'))
bpy.ops.render.render(write_still=True)

if os.environ.get('HERO_ANIMATION') == '1':
    scene.render.resolution_x = 700
    scene.render.resolution_y = 700
    scene.cycles.samples = 8
    scene.render.filepath = os.path.join(ROOT, 'tmp/hero-frames/frame-')
    os.makedirs(os.path.dirname(scene.render.filepath), exist_ok=True)
    bpy.ops.render.render(animation=True)
