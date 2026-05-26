import bpy
import sys
import math

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

mat_dark = bpy.data.materials.new(name="DarkInterior")
mat_dark.use_nodes = True
bsdf_dark = mat_dark.node_tree.nodes["Principled BSDF"]
bsdf_dark.inputs['Base Color'].default_value = (0.039, 0.031, 0.024, 1.0)
bsdf_dark.inputs['Roughness'].default_value = 0.9

mat_trim = bpy.data.materials.new(name="Trim")
mat_trim.use_nodes = True
bsdf_trim = mat_trim.node_tree.nodes["Principled BSDF"]
bsdf_trim.inputs['Base Color'].default_value = (0.094, 0.071, 0.035, 1.0)
bsdf_trim.inputs['Roughness'].default_value = 0.7

mat_metal = bpy.data.materials.new(name="Metal")
mat_metal.use_nodes = True
bsdf_metal = mat_metal.node_tree.nodes["Principled BSDF"]
bsdf_metal.inputs['Base Color'].default_value = (0.1, 0.1, 0.1, 1.0)
bsdf_metal.inputs['Roughness'].default_value = 0.5
bsdf_metal.inputs['Metallic'].default_value = 0.8

mat_teal = bpy.data.materials.new(name="Teal")
mat_teal.use_nodes = True
bsdf_teal = mat_teal.node_tree.nodes["Principled BSDF"]
bsdf_teal.inputs['Base Color'].default_value = (0.059, 0.463, 0.431, 1.0)
bsdf_teal.inputs['Roughness'].default_value = 0.5

mat_vine = bpy.data.materials.new(name="Vine")
mat_vine.use_nodes = True
bsdf_vine = mat_vine.node_tree.nodes["Principled BSDF"]
bsdf_vine.inputs['Base Color'].default_value = (0.102, 0.239, 0.102, 1.0)
bsdf_vine.inputs['Roughness'].default_value = 0.9
bsdf_vine.inputs['Alpha'].default_value = 0.7
mat_vine.blend_method = 'BLEND'

# Create stone block facade with actual individual blocks
# Increase detail for larger file size (target 80-300KB)
stone_blocks = []
block_width = 0.85
block_height = 0.35
rows = 28
cols = 24

for row in range(rows):
    for col in range(cols):
        x = (col - cols / 2) * block_width
        z = row * block_height + 0.3
        # Alternate pattern for brick/stone look
        if row % 2 == 1:
            x += block_width / 2
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, -8, z))
        block = bpy.context.active_object
        block.scale = (0.85, 0.2, 0.28)
        block.name = f"StoneBlock_{row}_{col}"
        block.data.materials.append(mat_sandstone)
        stone_blocks.append(block)

# Archway tunnel with depth
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=1.8, depth=2.5, location=(0, -7.5, 3.5), rotation=(1.5708, 0, 0))
archway = bpy.context.active_object
archway.name = "Archway"
archway.scale = (1, 1.2, 1)
archway.data.materials.append(mat_dark)

# Archway ceiling (separate from cylinder)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -7.5, 5.2))
arch_ceil = bpy.context.active_object
arch_ceil.name = "ArchwayCeiling"
arch_ceil.scale = (2, 1.25, 0.2)
arch_ceil.data.materials.append(mat_dark)

# Side walls of archway
for x_pos in [-2, 2]:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos, -7.5, 3.5))
    wall = bpy.context.active_object
    wall.name = f"ArchwayWall_{x_pos}"
    wall.scale = (0.2, 1.25, 1.7)
    wall.data.materials.append(mat_dark)

# Inner archway details (recesses)
for x_pos in [-1.5, 1.5]:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos, -7.3, 3.5))
    recess = bpy.context.active_object
    recess.scale = (0.15, 0.15, 1.5)
    recess.data.materials.append(mat_dark)

# Flanking columns with taper and detail
for x_pos in [-5, 5]:
    # Main column shaft (24 segments for more smoothness)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.45, depth=9, location=(x_pos, -7.7, 4.5))
    column = bpy.context.active_object
    column.name = f"Column_{x_pos}"

    # Add rings for column detail (more rings for detail)
    for z_offset in [-3.5, -2, 0, 2, 3.5]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.5, depth=0.12, location=(x_pos, -7.7, 4.5 + z_offset))
        ring = bpy.context.active_object
        ring.data.materials.append(mat_trim)

    column.data.materials.append(mat_sandstone)

    # Add fluting to columns (vertical grooves)
    for angle in range(0, 360, 30):  # 12 grooves
        rad = math.radians(angle)
        groove_x = x_pos + 0.42 * math.cos(rad)
        groove_y = -7.7 + 0.42 * math.sin(rad)
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.08, depth=8.5, location=(groove_x, groove_y, 4.5))
        groove = bpy.context.active_object
        groove.data.materials.append(mat_trim)

    # Column base
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.6, depth=0.5, location=(x_pos, -7.7, 0.25))
    base = bpy.context.active_object
    base.data.materials.append(mat_trim)

    # Column capital
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.55, depth=0.6, location=(x_pos, -7.7, 8.8))
    capital = bpy.context.active_object
    capital.data.materials.append(mat_trim)

# Cornice with detail
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -8.2, 14.75))
cornice = bpy.context.active_object
cornice.scale = (10.5, 0.4, 0.5)
cornice.data.materials.append(mat_trim)

# Cornice molding detail
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -8.3, 14.4))
molding = bpy.context.active_object
molding.scale = (10.5, 0.15, 0.15)
molding.data.materials.append(mat_trim)

# Banner frames with borders
for x_pos in [-3.5, 3.5]:
    # Frame border (4 pieces)
    for dy, dz, sx, sz in [
        (0, 2.2, 0.05, 0.05),  # top
        (0, -2.2, 0.05, 0.05),  # bottom
        (-0.05, 0, 0.05, 2.2),  # left
        (0.05, 0, 0.05, 2.2)  # right
    ]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos + dy, -7.55, 6 + dz))
        border = bpy.context.active_object
        border.scale = (sx, 0.03, sz)
        border.data.materials.append(mat_metal)

    # Teal interior plane
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x_pos, -7.5, 6), rotation=(1.5708, 0, 0))
    interior = bpy.context.active_object
    interior.scale = (0.85, 2, 1)
    interior.data.materials.append(mat_teal)

# Window reveals (recessed)
for x_pos in [-6.5, 6.5]:
    # Window frame
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos, -7.8, 6.5))
    frame = bpy.context.active_object
    frame.scale = (0.9, 0.2, 1.6)
    frame.data.materials.append(mat_dark)

    # Window recess detail
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos, -7.7, 6.5))
    recess = bpy.context.active_object
    recess.scale = (0.75, 0.15, 1.4)
    recess.data.materials.append(mat_dark)

# Decorative facade elements
# Horizontal bands across facade
for z_pos in [1.5, 3, 5.5, 8, 10, 12]:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -8.05, z_pos))
    band = bpy.context.active_object
    band.scale = (10, 0.05, 0.08)
    band.data.materials.append(mat_trim)

# Add decorative rosettes at intersections
for z_pos in [1.5, 5.5, 10]:
    for x_pos in [-8, -4, 0, 4, 8]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.15, location=(x_pos, -8.02, z_pos))
        rosette = bpy.context.active_object
        rosette.data.materials.append(mat_trim)

# Add vertical pilasters between stone blocks every 3rd column
for col_index in range(0, 24, 3):
    x = (col_index - 12) * 0.85
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, -8.02, 4))
    pilaster = bpy.context.active_object
    pilaster.scale = (0.08, 0.03, 3.5)
    pilaster.data.materials.append(mat_trim)

# Vine strip at roofline
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -7.95, 15.2), rotation=(1.5708, 0, 0))
vine = bpy.context.active_object
vine.scale = (10, 0.3, 1)
vine.data.materials.append(mat_vine)

# Back wall (solid)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -8.3, 7.5))
back_wall = bpy.context.active_object
back_wall.scale = (10.5, 0.1, 7.5)
back_wall.data.materials.append(mat_sandstone)

# Select all and join
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = back_wall
bpy.ops.object.join()

# Apply transformations
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

print(f"Exporting detailed v2 museum exterior to: {output_file}")
print(f"Geometry count: {len(bpy.context.active_object.data.vertices)} vertices")

bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_materials='EXPORT',
    export_apply=True,
)

print("Detailed museum exterior v2 export complete!")
