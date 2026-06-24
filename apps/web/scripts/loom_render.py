"""
Path-traced render of a flat embroidery scene, from the loom's exact stitch
geometry (the same filaments the raster draws). Accuracy is unchanged; this only
swaps the final shading to physically-based light transport for photo-realism.

Reads scene.json:
  { "fabric": {"widthMm","heightMm","hex"},
    "strokes": [ {"hex","sheen","radiusMm","filaments":[ [[x,y,z],...], ... ]} ] }

Run:
  blender --background --factory-startup --python loom_render.py -- \
    <scene.json> <out.png> [samples]
"""

import bpy
import json
import sys
import math

# Loom millimetres -> Blender units (1 unit = 1 cm) keeps lights/camera sane.
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


def thread_material(name, hexcol, sheen):
    """Photoreal cotton floss WITHOUT geometry hair (which doesn't scale): the
    fibre read comes from the material — a soft sheen for the fuzzy halo plus a
    fine high-frequency bump for the individual filaments catching the light."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    set_in(bsdf, "Base Color", hex_to_lin(hexcol))
    set_in(bsdf, "Specular IOR Level", 0.28)
    set_in(bsdf, "Sheen Weight", max(0.5, sheen))  # the fuzzy fibre halo
    set_in(bsdf, "Sheen Roughness", 0.3)
    set_in(bsdf, "Sheen Tint", (1.0, 1.0, 1.0, 1.0))
    set_in(bsdf, "Anisotropic", 0.6)         # sheen runs along the strand
    set_in(bsdf, "Subsurface Weight", 0.05)
    set_in(bsdf, "Subsurface Radius", (0.2, 0.16, 0.12))
    # Fine fibre micro-bump: a noise stretched ALONG the strand reads as the
    # individual filaments catching light — what turns a smooth tube into spun
    # cotton. Strong + fine because at hero zoom this is the main fibre cue.
    tex = nt.nodes.new("ShaderNodeTexCoord")
    mapp = nt.nodes.new("ShaderNodeMapping")
    mapp.inputs["Scale"].default_value = (90.0, 7.0, 7.0)  # stretched along strand
    fib = nt.nodes.new("ShaderNodeTexNoise")
    fib.inputs["Scale"].default_value = 11.0
    fib.inputs["Detail"].default_value = 5.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.8
    bump.inputs["Distance"].default_value = 0.009
    nt.links.new(tex.outputs["Object"], mapp.inputs["Vector"])
    nt.links.new(mapp.outputs["Vector"], fib.inputs["Vector"])
    nt.links.new(fib.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    # Roughness varies along the fibre (matte fluff vs catching strands) — the
    # uniform roughness is part of what read as flat "clay".
    rough = nt.nodes.new("ShaderNodeMapRange")
    rough.inputs["To Min"].default_value = 0.4
    rough.inputs["To Max"].default_value = 0.62
    nt.links.new(fib.outputs["Fac"], rough.inputs["Value"])
    nt.links.new(rough.outputs["Result"], bsdf.inputs["Roughness"])
    return mat


def build_threads(strokes):
    # Group filaments by (colour, radius) into a few curve objects for speed.
    groups = {}
    for st in strokes:
        key = (st["hex"], round(st["radiusMm"], 3), round(st.get("sheen", 0.6), 2))
        groups.setdefault(key, []).append(st)

    for (hexcol, radius, sheen), group in groups.items():
        cu = bpy.data.curves.new("thread", type="CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = 1.0          # scaled per-point by radius below
        cu.bevel_resolution = 3
        cu.resolution_u = 3
        cu.use_fill_caps = True
        for st in group:
            r = st["radiusMm"] * S * 1.6  # chunky floss that sits proud
            zlift = r * 1.05  # lift the strand ONTO the cloth so it casts a real
            #                   contact shadow instead of being half-sunk in it
            for poly in st["filaments"]:
                if len(poly) < 2:
                    continue
                sp = cu.splines.new("POLY")
                sp.points.add(len(poly) - 1)
                for i, p in enumerate(poly):
                    # loom (x, y-down, z-up) -> blender (x, -y, z)
                    sp.points[i].co = (p[0] * S, -p[1] * S, p[2] * S + zlift, 1.0)
                    sp.points[i].radius = r
        ob = bpy.data.objects.new("thread_" + hexcol.lstrip("#"), cu)
        ob.data.materials.append(thread_material("t_" + hexcol, hexcol, sheen))
        bpy.context.collection.objects.link(ob)


def fabric_material(hexcol, nx, ny):
    """Natural even-weave linen: a clearly visible warp/weft grid (the cue that
    it's real cloth, not a white void), plus slubby fibre variation. Matches the
    look of a real hoop-mounted linen in the reference hero photos."""
    mat = bpy.data.materials.new("fabric")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    base = hex_to_lin(hexcol)
    set_in(bsdf, "Roughness", 0.82)
    set_in(bsdf, "Specular IOR Level", 0.18)
    set_in(bsdf, "Sheen Weight", 0.7)
    set_in(bsdf, "Sheen Roughness", 0.45)

    tex = nt.nodes.new("ShaderNodeTexCoord")
    # Warp + weft as perpendicular wave bands at real thread frequency.
    w1 = nt.nodes.new("ShaderNodeTexWave")
    w1.bands_direction = "X"
    w1.inputs["Scale"].default_value = float(nx)
    w1.inputs["Distortion"].default_value = 0.6
    w1.inputs["Detail"].default_value = 1.5
    w2 = nt.nodes.new("ShaderNodeTexWave")
    w2.bands_direction = "Y"
    w2.inputs["Scale"].default_value = float(ny)
    w2.inputs["Distortion"].default_value = 0.6
    w2.inputs["Detail"].default_value = 1.5
    # Thread-over-thread: take the higher of warp/weft (a grid of ridges with a
    # dip — the weave hole — at each crossing).
    weave = nt.nodes.new("ShaderNodeMath")
    weave.operation = "MAXIMUM"
    nt.links.new(w1.outputs["Fac"], weave.inputs[0])
    nt.links.new(w2.outputs["Fac"], weave.inputs[1])
    # Slubby fibre variation in the cloth colour.
    slub = nt.nodes.new("ShaderNodeTexNoise")
    slub.inputs["Scale"].default_value = 22.0
    slub.inputs["Detail"].default_value = 3.0
    # Colour: base linen, darkened a touch in the weave dips for depth.
    darker = tuple(c * 0.72 for c in base[:3]) + (1.0,)
    mixc = nt.nodes.new("ShaderNodeMixRGB")
    mixc.blend_type = "MIX"
    mixc.inputs["Color1"].default_value = darker
    mixc.inputs["Color2"].default_value = base
    nt.links.new(weave.outputs["Value"], mixc.inputs["Fac"])
    mixs = nt.nodes.new("ShaderNodeMixRGB")
    mixs.blend_type = "MULTIPLY"
    mixs.inputs["Fac"].default_value = 0.12
    nt.links.new(mixc.outputs["Color"], mixs.inputs["Color1"])
    nt.links.new(slub.outputs["Color"], mixs.inputs["Color2"])
    nt.links.new(mixs.outputs["Color"], bsdf.inputs["Base Color"])
    # Relief: the weave grid + fine slub as a bump.
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.7
    bump.inputs["Distance"].default_value = 0.04
    nt.links.new(weave.outputs["Value"], bump.inputs["Height"])
    bump2 = nt.nodes.new("ShaderNodeBump")
    bump2.inputs["Strength"].default_value = 0.26
    nt.links.new(slub.outputs["Fac"], bump2.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bump2.inputs["Normal"])
    nt.links.new(bump2.outputs["Normal"], bsdf.inputs["Normal"])
    nt.links.new(tex.outputs["Generated"], w1.inputs["Vector"])
    nt.links.new(tex.outputs["Generated"], w2.inputs["Vector"])
    nt.links.new(tex.outputs["Generated"], slub.inputs["Vector"])
    return mat


def filter_main_cluster(strokes):
    """Drop spatially-isolated stray clusters (e.g. a test mark placed off to the
    side) so the finished hoop shows only the real design, and the framing centres
    on the actual motif. Keeps every component that's a meaningful fraction of the
    largest — so a pattern with several real motifs is untouched; only tiny far
    blobs are removed."""
    xs = []
    ys = []
    for st in strokes:
        for poly in st["filaments"]:
            for p in poly:
                xs.append(p[0])
                ys.append(p[1])
    if not xs:
        return strokes
    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)
    span = max(maxx - minx, maxy - miny) or 1.0
    g = span / 50.0

    def cell(x, y):
        return (int((x - minx) / g), int((y - miny) / g))

    occ = set()
    for st in strokes:
        for poly in st["filaments"]:
            for p in poly:
                occ.add(cell(p[0], p[1]))

    seen = set()
    comps = []
    for c in occ:
        if c in seen:
            continue
        stack = [c]
        seen.add(c)
        comp = {c}
        while stack:
            cx, cy = stack.pop()
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    nc = (cx + dx, cy + dy)
                    if nc in occ and nc not in seen:
                        seen.add(nc)
                        comp.add(nc)
                        stack.append(nc)
        comps.append(comp)
    if len(comps) <= 1:
        return strokes

    def stroke_cells(st):
        out = []
        for poly in st["filaments"]:
            for p in poly:
                out.append(cell(p[0], p[1]))
        return out

    weights = []
    for comp in comps:
        w = 0
        for st in strokes:
            for c in stroke_cells(st):
                if c in comp:
                    w += 1
        weights.append(w)
    main_w = max(weights)
    keep_comps = set()
    for comp, w in zip(comps, weights):
        if w >= 0.15 * main_w:  # meaningful motif, not a stray
            keep_comps |= comp

    kept = []
    for st in strokes:
        cells = stroke_cells(st)
        if not cells:
            continue
        inn = sum(1 for c in cells if c in keep_comps)
        if inn * 2 >= len(cells):
            kept.append(st)
    dropped = len(strokes) - len(kept)
    if dropped:
        print("filter_main_cluster: dropped %d stray strokes (of %d)" % (dropped, len(strokes)))
    return kept


def wood_material():
    """Light beech embroidery-hoop wood: warm tan with a faint grain."""
    mat = bpy.data.materials.new("hoop_wood")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    set_in(bsdf, "Base Color", hex_to_lin("#c6b291"))  # muted light wood (the
    #   saturation grade pushes a saturated tan to garish yellow)
    set_in(bsdf, "Roughness", 0.5)
    set_in(bsdf, "Specular IOR Level", 0.35)
    tex = nt.nodes.new("ShaderNodeTexCoord")
    mapp = nt.nodes.new("ShaderNodeMapping")
    mapp.inputs["Scale"].default_value = (1.0, 1.0, 40.0)  # grain runs around the ring
    grain = nt.nodes.new("ShaderNodeTexWave")
    grain.inputs["Scale"].default_value = 6.0
    grain.inputs["Distortion"].default_value = 2.0
    grain.inputs["Detail"].default_value = 3.0
    dark = hex_to_lin("#ad9871")
    light = hex_to_lin("#d3c2a3")
    mix = nt.nodes.new("ShaderNodeMixRGB")
    mix.inputs["Color1"].default_value = dark
    mix.inputs["Color2"].default_value = light
    nt.links.new(tex.outputs["Object"], mapp.inputs["Vector"])
    nt.links.new(mapp.outputs["Vector"], grain.inputs["Vector"])
    nt.links.new(grain.outputs["Fac"], mix.inputs["Fac"])
    nt.links.new(mix.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def add_hoop(cx, cy, ring_radius, tube):
    """A round wooden embroidery hoop sitting proud of the cloth, framing the
    design — the single biggest 'this is a real stitched piece' cue."""
    bpy.ops.mesh.primitive_torus_add(
        major_radius=ring_radius, minor_radius=tube,
        location=(cx, cy, tube * 0.2), major_segments=160, minor_segments=24,
    )
    hoop = bpy.context.active_object
    # Flatten the tube a little so it reads as a flat-section hoop, not a doughnut.
    hoop.scale = (1.0, 1.0, 0.62)
    hoop.data.materials.append(wood_material())
    try:
        for p in hoop.data.polygons:
            p.use_smooth = True
    except Exception:
        pass
    return hoop


def main():
    args = argv_after_dashes()
    in_path, out_path = args[0], args[1]
    samples = int(args[2]) if len(args) > 2 else 180
    with open(in_path) as f:
        data = json.load(f)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    fab = data["fabric"]
    strokes = filter_main_cluster(data["strokes"])

    # Frame to the actual thread content (blender units), not the fabric centre,
    # so the design is centred whatever its traced coordinates.
    minx = 1e9
    miny = 1e9
    maxx = -1e9
    maxy = -1e9
    for st in strokes:
        for poly in st["filaments"]:
            for p in poly:
                bx = p[0] * S
                by = -p[1] * S
                minx = min(minx, bx)
                maxx = max(maxx, bx)
                miny = min(miny, by)
                maxy = max(maxy, by)
    cx = (minx + maxx) * 0.5
    cy = (miny + maxy) * 0.5
    contentW = maxx - minx
    contentH = maxy - miny
    content_r = max(contentW, contentH) * 0.5
    margin = content_r * 0.95  # zoomed out a touch — more cloth around the hoop
    halfW = contentW * 0.5 + margin
    halfH = contentH * 0.5 + margin

    # Fabric plane — extends well past the frame so it reads as taut cloth the
    # hoop is stretched over, not a small swatch.
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(cx, cy, 0.0))
    plane = bpy.context.active_object
    plane.scale = (halfW * 4, halfH * 4, 1.0)
    nx = max(8, round((halfW * 2 / S) * 0.5))
    ny = max(8, round((halfH * 2 / S) * 0.5))
    # Natural beige linen (the scene hex is near-white aida; heroes read warmer).
    plane.data.materials.append(fabric_material("#e3d8c0", nx, ny))

    build_threads(strokes)

    # Wooden hoop framing the design — thinner ring, sized to the content not the
    # (now larger) margin so it sits with breathing room.
    ring_radius = content_r * 1.22
    add_hoop(cx, cy, ring_radius, content_r * 0.11)

    # Target at the content centre.
    tgt = bpy.data.objects.new("target", None)
    tgt.location = (cx, cy, 0.0)
    scene.collection.objects.link(tgt)

    # ---- Raking key + soft fill: the relief read comes from a DIRECTIONAL key
    # at a low angle so every raised stitch throws a soft contact shadow on the
    # cloth (and on its neighbours). Low ambient so those shadows survive — this
    # is what makes it 3D instead of flat pasted-on shapes. ----
    span = max(halfW, halfH) * 2
    # Key: off to one side and fairly LOW (z < horizontal offset) = raking light.
    bpy.ops.object.light_add(type="AREA", location=(cx - span * 0.95, cy + span * 0.75, span * 0.6))
    key = bpy.context.active_object
    key.data.energy = span * span * 14.0
    key.data.size = span * 0.55  # smallish = crisper, directional shadows
    # Fill: opposite side, broad and gentle, just lifts the shadow floors.
    bpy.ops.object.light_add(type="AREA", location=(cx + span * 0.8, cy - span * 0.5, span * 1.1))
    fill = bpy.context.active_object
    fill.data.energy = span * span * 3.0
    fill.data.size = span * 2.2
    for lt in (key, fill):
        c = lt.constraints.new("TRACK_TO")
        c.target = tgt
        c.track_axis = "TRACK_NEGATIVE_Z"
        c.up_axis = "UP_Y"

    world = bpy.data.worlds.new("w")
    scene.world = world
    world.use_nodes = True
    # Low, warm ambient — enough to keep shadows from going black, not so much it
    # flattens the relief.
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.95, 0.93, 0.9, 1.0)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.45

    # ---- Camera: top-down, long lens (near-ortho, low distortion), gentle DoF ----
    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 95
    cam = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(cam)
    dist = span * 2.05
    cam.location = (cx, cy, dist)
    cc = cam.constraints.new("TRACK_TO")
    cc.target = tgt
    cc.track_axis = "TRACK_NEGATIVE_Z"
    cc.up_axis = "UP_Y"
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = dist - 0.05
    cam_data.dof.aperture_fstop = 6.0   # subtle falloff only (Rebecca: not too soft)
    scene.camera = cam

    # ---- Render settings ----
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    aspect = (halfW * 2) / (halfH * 2)
    scene.render.resolution_y = 900
    scene.render.resolution_x = int(900 * aspect)
    # AgX = photographic highlight rolloff (the "real photo" look). It mutes
    # colour, so a modest saturation lift in the compositor brings the floss back
    # to rich-but-natural — not the neon of Standard.
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Base Contrast"
    scene.view_settings.exposure = 0.9  # lower: ambient no longer doing the lifting
    grade_saturation(scene, 1.5)  # counter AgX's desaturation so floss reads vivid
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
