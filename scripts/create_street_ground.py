import bpy
import sys
import random

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Output file from command line
output_file = sys.argv[-1]

# Create cobblestone path (30m long × 5m wide)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
path = bpy.context.active_object
path.name = "CobblestonePath"
path.scale = (2.5, 15, 1)

# Cobblestone material (dark warm grey)
mat_cobble = bpy.data.materials.new(name="Cobblestone")
mat_cobble.use_nodes = True
bsdf = mat_cobble.node_tree.nodes["Principled BSDF"]
bsdf.inputs['Base Color'].default_value = (0.361, 0.290, 0.227, 1.0)  # #5C4A3A
bsdf.inputs['Roughness'].default_value = 0.9
path.data.materials.append(mat_cobble)

# Stone bench material
mat_bench = bpy.data.materials.new(name="StoneBench")
mat_bench.use_nodes = True
bsdf_bench = mat_bench.node_tree.nodes["Principled BSDF"]
bsdf_bench.inputs['Base Color'].default_value = (0.769, 0.659, 0.510, 1.0)  # Sandstone
bsdf_bench.inputs['Roughness'].default_value = 0.7

# Dark metal material for bollards
mat_metal = bpy.data.materials.new(name="DarkMetal")
mat_metal.use_nodes = True
bsdf_metal = mat_metal.node_tree.nodes["Principled BSDF"]
bsdf_metal.inputs['Base Color'].default_value = (0.15, 0.12, 0.10, 1.0)
bsdf_metal.inputs['Roughness'].default_value = 0.4
bsdf_metal.inputs['Metallic'].default_value = 0.8

# Create two benches flanking the path
for z_pos, x_pos in [(5, -3.5), (5, 3.5)]:
    # Bench seat
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos, z_pos, 0.45))
    bench_seat = bpy.context.active_object
    bench_seat.name = f"BenchSeat_{z_pos}_{x_pos}"
    bench_seat.scale = (0.6, 1.8, 0.15)
    bench_seat.data.materials.append(mat_bench)

    # Bench back
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos, z_pos - 0.7, 0.75))
    bench_back = bpy.context.active_object
    bench_back.name = f"BenchBack_{z_pos}_{x_pos}"
    bench_back.scale = (0.5, 0.15, 0.45)
    bench_back.data.materials.append(mat_bench)

    # Two bench legs
    for y_offset in [-0.7, 0.7]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x_pos, z_pos + y_offset, 0.225))
        leg = bpy.context.active_object
        leg.name = f"BenchLeg_{z_pos}_{x_pos}_{y_offset}"
        leg.scale = (0.5, 0.15, 0.225)
        leg.data.materials.append(mat_bench)

# Create bollard lights along path edges (6 per side)
for i in range(6):
    z_pos = 2 + i * 2.5
    for x_pos in [-2.8, 2.8]:
        # Bollard post
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16,
            radius=0.12,
            depth=0.8,
            location=(x_pos, z_pos, 0.4)
        )
        bollard = bpy.context.active_object
        bollard.name = f"Bollard_{i}_{x_pos}"
        bollard.data.materials.append(mat_metal)

        # Light top cap (slightly emissive)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16,
            radius=0.14,
            depth=0.08,
            location=(x_pos, z_pos, 0.84)
        )
        cap = bpy.context.active_object
        cap.name = f"BollardCap_{i}_{x_pos}"

        # Emissive cap material (warm white glow)
        mat_cap = bpy.data.materials.new(name=f"BollardCap_{i}_{x_pos}")
        mat_cap.use_nodes = True
        bsdf_cap = mat_cap.node_tree.nodes["Principled BSDF"]
        bsdf_cap.inputs['Base Color'].default_value = (1.0, 0.95, 0.85, 1.0)
        bsdf_cap.inputs['Emission Color'].default_value = (1.0, 0.6, 0.27, 1.0)
        bsdf_cap.inputs['Emission Strength'].default_value = 0.5
        cap.data.materials.append(mat_cap)

# Select all and join
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = path
bpy.ops.object.join()

# Apply transformations
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

print(f"Exporting street ground to: {output_file}")
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_materials='EXPORT',
    export_apply=True,
)

print("Street ground export complete!")
