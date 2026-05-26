import bpy
import os
import sys

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Get input and output paths from command line args
blend_file = sys.argv[-2]
output_file = sys.argv[-1]

print(f"Loading: {blend_file}")
bpy.ops.wm.open_mainfile(filepath=blend_file)

# Downscale all textures to 512x512
for img in bpy.data.images:
    if img.size[0] > 512 or img.size[1] > 512:
        print(f"Resizing texture: {img.name} from {img.size[0]}x{img.size[1]} to 512x512")
        img.scale(512, 512)

# Select all objects
bpy.ops.object.select_all(action='SELECT')

# Export with Draco compression
print(f"Exporting optimized GLB to: {output_file}")
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12,
    export_image_format='JPEG',
    export_image_quality=75,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=True,
    export_apply=True,
)

print("Export complete!")
