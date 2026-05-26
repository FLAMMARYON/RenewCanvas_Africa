import bpy
import sys

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Output file from command line
output_file = sys.argv[-1]

# Create artwork frame: 1.8m wide × 2.4m tall (portrait orientation)
# Dark wood frame with depth

# Outer frame border (dark wood)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
outer_frame = bpy.context.active_object
outer_frame.name = "OuterFrame"
outer_frame.scale = (0.95, 0.08, 1.27)  # 1.9m × 0.16m × 2.54m

# Dark wood material (#2C1810)
mat_wood = bpy.data.materials.new(name="DarkWood")
mat_wood.use_nodes = True
bsdf = mat_wood.node_tree.nodes["Principled BSDF"]
bsdf.inputs['Base Color'].default_value = (0.173, 0.094, 0.063, 1.0)  # #2C1810
bsdf.inputs['Roughness'].default_value = 0.6
bsdf.inputs['Metallic'].default_value = 0.0
outer_frame.data.materials.append(mat_wood)

# Inner mat (cream color)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.04, 0))
inner_mat = bpy.context.active_object
inner_mat.name = "InnerMat"
inner_mat.scale = (0.84, 0.02, 1.16)  # 1.68m × 0.04m × 2.32m

# Cream mat material (#f2eadc)
mat_cream = bpy.data.materials.new(name="CreamMat")
mat_cream.use_nodes = True
bsdf_cream = mat_cream.node_tree.nodes["Principled BSDF"]
bsdf_cream.inputs['Base Color'].default_value = (0.949, 0.918, 0.863, 1.0)  # #f2eadc
bsdf_cream.inputs['Roughness'].default_value = 0.52
inner_mat.data.materials.append(mat_cream)

# Inner opening (where artwork goes) - just a thin backing plane
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -0.06, 0))
backing = bpy.context.active_object
backing.name = "Backing"
backing.scale = (0.88, 1.13, 1)  # 1.76m × 2.26m (artwork area)

# Dark backing material
mat_backing = bpy.data.materials.new(name="Backing")
mat_backing.use_nodes = True
bsdf_backing = mat_backing.node_tree.nodes["Principled BSDF"]
bsdf_backing.inputs['Base Color'].default_value = (0.1, 0.08, 0.06, 1.0)
bsdf_backing.inputs['Roughness'].default_value = 0.9
backing.data.materials.append(mat_backing)

# Select all and join
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = outer_frame
bpy.ops.object.join()

# Apply transformations
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

print(f"Exporting artwork frame to: {output_file}")
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_materials='EXPORT',
    export_apply=True,
)

print("Artwork frame export complete!")
