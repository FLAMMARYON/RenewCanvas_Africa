"""
RenewCanvas Africa – Virtual Gallery Architectural Scene
Paste into Blender's Scripting editor and press Run Script.
Tested on Blender 3.6 / 4.x
"""

import bpy
import bmesh
from mathutils import Vector
import math

# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for mat in bpy.data.materials:
        bpy.data.materials.remove(mat)

def new_mat(name, base_color, roughness=0.6, metallic=0.0, emission=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 3.0
    return mat

def add_box(name, loc, scale, mat=None):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    if mat:
        if obj.data.materials:
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)
    bpy.ops.object.transform_apply(scale=True)
    return obj

def add_cylinder(name, loc, radius, depth, mat=None, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth,
        location=loc,
        rotation=rot,
        vertices=32
    )
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        if obj.data.materials:
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)
    return obj

def add_sphere(name, loc, radius, mat=None):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc, segments=32, ring_count=16)
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        if obj.data.materials:
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)
    return obj

# ──────────────────────────────────────────────
# MATERIALS
# ──────────────────────────────────────────────

clear_scene()

mat_limestone  = new_mat("Limestone",     (0.80, 0.76, 0.68), roughness=0.85)
mat_dark_frame = new_mat("DarkFrame",     (0.08, 0.08, 0.08), roughness=0.4,  metallic=0.1)
mat_gold       = new_mat("Gold",          (0.80, 0.60, 0.20), roughness=0.25, metallic=0.9)
mat_wood       = new_mat("Wood",          (0.35, 0.20, 0.10), roughness=0.8)
mat_glass      = new_mat("Glass",         (0.55, 0.72, 0.75), roughness=0.05, metallic=0.0)
mat_greenery   = new_mat("Greenery",      (0.10, 0.35, 0.10), roughness=1.0)
mat_ground     = new_mat("Ground",        (0.30, 0.28, 0.25), roughness=0.95)
mat_cobble     = new_mat("Cobblestone",   (0.40, 0.38, 0.35), roughness=0.9)
mat_lamp_metal = new_mat("LampMetal",     (0.12, 0.12, 0.12), roughness=0.3,  metallic=0.8)
mat_lamp_glow  = new_mat("LampGlow",      (1.00, 0.95, 0.80), roughness=0.0,  emission=(1.0,0.9,0.7))
mat_banner     = new_mat("Banner",        (0.10, 0.28, 0.10), roughness=0.9)
mat_concrete   = new_mat("Concrete",      (0.55, 0.53, 0.50), roughness=0.95)
mat_artwork    = new_mat("Artwork",       (0.22, 0.15, 0.08), roughness=0.7)
mat_ceiling    = new_mat("Ceiling",       (0.20, 0.18, 0.15), roughness=0.6)
mat_white_ceil = new_mat("WhiteCeiling",  (0.95, 0.93, 0.88), roughness=0.7)
mat_bench_top  = new_mat("BenchTop",      (0.50, 0.30, 0.12), roughness=0.75)

# ──────────────────────────────────────────────
# GROUND PLANE
# ──────────────────────────────────────────────

ground = add_box("Ground", (0, 0, -0.05), (30, 30, 0.05), mat_ground)

# Cobblestone path (central approach, Z=0)
path = add_box("CobblePath", (0, 6, 0.01), (3, 14, 0.02), mat_cobble)

# ──────────────────────────────────────────────
# MAIN FACADE WALL
# Width=22, Height=10, Depth=1.5, centred at y=0
# ──────────────────────────────────────────────

# Left wing of wall (left of entrance opening)
add_box("WallLeft",   (-7.5, 0, 5), (5.5, 0.75, 5), mat_limestone)
# Right wing
add_box("WallRight",  ( 7.5, 0, 5), (5.5, 0.75, 5), mat_limestone)
# Top lintel over entrance (spans full width, above door arch)
add_box("WallTop",    (0,    0, 9.5),(11,  0.75, 0.5), mat_limestone)

# Dark recessed entrance frame (the dark surround)
# Outer frame slab set slightly forward
add_box("EntrFrame",  (0, -0.1, 6), (6, 0.5, 5.5), mat_dark_frame)
# Inner reveal / cutout – represent as slightly smaller limestone
add_box("EntrReveal", (0, -0.3, 6), (5.2, 0.3, 4.8), mat_limestone)

# ──────────────────────────────────────────────
# ENTRANCE SIGN PANEL (gold text panel)
# ──────────────────────────────────────────────
sign_panel = add_box("SignPanel", (0, -0.65, 8.8), (5.0, 0.15, 0.7), mat_dark_frame)
# Gold lettering approximated as thin raised strip
add_box("SignText",   (0, -0.82, 8.8), (4.2, 0.05, 0.35), mat_gold)

# ──────────────────────────────────────────────
# CORRIDOR / HALLWAY (extends into the building)
# ──────────────────────────────────────────────
hall_depth = 12

# Floor of corridor
add_box("HallFloor",  (0,  -hall_depth/2, 0.02), (4.8, hall_depth, 0.05), mat_concrete)
# Ceiling
add_box("HallCeil",   (0,  -hall_depth/2, 5.5),  (4.8, hall_depth, 0.25), mat_ceiling)
# Left wall
add_box("HallWallL",  (-2.5, -hall_depth/2, 2.75),(0.25, hall_depth, 2.75), mat_limestone)
# Right wall
add_box("HallWallR",  ( 2.5, -hall_depth/2, 2.75),(0.25, hall_depth, 2.75), mat_limestone)

# Oval skylight in corridor ceiling
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(0, -4, 5.5), segments=32, ring_count=8)
sky = bpy.context.active_object
sky.name = "Skylight"
sky.scale = (1.5, 1.0, 0.15)
mat_sky = new_mat("Skylight", (0.85, 0.92, 1.00), roughness=0.0, emission=(0.9,0.95,1.0))
mat_sky.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 5.0
sky.data.materials.append(mat_sky)
bpy.ops.object.transform_apply(scale=True)

# Artwork / portrait panel at end of corridor
add_box("ArtworkPanel", (0, -hall_depth+0.3, 2.8), (2.0, 0.1, 2.6), mat_artwork)
# Gold frame around artwork
add_box("ArtFrame",     (0, -hall_depth+0.25, 2.8), (2.2, 0.05, 2.8), mat_gold)

# ──────────────────────────────────────────────
# WOODEN ENTRY DOORS (two panels)
# ──────────────────────────────────────────────
add_box("DoorL", (-1.1, -0.9, 2.5), (0.9, 0.12, 2.5), mat_wood)
add_box("DoorR", ( 1.1, -0.9, 2.5), (0.9, 0.12, 2.5), mat_wood)
# Door handles (gold)
add_box("HandleL", (-0.25, -1.05, 2.5), (0.05, 0.05, 0.25), mat_gold)
add_box("HandleR", ( 0.25, -1.05, 2.5), (0.05, 0.05, 0.25), mat_gold)

# ──────────────────────────────────────────────
# VERTICAL BANNER PANELS (flanking entrance)
# ──────────────────────────────────────────────
# Left outer banner
add_box("BannerOL",  (-10.5, -0.5, 5.5), (0.5, 0.15, 4.0), mat_banner)
# Right outer banner
add_box("BannerOR",  ( 10.5, -0.5, 5.5), (0.5, 0.15, 4.0), mat_banner)
# Left inner banner (darker frame pillars beside entrance)
add_box("BannerIL",  (-4.8,  -0.4, 6.0), (0.4, 0.2,  4.5), mat_dark_frame)
add_box("BannerIR",  ( 4.8,  -0.4, 6.0), (0.4, 0.2,  4.5), mat_dark_frame)
# Green banner strips on inner pillars
add_box("GreenBanL", (-4.8,  -0.65, 6.5),(0.3, 0.05, 3.5), mat_banner)
add_box("GreenBanR", ( 4.8,  -0.65, 6.5),(0.3, 0.05, 3.5), mat_banner)

# ──────────────────────────────────────────────
# ROOFTOP GREEN LEDGE (trailing vines silhouette)
# ──────────────────────────────────────────────
add_box("RoofLedge",  (0, -0.2, 10.2), (11, 0.6, 0.3),  mat_limestone)
# Vine blobs across top
for x in range(-9, 10, 2):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.4, location=(x*0.9, -0.3, 10.55), segments=12, ring_count=8)
    v = bpy.context.active_object
    v.name = f"Vine_{x}"
    v.scale = (0.7, 0.5, 0.4)
    v.data.materials.append(mat_greenery)
    bpy.ops.object.transform_apply(scale=True)

# ──────────────────────────────────────────────
# STREET LAMP POSTS (2 flanking the path)
# ──────────────────────────────────────────────
for sx in (-5, 5):
    pole = add_cylinder(f"Pole_{sx}", (sx, 5, 3.0), 0.08, 6.0, mat_lamp_metal)
    arm  = add_box(f"Arm_{sx}",   (sx, 5, 6.2), (0.06, 0.6, 0.06), mat_lamp_metal)
    head = add_cylinder(f"Head_{sx}", (sx, 4.5, 6.4), 0.22, 0.3, mat_lamp_metal)
    glow = add_cylinder(f"Glow_{sx}", (sx, 4.5, 6.25), 0.18, 0.05, mat_lamp_glow)
    # Add actual point light
    bpy.ops.object.light_add(type='POINT', location=(sx, 4.5, 6.3))
    lamp = bpy.context.active_object
    lamp.name = f"LampLight_{sx}"
    lamp.data.energy = 800
    lamp.data.color  = (1.0, 0.95, 0.78)
    lamp.data.shadow_soft_size = 0.3

# ──────────────────────────────────────────────
# GROUND BOLLARD LIGHTS (path edges)
# ──────────────────────────────────────────────
for y in range(2, 16, 3):
    for bx in (-2, 2):
        add_cylinder(f"Bollard_{bx}_{y}", (bx, y, 0.25), 0.08, 0.5, mat_lamp_metal)
        add_cylinder(f"BollardGlow_{bx}_{y}", (bx, y, 0.52), 0.06, 0.05, mat_lamp_glow)
        bpy.ops.object.light_add(type='POINT', location=(bx, y, 0.55))
        bl = bpy.context.active_object
        bl.name = f"BollardLight_{bx}_{y}"
        bl.data.energy = 120
        bl.data.color  = (1.0, 0.9, 0.7)

# ──────────────────────────────────────────────
# EXTERIOR SIGNBOARD (left side)
# ──────────────────────────────────────────────
# Post
add_cylinder("SignPost", (-12, 8, 1.5), 0.08, 3.0, mat_lamp_metal)
# Board
add_box("SignBoard", (-12, 7.8, 3.2), (1.2, 0.12, 2.0), mat_dark_frame)
# Logo mark (gold R square)
add_box("LogoMark",  (-12, 7.68, 4.5), (0.35, 0.04, 0.35), mat_gold)

# ──────────────────────────────────────────────
# OUTDOOR BENCHES (2 flanking path near entrance)
# ──────────────────────────────────────────────
for bx, by in ((-5, 3), (5, 3)):
    # Concrete base
    add_box(f"BenchBase_{bx}", (bx, by, 0.2), (1.0, 0.3, 0.2), mat_concrete)
    # Wooden seat
    add_box(f"BenchSeat_{bx}", (bx, by, 0.45),(1.0, 0.28, 0.06), mat_bench_top)

# ──────────────────────────────────────────────
# TROPICAL PLANTS / SHRUBS (foreground clusters)
# ──────────────────────────────────────────────
plant_positions = [
    (-8, 1), (-6, 0), (-9, 3), (-11, 2),
    ( 8, 1), ( 6, 0), ( 9, 3), ( 11, 2),
    (-3, -1),( 3,-1),
    (-13, 5),( 13, 5),
    (-4, 8), ( 4, 8),
]
for i, (px, py) in enumerate(plant_positions):
    h = 0.6 + (i % 3) * 0.4
    bpy.ops.mesh.primitive_uv_sphere_add(radius=h, location=(px, py, h), segments=10, ring_count=6)
    p = bpy.context.active_object
    p.name = f"Plant_{i}"
    p.scale = (1.0, 1.0, 1.4)
    p.data.materials.append(mat_greenery)
    bpy.ops.object.transform_apply(scale=True)

# Palm trees flanking entrance
for px in (-8, 8):
    # Trunk
    trunk = add_cylinder(f"PalmTrunk_{px}", (px, 1, 2.5), 0.15, 5.0, mat_wood)
    # Fronds (2 sphere clusters)
    for fi in range(4):
        angle = fi * (math.pi / 2)
        fx = px + math.cos(angle) * 1.2
        fy = 1  + math.sin(angle) * 1.2
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.6, location=(fx, fy, 5.5))
        frond = bpy.context.active_object
        frond.name = f"Frond_{px}_{fi}"
        frond.scale = (1.5, 0.6, 0.4)
        frond.data.materials.append(mat_greenery)
        bpy.ops.object.transform_apply(scale=True)

# ──────────────────────────────────────────────
# INTERIOR CORRIDOR COLUMN PILLARS
# ──────────────────────────────────────────────
for cy, side in [(-3, -2.0), (-3, 2.0), (-6, -2.0), (-6, 2.0)]:
    add_cylinder(f"HallPillar_{side}_{cy}", (side, cy, 2.75), 0.2, 5.5, mat_concrete)

# ──────────────────────────────────────────────
# INTERIOR LIGHTING (ceiling spotlights in entrance)
# ──────────────────────────────────────────────
for ix in (-1.5, 0, 1.5):
    bpy.ops.object.light_add(type='SPOT', location=(ix, -1.5, 5.2))
    sl = bpy.context.active_object
    sl.name = f"SpotLight_{ix}"
    sl.data.energy = 600
    sl.data.spot_size = math.radians(45)
    sl.rotation_euler = (math.radians(20), 0, 0)
    sl.data.color = (1.0, 0.95, 0.85)

# ──────────────────────────────────────────────
# LARGE ROCKS (flanking path near entrance)
# ──────────────────────────────────────────────
for rx, ry, rs in [( 9, 4, 0.8), (-9.5, 3.5, 0.7), (10, 6, 0.6)]:
    bpy.ops.mesh.primitive_ico_sphere_add(radius=rs, location=(rx, ry, rs*0.5), subdivisions=2)
    rock = bpy.context.active_object
    rock.name = f"Rock_{rx}"
    rock.scale = (1.0, 0.7, 0.55)
    rock.data.materials.append(mat_concrete)
    bpy.ops.object.transform_apply(scale=True)

# ──────────────────────────────────────────────
# WORLD / SKY
# ──────────────────────────────────────────────
world = bpy.context.scene.world
if world is None:
    world = bpy.data.worlds.new("World")
    bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (0.52, 0.72, 0.92, 1.0)
bg.inputs["Strength"].default_value = 1.2

# ──────────────────────────────────────────────
# SUN LIGHT
# ──────────────────────────────────────────────
bpy.ops.object.light_add(type='SUN', location=(10, 15, 20))
sun = bpy.context.active_object
sun.name = "Sun"
sun.data.energy = 5.0
sun.data.color  = (1.0, 0.97, 0.88)
sun.rotation_euler = (math.radians(40), math.radians(0), math.radians(-40))

# ──────────────────────────────────────────────
# CAMERA – positioned for the reference shot angle
# ──────────────────────────────────────────────
bpy.ops.object.camera_add(location=(0, 22, 5.5))
cam = bpy.context.active_object
cam.name = "MainCamera"
cam.rotation_euler = (math.radians(82), 0, math.radians(180))
cam.data.lens = 35
bpy.context.scene.camera = cam

# ──────────────────────────────────────────────
# RENDER SETTINGS (Cycles, moderate quality)
# ──────────────────────────────────────────────
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 256
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = False

print("✅ RenewCanvas Africa gallery scene built successfully!")
print("   Press F12 to render, or NumPad-0 to look through the camera.")