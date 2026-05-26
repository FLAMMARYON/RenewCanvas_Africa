import bpy
import sys

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Output file from command line
output_file = sys.argv[-1]

# Create museum exterior: 20m wide × 10m deep × 15m tall modernist building
# Main building volume
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 7.5))
main_building = bpy.context.active_object
main_building.name = "MainBuilding"
main_building.scale = (10, 5, 7.5)  # 20m × 10m × 15m

# Create sandstone material
mat_stone = bpy.data.materials.new(name="Sandstone")
mat_stone.use_nodes = True
bsdf = mat_stone.node_tree.nodes["Principled BSDF"]
bsdf.inputs['Base Color'].default_value = (0.769, 0.659, 0.510, 1.0)  # #C4A882
bsdf.inputs['Roughness'].default_value = 0.8
main_building.data.materials.append(mat_stone)

# Create entrance archway (subtract from main building via boolean)
bpy.ops.mesh.primitive_cylinder_add(
    vertices=32,
    radius=1.5,
    depth=1.2,
    location=(0, 5.6, 3.5),
    rotation=(1.5708, 0, 0)  # 90 degrees in radians
)
archway = bpy.context.active_object
archway.name = "Archway"
archway.scale = (1, 1, 2)  # Taller archway

# Dark archway material
mat_dark = bpy.data.materials.new(name="DarkArchway")
mat_dark.use_nodes = True
bsdf_dark = mat_dark.node_tree.nodes["Principled BSDF"]
bsdf_dark.inputs['Base Color'].default_value = (0.1, 0.08, 0.06, 1.0)
bsdf_dark.inputs['Roughness'].default_value = 0.9
archway.data.materials.append(mat_dark)

# Roof edge/trim
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 15))
roof_trim = bpy.context.active_object
roof_trim.name = "RoofTrim"
roof_trim.scale = (10.5, 5.5, 0.2)

# Dark trim material
mat_trim = bpy.data.materials.new(name="DarkTrim")
mat_trim.use_nodes = True
bsdf_trim = mat_trim.node_tree.nodes["Principled BSDF"]
bsdf_trim.inputs['Base Color'].default_value = (0.15, 0.12, 0.09, 1.0)
bsdf_trim.inputs['Roughness'].default_value = 0.7
roof_trim.data.materials.append(mat_trim)

# Two decorative columns flanking entrance
for x_pos in [-4, 4]:
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16,
        radius=0.4,
        depth=6,
        location=(x_pos, 5.2, 3)
    )
    column = bpy.context.active_object
    column.name = f"Column_{x_pos}"
    column.data.materials.append(mat_stone)

# Logo banner planes (left and right of archway)
for x_pos in [-3, 3]:
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x_pos, 5.8, 6))
    banner = bpy.context.active_object
    banner.name = f"Banner_{x_pos}"
    banner.scale = (0.8, 3, 1)
    banner.rotation_euler = (1.5708, 0, 0)  # Face forward

    # Dark banner material
    mat_banner = bpy.data.materials.new(name=f"Banner_{x_pos}")
    mat_banner.use_nodes = True
    bsdf_banner = mat_banner.node_tree.nodes["Principled BSDF"]
    bsdf_banner.inputs['Base Color'].default_value = (0.06, 0.47, 0.43, 1.0)  # Teal
    bsdf_banner.inputs['Roughness'].default_value = 0.5
    banner.data.materials.append(mat_banner)

# Select all and join into one mesh
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = main_building
bpy.ops.object.join()

# Apply transformations
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

print(f"Exporting museum exterior to: {output_file}")
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_materials='EXPORT',
    export_apply=True,
)

print("Museum exterior export complete!")
