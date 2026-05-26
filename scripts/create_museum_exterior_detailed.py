import bpy
import sys

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Output file from command line
output_file = sys.argv[-1]

# Materials
mat_sandstone = bpy.data.materials.new(name="Sandstone")
mat_sandstone.use_nodes = True
bsdf_sand = mat_sandstone.node_tree.nodes["Principled BSDF"]
bsdf_sand.inputs['Base Color'].default_value = (0.769, 0.659, 0.510, 1.0)  # #C4A882
bsdf_sand.inputs['Roughness'].default_value = 0.8
bsdf_sand.inputs['Metallic'].default_value = 0.0

mat_dark_interior = bpy.data.materials.new(name="DarkInterior")
mat_dark_interior.use_nodes = True
bsdf_dark = mat_dark_interior.node_tree.nodes["Principled BSDF"]
bsdf_dark.inputs['Base Color'].default_value = (0.039, 0.031, 0.024, 1.0)  # #0A0806
bsdf_dark.inputs['Roughness'].default_value = 0.9

mat_column_trim = bpy.data.materials.new(name="ColumnTrim")
mat_column_trim.use_nodes = True
bsdf_trim = mat_column_trim.node_tree.nodes["Principled BSDF"]
bsdf_trim.inputs['Base Color'].default_value = (0.094, 0.071, 0.035, 1.0)  # #181209
bsdf_trim.inputs['Roughness'].default_value = 0.7

mat_metal_banner = bpy.data.materials.new(name="MetalBanner")
mat_metal_banner.use_nodes = True
bsdf_metal = mat_metal_banner.node_tree.nodes["Principled BSDF"]
bsdf_metal.inputs['Base Color'].default_value = (0.1, 0.1, 0.1, 1.0)
bsdf_metal.inputs['Roughness'].default_value = 0.5
bsdf_metal.inputs['Metallic'].default_value = 0.8

mat_teal = bpy.data.materials.new(name="TealInterior")
mat_teal.use_nodes = True
bsdf_teal = mat_teal.node_tree.nodes["Principled BSDF"]
bsdf_teal.inputs['Base Color'].default_value = (0.059, 0.463, 0.431, 1.0)  # #0F766E
bsdf_teal.inputs['Roughness'].default_value = 0.5

mat_vine = bpy.data.materials.new(name="Vine")
mat_vine.use_nodes = True
bsdf_vine = mat_vine.node_tree.nodes["Principled BSDF"]
bsdf_vine.inputs['Base Color'].default_value = (0.102, 0.239, 0.102, 1.0)  # #1A3D1A
bsdf_vine.inputs['Roughness'].default_value = 0.9
bsdf_vine.inputs['Alpha'].default_value = 0.7
mat_vine.blend_method = 'BLEND'

# Main facade wall with subdivision for stone blocks
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -8, 7.5))
main_wall = bpy.context.active_object
main_wall.name = "MainWall"
main_wall.scale = (10, 0.25, 7.5)

# Add loop cuts for stone block detail (horizontal and vertical)
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
# Add 8 horizontal loop cuts (stone courses)
for i in range(8):
    bpy.ops.mesh.loopcut_slide(MESH_OT_loopcut={"number_cuts": 1, "edge_index": 0}, TRANSFORM_OT_edge_slide={"value": 0})
# Add 12 vertical loop cuts (stone blocks)
bpy.ops.mesh.loopcut_slide(MESH_OT_loopcut={"number_cuts": 12, "edge_index": 8}, TRANSFORM_OT_edge_slide={"value": 0})
bpy.ops.object.mode_set(mode='OBJECT')

main_wall.data.materials.append(mat_sandstone)

# Recessed archway with depth
# Archway tunnel (3D depth)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -7, 3.5))
archway_tunnel = bpy.context.active_object
archway_tunnel.name = "ArchwayTunnel"
archway_tunnel.scale = (1.75, 1.2, 2.5)
archway_tunnel.data.materials.append(mat_dark_interior)

# Archway opening (boolean subtract from main wall in reality, but we'll keep separate)
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=1.8, depth=0.6, location=(0, -8.1, 3.5), rotation=(1.5708, 0, 0))
archway_opening = bpy.context.active_object
archway_opening.name = "ArchwayOpening"
archway_opening.scale = (1, 1, 1.4)
archway_opening.data.materials.append(mat_dark_interior)

# Archway side walls (left and right)
for x_pos in [-1.75, 1.75]:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos, -7.5, 3.5))
    side_wall = bpy.context.active_object
    side_wall.name = f"ArchwayWall_{x_pos}"
    side_wall.scale = (0.15, 0.6, 2.5)
    side_wall.data.materials.append(mat_dark_interior)

# Archway ceiling
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -7.5, 5.8))
ceiling = bpy.context.active_object
ceiling.name = "ArchwayCeiling"
ceiling.scale = (1.75, 0.6, 0.15)
ceiling.data.materials.append(mat_dark_interior)

# Two flanking columns (tapered)
for x_pos in [-5, 5]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=1, depth=9, location=(x_pos, -7.7, 4.5))
    column = bpy.context.active_object
    column.name = f"Column_{x_pos}"
    column.scale = (0.5, 0.5, 1)

    # Taper: scale top slightly smaller
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='DESELECT')
    bpy.ops.object.mode_set(mode='OBJECT')
    # Select top vertices and scale
    for v in column.data.vertices:
        if v.co.z > 4:
            v.select = True
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.transform.resize(value=(0.85, 0.85, 1))
    bpy.ops.object.mode_set(mode='OBJECT')

    column.data.materials.append(mat_sandstone)

# Cornice ledge (protruding horizontal)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -8.2, 14.75))
cornice = bpy.context.active_object
cornice.name = "Cornice"
cornice.scale = (10.5, 0.4, 0.5)
cornice.data.materials.append(mat_column_trim)

# Banner frames (left and right of archway)
for x_pos in [-3.5, 3.5]:
    # Dark metal outer border
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos, -7.6, 6))
    banner_border = bpy.context.active_object
    banner_border.name = f"BannerBorder_{x_pos}"
    banner_border.scale = (0.1, 0.05, 2)
    banner_border.data.materials.append(mat_metal_banner)

    # Teal interior plane (for logo texture)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x_pos, -7.5, 6), rotation=(1.5708, 0, 0))
    banner_interior = bpy.context.active_object
    banner_interior.name = f"BannerInterior_{x_pos}"
    banner_interior.scale = (0.8, 1.8, 1)
    banner_interior.data.materials.append(mat_teal)

# Window reveals (recessed either side of archway)
for x_pos in [-6, 6]:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos, -7.7, 6.5))
    window_reveal = bpy.context.active_object
    window_reveal.name = f"WindowReveal_{x_pos}"
    window_reveal.scale = (0.8, 0.3, 1.5)
    window_reveal.data.materials.append(mat_dark_interior)

# Trailing vine at roofline
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -8, 15.2), rotation=(1.5708, 0, 0))
vine = bpy.context.active_object
vine.name = "VineStrip"
vine.scale = (10, 0.3, 1)
vine.data.materials.append(mat_vine)

# Select all and join
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = main_wall
bpy.ops.object.join()

# Apply transformations
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

print(f"Exporting detailed museum exterior to: {output_file}")
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_materials='EXPORT',
    export_apply=True,
)

print("Detailed museum exterior export complete!")
