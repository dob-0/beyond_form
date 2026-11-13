"""Blender headless: STL -> decimated GLB. Run per file:
blender -b -P stl2glb.py -- in.stl out.glb [target_tris]
"""
import sys

import bpy

argv = sys.argv[sys.argv.index('--') + 1:]
src, dst = argv[0], argv[1]
target = int(argv[2]) if len(argv) > 2 else 40000

bpy.ops.wm.read_factory_settings(use_empty=True)
if hasattr(bpy.ops.wm, 'stl_import'):
    bpy.ops.wm.stl_import(filepath=src)
else:
    bpy.ops.import_mesh.stl(filepath=src)

obj = bpy.context.selected_objects[0]
bpy.context.view_layer.objects.active = obj
tris = len(obj.data.loop_triangles) or len(obj.data.polygons) * 2
obj.data.calc_loop_triangles()
tris = len(obj.data.loop_triangles)
ratio = min(1.0, target / max(tris, 1))
if ratio < 1.0:
    mod = obj.modifiers.new('dec', 'DECIMATE')
    mod.ratio = ratio
    bpy.ops.object.modifier_apply(modifier='dec')

# print files carry arbitrary units/orientation; normalize to a unit-ish scale
# centered at origin so every viewer frames them the same way
import mathutils
bbox = [obj.matrix_world @ mathutils.Vector(c) for c in obj.bound_box]
center = sum(bbox, mathutils.Vector()) / 8
size = max((max(v[i] for v in bbox) - min(v[i] for v in bbox)) for i in range(3))
obj.location = -center
bpy.ops.object.transform_apply(location=True)
s = 2.0 / size if size else 1.0
obj.scale = (s, s, s)
bpy.ops.object.transform_apply(scale=True)

obj.data.calc_loop_triangles()
print(f'{src}: {tris} -> {len(obj.data.loop_triangles)} tris')
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_apply=True)
