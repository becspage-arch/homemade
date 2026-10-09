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
from mathutils import Matrix

# Loom millimetres -> Blender units (1 unit = 1 cm).
S = 0.1

# How many times brighter than its own albedo the backdrop shades for camera
# rays — the "blown-out paper sweep" of a product photo. Picked off a measured
# Fargate ramp against the reference photos' corner luminance (237-245 of 255):
# x1 = 179/176, x4 = 223/221, x8 = 237/236, x10 = the middle of the band,
# x12 = 244/243, x16 = 248/247 (coaster / bear). See surface_material() and
# STITCH_ENGINE §8e-2 Part C.
GROUND_WHITE_BOOST = 10.0


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


# Per-fibre shader knobs (STITCH_ENGINE yarn-fibre pass). `cotton` is the
# ORIGINAL crisp-plied numbers, unchanged, so a program that doesn't set
# `fibre` (every program before this pass, and every one that stays on the
# default) renders byte-for-byte as before. The other three retune the same
# BSDF for a different real fibre; `chenille`/`velvet` additionally grow a
# fuzz-shell halo object (see `fuzz_shell_material` / `build_yarn`) — the base
# material alone cannot fake a pile that stands proud of the strand silhouette.
FIBRE_PARAMS = {
    "cotton": dict(
        specular=0.18, sheen=0.55, sheen_rough=0.5, aniso=0.25,
        subsurf=0.1, bump1=0.6, bump2=0.28, rough_lo=0.55, rough_hi=0.78,
        flyaway=0.0, halo=None,
    ),
    # Softer sheen, more haze, a hint of stray fibres: less satiny than plied
    # cotton (lower specular + anisotropic), a broader/stronger sheen halo, more
    # bump relief on both fibre layers, and a sparse third "flyaway" bump (fine
    # Voronoi spikes) reading as the odd stray hair catching the key light.
    "wool": dict(
        specular=0.12, sheen=0.7, sheen_rough=0.65, aniso=0.12,
        subsurf=0.14, bump1=0.85, bump2=0.42, rough_lo=0.62, rough_hi=0.85,
        flyaway=0.35, halo=None,
    ),
    # Matte and plump: low specular/sheen on the CORE strand (the fuzz-shell
    # halo carries almost all of the visual texture), higher subsurface for a
    # soft plush look, no anisotropic satin (chenille has no ply shine).
    "chenille": dict(
        specular=0.03, sheen=0.12, sheen_rough=0.8, aniso=0.0,
        subsurf=0.22, bump1=0.3, bump2=0.16, rough_lo=0.75, rough_hi=0.92,
        flyaway=0.0, halo=dict(mult=1.55, noise_scale=210.0),
    ),
    # Chenille's dense short pile, plus a directional sheen: real curve
    # geometry in Cycles carries a native along-length tangent, so raising
    # Anisotropic + Sheen here (rather than adding new geometry) gives a
    # genuine brushed-velvet streak that runs along the strand.
    "velvet": dict(
        specular=0.12, sheen=0.4, sheen_rough=0.28, aniso=0.65,
        subsurf=0.16, bump1=0.3, bump2=0.16, rough_lo=0.35, rough_hi=0.55,
        flyaway=0.0, halo=dict(mult=1.35, noise_scale=260.0),
    ),
}


def yarn_material(name, hexcol, sheen, fibre="cotton"):
    """The CORE strand material for one yarn fibre look (STITCH_ENGINE yarn-
    fibre pass). The ply DEFINITION comes from the real ply geometry (nPly
    distinct tubes spiralling — yarnLoop.pliedFilaments), so this only ever
    tunes how the surface itself reads: cotton's satiny plied sheen with a
    whisper of haze, wool's softer matte haze with a hint of stray fibre,
    or chenille/velvet's matte plump core (their pile halo is a separate
    object — see `fuzz_shell_material`). `fibre` unset/unknown falls back to
    cotton, so every pre-existing call site is unaffected."""
    fp = FIBRE_PARAMS.get(fibre, FIBRE_PARAMS["cotton"])
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    set_in(bsdf, "Base Color", hex_to_lin(hexcol))
    set_in(bsdf, "Specular IOR Level", fp["specular"])
    set_in(bsdf, "Sheen Weight", fp["sheen"])
    set_in(bsdf, "Sheen Roughness", fp["sheen_rough"])
    set_in(bsdf, "Sheen Tint", (1.0, 1.0, 1.0, 1.0))
    set_in(bsdf, "Anisotropic", fp["aniso"])
    set_in(bsdf, "Subsurface Weight", fp["subsurf"])
    set_in(bsdf, "Subsurface Radius", (0.6, 0.5, 0.42))
    # Fine fibre haze (the real ply relief is geometry now). A gentle bump
    # stretched along the strand — enough to read as spun fibre, not felt.
    tex = nt.nodes.new("ShaderNodeTexCoord")
    mapp = nt.nodes.new("ShaderNodeMapping")
    mapp.inputs["Scale"].default_value = (40.0, 9.0, 9.0)
    fib = nt.nodes.new("ShaderNodeTexNoise")
    fib.inputs["Scale"].default_value = 8.0
    fib.inputs["Detail"].default_value = 5.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = fp["bump1"]   # spun-fibre relief
    bump.inputs["Distance"].default_value = 0.015
    nt.links.new(tex.outputs["Object"], mapp.inputs["Vector"])
    nt.links.new(mapp.outputs["Vector"], fib.inputs["Vector"])
    nt.links.new(fib.outputs["Fac"], bump.inputs["Height"])
    # A finer, denser fuzz — the fibre's haze of short fibres.
    fuzz = nt.nodes.new("ShaderNodeTexNoise")
    fuzz.inputs["Scale"].default_value = 60.0
    fuzz.inputs["Detail"].default_value = 6.0
    bump2 = nt.nodes.new("ShaderNodeBump")
    bump2.inputs["Strength"].default_value = fp["bump2"]
    bump2.inputs["Distance"].default_value = 0.004
    nt.links.new(fuzz.outputs["Fac"], bump2.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bump2.inputs["Normal"])
    last_normal = bump2.outputs["Normal"]
    # Wool only: a sparse, sharp Voronoi spike layer — the odd stray fibre
    # catching the light, not a uniform haze (that's what `bump2` already is).
    if fp["flyaway"] > 0:
        stray = nt.nodes.new("ShaderNodeTexVoronoi")
        stray.voronoi_dimensions = "3D"
        stray.distance = "EUCLIDEAN"
        stray.inputs["Scale"].default_value = 140.0
        bump3 = nt.nodes.new("ShaderNodeBump")
        bump3.inputs["Strength"].default_value = fp["flyaway"]
        bump3.inputs["Distance"].default_value = 0.01
        nt.links.new(stray.outputs["Distance"], bump3.inputs["Height"])
        nt.links.new(last_normal, bump3.inputs["Normal"])
        last_normal = bump3.outputs["Normal"]
    nt.links.new(last_normal, bsdf.inputs["Normal"])
    # Roughness varies along the fibre — satiny (plies catch light) for cotton,
    # progressively more matte for wool/chenille, a tighter glossier band for
    # velvet's brushed sheen.
    rough = nt.nodes.new("ShaderNodeMapRange")
    rough.inputs["To Min"].default_value = fp["rough_lo"]
    rough.inputs["To Max"].default_value = fp["rough_hi"]
    nt.links.new(fib.outputs["Fac"], rough.inputs["Value"])
    nt.links.new(rough.outputs["Result"], bsdf.inputs["Roughness"])
    return mat


def fuzz_shell_material(name, hexcol, fibre):
    """The chenille/velvet PILE HALO — a thin alpha-cutout shell wrapped just
    outside the core strand (see `build_yarn`), read at the strand's silhouette
    as a dense short fringe rather than a smooth outline. Cheaper and more
    reliable in the Fargate time budget than per-fibre hair particles: one
    extra low-poly curve object per yarn colour group, its Alpha driven by a
    Fresnel term (near-zero face-on so the core strand's own colour and sheen
    still read through the middle of each stitch, rising to near-opaque at
    grazing angles) broken up by a fine noise threshold so the rim reads as
    many short fibres, not a uniform glow ring."""
    fp = FIBRE_PARAMS.get(fibre, FIBRE_PARAMS["chenille"])
    halo = fp["halo"] or FIBRE_PARAMS["chenille"]["halo"]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    set_in(bsdf, "Base Color", hex_to_lin(hexcol))
    set_in(bsdf, "Roughness", 0.95)
    set_in(bsdf, "Specular IOR Level", 0.05)
    set_in(bsdf, "Sheen Weight", 0.0)
    fres = nt.nodes.new("ShaderNodeFresnel")
    fres.inputs["IOR"].default_value = 1.35
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = halo["noise_scale"]
    noise.inputs["Detail"].default_value = 3.0
    ramp = nt.nodes.new("ShaderNodeMapRange")
    ramp.inputs["To Min"].default_value = -0.35   # some noise valleys cut fully through (gaps between pile fibres)
    ramp.inputs["To Max"].default_value = 1.15
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Value"])
    combine = nt.nodes.new("ShaderNodeMath")
    combine.operation = "MULTIPLY_ADD"
    # alpha = fresnel * ramp(noise) — grazing angle scales how much of the
    # noise-broken fringe shows; face-on (fresnel≈0) the shell is invisible and
    # the core strand's own material shows clean through the middle.
    nt.links.new(fres.outputs["Fac"], combine.inputs[0])
    nt.links.new(ramp.outputs["Result"], combine.inputs[1])
    combine.inputs[2].default_value = 0.0
    clamp = nt.nodes.new("ShaderNodeClamp")
    nt.links.new(combine.outputs["Value"], clamp.inputs["Value"])
    nt.links.new(clamp.outputs["Result"], bsdf.inputs["Alpha"])
    return mat


def build_yarn(strokes, drape=None, z_offset=0.0, fibre="cotton"):
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

    has_halo = fibre in ("chenille", "velvet")

    def write_points(cu, mult):
        for st in group:
            # radiusMm is now the PLY tube radius (crisp plied model, §11): bevel
            # it 1:1 so the nPly plies stay distinct (a fatter multiplier merges
            # them back into a smooth roving tube). The ply spread reaches the
            # target outer radius, so the yarn still fills the fabric. `mult` >1
            # grows the halo shell (see build_yarn's fuzz-halo pass) outside the
            # core strand without changing the core's own radius.
            r = st["radiusMm"] * S * 1.02 * mult
            zlift = st["radiusMm"] * S * 1.02  # halo lifts with the CORE strand, not its own bigger radius
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

    for (hexcol, radius, sheen), group in groups.items():
        cu = bpy.data.curves.new("yarn", type="CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = 1.0
        cu.bevel_resolution = 2
        cu.resolution_u = 2
        cu.use_fill_caps = True
        write_points(cu, 1.0)
        ob = bpy.data.objects.new("yarn_" + hexcol.lstrip("#"), cu)
        ob.data.materials.append(yarn_material("y_" + hexcol, hexcol, sheen, fibre))
        bpy.context.collection.objects.link(ob)

        if has_halo:
            # The chenille/velvet PILE HALO: one extra low-poly shell per colour
            # group (bevel_resolution 1, not 2 — the alpha cutout hides the facet
            # look, and this keeps the extra object cheap). See fuzz_shell_material.
            fp = FIBRE_PARAMS[fibre]
            hcu = bpy.data.curves.new("yarn_halo", type="CURVE")
            hcu.dimensions = "3D"
            hcu.bevel_depth = 1.0
            hcu.bevel_resolution = 1
            hcu.resolution_u = 2
            hcu.use_fill_caps = False
            write_points(hcu, fp["halo"]["mult"])
            hob = bpy.data.objects.new("yarnhalo_" + hexcol.lstrip("#"), hcu)
            hob.data.materials.append(fuzz_shell_material("yh_" + hexcol, hexcol, fibre))
            bpy.context.collection.objects.link(hob)


def prop_material(hexcol, gloss):
    """A moulded plastic NOTION — a safety eye, a plastic nose. Not yarn and not
    pretending to be: hard, smooth, glossy, the way the haberdashery part in a
    real amigurumi pattern's notions list actually looks against wool.

    `gloss` used to drive roughness, specular level AND coat weight off the one
    number, which put a near-mirror clearcoat (weight up to 1.0 at roughness
    0.04) and a specular level far above any real plastic on a BLACK eye. A
    curved black sphere wearing a mirror reflects whatever is around it, so
    against a bright backdrop the eyes rendered as mid-grey marbles instead of
    black eyes — and the brighter the ground got, the greyer they went.

    Decoupled: `gloss` now only tightens the HIGHLIGHT. Specular sits at the
    dielectric default (0.5 = IOR 1.5, the ~4% face-on reflection real plastic
    has), and the coat is a thin sheen rather than a mirror, so a near-black
    prop stays near-black and catches one small bright highlight plus a faint
    rim. A glossy eye (gloss ~0.6-0.85) reads as wet-look plastic; a lower
    gloss (the nose, ~0.4) reads as black satin.

    The eye's reflection is a glossy ray, and the ground's white-sweep boost is
    camera-ray-only (surface_material), so the backdrop the props reflect is
    the original one — the crisp ground cannot wash them out.
    """
    mat = bpy.data.materials.new("prop_" + hexcol.lstrip("#"))
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    set_in(bsdf, "Base Color", hex_to_lin(hexcol))
    set_in(bsdf, "Roughness", max(0.08, 0.45 * (1.0 - gloss)))
    set_in(bsdf, "Specular IOR Level", 0.5)
    set_in(bsdf, "Metallic", 0.0)
    set_in(bsdf, "Sheen Weight", 0.0)
    set_in(bsdf, "Coat Weight", 0.15 * gloss)
    set_in(bsdf, "Coat Roughness", 0.10)
    return mat


def build_props(props, z_offset):
    """Non-yarn notions as what they are: smooth ellipsoid primitives.

    Each prop arrives as a centre plus three semi-axis VECTORS already in loom
    millimetres, so the renderer needs no rotation convention of its own — the
    axes are the object matrix's columns (with the same mm->BU scale and the
    same y flip build_yarn uses, and the same z_offset so props ride with the
    yarn when the piece is floated onto the table)."""
    def to_bu(v):
        return (v[0] * S, -v[1] * S, v[2] * S)

    for pr in props:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1.0)
        ob = bpy.context.active_object
        bpy.ops.object.shade_smooth()
        a0, a1, a2 = (to_bu(v) for v in pr["axes"])
        c = pr["centre"]
        t = (c[0] * S, -c[1] * S, c[2] * S + z_offset)
        ob.matrix_world = Matrix((
            (a0[0], a1[0], a2[0], t[0]),
            (a0[1], a1[1], a2[1], t[1]),
            (a0[2], a1[2], a2[2], t[2]),
            (0.0, 0.0, 0.0, 1.0),
        ))
        ob.data.materials.clear()
        ob.data.materials.append(prop_material(pr["hex"], float(pr.get("gloss", 0.85))))


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


def surface_material(hexcol, camera_boost=1.0):
    """The surface the blanket rests on — matte, so a contrasting tone makes the
    cream pop (cream-on-cream is invisible).

    `camera_boost` is the crisp-white-ground trick (§8e-2 Part C). A product
    photo's paper sweep is a deliberately BLOWN-OUT white: several stops
    brighter than the subject, while the subject itself is metered normally.
    Our `exposure` is tuned low so pale wool doesn't blow white under AgX
    (§11), and that same low exposure lands a near-white `bgHex` ground as a
    soft mid-grey. Fix, entirely in the ground's own shader: for CAMERA RAYS
    ONLY the plane shades as a diffuse whose albedo is `camera_boost` times
    the backdrop colour, so every pixel of ground leaves with `camera_boost`x
    the radiance it had and lands in AgX's highlight shoulder — flat near-white,
    gradient and mottling compressed away. Because the boost multiplies the
    SHADED result, the contact shadow survives as the same ratio (a lighter,
    softer grey, exactly like a real sweep). Because it is gated on
    `Is Camera Ray`, every other ray — the bounce light the ground throws back
    up onto the yarn, reflections, shadow rays — still sees the ORIGINAL
    material, so no yarn pixel changes.
    """
    mat = bpy.data.materials.new("surface")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    base = hex_to_lin(hexcol)
    set_in(bsdf, "Base Color", base)
    set_in(bsdf, "Roughness", 0.94)
    set_in(bsdf, "Specular IOR Level", 0.06)
    set_in(bsdf, "Sheen Weight", 0.3)
    if camera_boost and camera_boost > 1.0:
        out = nt.nodes.get("Material Output")
        if out is None:
            return mat
        # A plain Diffuse BSDF (not a second Principled) for the boosted branch:
        # albedo above 1.0 is exactly the "multiply the outgoing radiance" we
        # want, and Diffuse is the one node where that scales linearly with no
        # energy-conservation clamping to argue with.
        bright = nt.nodes.new("ShaderNodeBsdfDiffuse")
        bright.inputs["Color"].default_value = (
            base[0] * camera_boost,
            base[1] * camera_boost,
            base[2] * camera_boost,
            1.0,
        )
        bright.inputs["Roughness"].default_value = 0.0
        lp = nt.nodes.new("ShaderNodeLightPath")
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs[0])
        nt.links.new(bsdf.outputs["BSDF"], mix.inputs[1])
        nt.links.new(bright.outputs["BSDF"], mix.inputs[2])
        nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
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
    fibre = data.get("fibre", "cotton")  # yarn-fibre pass: 'cotton'|'wool'|'chenille'|'velvet'

    view = data.get("view", {})
    view = stage_view(view)  # hero stage: camera-only overrides; studio = unchanged
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

    # A real product photo holds one consistent SCALE: a small finished object
    # sits in the frame with white ground round it, it does not fill the frame
    # the way a larger one does. `minFieldMm` (STITCH_ENGINE §8e-2 Part C) is a
    # floor on the framed extent's SHORTER side (mm, converted to Blender units
    # by S) — below it, both halves are scaled up together (aspect preserved,
    # so `aspect`/`dist`/`span` downstream all just see a bigger virtual frame)
    # rather than a new mode. An object already framed wider than the floor on
    # its short axis is completely unaffected — this only ever pulls the
    # camera BACK, never in. `swatch` staging (the stitch-proof macro crop)
    # never sets this key, so it is untouched by construction.
    min_field_mm = view.get("minFieldMm")
    if min_field_mm:
        min_field_bu = min_field_mm * S
        frame_short = min(halfW, halfH) * 2
        if 0 < frame_short < min_field_bu:
            grow = min_field_bu / frame_short
            halfW *= grow
            halfH *= grow

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
    # A near-horizontal camera sees much further across the table than a
    # top-down one, so a tall staged figure needs a wider ground (default 5 =
    # every existing render unchanged).
    ground = view.get("groundScale", 5)
    surface.scale = (max(halfW, contentW) * ground, max(halfH, contentH) * ground, 1.0)
    # Crisp near-white ground on every hero (§8e-2 Part C) — no per-pattern
    # flag, `groundWhite` only exists so a scene can dial it or switch it off
    # (0/1 = the old un-boosted ground). See surface_material().
    surface.data.materials.append(
        surface_material(bg_hex, view.get("groundWhite", GROUND_WHITE_BOOST))
    )

    build_yarn(strokes, drape, z_offset, fibre)

    # Non-yarn notions (safety eyes, a nose). Absent from every scene that has
    # none, so those renders are unchanged.
    props = data.get("props") or []
    if props:
        build_props(props, z_offset)

    # Target at content centre.
    # A tall figure shot from a LOW tilt has to be aimed at its body, not at the
    # table under it. 0 (the default) keeps every existing render identical.
    aim_frac = view.get("aimHeightFrac", 0.0)
    maxz_bu = -1e9
    for st in strokes:
        for poly in st["filaments"]:
            for pt in poly:
                if pt[2] * S > maxz_bu:
                    maxz_bu = pt[2] * S
    tgt_z = aim_frac * (maxz_bu + z_offset) if aim_frac else 0.0
    tgt = bpy.data.objects.new("target", None)
    tgt.location = (cx, cy, tgt_z)
    scene.collection.objects.link(tgt)

    # ---- Soft daylight with a gentle raking key so the blo ridges cast a soft
    # contact shadow (the diagonal rib relief) without the scene going harsh. ----
    span = max(halfW, halfH) * 2
    # `light` scales the key+fill energy; ease it for pale wool so it doesn't clip
    # to white under AgX (the wash in §11). 1.0 = original; ~0.65 keeps cream as cream.
    light = view.get("light", 0.65)
    yaw_r = math.radians(view.get("yawDeg", 0.0))
    if view.get("lightRig") == "product":
        # A standing FIGURE shot from near eye level: the flat-fabric rig's key
        # sits low and on the far side of the piece, which back-lights a toy into
        # a silhouette. This rig keys high from the camera's left and fills from
        # its right, the way a toy is lit on a table. Only used when asked for,
        # so every flat/top-down render keeps the raking rig above.
        def around(deg, radius, height):
            a = yaw_r + math.radians(deg)
            return (cx + radius * math.sin(a), cy - radius * math.cos(a), height)
        bpy.ops.object.light_add(type="AREA", location=around(-42, span * 1.05, span * 1.25))
        key = bpy.context.active_object
        key.data.energy = span * span * 14.0 * light
        key.data.size = span * 0.9
        bpy.ops.object.light_add(type="AREA", location=around(58, span * 1.4, span * 0.85))
        fill = bpy.context.active_object
        fill.data.energy = span * span * 4.0 * light
        fill.data.size = span * 2.4
    else:
        # Key raking LOW and across the diagonal ribs (from upper-left) so each rib
        # casts a soft shadow into the groove below it = the ribbing reads in relief.
        bpy.ops.object.light_add(type="AREA", location=(cx - span * 0.85, cy + span * 0.7, span * 0.42))
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
    dist = span * 2.1 * view.get("distScale", 1.0)
    if tilt_deg:
        # Tilt off straight-down toward the viewer for perspective (a draped, 3/4
        # look instead of a flat placemat). Pull back a little to keep it framed.
        # `yawDeg` swings the camera round the object as well, for the
        # three-quarter angle a product photo of a toy is shot from (0 = the
        # original square-on view, so existing renders are unchanged).
        t = math.radians(tilt_deg)
        yaw = math.radians(view.get("yawDeg", 0.0))
        dist *= 1.12
        cam.location = (
            cx + dist * math.sin(t) * math.sin(yaw),
            cy - dist * math.sin(t) * math.cos(yaw),
            tgt_z + dist * math.cos(t),
        )
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
    grade_saturation(scene, view.get("saturation", 1.2))  # bring warmth back after AgX desaturates (1.4 oversaturated the crisper, less-felted yarn)
    # Hero stage (bar criterion 8): styled set dressing round the untouched piece.
    apply_stage(stage_of(view), scene, dict(
        cx=cx, cy=cy, yaw=yaw_r, span=span, R=0.5 * max(contentW, contentH),
        H=maxz_bu + z_offset, cam=cam, tgt=tgt, view=view, key_energy=key.data.energy,
        lights=[key, fill], remove=[surface]))
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print("RENDERED", out_path)


# ---------------------------------------------------------------------------
# HERO STAGES (bar criterion 8, "photographed like a bestseller").
#
# `view.stage` picks a styled listing-photo set built around the piece:
#   "studio"      (default / absent) the clean near-white product sweep, exactly
#                 as before. Nothing below runs, so every existing hero is
#                 byte-for-byte unchanged.
#   "linen"       a rumpled oatmeal linen throw, a soft cream wall, warm side
#                 window light.
#   "windowsill"  a wooden windowsill with a bright blurred window behind, a linen
#                 napkin under the piece, a jug and books out of focus.
#   "nursery"     a cream chunky-knit blanket, blush wall, a picture frame, a
#                 wooden star, a glowing lantern and a lilac blanket.
#   "christmas"   a cream knit throw, pine sprigs with red berries and fairy-light
#                 bokeh on a warm wall.
#
# THE PIECE IS NEVER TOUCHED (notes/feedback_hero_must_be_exact_pattern.md):
# every function here only adds set dressing, swaps the ground, the lights and
# the world, and moves the CAMERA (elevation, distance, aspect, aperture). The
# yarn curves, the props (eyes/nose) and their materials are built exactly as in
# studio. Everything is procedural (no downloaded photos, no other shop's image).
#
# Units: 1 BU = 1 cm of the real toy. Blender's thin-lens DoF takes the aperture
# from `lens / (2 * fstop)` in scene units read as METRES, so a real-world
# f-number N on this 100x-scaled set is `N / 100` (STAGE_FSTOP below).
# ---------------------------------------------------------------------------

import bmesh
from mathutils import Vector

# Real-camera equivalent f/14 on a 90 mm lens: the toy (+-3 cm around the focus
# plane at ~50 cm) stays within ~2-3 px of blur at 1200 px, while a backdrop a
# metre behind blurs ~30 px — the "piece sharp, room melted" look of the bar.
STAGE_FSTOP = 0.14
STAGE_TILT = 80.0       # camera 10 deg above the table: sees the room behind
STAGE_ZOOM = 1.25       # pull back so the piece fills ~65% of the frame height
STAGE_ASPECT = 1.0      # square listing photo (the bunny and tree bars)
STAGE_IDS = ("linen", "windowsill", "nursery", "christmas")


def stage_of(view):
    st = view.get("stage") or "studio"
    return st if st in STAGE_IDS else "studio"


def stage_view(view):
    """Camera-only overrides for a styled stage, applied BEFORE main() reads the
    view. Returns the view unchanged for studio."""
    if stage_of(view) == "studio":
        return view
    v = dict(view)
    v["tiltDeg"] = view.get("stageTiltDeg", STAGE_TILT)
    v["distScale"] = view.get("distScale", 1.0) * view.get("stageZoom", STAGE_ZOOM)
    return v


def _lin(h):
    return hex_to_lin(h)


def _principled(name, hexcol, rough=0.8, sheen=0.0, spec=0.3, coat=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    b = mat.node_tree.nodes.get("Principled BSDF")
    set_in(b, "Base Color", _lin(hexcol) if isinstance(hexcol, str) else hexcol)
    set_in(b, "Roughness", rough)
    set_in(b, "Sheen Weight", sheen)
    set_in(b, "Specular IOR Level", spec)
    set_in(b, "Coat Weight", coat)
    return mat


def _emit_mat(name, rgb, strength):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    out = nt.nodes.get("Material Output")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def _obj_coords(nt, scale):
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = scale
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    return mp.outputs["Vector"]


def _math(nt, op, a, b=None, clamp=False):
    m = nt.nodes.new("ShaderNodeMath")
    m.operation = op
    m.use_clamp = clamp
    for i, v in enumerate((a, b)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            m.inputs[i].default_value = v
        else:
            nt.links.new(v, m.inputs[i])
    return m.outputs["Value"]


def _mix_rgb(nt, fac, c1, c2):
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    if isinstance(fac, (int, float)):
        mx.inputs["Factor"].default_value = fac
    else:
        nt.links.new(fac, mx.inputs["Factor"])
    mx.inputs[6].default_value = c1
    mx.inputs[7].default_value = c2
    return mx.outputs[2]


def linen_material(name, hexcol, weave=11.0):
    """Oatmeal linen: a plain weave of slubby threads (two crossed wave bands),
    soft low-frequency tone mottling, a faint fibre sheen."""
    mat = _principled(name, hexcol, rough=0.9, sheen=0.35, spec=0.15)
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    vec = _obj_coords(nt, (weave, weave, weave))
    wx = nt.nodes.new("ShaderNodeTexWave")
    wx.wave_type = "BANDS"
    wx.bands_direction = "X"
    wx.inputs["Distortion"].default_value = 1.5
    wx.inputs["Detail"].default_value = 2.0
    wy = nt.nodes.new("ShaderNodeTexWave")
    wy.wave_type = "BANDS"
    wy.bands_direction = "Y"
    wy.inputs["Distortion"].default_value = 1.5
    wy.inputs["Detail"].default_value = 2.0
    nt.links.new(vec, wx.inputs["Vector"])
    nt.links.new(vec, wy.inputs["Vector"])
    weave_h = _math(nt, "MULTIPLY", wx.outputs["Fac"], wy.outputs["Fac"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.35
    bump.inputs["Distance"].default_value = 0.02
    nt.links.new(weave_h, bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    slub_vec = _obj_coords(nt, (0.6, 0.6, 0.6))
    slub = nt.nodes.new("ShaderNodeTexNoise")
    slub.inputs["Scale"].default_value = 1.6
    slub.inputs["Detail"].default_value = 3.0
    nt.links.new(slub_vec, slub.inputs["Vector"])
    base = _lin(hexcol)
    dark = tuple(c * 0.86 for c in base[:3]) + (1.0,)
    light = tuple(min(1.0, c * 1.06) for c in base[:3]) + (1.0,)
    col = _mix_rgb(nt, slub.outputs["Fac"], dark, light)
    # thread shading: the weave valleys a touch darker
    shade = nt.nodes.new("ShaderNodeMix")
    shade.data_type = "RGBA"
    nt.links.new(_math(nt, "SUBTRACT", 0.12, _math(nt, "MULTIPLY", weave_h, 0.12)), shade.inputs["Factor"])
    nt.links.new(col, shade.inputs[6])
    shade.inputs[7].default_value = (0.0, 0.0, 0.0, 1.0)
    col2 = shade.outputs[2]
    nt.links.new(col2, bsdf.inputs["Base Color"])
    return mat


def knit_material(name, hexcol, stitch_cm=1.3, rough=0.92):
    """A chunky stocking-stitch blanket: columns of V stitches (a chevron height
    field), dark gaps between columns, a soft wool sheen."""
    mat = _principled(name, hexcol, rough=rough, sheen=0.6, spec=0.1)
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    sc = 1.0 / stitch_cm
    vec = _obj_coords(nt, (sc, sc * 1.35, sc))
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(vec, sep.inputs["Vector"])
    u = sep.outputs["X"]
    v = sep.outputs["Y"]
    a = _math(nt, "ABSOLUTE", _math(nt, "SUBTRACT", _math(nt, "FRACT", u), 0.5))  # 0 mid column .. 0.5 gap
    w = _math(nt, "ADD", v, _math(nt, "MULTIPLY", a, 1.2))
    ridge = _math(nt, "MULTIPLY_ADD", _math(nt, "SINE", _math(nt, "MULTIPLY", w, 6.2832)), 0.5)
    ridge.node.inputs[2].default_value = 0.5
    gap = _math(nt, "POWER", _math(nt, "MULTIPLY", a, 2.0), 5.0)
    h = _math(nt, "MULTIPLY", ridge, _math(nt, "SUBTRACT", 1.0, gap))
    # A finer fibre fuzz on top.
    fz = nt.nodes.new("ShaderNodeTexNoise")
    fz.inputs["Scale"].default_value = 90.0
    nt.links.new(_obj_coords(nt, (1, 1, 1)), fz.inputs["Vector"])
    h2 = _math(nt, "MULTIPLY_ADD", fz.outputs["Fac"], 0.08)
    nt.links.new(h, h2.node.inputs[2])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.85
    bump.inputs["Distance"].default_value = 0.35
    nt.links.new(h2, bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    base = _lin(hexcol)
    dark = tuple(c * 0.72 for c in base[:3]) + (1.0,)
    nt.links.new(_mix_rgb(nt, h, dark, base), bsdf.inputs["Base Color"])
    return mat


def wood_material(name, light_hex, dark_hex, along_x=True, rough=0.55):
    """Oiled pale oak: stretched distorted wave bands for the grain."""
    mat = _principled(name, light_hex, rough=rough, sheen=0.0, spec=0.35)
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    vec = _obj_coords(nt, (0.12, 1.4, 1.4) if along_x else (1.4, 0.12, 1.4))
    wv = nt.nodes.new("ShaderNodeTexWave")
    wv.wave_type = "BANDS"
    wv.bands_direction = "Y" if along_x else "X"
    wv.inputs["Scale"].default_value = 1.6
    wv.inputs["Distortion"].default_value = 7.0
    wv.inputs["Detail"].default_value = 3.0
    wv.inputs["Detail Scale"].default_value = 1.2
    nt.links.new(vec, wv.inputs["Vector"])
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 3.0
    nt.links.new(vec, nz.inputs["Vector"])
    f = _math(nt, "MULTIPLY", wv.outputs["Fac"], _math(nt, "MULTIPLY_ADD", nz.outputs["Fac"], 0.6))
    f.node.inputs[0].default_value = 1.0
    f2 = _math(nt, "POWER", f, 1.6)
    nt.links.new(_mix_rgb(nt, f2, _lin(light_hex), _lin(dark_hex)), bsdf.inputs["Base Color"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.15
    nt.links.new(f2, bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def plaster_material(name, hexcol, mottle=0.05):
    mat = _principled(name, hexcol, rough=0.95, spec=0.08)
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 0.05
    nz.inputs["Detail"].default_value = 4.0
    nt.links.new(_obj_coords(nt, (1, 1, 1)), nz.inputs["Vector"])
    base = _lin(hexcol)
    a = tuple(c * (1 - mottle) for c in base[:3]) + (1.0,)
    b = tuple(min(1.0, c * (1 + mottle)) for c in base[:3]) + (1.0,)
    nt.links.new(_mix_rgb(nt, nz.outputs["Fac"], a, b), bsdf.inputs["Base Color"])
    return mat


def outside_material(name, strength):
    """What a blurred window looks at: bright warm sky above, soft sage garden
    blobs below. Only ever seen far out of focus."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    out = nt.nodes.get("Material Output")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].position = 0.0
    cr.elements[0].color = (0.50, 0.55, 0.40, 1.0)
    cr.elements[1].position = 0.55
    cr.elements[1].color = (1.0, 0.97, 0.90, 1.0)
    e = cr.elements.new(0.32)
    e.color = (0.78, 0.80, 0.66, 1.0)
    nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 4.0
    nz.inputs["Detail"].default_value = 2.0
    nt.links.new(tc.outputs["Generated"], nz.inputs["Vector"])
    blob = _math(nt, "MULTIPLY_ADD", nz.outputs["Fac"], 0.5)
    blob.node.inputs[2].default_value = 0.7
    em = nt.nodes.new("ShaderNodeEmission")
    mixc = nt.nodes.new("ShaderNodeMix")
    mixc.data_type = "RGBA"
    mixc.blend_type = "MULTIPLY"
    mixc.inputs["Factor"].default_value = 0.6
    nt.links.new(ramp.outputs["Color"], mixc.inputs[6])
    nt.links.new(nz.outputs["Color"], mixc.inputs[7])
    nt.links.new(mixc.outputs[2], em.inputs["Color"])
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def _link(ob, root, mat=None, smooth=False):
    bpy.context.scene.collection.objects.link(ob) if ob.name not in bpy.context.scene.collection.objects else None
    ob.parent = root
    if mat is not None:
        ob.data.materials.clear()
        ob.data.materials.append(mat)
    if smooth and ob.type == "MESH":
        for pl in ob.data.polygons:
            pl.use_smooth = True
    return ob


def _bm_object(name, bm, root, mat, smooth=True):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    return _link(ob, root, mat, smooth)


def _box(name, root, mat, x0, x1, y0, y1, z0, z1):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for vt in bm.verts:
        vt.co.x = x0 + (vt.co.x + 0.5) * (x1 - x0)
        vt.co.y = y0 + (vt.co.y + 0.5) * (y1 - y0)
        vt.co.z = z0 + (vt.co.z + 0.5) * (z1 - z0)
    return _bm_object(name, bm, root, mat, smooth=False)


def _cloth(name, root, mat, x0, x1, y0, y1, n, height):
    """A rumpled cloth as a height-field grid (real geometry, so the folds catch
    the window light and cast their own soft shadows)."""
    bm = bmesh.new()
    nx = n
    ny = max(2, int(n * (y1 - y0) / max(1e-6, x1 - x0)))
    grid = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            x = x0 + (x1 - x0) * i / nx
            y = y0 + (y1 - y0) * j / ny
            row.append(bm.verts.new((x, y, height(x, y))))
        grid.append(row)
    for j in range(ny):
        for i in range(nx):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    return _bm_object(name, bm, root, mat, smooth=True)


def _smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / max(1e-6, e1 - e0)))
    return t * t * (3 - 2 * t)


def _folds(H, R, amp, lift=0.03, seed=0.0):
    """Soft cloth folds that die away to perfectly flat under the piece (radius R
    around the origin), so the piece rests on it exactly as it rests on the
    studio ground — same height, same contact."""
    def h(x, y):
        r = math.hypot(x, y * 1.15)
        m = _smoothstep(R * 1.05, R * 1.9, r)
        k = 1.0 / H
        f = (math.sin(x * k * 2.1 + seed) * 0.5
             + math.sin((x * 0.6 + y) * k * 1.3 + 1.7 + seed) * 0.8
             + math.sin((y - x * 0.4) * k * 3.4 + 0.4) * 0.25)
        return lift + max(0.0, amp * H * m * (f + 1.3) * 0.5)
    return h


def _spheres(name, root, mat, pts, radius, subdiv=2):
    bm = bmesh.new()
    for p in pts:
        r = radius if len(p) < 4 else p[3]
        bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=r,
                                   matrix=Matrix.Translation(Vector(p[:3])))
    return _bm_object(name, bm, root, mat, smooth=True)


def _cyl(name, root, mat, x, y, z0, r1, r2, depth, seg=48):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg,
                          radius1=r1, radius2=r2, depth=depth,
                          matrix=Matrix.Translation(Vector((x, y, z0 + depth * 0.5))))
    return _bm_object(name, bm, root, mat, smooth=True)


def _star_prism(name, root, mat, x, y, z0, r, depth, tilt=0.0, points=5):
    """A chunky wooden star standing on one point-pair, face to the camera."""
    bm = bmesh.new()
    outline = []
    for k in range(points * 2):
        a = math.pi / 2 + k * math.pi / points
        rr = r if k % 2 == 0 else r * 0.45
        outline.append((rr * math.cos(a), rr * math.sin(a)))
    lift = r * 0.55
    front = [bm.verts.new((x + px, y - depth * 0.5, z0 + lift + pz)) for px, pz in outline]
    back = [bm.verts.new((x + px, y + depth * 0.5, z0 + lift + pz)) for px, pz in outline]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    n = len(outline)
    for k in range(n):
        bm.faces.new((front[k], front[(k + 1) % n], back[(k + 1) % n], back[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _bm_object(name, bm, root, mat, smooth=False)


def _curve(name, root, mat, pts, radius):
    cu = bpy.data.curves.new(name, type="CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 2
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        sp.points[i].co = (p[0], p[1], p[2], 1.0)
    ob = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = root
    ob.data.materials.append(mat)
    return ob


def _pine_sprig(name, root, needle_mat, twig_mat, start, end, sag, needle_len, density=26):
    """A fir sprig: a sagging twig with dense needles fanned around it (crossed
    thin quads, one mesh). Only ever seen out of focus, so the needle count is
    about the silhouette, not the botany."""
    sx, sy, sz = start
    ex, ey, ez = end
    pts = []
    N = 24
    for i in range(N + 1):
        t = i / N
        pts.append((sx + (ex - sx) * t, sy + (ey - sy) * t,
                    sz + (ez - sz) * t - sag * math.sin(math.pi * t)))
    _curve(name + "_twig", root, twig_mat, pts, needle_len * 0.07)
    bm = bmesh.new()
    w = needle_len * 0.06
    for i in range(N):
        a = Vector(pts[i])
        b = Vector(pts[i + 1])
        d = (b - a)
        if d.length < 1e-6:
            continue
        d.normalize()
        side = d.cross(Vector((0, 0, 1)))
        if side.length < 1e-3:
            side = Vector((1, 0, 0))
        side.normalize()
        up = side.cross(d).normalized()
        for k in range(density):
            t = (k + 0.5) / density
            base = a.lerp(b, t)
            ang = (k * 2.399963) + i * 0.7          # golden-angle fan around the twig
            radial = (side * math.cos(ang) + up * math.sin(ang)).normalized()
            taper = 0.55 + 0.45 * math.sin(math.pi * min(1.0, (i + t) / N + 0.08))
            L = needle_len * taper * (0.8 + 0.2 * math.sin(k * 1.7))
            tip = base + (radial * 0.85 + d * 0.5).normalized() * L
            perp = radial.cross(d).normalized() * w
            v = [bm.verts.new(base - perp), bm.verts.new(base + perp),
                 bm.verts.new(tip + perp * 0.3), bm.verts.new(tip - perp * 0.3)]
            bm.faces.new(v)
    return _bm_object(name, bm, root, needle_mat, smooth=False)


def _fairy_string(name, root, wire_mat, bulb_mat, a, b, sag, count, bulb_r):
    pts = []
    for i in range(count):
        t = (i + 0.5) / count
        pts.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t,
                    a[2] + (b[2] - a[2]) * t - sag * math.sin(math.pi * t)))
    wire = [a] + pts + [b]
    _curve(name + "_wire", root, wire_mat, wire, bulb_r * 0.12)
    return _spheres(name, root, bulb_mat, pts, bulb_r, subdiv=1)


def _area(name, root_loc, loc, target, energy, size, color):
    ld = bpy.data.lights.new(name, type="AREA")
    ld.energy = energy
    ld.size = size
    ld.color = color
    ob = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    tgt = bpy.data.objects.new(name + "_t", None)
    tgt.location = target
    bpy.context.scene.collection.objects.link(tgt)
    c = ob.constraints.new("TRACK_TO")
    c.target = tgt
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    return ob


# A warm window daylight (~4500 K) — kept gentle so the yarn colours stay the
# yarn colours; the warmth mostly lives in the set and the ambient.
WARM = (1.0, 0.92, 0.82)
WARM_SOFT = (1.0, 0.95, 0.89)


def _world(scene, rgb, strength):
    world = scene.world or bpy.data.worlds.new("w")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
    bg.inputs["Strength"].default_value = strength


def apply_stage(stage, scene, ctx):
    """Build the styled set round the finished piece. `ctx` carries what main()
    already computed: cx, cy, yaw, span, footprint radius R, piece height H,
    camera `cam` + target `tgt`, and the studio objects to replace."""
    if stage == "studio":
        return
    cx, cy, yaw = ctx["cx"], ctx["cy"], ctx["yaw"]
    H = max(ctx["H"], 1.0)
    R = ctx["R"]
    cam, tgt = ctx["cam"], ctx["tgt"]
    view = ctx["view"]
    s = (cam.location - tgt.location).length          # camera distance
    D = 1.4 * s                                         # backdrop distance behind the piece

    # The studio sweep goes; its lights are kept (they model the toy exactly as
    # the signed-off studio hero does) but warmed and eased, and the set gets its
    # own light on top.
    for ob in ctx.get("remove", []):
        if ob is not None:
            bpy.data.objects.remove(ob, do_unlink=True)
    for lt in ctx.get("lights", []):
        lt.data.color = WARM_SOFT
        lt.data.energy *= view.get("stageKeyMult", 0.9)

    # Everything is built in a frame that turns with the camera's yaw: local +Y
    # runs away from the camera (into the room), +X to the camera's right.
    root = bpy.data.objects.new("stage_root", None)
    scene.collection.objects.link(root)
    root.location = (cx, cy, 0.0)
    root.rotation_euler = (0.0, 0.0, yaw)

    def to_world(p):
        return root.matrix_world @ Vector(p)

    bpy.context.view_layer.update()
    key_e = ctx["key_energy"]

    def room_light(loc, aim, mult, size, color=WARM):
        # energy scales with distance^2 relative to the studio key (~1.3 span away)
        d = (Vector(loc) - Vector(aim)).length
        e = key_e * mult * (d / (1.3 * ctx["span"])) ** 2
        return _area("stage_light", None, to_world(loc), to_world(aim), e, size, color)

    if stage == "windowsill":
        _stage_windowsill(root, H, R, s, D, room_light)
        _world(scene, (0.98, 0.93, 0.86), 0.35)
    elif stage == "linen":
        _stage_linen(root, H, R, s, D, room_light)
        _world(scene, (0.98, 0.93, 0.86), 0.32)
    elif stage == "nursery":
        _stage_nursery(root, H, R, s, D, room_light)
        _world(scene, (0.99, 0.92, 0.88), 0.32)
    elif stage == "christmas":
        _stage_christmas(root, H, R, s, D, room_light)
        _world(scene, (0.95, 0.82, 0.66), 0.22)

    # Camera: a real shallow depth of field, focused on the piece.
    cd = cam.data
    cd.dof.use_dof = True
    cd.dof.focus_object = None
    cd.dof.focus_distance = s
    cd.dof.aperture_fstop = view.get("stageFstop", STAGE_FSTOP)
    cd.dof.aperture_blades = 7
    cd.dof.aperture_rotation = 0.3
    cd.clip_end = max(cd.clip_end, D * 6)
    # Square (or `stageAspect`) frame round the same vertical field of view: the
    # piece keeps its size in frame, the set opens out either side.
    asp = view.get("stageAspect", STAGE_ASPECT)
    ry = scene.render.resolution_y
    scene.render.resolution_x = int(round(ry * asp))
    cd.sensor_fit = "VERTICAL"
    cd.sensor_height = 36.0
    scene.view_settings.exposure = view.get("stageExposure", scene.view_settings.exposure)
    print("[stage]", stage, "s=%.1f D=%.1f H=%.1f R=%.1f fstop=%.3f" % (s, D, H, R, cd.dof.aperture_fstop))


def _ground(root, mat, s, D, z=0.0):
    return _box("stage_ground", root, mat, -3 * s, 3 * s, -3 * s, D + 2, z - 2.0, z)


def _stage_windowsill(root, H, R, s, D, room_light):
    wood = wood_material("sill_wood", "#c49a6c", "#8a6040")
    _ground(root, wood, s, D)
    # Back wall with a window opening, upper left of frame.
    plaster = plaster_material("wall", "#e9dfd0")
    W = 2.5 * s
    wx0, wx1 = -0.75 * s, 0.30 * s
    wz0, wz1 = 0.10 * H, 1.6 * s
    t = 3.0
    _box("wall_l", root, plaster, -W, wx0, D, D + t, 0, 2 * s)
    _box("wall_r", root, plaster, wx1, W, D, D + t, 0, 2 * s)
    _box("wall_b", root, plaster, wx0, wx1, D, D + t, 0, wz0)
    _box("wall_t", root, plaster, wx0, wx1, D, D + t, wz1, 2 * s)
    frame = _principled("window_frame", "#ece6da", rough=0.55, spec=0.3)
    fb = 0.06 * s * 0.5
    fy0, fy1 = D + 0.6 * t, D + 0.6 * t + fb * 1.2
    _box("wf_bot", root, frame, wx0, wx1, fy0, fy1, wz0, wz0 + fb * 1.4)
    _box("wf_top", root, frame, wx0, wx1, fy0, fy1, wz1 - fb, wz1)
    _box("wf_l", root, frame, wx0, wx0 + fb, fy0, fy1, wz0, wz1)
    _box("wf_r", root, frame, wx1 - fb, wx1, fy0, fy1, wz0, wz1)
    mx = (wx0 + wx1) * 0.5
    _box("wf_mull", root, frame, mx - fb * 0.4, mx + fb * 0.4, fy0, fy1, wz0, wz1)
    mz = wz0 + (wz1 - wz0) * 0.45
    _box("wf_tran", root, frame, wx0, wx1, fy0, fy1, mz - fb * 0.4, mz + fb * 0.4)
    # The deep inner sill ledge the window sits on.
    _box("ledge", root, wood, wx0 - 0.1 * s, wx1 + 0.1 * s, D - 0.18 * s, D + 0.6 * t, 0, wz0)
    # The bright outside, well beyond the glass.
    out = outside_material("outside", 3.2)
    ob = _box("outside", root, out, -2.5 * s, 2.5 * s, D + 1.2 * s, D + 1.2 * s + 1, -0.5 * s, 2.5 * s)
    ob.visible_shadow = False
    # A linen napkin under the piece.
    lin = linen_material("napkin", "#ddd3c2")
    _cloth("napkin", root, lin, -2.6 * R, 2.4 * R, -1.8 * R, 2.0 * R, 90, _folds(H, R, 0.10, seed=0.4))
    # Out-of-focus props on the sill behind, right: a cream jug and books.
    glaze = _principled("jug", "#efe8dc", rough=0.25, spec=0.5, coat=0.4)
    jx, jy = 0.55 * s, 0.55 * D
    _cyl("jug", root, glaze, jx, jy, 0.0, 0.32 * H, 0.26 * H, 0.95 * H)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=False, cap_tris=False, segments=24, radius1=0.26 * H,
                          radius2=0.30 * H, depth=0.12 * H,
                          matrix=Matrix.Translation(Vector((jx, jy, 1.0 * H))))
    _bm_object("jug_lip", bm, root, glaze, smooth=True)
    z0 = 0.0
    for k, (col, th) in enumerate((("#9aa58b", 0.16), ("#d8c8a8", 0.12), ("#7d5b44", 0.14))):
        _box("book%d" % k, root, _principled("book%d" % k, col, rough=0.7),
             0.82 * s - 0.5 * H, 0.82 * s + 0.5 * H + k * 0.05 * H, 0.70 * D - 0.36 * H, 0.70 * D + 0.36 * H,
             z0, z0 + th * H)
        z0 += th * H
    # Dried lavender + grass bunch lying on the sill to the left of the piece.
    _dried_bunch(root, H, R)
    # Window daylight: a broad warm source just inside the glass, raking in from
    # behind-left (the rim on the fur), plus a soft room bounce from the front.
    room_light((mx, D - 2, wz0 + 0.6 * s), (0, 0, 0.45 * H), 0.55, 0.9 * s)
    room_light((-0.4 * s, -0.3 * s, 1.2 * s), (0.0, 0.6 * D, 0.3 * s), 0.35, 1.2 * s, WARM_SOFT)


def _dried_bunch(root, H, R):
    stem = _principled("stem", "#9a8c5c", rough=0.8)
    lav = _principled("lavender", "#8d78a8", rough=0.85, sheen=0.3)
    daisy = _principled("daisy", "#f3efe4", rough=0.8)
    eye = _principled("daisy_eye", "#d9a63a", rough=0.8)
    grass = _principled("grass", "#c9b07a", rough=0.85)
    bx, by = -1.55 * R, -0.15 * R          # the tie point
    lav_pts, dai_pts, eye_pts, gr_pts = [], [], [], []
    for k in range(17):
        a = math.radians(150 + (k - 8) * 4.2)
        L = (1.3 + 0.25 * math.sin(k * 2.3)) * H
        dx, dy = math.cos(a), math.sin(a) * 0.55
        base = (bx - dx * 0.55 * H, by - dy * 0.55 * H, 0.12)
        tip = (bx + dx * L, by + dy * L, 0.12 + 0.04 * H * (k % 3))
        _curve("stem%d" % k, root, stem, [base, tip], 0.018 * H)
        kind = k % 3
        for j in range(9):
            t = 0.72 + 0.28 * j / 8
            p = (base[0] + (tip[0] - base[0]) * t, base[1] + (tip[1] - base[1]) * t,
                 base[2] + (tip[2] - base[2]) * t + 0.02 * H)
            if kind == 0:
                lav_pts.append((p[0], p[1] + 0.01 * H * (j % 2), p[2], 0.035 * H))
            elif kind == 1 and j % 4 == 0:
                dai_pts.append((p[0], p[1], p[2], 0.06 * H))
                eye_pts.append((p[0], p[1], p[2] + 0.03 * H, 0.025 * H))
            elif kind == 2:
                gr_pts.append((p[0], p[1], p[2], 0.028 * H))
    _spheres("lavender", root, lav, lav_pts, 0.03 * H, subdiv=1)
    d = _spheres("daisies", root, daisy, dai_pts, 0.05 * H, subdiv=1)
    del d
    _spheres("daisy_eyes", root, eye, eye_pts, 0.02 * H, subdiv=1)
    _spheres("grass_heads", root, grass, gr_pts, 0.02 * H, subdiv=1)


def _stage_linen(root, H, R, s, D, room_light):
    table = wood_material("table_wood", "#b38a63", "#7a5639")
    _ground(root, table, s, D)
    lin = linen_material("throw", "#dcd1bf")
    base = _folds(H, R, 0.16, seed=1.1)

    def h(x, y):
        # a soft heap of the same throw rising behind the piece
        heap = 0.55 * H * math.exp(-((y - 0.42 * s) / (0.22 * s)) ** 2) * (0.75 + 0.25 * math.sin(x / H * 1.3))
        return base(x, y) + heap * _smoothstep(0.1 * s, 0.3 * s, y)
    _cloth("throw", root, lin, -1.6 * s, 1.6 * s, -1.6 * s, 0.9 * s, 180, h)
    plaster = plaster_material("wall", "#ece4d6")
    _box("wall", root, plaster, -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    # A stoneware vase with dried pampas, out of focus back left.
    glaze = _principled("vase", "#cfc2ae", rough=0.6, spec=0.3)
    vx, vy = -0.55 * s, 0.85 * s
    _cyl("vase", root, glaze, vx, vy, 0.0, 0.28 * H, 0.18 * H, 1.1 * H)
    plume = _principled("pampas", "#e6d8bc", rough=0.95, sheen=0.8)
    stem = _principled("pstem", "#b49a6c", rough=0.8)
    pts = []
    for k in range(7):
        a = math.radians(-35 + k * 11)
        top = (vx + math.sin(a) * 0.9 * H, vy + 0.1 * H * math.cos(k), 1.1 * H + math.cos(a) * 1.6 * H)
        _curve("pst%d" % k, root, stem, [(vx, vy, 1.0 * H), top], 0.012 * H)
        for j in range(10):
            t = j / 9.0
            pts.append((top[0] + math.sin(a) * 0.5 * H * t, top[1], top[2] + math.cos(a) * 0.5 * H * t, (0.12 + 0.05 * math.sin(math.pi * t)) * H))
    _spheres("pampas", root, plume, pts, 0.1 * H, subdiv=2)
    # Window light from the left, a soft fill from the right, light on the wall.
    room_light((-1.3 * s, 0.1 * s, 0.9 * s), (0, 0, 0.4 * H), 0.55, 1.0 * s)
    room_light((0.2 * s, 0.4 * D, 1.4 * s), (0.0, D, 0.4 * s), 0.6, 1.6 * s, WARM_SOFT)


def _stage_nursery(root, H, R, s, D, room_light):
    knit = knit_material("blanket", "#f1eadf", stitch_cm=1.1)
    _ground(root, _principled("dresser", "#efe7dc", rough=0.6), s, D)
    _cloth("blanket", root, knit, -1.8 * s, 1.8 * s, -1.6 * s, 0.6 * D, 160, _folds(H, R, 0.09, lift=0.04, seed=2.2))
    plaster = plaster_material("wall", "#f0dcd2")
    _box("wall", root, plaster, -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    oak = wood_material("oak", "#d9b68a", "#b38b5e", along_x=False)
    # A picture frame leaning on the wall, back left.
    fx, fy = -0.62 * s, 0.75 * D
    fw, fh, fb = 1.25 * H, 1.6 * H, 0.12 * H
    _box("frame_l", root, oak, fx - fw / 2, fx - fw / 2 + fb, fy, fy + fb, 0.0, fh)
    _box("frame_r", root, oak, fx + fw / 2 - fb, fx + fw / 2, fy, fy + fb, 0.0, fh)
    _box("frame_b", root, oak, fx - fw / 2, fx + fw / 2, fy, fy + fb, 0.0, fb)
    _box("frame_t", root, oak, fx - fw / 2, fx + fw / 2, fy, fy + fb, fh - fb, fh)
    _box("frame_card", root, _principled("card", "#f6f1e8", rough=0.9),
         fx - fw / 2 + fb, fx + fw / 2 - fb, fy + fb * 0.5, fy + fb * 0.7, fb, fh - fb)
    # A chunky wooden star in front of it.
    _star_prism("star", root, oak, fx + 0.55 * H, fy - 0.8 * H, 0.0, 0.42 * H, 0.18 * H)
    # A white lantern glowing, back right, with tiny warm star lights.
    lx, ly = 0.6 * s, 0.7 * D
    lw, lh = 0.75 * H, 1.25 * H
    white = _principled("lantern", "#f4f1ec", rough=0.5)
    p = 0.06 * H
    for i, (ox, oy) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1))):
        _box("lp%d" % i, root, white, lx + ox * lw / 2 - p, lx + ox * lw / 2 + p,
             ly + oy * lw / 2 - p, ly + oy * lw / 2 + p, 0.0, lh)
    _box("lbase", root, white, lx - lw / 2 - p, lx + lw / 2 + p, ly - lw / 2 - p, ly + lw / 2 + p, 0, 0.08 * H)
    _cyl("lroof", root, white, lx, ly, lh, 0.62 * lw, 0.08 * lw, 0.35 * H, seg=4)
    glow = _emit_mat("lglow", (1.0, 0.72, 0.42), 18.0)
    _spheres("lbulbs", root, glow, [(lx + 0.18 * lw * math.cos(k * 1.3), ly + 0.15 * lw * math.sin(k * 2.1),
                                     0.25 * lh + 0.55 * lh * (k / 6.0)) for k in range(7)], 0.04 * H, subdiv=1)
    # A lilac knit blanket heaped at the right.
    lilac = knit_material("lilac", "#b9a3cc", stitch_cm=1.0)

    def heap(x, y):
        hx = x - 1.05 * s * 0.55
        return 0.03 + max(0.0, 0.45 * H * math.exp(-(hx / (0.28 * s)) ** 2 - ((y - 0.25 * s) / (0.35 * s)) ** 2)
                          * (0.8 + 0.2 * math.sin(y / H * 2.0)))
    _cloth("lilac", root, lilac, max(R * 1.3, 0.25 * s), 1.4 * s, -0.4 * s, 0.9 * s, 110, heap)
    room_light((-1.2 * s, 0.0, 1.0 * s), (0, 0, 0.4 * H), 0.5, 1.0 * s)
    room_light((0.0, 0.45 * D, 1.4 * s), (0.0, D, 0.4 * s), 0.6, 1.6 * s, WARM_SOFT)


def _stage_christmas(root, H, R, s, D, room_light):
    knit = knit_material("throw", "#efe6d6", stitch_cm=1.2)
    _ground(root, wood_material("table", "#8f6a4a", "#5d4130"), s, D)
    _cloth("throw", root, knit, -1.8 * s, 1.8 * s, -1.6 * s, 0.55 * D, 160, _folds(H, R, 0.12, lift=0.04, seed=0.9))
    plaster = plaster_material("wall", "#cdb59a", mottle=0.08)
    _box("wall", root, plaster, -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    needle = _principled("needle", "#24402a", rough=0.6, spec=0.3)
    twig = _principled("twig", "#5a4030", rough=0.9)
    berry = _principled("berry", "#a8191f", rough=0.18, spec=0.5, coat=0.5)
    wire = _principled("wire", "#3a2c20", rough=0.6)
    bulb = _emit_mat("bulb", (1.0, 0.70, 0.36), 60.0)
    # Pine sprigs framing both sides, one reaching into the near foreground.
    nl = 0.32 * H
    _pine_sprig("pine_l", root, needle, twig, (-1.0 * s, 0.35 * s, 1.3 * H), (-0.32 * s, 0.25 * s, 0.9 * H), 0.2 * H, nl)
    _pine_sprig("pine_l2", root, needle, twig, (-0.9 * s, 0.05 * s, 0.25 * H), (-0.30 * s, -0.08 * s, 0.15 * H), 0.05 * H, nl)
    _pine_sprig("pine_r", root, needle, twig, (1.0 * s, 0.4 * s, 1.5 * H), (0.34 * s, 0.30 * s, 1.0 * H), 0.25 * H, nl)
    _pine_sprig("pine_r2", root, needle, twig, (0.95 * s, 0.1 * s, 0.3 * H), (0.36 * s, 0.02 * s, 0.18 * H), 0.05 * H, nl)
    # A long bough across the back with lights wound along it.
    _pine_sprig("pine_back", root, needle, twig, (-1.2 * s, 0.75 * D, 2.6 * H), (1.2 * s, 0.75 * D, 2.4 * H), 0.4 * H, 0.5 * H, density=18)
    bpts = []
    for (bx, by, bz) in ((-0.36 * s, 0.24 * s, 0.85 * H), (0.40 * s, 0.30 * s, 0.95 * H),
                         (-0.34 * s, -0.09 * s, 0.2 * H), (0.38 * s, 0.0, 0.22 * H)):
        for k in range(5):
            a = k * 1.26
            bpts.append((bx + 0.09 * H * math.cos(a), by + 0.07 * H * math.sin(a), bz + 0.05 * H * (k % 2), 0.075 * H))
    _spheres("berries", root, berry, bpts, 0.07 * H)
    # Fairy lights: draped across the wall behind (deep bokeh) and through the
    # side sprigs.
    for k, z in enumerate((1.3 * H, 2.0 * H, 2.9 * H)):
        _fairy_string("fl_wall%d" % k, root, wire, bulb, (-1.4 * s, D - 1, z + 0.5 * H),
                      (1.4 * s, D - 1, z + 0.3 * H), 0.4 * H, 26, 0.09 * H)
    _fairy_string("fl_l", root, wire, bulb, (-1.0 * s, 0.32 * s, 1.35 * H), (-0.34 * s, 0.22 * s, 0.75 * H), 0.1 * H, 7, 0.05 * H)
    _fairy_string("fl_r", root, wire, bulb, (1.0 * s, 0.38 * s, 1.5 * H), (0.36 * s, 0.28 * s, 0.85 * H), 0.1 * H, 7, 0.05 * H)
    _fairy_string("fl_back", root, wire, bulb, (-1.2 * s, 0.73 * D, 2.4 * H), (1.2 * s, 0.73 * D, 2.2 * H), 0.4 * H, 22, 0.07 * H)
    room_light((-1.2 * s, 0.0, 1.0 * s), (0, 0, 0.4 * H), 0.45, 1.0 * s)
    room_light((0.0, 0.4 * D, 1.2 * s), (0.0, D, 0.3 * s), 0.35, 1.6 * s, (1.0, 0.85, 0.68))



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
