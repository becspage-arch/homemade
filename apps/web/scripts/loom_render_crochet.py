"""
Path-traced render of a flat CROCHET scene, from the loom's exact stitch
geometry (real yarn loop filaments). Same physically-based recipe that made the
embroidery loom photographic (Cycles + AgX), retuned for bulky yarn fabric:
a soft fuzzy matte wool material, no embroidery hoop, a backing in the yarn
colour so no surface shows through the loops, and soft daylight raking across
the blo ridges so the diagonal ribbing reads in 3D relief.

Reads the same scene.json contract as loom_render.py:
  { "fabric": {"widthMm","heightMm","hex"},
    "strokes": [ {"hex","sheen","radiusMm","filaments":[ [[x,y,z],...], ... ]} ] }

Run:
  blender --background --factory-startup --python loom_render_crochet.py -- \
    <scene.json> <out.png> [samples]
"""

import bpy
import json
import sys
import math

# Loom millimetres -> Blender units (1 unit = 1 cm).
S = 0.1


def argv_after_dashes():
    a = sys.argv
    return a[a.index("--") + 1:] if "--" in a else []


def set_in(node, name, value):
    try:
        node.inputs[name].default_value = value
    except Exception:
        pass


def hex_to_lin(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))

    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), 1.0)


def yarn_material(name, hexcol, sheen):
    """Bulky wool yarn: matte, soft, with a strong fuzzy fibre halo and a coarse
    micro-bump (the plied strands + the wool's fluff). Lower spec than cotton
    floss; more subsurface for that soft, light-through-wool glow."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    set_in(bsdf, "Base Color", hex_to_lin(hexcol))
    set_in(bsdf, "Specular IOR Level", 0.14)        # wool is matte, low spec
    set_in(bsdf, "Sheen Weight", 1.0)               # strong fuzzy wool halo
    set_in(bsdf, "Sheen Roughness", 0.55)
    set_in(bsdf, "Sheen Tint", (1.0, 1.0, 1.0, 1.0))
    set_in(bsdf, "Anisotropic", 0.45)
    set_in(bsdf, "Subsurface Weight", 0.12)         # soft light through the fibre
    set_in(bsdf, "Subsurface Radius", (0.6, 0.5, 0.42))
    # Coarse plied-fibre bump stretched along the strand (bulkier than floss).
    tex = nt.nodes.new("ShaderNodeTexCoord")
    mapp = nt.nodes.new("ShaderNodeMapping")
    mapp.inputs["Scale"].default_value = (40.0, 9.0, 9.0)
    fib = nt.nodes.new("ShaderNodeTexNoise")
    fib.inputs["Scale"].default_value = 8.0
    fib.inputs["Detail"].default_value = 5.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 1.3       # pronounced spun-fibre relief
    bump.inputs["Distance"].default_value = 0.03
    nt.links.new(tex.outputs["Object"], mapp.inputs["Vector"])
    nt.links.new(mapp.outputs["Vector"], fib.inputs["Vector"])
    nt.links.new(fib.outputs["Fac"], bump.inputs["Height"])
    # A finer, denser fuzz bump layered on top — the wool's haze of short fibres.
    fuzz = nt.nodes.new("ShaderNodeTexNoise")
    fuzz.inputs["Scale"].default_value = 60.0
    fuzz.inputs["Detail"].default_value = 6.0
    bump2 = nt.nodes.new("ShaderNodeBump")
    bump2.inputs["Strength"].default_value = 0.45
    bump2.inputs["Distance"].default_value = 0.006
    nt.links.new(fuzz.outputs["Fac"], bump2.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bump2.inputs["Normal"])
    nt.links.new(bump2.outputs["Normal"], bsdf.inputs["Normal"])
    # Roughness varies along the fibre (matte fluff vs catching strands).
    rough = nt.nodes.new("ShaderNodeMapRange")
    rough.inputs["To Min"].default_value = 0.62
    rough.inputs["To Max"].default_value = 0.86
    nt.links.new(fib.outputs["Fac"], rough.inputs["Value"])
    nt.links.new(rough.outputs["Result"], bsdf.inputs["Roughness"])
    return mat


def build_yarn(strokes, drape=None, z_offset=0.0):
    # One curve object per (colour, radius) for speed. Bulky yarn sits proud.
    # `drape`, if given, is (cx, cy, amp, fx, fy) — a low-frequency height field
    # that lifts the whole blanket into soft hills/valleys so it reads as draped
    # textile, not a rigid placemat. The backing follows the same field.
    groups = {}
    for st in strokes:
        key = (st["hex"], round(st["radiusMm"], 3), round(st.get("sheen", 0.7), 2))
        groups.setdefault(key, []).append(st)

    def drape_z(bx, by):
        if not drape:
            return 0.0
        cx, cy, amp, fx, fy = drape
        return amp * (math.sin((bx - cx) * fx) + math.cos((by - cy) * fy)
                      + 0.5 * math.sin((bx - cx + by - cy) * fx * 0.6))

    for (hexcol, radius, sheen), group in groups.items():
        cu = bpy.data.curves.new("yarn", type="CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = 1.0
        cu.bevel_resolution = 2
        cu.resolution_u = 2
        cu.use_fill_caps = True
        for st in group:
            r = st["radiusMm"] * S * 1.5   # chunky, fills the bundle
            zlift = r * 1.0
            for poly in st["filaments"]:
                if len(poly) < 2:
                    continue
                sp = cu.splines.new("POLY")
                sp.points.add(len(poly) - 1)
                for i, p in enumerate(poly):
                    bx = p[0] * S
                    by = -p[1] * S
                    sp.points[i].co = (bx, by, p[2] * S + zlift + z_offset + drape_z(bx, by), 1.0)
                    sp.points[i].radius = r
        ob = bpy.data.objects.new("yarn_" + hexcol.lstrip("#"), cu)
        ob.data.materials.append(yarn_material("y_" + hexcol, hexcol, sheen))
        bpy.context.collection.objects.link(ob)


def backing_material(hexcol):
    """A slightly darker, soft-noise version of the yarn colour, sitting just
    under the loops so any sliver of gap between stitches reads as shadowed yarn,
    never as background."""
    mat = bpy.data.materials.new("backing")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    base = hex_to_lin(hexcol)
    darker = tuple(c * 0.82 for c in base[:3]) + (1.0,)  # soft shadow, rows read connected
    set_in(bsdf, "Base Color", darker)
    set_in(bsdf, "Roughness", 0.9)
    set_in(bsdf, "Specular IOR Level", 0.1)
    set_in(bsdf, "Sheen Weight", 0.5)
    return mat


def surface_material(hexcol):
    """The surface the blanket rests on — matte, so a contrasting tone makes the
    cream pop (cream-on-cream is invisible)."""
    mat = bpy.data.materials.new("surface")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    set_in(bsdf, "Base Color", hex_to_lin(hexcol))
    set_in(bsdf, "Roughness", 0.94)
    set_in(bsdf, "Specular IOR Level", 0.06)
    set_in(bsdf, "Sheen Weight", 0.3)
    return mat


def main():
    args = argv_after_dashes()
    in_path, out_path = args[0], args[1]
    samples = int(args[2]) if len(args) > 2 else 160
    with open(in_path) as f:
        data = json.load(f)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    strokes = data["strokes"]
    yarn_hex = strokes[0]["hex"] if strokes else "#efe4d6"

    view = data.get("view", {})
    bg_hex = view.get("bgHex", "#7c6049")          # contrasting warm walnut
    margin_factor = view.get("marginFactor", 0.06)  # negative crops INTO the fabric
    tilt_deg = view.get("tiltDeg", 0.0)             # 0 = flat top-down; >0 = perspective
    drape_amp = view.get("drapeAmp", 0.0)           # soft hills/valleys (cm)

    # Content bounds (blender units) for framing + the backing size.
    minx = 1e9
    miny = 1e9
    maxx = -1e9
    maxy = -1e9
    minz = 1e9
    for st in strokes:
        for poly in st["filaments"]:
            for p in poly:
                bx = p[0] * S
                by = -p[1] * S
                minx = min(minx, bx)
                maxx = max(maxx, bx)
                miny = min(miny, by)
                maxy = max(maxy, by)
                minz = min(minz, p[2] * S)
    cx = (minx + maxx) * 0.5
    cy = (miny + maxy) * 0.5
    contentW = maxx - minx
    contentH = maxy - miny
    margin = max(contentW, contentH) * margin_factor
    halfW = contentW * 0.5 + margin
    halfH = contentH * 0.5 + margin

    drape = None
    if drape_amp:
        span0 = max(contentW, contentH)
        drape = (cx, cy, drape_amp, 6.2 / span0, 5.0 / span0)

    # Turned crochet works alternate rows from the back, so the fabric has relief on
    # BOTH faces (some nodes go to −z). Float the whole piece up so its lowest point
    # sits just above the table, and slip the backing just under it — otherwise the
    # back-worked rows clip through the table or hide behind the backing.
    z_offset = 0.08 - minz
    backing_z = 0.04

    # Backing right under the loops (yarn colour, darker) so no gap shows surface.
    # Sized to the full content (not the possibly-cropped frame) so a tight crop
    # never reveals its edge. OPEN fabrics (dc/tr lace: shell, V-stitch, crossed,
    # dc increases) are MEANT to show the table through their holes — a
    # yarn-coloured backing plane there reads as solid dark rectangles floating
    # behind the lace. For those, drop the backing so each hole shows the surface
    # (a lace swatch photographed on a table). Dense fabrics keep the backing so a
    # sliver of gap never flashes background. Presentation only — no geometry.
    open_fabric = bool(view.get("openFabric", False))
    if not open_fabric:
        bpy.ops.mesh.primitive_plane_add(size=1.0, location=(cx, cy, backing_z))
        backing = bpy.context.active_object
        backing.scale = (contentW * 0.54, contentH * 0.54, 1.0)
        backing.data.materials.append(backing_material(yarn_hex))

    # The surface the throw sits on, well below + wider.
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(cx, cy, 0.0))
    surface = bpy.context.active_object
    surface.scale = (max(halfW, contentW) * 5, max(halfH, contentH) * 5, 1.0)
    surface.data.materials.append(surface_material(bg_hex))

    build_yarn(strokes, drape, z_offset)

    # Target at content centre.
    tgt = bpy.data.objects.new("target", None)
    tgt.location = (cx, cy, 0.0)
    scene.collection.objects.link(tgt)

    # ---- Soft daylight with a gentle raking key so the blo ridges cast a soft
    # contact shadow (the diagonal rib relief) without the scene going harsh. ----
    span = max(halfW, halfH) * 2
    # Key raking LOW and across the diagonal ribs (from upper-left) so each rib
    # casts a soft shadow into the groove below it = the ribbing reads in relief.
    bpy.ops.object.light_add(type="AREA", location=(cx - span * 0.85, cy + span * 0.7, span * 0.42))
    # `light` scales the key+fill energy; ease it for pale wool so it doesn't clip
    # to white under AgX (the wash in §11). 1.0 = original; ~0.65 keeps cream as cream.
    light = view.get("light", 0.65)
    key = bpy.context.active_object
    key.data.energy = span * span * 13.0 * light
    key.data.size = span * 0.55
    bpy.ops.object.light_add(type="AREA", location=(cx + span * 0.6, cy - span * 0.4, span * 1.0))
    fill = bpy.context.active_object
    fill.data.energy = span * span * 3.2 * light
    fill.data.size = span * 2.4
    for lt in (key, fill):
        c = lt.constraints.new("TRACK_TO")
        c.target = tgt
        c.track_axis = "TRACK_NEGATIVE_Z"
        c.up_axis = "UP_Y"

    world = bpy.data.worlds.new("w")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.95, 0.94, 0.92, 1.0)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.38

    # ---- Camera: top-down, long lens, very gentle DoF. ----
    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 90
    cam = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(cam)
    dist = span * 2.1
    if tilt_deg:
        # Tilt off straight-down toward the viewer for perspective (a draped, 3/4
        # look instead of a flat placemat). Pull back a little to keep it framed.
        t = math.radians(tilt_deg)
        dist *= 1.12
        cam.location = (cx, cy - dist * math.sin(t), dist * math.cos(t))
    else:
        cam.location = (cx, cy, dist)
    cc = cam.constraints.new("TRACK_TO")
    cc.target = tgt
    cc.track_axis = "TRACK_NEGATIVE_Z"
    cc.up_axis = "UP_Y"
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = dist
    cam_data.dof.aperture_fstop = 8.0
    scene.camera = cam

    # ---- Render settings ----
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    aspect = (halfW * 2) / (halfH * 2)
    res_y = int(view.get("resY", 960))
    scene.render.resolution_y = res_y
    scene.render.resolution_x = int(res_y * aspect)
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Base Contrast"
    scene.view_settings.exposure = view.get("exposure", 0.2)  # lower: stop pale wool blowing white
    grade_saturation(scene, view.get("saturation", 1.4))  # bring warmth back after AgX desaturates
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print("RENDERED", out_path)


def grade_saturation(scene, sat):
    scene.use_nodes = True
    nt = scene.node_tree
    rl = nt.nodes.get("Render Layers")
    comp = nt.nodes.get("Composite")
    if not rl or not comp:
        return
    hs = nt.nodes.new("CompositorNodeHueSat")
    hs.inputs["Saturation"].default_value = sat
    nt.links.new(rl.outputs["Image"], hs.inputs["Image"])
    nt.links.new(hs.outputs["Image"], comp.inputs["Image"])


main()
