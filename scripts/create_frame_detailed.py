import bpy
import sys
import math

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Output file from command line
output_file = sys.argv[-1]

# Dimensions (in meters)
outer_width = 1.95
outer_height = 2.55
inner_width = 1.76
inner_height = 2.26
frame_depth = 0.12
border_width = (outer_width - inner_width) / 2  # 0.095m (9.5cm per side)

# Materials
mat_wood = bpy.data.materials.new(name="DarkWood")
mat_wood.use_nodes = True
bsdf_wood = mat_wood.node_tree.nodes["Principled BSDF"]
bsdf_wood.inputs['Base Color'].default_value = (0.173, 0.094, 0.063, 1.0)  # #2C1810
bsdf_wood.inputs['Roughness'].default_value = 0.6
bsdf_wood.inputs['Metallic'].default_value = 0.05

mat_mat = bpy.data.materials.new(name="CreamMat")
mat_mat.use_nodes = True
bsdf_mat = mat_mat.node_tree.nodes["Principled BSDF"]
bsdf_mat.inputs['Base Color'].default_value = (0.949, 0.918, 0.863, 1.0)  # #F2EADC
bsdf_mat.inputs['Roughness'].default_value = 0.52

mat_backing = bpy.data.materials.new(name="Backing")
mat_backing.use_nodes = True
bsdf_back = mat_backing.node_tree.nodes["Principled BSDF"]
bsdf_back.inputs['Base Color'].default_value = (0.039, 0.031, 0.024, 1.0)  # #0A0806
bsdf_back.inputs['Roughness'].default_value = 0.9

# Helper function to create mitred border piece
def create_border_piece(name, length, position, rotation_z=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=position, rotation=(0, 0, rotation_z))
    piece = bpy.context.active_object
    piece.name = name
    piece.scale = (border_width / 2, length / 2, frame_depth / 2)

    # Apply scale to make beveling work correctly
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Add bevels to inner and outer edges
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')

    # Add bevel modifier for smooth edges
    bpy.ops.object.mode_set(mode='OBJECT')
    bevel = piece.modifiers.new(name="Bevel", type='BEVEL')
    bevel.width = 0.012  # 12mm bevel (wider for more detail)
    bevel.segments = 5  # More segments for smoother bevel
    bevel.limit_method = 'ANGLE'
    bevel.angle_limit = math.radians(30)

    # Apply modifier
    bpy.ops.object.modifier_apply(modifier="Bevel")

    piece.data.materials.append(mat_wood)
    return piece

# Create four border pieces with 45° mitred corners
# Top border
top = create_border_piece(
    "TopBorder",
    outer_width,
    (0, 0, outer_height / 2 - border_width / 2),
    0
)

# Bottom border
bottom = create_border_piece(
    "BottomBorder",
    outer_width,
    (0, 0, -outer_height / 2 + border_width / 2),
    0
)

# Left border (vertical)
left = create_border_piece(
    "LeftBorder",
    inner_height,
    (-inner_width / 2 - border_width / 2, 0, 0),
    math.radians(90)
)

# Right border (vertical)
right = create_border_piece(
    "RightBorder",
    inner_height,
    (inner_width / 2 + border_width / 2, 0, 0),
    math.radians(90)
)

# Create corner mitres by adding 45° cut geometry at corners
corner_positions = [
    (-inner_width / 2 - border_width / 2, 0, outer_height / 2 - border_width / 2),  # Top-left
    (inner_width / 2 + border_width / 2, 0, outer_height / 2 - border_width / 2),   # Top-right
    (-inner_width / 2 - border_width / 2, 0, -outer_height / 2 + border_width / 2), # Bottom-left
    (inner_width / 2 + border_width / 2, 0, -outer_height / 2 + border_width / 2),  # Bottom-right
]

for i, pos in enumerate(corner_positions):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos, rotation=(0, math.radians(45), 0))
    corner = bpy.context.active_object
    corner.name = f"Corner_{i}"
    corner.scale = (border_width / 2.5, border_width / 2.5, frame_depth / 2)

    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.object.mode_set(mode='OBJECT')

    corner.data.materials.append(mat_wood)

# Inner cream mat (sits 2cm behind frame face)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.02, 0))
mat_plane = bpy.context.active_object
mat_plane.name = "InnerMat"
mat_plane.scale = (inner_width / 2, inner_height / 2, 1)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Add subdivision to mat for realism
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.subdivide(number_cuts=4)  # More subdivisions
bpy.ops.object.mode_set(mode='OBJECT')

mat_plane.data.materials.append(mat_mat)

# Add inner lip detail (small recessed border inside frame)
for side, width, height, pos_x, pos_z, rot in [
    ("InnerLipTop", inner_width, 0.015, 0, inner_height / 2, 0),
    ("InnerLipBottom", inner_width, 0.015, 0, -inner_height / 2, 0),
    ("InnerLipLeft", 0.015, inner_height, -inner_width / 2, 0, math.radians(90)),
    ("InnerLipRight", 0.015, inner_height, inner_width / 2, 0, math.radians(90)),
]:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(pos_x, 0.01, pos_z), rotation=(0, 0, rot))
    lip = bpy.context.active_object
    lip.name = side
    lip.scale = (width / 2, height / 2, 0.008)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    lip.data.materials.append(mat_wood)

# Backing plane (for artwork texture)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.04, 0))
backing = bpy.context.active_object
backing.name = "BackingPlane"
backing.scale = (inner_width / 2, inner_height / 2, 1)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Add UV map for artwork texture
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.uv.unwrap()
bpy.ops.object.mode_set(mode='OBJECT')

backing.data.materials.append(mat_backing)

# Select all and join
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = top
bpy.ops.object.join()

print(f"Exporting detailed artwork frame to: {output_file}")
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_materials='EXPORT',
    export_apply=True,
)

print("Detailed artwork frame export complete!")
