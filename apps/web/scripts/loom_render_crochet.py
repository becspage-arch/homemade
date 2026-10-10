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
# default) renders byte-for-byte as before. `wool` and `velvet` retune the same
# BSDF on the scene's own plies (`velvet` adds a fuzz-shell halo object, see
# `fuzz_shell_material`). `chenille` and `fine-cotton` REBUILD the strand from
# the plies' centreline (`strand`: "single" = one plump unplied tube,
# "replied" = re-plied with the fibre's own twist and ply size; see
# `strand_centre` / `replied`), render-only, so no geometry hash moves.
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
    # Plush chenille (bar: highland cow). No ply and no halo shell: one plump
    # strand (`strand`), the velvet pile material (`chenille_material`: matte,
    # microfibre sheen rim, crushed-pile value drift, soft subsurface) and a
    # short dense fringe of real hair curves for a soft silhouette
    # (`add_pile_hairs`). The earlier halo-shell version kept the cotton ply
    # visible and read dark and speckled (crochet-fibre-proof/verdict.md).
    "chenille": dict(
        specular=0.04, sheen=0.35, sheen_rough=0.5, aniso=0.0,
        # Depth (Fable r5-r7, proofs/yarn r5-*/r6-*): the pile swallows light,
        # so the same dye reads darker in chenille than in cotton, with deep
        # warm crevices between stitches. `base_mult` scales the albedo for
        # mid/dark colours only (a cream muzzle stays cream: see
        # `depth_weight`), the AO cavity term darkens where strands are hemmed
        # in, the rim lifts silhouettes without losing chroma, and the warm-up
        # saturation grade is eased (1.2 pushed brown orange).
        base_mult=0.76, cavity_amt=0.7, cavity_dist_mm=2.0, cavity_pow=1.5,
        cavity_shade=0.32, rim_amt=0.45, rim_mode="lift", rim_tint=0.45,
        rim_pow=2.5, rim_blend=0.5, rim_alpha=0.0, sat_mult=0.92, depth_by_lum=True,
        # subsurface OFF: the plump strands interpenetrate where stitches
        # squash together, and random-walk SSS trapped inside an overlap
        # rendered as dark specks on pale chenille (proofs/yarn r1, r4).
        subsurf=0.0, bump1=0.3, bump2=0.16, rough_lo=0.75, rough_hi=0.92,
        rough=1.0, sheen_tint_mix=0.45, crush_scale=7.0, crush_amt=0.14,
        fleck_scale=45.0, fleck_amt=0.45,
        pile_scale=90.0, pile_bump=0.45,
        # Hair-curve pile fringe (`add_pile_hairs`) is OFF by default. It is
        # cheap now that the length is right (r6: 1.6 M hairs at 3/mm2 on the
        # bear hero cost +80 s), and it does soften the brown silhouette, but
        # on cream it reads as grey whiskers rather than nap (proofs/yarn
        # r6-bunny-chenille). Opt in per scene with fibreTune pile_density.
        pile_density=0.0, pile_children=10, pile_len_mm=1.0, pile_lean=0.7,
        pile_radius_mm=0.04, pile_tip_lift=0.12,
        flyaway=0.0, halo=None,
        # Chenille has NO ply: the strand is one plump velvet tube. The renderer
        # rebuilds it from the plies' shared centreline (see `strand_centre`) at
        # `strand_mult` x the plied bundle's outer radius, so neighbouring
        # stitches close up the way squashy chenille does. Pile = `chenille_material`.
        strand="single", strand_mult=1.38,
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
    # Fine mercerised cotton (the bar's fairy doll): small, even, DEFINED
    # stitches with a slight sheen. Same plied construction as `cotton` but
    # re-plied by the renderer from the centreline with an even, moderate twist
    # (0.2 turns/mm, vs the default's 0.18 on much thinner plies) so the ply
    # reads as fine regular grooves, not a barber-pole rope, and a plumper
    # strand (1.15x) so stitches sit snug with no daylight between them.
    # Probe r1-r3: ply 0.6 / twist 0.09 read doughy; one smooth strand read
    # as plastic pasta; this was the clear winner (proofs/yarn/r3-*).
    # Fable r6 (proofs/yarn/r6-finecotton*.png, beside the bar bunny): the
    # bunny's milk cotton shows NO ply at close range, only a smooth matte
    # stitch with a faint spun grain. Plies overlapping heavily (0.62) with
    # a moderate twist leave just that grain; the satin sheen and anisotropy
    # went (they read as plastic pasta on a smooth strand, r3/r5/r6), the
    # surface is matte, and a gentle cavity term shades the valleys between
    # stitches the way the bunny's do.
    "fine-cotton": dict(
        specular=0.08, sheen=0.6, sheen_rough=0.7, aniso=0.0,
        subsurf=0.08, bump1=0.5, bump2=0.3, rough_lo=0.7, rough_hi=0.85,
        flyaway=0.0, halo=None,
        strand="replied", strand_mult=1.15, ply_frac=0.62, twist_turns_per_mm=0.22,
        cavity_amt=0.3, cavity_dist_mm=1.5, cavity_pow=1.2, cavity_shade=0.45,
    ),
}


def strand_centre(filaments):
    """The yarn CENTRELINE behind a stroke's plies, plus the plied bundle's outer
    radius offset (centre-to-ply distance). yarnLoop.pliedFilaments lays the
    nPly plies at equal phase (2*pi*f/nPly) round the centreline, so their
    pointwise mean IS the centreline exactly. A stroke that isn't a clean plied
    set (one filament, or unequal lengths) is returned as-is."""
    polys = [p for p in filaments if len(p) >= 2]
    if len(polys) < 2 or len({len(p) for p in polys}) != 1:
        return polys, 0.0
    n = len(polys)
    centre = []
    spread = 0.0
    for i in range(len(polys[0])):
        c = [sum(p[i][k] for p in polys) / n for k in range(3)]
        centre.append(c)
        spread += math.dist(c, polys[0][i])
    return [centre], spread / len(centre)


def replied(centre, spread_mm, n_ply, turns_per_mm):
    """Re-ply a centreline into `n_ply` spiralling ply paths (the same
    parallel-transport construction as yarnLoop.pliedFilaments) with the
    fibre's own spread and twist. Render-only."""
    from mathutils import Vector
    pts = [Vector(p) for p in centre]
    n = len(pts)
    if n < 2:
        return [centre]
    tans = []
    for i in range(n):
        d = pts[min(n - 1, i + 1)] - pts[max(0, i - 1)]
        tans.append(d.normalized() if d.length > 1e-9 else Vector((1, 0, 0)))
    ref = Vector((0, 0, 1)) if abs(tans[0].z) < 0.9 else Vector((1, 0, 0))
    n1 = (ref - tans[0] * ref.dot(tans[0])).normalized()
    frames = []
    arc = [0.0]
    for i in range(n):
        t = tans[i]
        m = n1 - t * n1.dot(t)
        if m.length < 1e-6:
            r2 = Vector((0, 0, 1)) if abs(t.z) < 0.9 else Vector((1, 0, 0))
            m = r2 - t * r2.dot(t)
        n1 = m.normalized()
        frames.append((n1, t.cross(n1)))
        if i:
            arc.append(arc[-1] + (pts[i] - pts[i - 1]).length)
    out = []
    for f in range(n_ply):
        ph0 = 2 * math.pi * f / n_ply
        poly = []
        for i in range(n):
            ph = arc[i] * turns_per_mm * 2 * math.pi + ph0
            a, b = frames[i]
            q = pts[i] + a * (math.cos(ph) * spread_mm) + b * (math.sin(ph) * spread_mm)
            poly.append((q.x, q.y, q.z))
        out.append(poly)
    return out


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
    base = hex_to_lin(hexcol)
    set_in(bsdf, "Base Color", base)
    if fp.get("cavity_amt", 0.0) > 0:
        # fine cotton (and any fibre that asks): shade the valleys between
        # stitches, see `cavity_nodes`. Absent from cotton/wool/velvet, so
        # their renders are unchanged.
        rgb = nt.nodes.new("ShaderNodeRGB")
        rgb.outputs[0].default_value = base
        nt.links.new(cavity_nodes(nt, rgb.outputs[0], base, fp), bsdf.inputs["Base Color"])
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


def depth_weight(base):
    """How much of a fibre's 'depth' treatment a colour takes: 1 for mid and
    dark dyes, fading to 0 for pale ones (the bar cow's cream muzzle is still
    bright cream in chenille; proofs/yarn r6-bunny-chenille went dirty grey
    with the full treatment)."""
    lum = 0.2126 * base[0] + 0.7152 * base[1] + 0.0722 * base[2]
    srgb = lum ** (1 / 2.2)
    t = min(1.0, max(0.0, (srgb - 0.45) / 0.4))
    return 1.0 - 0.6 * t * t * (3 - 2 * t)   # pale colours keep 40% of the depth


def cavity_nodes(nt, col, base, fp):
    """Crevice shadow (Fable r5): on a real toy the valleys between stitches
    go deep, warm and slightly redder while the stitch tops stay lit, and that
    value range is most of what reads as plush depth rather than flat tubing.
    Cycles' own bounce light fills those valleys because the strands are
    bright and close together, so an AO term mixes the colour towards a dark
    crevice shade where the strand is hemmed in. Returns the new colour socket
    (unchanged when `cavity_amt` is 0)."""
    cav = fp.get("cavity_amt", 0.0) * (depth_weight(base) if fp.get("depth_by_lum") else 1.0)
    if cav <= 0:
        return col
    ao = nt.nodes.new("ShaderNodeAmbientOcclusion")
    ao.samples = int(fp.get("cavity_samples", 8))
    ao.only_local = False
    ao.inputs["Distance"].default_value = fp.get("cavity_dist_mm", 1.5) * S
    aw = nt.nodes.new("ShaderNodeMath")
    aw.operation = "POWER"
    nt.links.new(ao.outputs["AO"], aw.inputs[0])
    aw.inputs[1].default_value = fp.get("cavity_pow", 1.5)
    am = nt.nodes.new("ShaderNodeMath")
    am.operation = "MULTIPLY_ADD"
    nt.links.new(aw.outputs[0], am.inputs[0])
    am.inputs[1].default_value = cav
    am.inputs[2].default_value = 1.0 - cav
    cs = fp.get("cavity_shade", 0.32)
    crev = (base[0] * cs * 1.1, base[1] * cs * 0.9, base[2] * cs * 0.85, 1.0)
    cm = nt.nodes.new("ShaderNodeMix")
    cm.data_type = "RGBA"
    nt.links.new(am.outputs[0], cm.inputs[0])
    cm.inputs[6].default_value = crev
    nt.links.new(col, cm.inputs[7])
    return cm.outputs[2]


def chenille_material(name, hexcol, fp):
    """CHENILLE / velvet pile on a single plump strand (no ply at all).

    What makes a real chenille amigurumi read as plush, and what each node is:
      - a dense, short cut pile: matte (high roughness, almost no specular) with
        a soft micro-relief, so light never makes a crisp line on the strand;
      - the velvet RIM: pile fibres seen side-on catch light, so a curved
        stitch is brighter at its grazing edges than face-on. Principled's
        microfibre Sheen layer is exactly that, tinted towards a lighter shade
        of the yarn (not white, which reads dusty);
      - crushed pile: chenille's nap lies in different directions stitch to
        stitch, so neighbouring stitches differ slightly in value and sheen.
        A low-frequency noise (about one stitch across) nudges colour and
        sheen roughness;
      - light diffusing into the pile: a little subsurface softens the
        terminator so the bumps read soft, not hard plastic."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    base = hex_to_lin(hexcol)
    # Chenille DEPTH (Fable r5): the same dye looks darker in chenille than in
    # cotton, because the pile swallows light (the bar cow at #7a4a35 reads
    # value ~0.36 where our r4 render read ~0.48). `base_mult` scales the
    # albedo for the pile; the crevice darkening below does the rest.
    bm = 1.0 - (1.0 - fp.get("base_mult", 1.0)) * (depth_weight(base) if fp.get("depth_by_lum") else 1.0)
    base = tuple(c * bm for c in base[:3]) + (1.0,)
    tex = nt.nodes.new("ShaderNodeTexCoord")
    # crushed-pile patches (~1.5 mm, object units are cm)
    crush = nt.nodes.new("ShaderNodeTexNoise")
    crush.inputs["Scale"].default_value = fp.get("crush_scale", 7.0)
    crush.inputs["Detail"].default_value = 2.0
    nt.links.new(tex.outputs["Object"], crush.inputs["Vector"])
    lo = tuple(c * (1.0 - fp.get("crush_amt", 0.14)) for c in base[:3]) + (1.0,)
    hi = tuple(min(1.0, c * (1.0 + fp.get("crush_amt", 0.14))) for c in base[:3]) + (1.0,)
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.3
    ramp.color_ramp.elements[0].color = lo
    ramp.color_ramp.elements[1].position = 0.7
    ramp.color_ramp.elements[1].color = hi
    nt.links.new(crush.outputs["Fac"], ramp.inputs["Fac"])
    # pile-tip flecks: the cut ends of the pile catch the light as countless
    # tiny pale points (the bar cow's surface is made of them), so a fine,
    # high-contrast noise lifts specks of the yarn towards a paler tint. This
    # is what reads as "fibre" rather than smooth velvet tubing.
    fleck = nt.nodes.new("ShaderNodeTexNoise")
    fleck.inputs["Scale"].default_value = fp.get("fleck_scale", 160.0)
    fleck.inputs["Detail"].default_value = 2.0
    nt.links.new(tex.outputs["Object"], fleck.inputs["Vector"])
    fr = nt.nodes.new("ShaderNodeMapRange")
    fr.inputs["From Min"].default_value = 0.52
    fr.inputs["From Max"].default_value = 0.72
    fr.inputs["To Min"].default_value = 0.0
    fr.inputs["To Max"].default_value = fp.get("fleck_amt", 0.0)
    nt.links.new(fleck.outputs["Fac"], fr.inputs["Value"])
    pale = tuple(min(1.0, c * 1.7 + 0.03) for c in base[:3]) + (1.0,)
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    nt.links.new(fr.outputs["Result"], mix.inputs[0])
    nt.links.new(ramp.outputs["Color"], mix.inputs[6])
    mix.inputs[7].default_value = pale
    col = mix.outputs[2]
    # Crevice shadow (Fable r5): on a real chenille toy the valleys between
    # stitches go deep, warm brown while the stitch tops stay lit, and that
    # value range is most of what reads as "deep plush" rather than flat
    # orange tubing. Cycles' own bounce light fills those valleys because the
    # plump strands are bright and close together, so an AO term darkens the
    # colour towards a saturated crevice shade where the strand is hemmed in.
    col = cavity_nodes(nt, col, base, fp)
    # Fuzzy rim without hairs (Fable r5): pile fibres seen side-on at a
    # stitch's silhouette are lit from behind and scatter, so the edge of
    # every bump fades to a paler, softer tint instead of ending in a clean
    # line. Layer Weight's Facing term raised to `rim_pow` keeps it to the
    # last few degrees of the curve.
    rim = fp.get("rim_amt", 0.0)
    rim_alpha = fp.get("rim_alpha", 0.0)
    facing = None
    if rim > 0 or rim_alpha > 0:
        lw = nt.nodes.new("ShaderNodeLayerWeight")
        lw.inputs["Blend"].default_value = fp.get("rim_blend", 0.5)
        pw = nt.nodes.new("ShaderNodeMath")
        pw.operation = "POWER"
        nt.links.new(lw.outputs["Facing"], pw.inputs[0])
        pw.inputs[1].default_value = fp.get("rim_pow", 2.5)
        facing = pw.outputs[0]
    if rim > 0:
        rs = nt.nodes.new("ShaderNodeMath")
        rs.operation = "MULTIPLY"
        nt.links.new(facing, rs.inputs[0])
        rs.inputs[1].default_value = rim
        rt = fp.get("rim_tint", 0.55)
        if fp.get("rim_mode", "pale") == "lift":
            # lift the yarn colour towards light WITHOUT losing its chroma (a
            # white mix read dusty on the r5 bear): a gamma lift in linear
            # light keeps brown brown as it brightens.
            rim_col = tuple(c ** (1.0 - rt) for c in base[:3]) + (1.0,)
        else:
            rim_col = tuple(c * (1 - rt) + rt for c in base[:3]) + (1.0,)
        rm = nt.nodes.new("ShaderNodeMix")
        rm.data_type = "RGBA"
        nt.links.new(rs.outputs[0], rm.inputs[0])
        nt.links.new(col, rm.inputs[6])
        rm.inputs[7].default_value = rim_col
        col = rm.outputs[2]
    nt.links.new(col, bsdf.inputs["Base Color"])
    if rim_alpha > 0:
        # the very edge of the strand goes part-transparent so the silhouette
        # is soft (a fringe of pile, not a cut-out); kept small, since every
        # transparent hit costs a bounce.
        out = nt.nodes.get("Material Output")
        tr = nt.nodes.new("ShaderNodeBsdfTransparent")
        ms = nt.nodes.new("ShaderNodeMixShader")
        ra = nt.nodes.new("ShaderNodeMath")
        ra.operation = "MULTIPLY"
        nt.links.new(facing, ra.inputs[0])
        ra.inputs[1].default_value = rim_alpha
        nt.links.new(ra.outputs[0], ms.inputs[0])
        nt.links.new(bsdf.outputs[0], ms.inputs[1])
        nt.links.new(tr.outputs[0], ms.inputs[2])
        nt.links.new(ms.outputs[0], out.inputs["Surface"])
    set_in(bsdf, "Roughness", fp.get("rough", 0.9))
    set_in(bsdf, "Specular IOR Level", fp.get("specular", 0.04))
    set_in(bsdf, "Sheen Weight", fp.get("sheen", 1.0))
    st = fp.get("sheen_tint_mix", 0.45)
    tint = tuple(c * (1 - st) + st for c in base[:3]) + (1.0,)
    set_in(bsdf, "Sheen Tint", tint)
    sr = nt.nodes.new("ShaderNodeMapRange")
    sr.inputs["To Min"].default_value = fp.get("sheen_rough", 0.3) - 0.08
    sr.inputs["To Max"].default_value = fp.get("sheen_rough", 0.3) + 0.12
    nt.links.new(crush.outputs["Fac"], sr.inputs["Value"])
    nt.links.new(sr.outputs["Result"], bsdf.inputs["Sheen Roughness"])
    set_in(bsdf, "Subsurface Weight", fp.get("subsurf", 0.2))
    set_in(bsdf, "Subsurface Radius", (0.6, 0.45, 0.35))
    set_in(bsdf, "Subsurface Scale", 0.03)
    # short cut pile: a fine isotropic micro-relief (~0.2 mm tufts)
    pile = nt.nodes.new("ShaderNodeTexNoise")
    pile.inputs["Scale"].default_value = fp.get("pile_scale", 55.0)
    pile.inputs["Detail"].default_value = 4.0
    nt.links.new(tex.outputs["Object"], pile.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = fp.get("pile_bump", 0.35)
    bump.inputs["Distance"].default_value = 0.006
    nt.links.new(pile.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def pile_hair_material(name, hexcol, fp):
    """The loose pile tips (see `add_pile_hairs`): the yarn colour lifted a
    little towards a pale tint, because the tips are what catch the light on a
    real chenille — that lighter, softer bloom over the stitch is the plush."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    base = hex_to_lin(hexcol)
    lift = fp.get("pile_tip_lift", 0.18)
    set_in(bsdf, "Base Color", tuple(c * (1 - lift) + lift * min(1.0, c * 2.2) for c in base[:3]) + (1.0,))
    set_in(bsdf, "Roughness", 0.75)
    set_in(bsdf, "Specular IOR Level", 0.15)
    set_in(bsdf, "Sheen Weight", 0.0)
    set_in(bsdf, "Subsurface Weight", 0.0)
    return mat


def add_pile_hairs(ob, hexcol, fp):
    """The chenille's SOFT SILHOUETTE: a short, dense fringe of real hair
    curves standing out of the plump strand, so no stitch edge is ever a hard
    line (the halo shell's alpha speckle could not do this — it read as dark
    pits). The curve is baked to a hidden emitter mesh, then `pile_density`
    hairs per mm^2 of strand surface (parents x simple children, so the
    particle system itself stays small) of `pile_len_mm`, sprayed roughly
    along the surface normal with a random lean."""
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    if not me.polygons:
        return
    area_mm2 = sum(pl.area for pl in me.polygons) / (S * S)
    total = int(area_mm2 * fp.get("pile_density", 12.0))
    kids = int(fp.get("pile_children", 12))
    em = bpy.data.objects.new(ob.name + "_pile", me)
    bpy.context.collection.objects.link(em)
    em.data.materials.clear()
    em.data.materials.append(pile_hair_material("ph_" + hexcol, hexcol, fp))
    mod = em.modifiers.new("pile", "PARTICLE_SYSTEM")
    ps = mod.particle_system.settings
    em.show_instancer_for_render = False   # the emitter copy itself never renders
    for k, v in (
        ("type", "HAIR"), ("use_advanced_hair", True),
        ("count", max(1, total // max(1, kids + 1))),
        ("hair_length", fp.get("pile_len_mm", 0.45) * S),
        ("emit_from", "FACE"), ("use_emit_random", True), ("use_even_distribution", True),
        # With use_advanced_hair the hair grows from its emission VELOCITY, not
        # `hair_length` (Blender grows ~4 BU of hair per unit of velocity), so
        # the length is set through normal_factor. (The r2/r4 "hung" hair renders
        # were millions of 3 cm hairs at normal_factor 1.0: r5 probe h1.)
        ("normal_factor", fp.get("pile_len_mm", 0.45) * S / 4.0),
        ("factor_random", fp.get("pile_lean", 0.7) * fp.get("pile_len_mm", 0.45) * S / 4.0),
        ("length_random", 0.5), ("hair_step", 3), ("display_step", 1), ("render_step", 2),
        ("child_type", "SIMPLE"), ("child_percent", 1), ("rendered_child_count", kids),
        ("child_radius", fp.get("pile_len_mm", 0.45) * S * 1.5), ("child_roundness", 1.0),
        ("roughness_1", 0.015), ("roughness_1_size", 0.5), ("roughness_endpoint", 0.01),
        ("radius_scale", fp.get("pile_radius_mm", 0.03) * S),
        ("root_radius", 1.0), ("tip_radius", 0.3), ("material", 1),
    ):
        try:
            setattr(ps, k, v)
        except Exception as e:  # a renamed setting must not kill the render
            print("[yarn] pile setting skipped", k, e)
    print("[yarn] pile", ob.name, "area_mm2", int(area_mm2), "hairs", ps.count * (kids + 1))


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

    fpb = FIBRE_PARAMS.get(fibre, FIBRE_PARAMS["cotton"])
    has_halo = bool(fpb.get("halo"))
    strand = fpb.get("strand", "ply")

    def stroke_polys(st):
        """The polylines to sweep for one stroke and the radius (mm) of each:
        the scene's own plies untouched for 'ply' (cotton/wool/velvet, so their
        renders are unchanged), or the strand rebuilt from the plies'
        centreline for 'single' (chenille) / 'replied' (fine cotton)."""
        if strand == "ply":
            return st["filaments"], st["radiusMm"]
        centre, spread = strand_centre(st["filaments"])
        if not spread:
            return st["filaments"], st["radiusMm"]
        bundle = (spread + st["radiusMm"]) * fpb.get("strand_mult", 1.0)
        if strand == "single":
            return centre, bundle
        ply_r = bundle * fpb.get("ply_frac", 0.52)
        return replied(centre[0], bundle - ply_r, len(st["filaments"]),
                       fpb.get("twist_turns_per_mm", 0.1)), ply_r

    def write_points(cu, mult):
        for st in group:
            polys, rad_mm = stroke_polys(st)
            # radiusMm is now the PLY tube radius (crisp plied model, §11): bevel
            # it 1:1 so the nPly plies stay distinct (a fatter multiplier merges
            # them back into a smooth roving tube). The ply spread reaches the
            # target outer radius, so the yarn still fills the fabric. `mult` >1
            # grows the halo shell (see build_yarn's fuzz-halo pass) outside the
            # core strand without changing the core's own radius.
            r = rad_mm * S * 1.02 * mult
            zlift = st["radiusMm"] * S * 1.02  # halo lifts with the CORE strand, not its own bigger radius
            for poly in polys:
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
        cu.bevel_resolution = 3 if strand == "single" else 2
        cu.resolution_u = 2
        cu.use_fill_caps = True
        write_points(cu, 1.0)
        ob = bpy.data.objects.new("yarn_" + hexcol.lstrip("#"), cu)
        if strand == "single" and fpb.get("material", "pile") == "pile":
            ymat = chenille_material("y_" + hexcol, hexcol, fpb)
        else:
            ymat = yarn_material("y_" + hexcol, hexcol, sheen, fibre)
        ob.data.materials.append(ymat)
        bpy.context.collection.objects.link(ob)
        if strand == "single" and fpb.get("pile_density", 0) > 0:
            # `pile_dark_only` (Highland cow, 2026-10-10): the hair-curve pile
            # on the mid/dark yarn only — on cream it reads as grey whiskers
            # (proofs/yarn r6-bunny-chenille), on deep brown as lit pile tips.
            if not fpb.get("pile_dark_only") or depth_weight(hex_to_lin(hexcol)) > 0.75:
                add_pile_hairs(ob, hexcol, fpb)

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
    fibre = data.get("fibre", "cotton")  # yarn-fibre pass: 'cotton'|'wool'|'chenille'|'velvet'|'fine-cotton'
    # Probe-only tuning hook: a scene may override its fibre's knobs (absent from
    # every scene the engine writes, so production renders are unaffected).
    if isinstance(data.get("fibreTune"), dict) and fibre in FIBRE_PARAMS:
        FIBRE_PARAMS[fibre] = dict(FIBRE_PARAMS[fibre], **data["fibreTune"])

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

    # Per-stroke fibre (embroidered faces): a stroke may carry its own
    # `fibre` (blush sewn in a soft wool on a cotton toy); every stroke without
    # one is the scene's fibre, built exactly as before.
    by_fibre = {}
    for st in strokes:
        by_fibre.setdefault(st.get("fibre", fibre), []).append(st)
    for stroke_fibre, fibre_strokes in by_fibre.items():
        build_yarn(fibre_strokes, drape, z_offset, stroke_fibre)

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
    if FIBRE_PARAMS.get(fibre, {}).get("pile_density"):
        try:
            scene.cycles_curves.shape = "RIBBONS"   # pile hairs: cheap camera-facing ribbons
            scene.cycles_curves.subdivisions = 1
        except Exception:
            pass
    aspect = (halfW * 2) / (halfH * 2)
    res_y = int(view.get("resY", 960))
    scene.render.resolution_y = res_y
    scene.render.resolution_x = int(res_y * aspect)
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Base Contrast"
    scene.view_settings.exposure = view.get("exposure", 0.2)  # lower: stop pale wool blowing white
    # a fibre may ease the warm-up grade (chenille: the 1.2 boost tuned for
    # plied cotton pushed brown chenille orange, proofs/yarn r4-r5)
    grade_saturation(scene, view.get("saturation", 1.2) * FIBRE_PARAMS.get(fibre, {}).get("sat_mult", 1.0))  # bring warmth back after AgX desaturates (1.4 oversaturated the crisper, less-felted yarn)
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
# Round 5: the bar frames the toy tight (bunny ~85% of the frame height, cow
# ~75%), so each set has its own zoom; `view.stageZoom` still overrides.
STAGE_ZOOM_BY = {"linen": 1.08, "windowsill": 1.02, "nursery": 0.9, "christmas": 1.02}
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
    v["distScale"] = view.get("distScale", 1.0) * view.get("stageZoom", STAGE_ZOOM_BY.get(stage_of(view), STAGE_ZOOM))
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


def linen_material(name, hexcol, weave=7.0):
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
    bump.inputs["Strength"].default_value = 0.9     # r5: the weave must read at listing size
    bump.inputs["Distance"].default_value = 0.12
    nt.links.new(weave_h, bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    slub_vec = _obj_coords(nt, (0.6, 0.6, 0.6))
    slub = nt.nodes.new("ShaderNodeTexNoise")
    slub.inputs["Scale"].default_value = 2.4      # r6: tighter, stronger slub mottle
    slub.inputs["Detail"].default_value = 5.0
    slub.inputs["Roughness"].default_value = 0.7
    nt.links.new(slub_vec, slub.inputs["Vector"])
    base = _lin(hexcol)
    dark = tuple(c * 0.66 for c in base[:3]) + (1.0,)
    light = tuple(min(1.0, c * 1.08) for c in base[:3]) + (1.0,)
    col = _mix_rgb(nt, slub.outputs["Fac"], dark, light)
    # thread shading: the weave valleys darker (r5: 0.2, was 0.12 — invisible)
    shade = nt.nodes.new("ShaderNodeMix")
    shade.data_type = "RGBA"
    nt.links.new(_math(nt, "SUBTRACT", 0.2, _math(nt, "MULTIPLY", weave_h, 0.2)), shade.inputs["Factor"])
    nt.links.new(col, shade.inputs[6])
    shade.inputs[7].default_value = (0.0, 0.0, 0.0, 1.0)
    col2 = shade.outputs[2]
    nt.links.new(col2, bsdf.inputs["Base Color"])
    return mat


def knit_material(name, hexcol, stitch_cm=1.3, rough=0.92):
    """A chunky stocking-stitch blanket: every stitch a V of two plump leaning
    loops (each leg a rounded lozenge whose top leans outward), deep shadow
    between columns, a fine fibre fuzz and a soft wool sheen."""
    mat = _principled(name, hexcol, rough=rough, sheen=0.7, spec=0.1)
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    sc = 1.0 / stitch_cm
    vec = _obj_coords(nt, (sc, sc * 1.2, sc))
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(vec, sep.inputs["Vector"])
    fu = _math(nt, "FRACT", sep.outputs["X"])
    fv = _math(nt, "FRACT", sep.outputs["Y"])
    dy = _math(nt, "SUBTRACT", fv, 0.5)
    lean = _math(nt, "MULTIPLY", dy, 0.22)

    def leg(centre, sign):
        # dx = fu - centre + sign*lean ; h = 1 - (dx/0.23)^2 - (dy/0.62)^2
        dx = _math(nt, "ADD" if sign > 0 else "SUBTRACT", _math(nt, "SUBTRACT", fu, centre), lean)
        qx = _math(nt, "POWER", _math(nt, "DIVIDE", dx, 0.23), 2.0)
        qy = _math(nt, "POWER", _math(nt, "DIVIDE", dy, 0.62), 2.0)
        return _math(nt, "SUBTRACT", _math(nt, "SUBTRACT", 1.0, qx), qy)

    h = _math(nt, "MAXIMUM", leg(0.27, +1), leg(0.73, -1))
    h = _math(nt, "SQRT", _math(nt, "MAXIMUM", h, 0.0))
    # A finer fibre fuzz on top.
    fz = nt.nodes.new("ShaderNodeTexNoise")
    fz.inputs["Scale"].default_value = 60.0
    fz.inputs["Detail"].default_value = 4.0
    nt.links.new(_obj_coords(nt, (1, 1, 1)), fz.inputs["Vector"])
    h2 = _math(nt, "MULTIPLY_ADD", fz.outputs["Fac"], 0.12)
    nt.links.new(h, h2.node.inputs[2])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 1.0
    bump.inputs["Distance"].default_value = 0.45 * stitch_cm
    nt.links.new(h2, bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    base = _lin(hexcol)
    dark = tuple(c * 0.5 for c in base[:3]) + (1.0,)
    shade = _math(nt, "POWER", h, 0.6)
    nt.links.new(_mix_rgb(nt, shade, dark, base), bsdf.inputs["Base Color"])
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
    xr = x1 if not callable(x1) else x1(0.5 * (y0 + y1))
    ny = max(2, int(n * (y1 - y0) / max(1e-6, xr - x0)))
    grid = []
    for j in range(ny + 1):
        row = []
        y = y0 + (y1 - y0) * j / ny
        xe = x1(y) if callable(x1) else x1     # r6: the right edge may wander with y
        for i in range(nx + 1):
            x = x0 + (xe - x0) * i / nx
            row.append(bm.verts.new((x, y, height(x, y))))
        grid.append(row)
    for j in range(ny):
        for i in range(nx):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    return _bm_object(name, bm, root, mat, smooth=True)


def _smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / max(1e-6, e1 - e0)))
    return t * t * (3 - 2 * t)


def _folds(H, R, amp, lift=0.03, seed=0.0, wl_scale=1.0):
    """Soft cloth wrinkles — rounded ridges and troughs in a few directions —
    that settle to perfectly flat under the piece (radius ~R round the origin),
    so the piece rests on it exactly as it rests on the studio ground: same
    height, same contact. Troughs never go through the table."""
    dirs = [(math.cos(a), math.sin(a)) for a in (0.35 + seed, 1.25 + seed * 0.5, 2.2 - seed * 0.3, 2.9)]
    # wrinkle wavelengths ~0.2-0.45 of the toy's height (2-6 cm on a 13 cm toy)
    wls = (0.30, 0.21, 0.45, 0.16)
    weights = (1.0, 0.6, 0.8, 0.3)

    def h(x, y):
        r = math.hypot(x, y * 1.1)
        m = _smoothstep(R * 1.1, R * 1.1 + 0.8 * H, r)
        if m <= 0.0:
            return lift
        f = 0.0
        # wrinkles bunch up in places and relax in others, as real cloth does
        env = 0.55 + 0.45 * math.sin(x / H * 0.9 + seed) * math.cos(y / H * 0.7 - seed)
        for (dx, dy), wl, w in zip(dirs, wls, weights):
            u = (x * dx + y * dy) / (wl * wl_scale * H) * math.pi + seed * 3.1
            # sharpened crest: a fold, not a sine swell
            c = 1.0 - abs(math.sin(u))
            f += w * (c * c - 0.4)
        # r6: long ROUNDED drapes under the creases (a cloth that was folded and
        # shaken out, wavelength ~1.5-2 H), so the raking key finds broad lit
        # and shaded slopes instead of a field of paper creases
        d1 = math.sin((x * 0.8 + y * 0.6) / (1.6 * H) * math.pi + seed * 2.0)
        d2 = math.sin((x * -0.5 + y * 0.87) / (2.1 * H) * math.pi - seed)
        drape = 0.55 * (d1 * 0.6 + d2 * 0.4 + 0.2 * d1 * d2)
        return max(0.02, lift + amp * H * m * (0.55 * env * f + drape))
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


def _plate(name, root, mat, x, y, z, r, th, seg=40):
    """A thin disc facing the camera (axis along local Y), centred at (x, y, z)."""
    bm = bmesh.new()
    m = Matrix.Translation(Vector((x, y, z))) @ Matrix.Rotation(math.pi / 2, 4, "X")
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r, depth=th, matrix=m)
    return _bm_object(name, bm, root, mat, smooth=True)


def _lathe(name, root, mat, x, y, profile, seg=48):
    """A turned vessel: a (radius, height) profile spun round a vertical axis."""
    bm = bmesh.new()
    rings = []
    for r, z in profile:
        if r <= 1e-6:
            rings.append([bm.verts.new((x, y, z))])
            continue
        rings.append([bm.verts.new((x + r * math.cos(2 * math.pi * k / seg),
                                    y + r * math.sin(2 * math.pi * k / seg), z)) for k in range(seg)])
    for a, b in zip(rings, rings[1:]):
        if len(a) == 1 and len(b) == 1:
            continue
        if len(a) == 1:
            for k in range(seg):
                bm.faces.new((a[0], b[k], b[(k + 1) % seg]))
        elif len(b) == 1:                       # a closed tip (r5: pinecone)
            for k in range(seg):
                bm.faces.new((a[(k + 1) % seg], a[k], b[0]))
        else:
            for k in range(seg):
                bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _bm_object(name, bm, root, mat, smooth=True)


def _star_prism(name, root, mat, x, y, z0, r, depth, tilt=0.0, points=5, bevel=0.0):
    """A chunky wooden star standing on one point-pair, face to the camera.
    `bevel` (r5) rounds every edge — a sanded toy-shop star, not a sharp prism."""
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
    if bevel > 0.0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=3, profile=0.6, affect="EDGES")
    return _bm_object(name, bm, root, mat, smooth=bevel > 0.0)


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
    return _spheres(name, root, bulb_mat, pts, bulb_r, subdiv=3)


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
# Round 5: late-afternoon window light (~3800 K) — the golden raking key every
# bar photo has. The studio key/fill are eased so this one reads as THE light.
GOLD = (1.0, 0.84, 0.64)


def _world(scene, rgb, strength):
    world = scene.world or bpy.data.worlds.new("w")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
    bg.inputs["Strength"].default_value = strength


class _Vis:
    """What the stage camera can see, so set dressing is placed IN frame. Local
    stage frame: +Y away from the camera (depth past the piece), +X to its right.
    `hw(y)` is the visible half-width at depth y; `ztop/zmid(y)` the heights the
    top edge / centre of the frame cross at that depth."""

    def __init__(self, s, elev_deg, lens, asp, tz):
        e = math.radians(elev_deg)
        self.av = math.atan(18.0 / lens)
        self.ah = math.atan(math.tan(self.av) * asp)
        self.e = e
        self.c = s * math.cos(e)
        self.camz = tz + s * math.sin(e)

    def hw(self, y):
        return (self.c + y) * math.tan(self.ah)

    def ztop(self, y):
        return self.camz + (self.c + y) * math.tan(self.av - self.e)

    def zmid(self, y):
        return self.camz - (self.c + y) * math.tan(self.e)

    def y_near(self):
        """Depth where the bottom edge of the frame meets the table."""
        return self.camz / math.tan(self.e + self.av) - self.c


def _hash01(k, salt=0.0):
    v = math.sin(k * 12.9898 + salt * 78.233) * 43758.5453
    return v - math.floor(v)


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
    D = 1.4 * s                                         # back wall distance behind the piece
    asp = view.get("stageAspect", STAGE_ASPECT)
    vis = _Vis(s, 90.0 - view.get("tiltDeg", STAGE_TILT), cam.data.lens, asp, tgt.location.z)

    # The studio sweep goes; its lights are kept (they model the toy exactly as
    # the signed-off studio hero does) but warmed and eased, and the set gets its
    # own light on top.
    for ob in ctx.get("remove", []):
        if ob is not None:
            bpy.data.objects.remove(ob, do_unlink=True)
    for lt in ctx.get("lights", []):
        lt.data.color = WARM_SOFT
        lt.data.energy *= view.get("stageKeyMult", STAGE_KEY_MULT.get(stage, 0.9))

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
    room_mult = view.get("stageRoomLight", 1.0)

    def room_light(loc, aim, mult, size, color=WARM):
        # energy scales with distance^2 relative to the studio key (~1.3 span away)
        d = (Vector(loc) - Vector(aim)).length
        e = key_e * mult * room_mult * (d / (1.3 * ctx["span"])) ** 2
        return _area("stage_light", None, to_world(loc), to_world(aim), e, size, color)

    k = dict(root=root, H=H, R=R, s=s, D=D, vis=vis, light=room_light)
    if stage == "windowsill":
        _stage_windowsill(**k)
        _world(scene, (0.98, 0.93, 0.86), 0.45)
    elif stage == "linen":
        _stage_linen(**k)
        _world(scene, (0.98, 0.93, 0.86), 0.45)
    elif stage == "nursery":
        _stage_nursery(**k)
        _world(scene, (0.99, 0.93, 0.90), 0.45)
    elif stage == "christmas":
        _stage_christmas(**k)
        _world(scene, (0.95, 0.82, 0.66), 0.25)

    # Camera: a real shallow depth of field, focused on the piece.
    cd = cam.data
    cd.dof.use_dof = True
    cd.dof.focus_object = None
    cd.dof.focus_distance = s
    cd.dof.aperture_fstop = view.get("stageFstop", STAGE_FSTOP)
    cd.dof.aperture_blades = 0          # round bokeh
    cd.dof.aperture_rotation = 0.3
    cd.clip_end = max(cd.clip_end, D * 6)
    # Square (or `stageAspect`) frame round the same vertical field of view: the
    # piece keeps its size in frame, the set opens out either side.
    ry = scene.render.resolution_y
    scene.render.resolution_x = int(round(ry * asp))
    cd.sensor_fit = "VERTICAL"
    cd.sensor_height = 36.0
    scene.view_settings.exposure = view.get(
        "stageExposure", scene.view_settings.exposure + STAGE_EXPOSURE_LIFT.get(stage, 0.0))
    # Round 5: a touch more contrast and a warm golden grade (lifted warm
    # highlights, slightly cool-neutral shadows) over the AgX base look.
    scene.view_settings.look = view.get("stageLook", "AgX - Medium High Contrast")
    grade_golden(scene, view.get("stageWarmth", STAGE_WARMTH.get(stage, 0.65)))
    print("[stage]", stage, "s=%.1f D=%.1f H=%.1f R=%.1f fstop=%.3f hw0=%.1f ynear=%.1f" % (
        s, D, H, R, cd.dof.aperture_fstop, vis.hw(0), vis.y_near()))


# High-key, airy listing photos: lift the exposure a touch over the studio grade
# (the set is darker than a blown-out white sweep). Christmas stays moodier so
# the fairy-light bokeh glows.
STAGE_EXPOSURE_LIFT = {"linen": 0.15, "windowsill": 0.1, "nursery": 0.2, "christmas": 0.0}
# Round 5: ease the flat studio key+fill so the set's own warm window key rakes
# across the piece (contrast, a lit side and a soft side) instead of an even wash.
STAGE_KEY_MULT = {"linen": 0.7, "windowsill": 0.6, "nursery": 0.75, "christmas": 0.65}
# r6: how golden the grade is (1 = r5's full gold, which read as a yellow filter
# on the windowsill and fought the blush/lavender nursery palette).
STAGE_WARMTH = {"linen": 0.65, "windowsill": 0.6, "nursery": 0.3, "christmas": 0.75}


def _ground(root, mat, s, D, z=0.0):
    return _box("stage_ground", root, mat, -3 * s, 3 * s, -3 * s, D + 2, z - 2.0, z)


def _throw(name, root, mat, vis, H, R, D, amp, back=0.45, lift=0.04, seed=0.0, heap=None, wl_scale=1.0,
           right=None, hem=0.0):
    """A cloth that fills the whole bottom of the frame and runs back into the
    room, flat under the piece, folding everywhere else. `right` (a fraction of
    the visible half-width at the piece) ends the cloth short of the frame on
    the right so the table shows, and `hem` (a radius, toy units) rolls a
    stitched hem along that edge — a napkin, not an infinite sheet."""
    y0 = min(vis.y_near() - 4.0, -R * 2)
    y1 = back * D
    x1 = vis.hw(y1) * 1.15
    xr = x1 if right is None else right * vis.hw(0)
    f = _folds(H, R, amp, lift=lift, seed=seed, wl_scale=wl_scale)
    if heap:
        def h(x, y):
            return f(x, y) + heap(x, y)
    else:
        h = f
    n = int(min(320, max(120, (x1 + xr) / (0.025 * H))))

    def edge(y):
        # the hem wanders (r6: a slack edge, never a ruled line)
        return xr + 0.06 * H * math.sin(y / H * 0.9 + seed) + 0.02 * H * math.sin(y / H * 2.7)
    ob = _cloth(name, root, mat, -x1, edge if right is not None else xr, y0, y1, n, h)
    if right is not None and hem > 0.0:
        pts = []
        m = 80
        for j in range(m + 1):
            y = y0 + (y1 - y0) * j / m
            x = edge(y) - hem * 0.3
            pts.append((x, y, h(x, y) + hem * 0.6))
        _curve(name + "_hem", root, mat, pts, hem)
    return ob


def _stage_windowsill(root, H, R, s, D, vis, light):
    wood = wood_material("sill_wood", "#c9a27a", "#94694a")
    _ground(root, wood, s, D)
    # Back wall with a multi-pane window filling the left two thirds.
    plaster = plaster_material("wall", "#ebe2d4")
    hwD = vis.hw(D)
    W = 2.5 * hwD
    wx0, wx1 = -1.05 * hwD, 0.42 * hwD
    ledge_h = 0.22 * H
    wz0, wz1 = ledge_h, vis.ztop(D) + 0.6 * H
    t = 3.0
    _box("wall_l", root, plaster, -W, wx0, D, D + t, 0, wz1 + 30)
    _box("wall_r", root, plaster, wx1, W, D, D + t, 0, wz1 + 30)
    _box("wall_b", root, plaster, wx0, wx1, D, D + t, 0, wz0)
    _box("wall_t", root, plaster, wx0, wx1, D, D + t, wz1, wz1 + 30)
    # r5: a weathered painted-pine frame (grain showing through chalky paint)
    frame = wood_material("window_frame", "#e4dac8", "#b9a888", along_x=False, rough=0.75)
    fb = 0.9                                            # 9 mm glazing bars at toy scale
    fy0, fy1 = D + 0.5 * t, D + 0.5 * t + 1.2
    _box("wf_bot", root, frame, wx0, wx1, fy0, fy1, wz0, wz0 + fb * 1.6)
    _box("wf_l", root, frame, wx0, wx0 + fb * 1.4, fy0, fy1, wz0, wz1)
    _box("wf_r", root, frame, wx1 - fb * 1.4, wx1, fy0, fy1, wz0, wz1)
    for i in (1, 2):
        mx = wx0 + (wx1 - wx0) * i / 3.0
        _box("wf_mull%d" % i, root, frame, mx - fb * 0.5, mx + fb * 0.5, fy0, fy1, wz0, wz1)
    for zf in (0.45, 0.9):
        mz = wz0 + (vis.ztop(D) - wz0) * zf
        _box("wf_tran%.0f" % (zf * 10), root, frame, wx0, wx1, fy0, fy1, mz - fb * 0.5, mz + fb * 0.5)
    # The deep painted sill ledge the window sits on.
    _box("ledge", root, frame, -W, W, D - 0.12 * s, D + 0.5 * t, 0, ledge_h)
    # The soft bright garden beyond the glass.
    out = outside_material("outside", 2.4)
    oy = D + 0.9 * s
    ob = _box("outside", root, out, -2.0 * vis.hw(oy), 2.0 * vis.hw(oy), oy, oy + 1, -2, vis.ztop(oy) + 5)
    ob.visible_shadow = False
    # A rumpled oatmeal linen under the piece, filling the foreground.
    lin = linen_material("napkin", "#d6c9b2")
    # r5: a napkin, not a sheet — deeper folds, ends right of the piece with a
    # rolled hem so the oak sill shows beside it (the cow bar)
    _throw("napkin", root, lin, vis, H, R, D, 0.1, back=0.32, seed=0.4, wl_scale=1.3, right=0.78, hem=0.03 * H)
    # Out of focus on the sill, back right: a cream jug and a stack of books.
    glaze = _principled("jug", "#eee6d8", rough=0.3, spec=0.5, coat=0.3)
    jy = 0.55 * D
    jx = 0.62 * vis.hw(jy)
    _lathe("jug", root, glaze, jx, jy, [(r * H, z * H) for r, z in (
        (0.0, 0.0), (0.26, 0.0), (0.30, 0.04), (0.34, 0.22), (0.34, 0.42), (0.29, 0.62),
        (0.21, 0.78), (0.21, 0.86), (0.26, 0.96), (0.24, 0.97), (0.19, 0.87), (0.19, 0.79))])
    hx = jx + 0.3 * H
    _curve("jug_handle", root, glaze, [(jx + 0.2 * H, jy, 0.78 * H), (hx + 0.08 * H, jy, 0.74 * H),
                                       (hx + 0.12 * H, jy, 0.55 * H), (hx + 0.06 * H, jy, 0.36 * H),
                                       (jx + 0.3 * H, jy, 0.28 * H)], 0.04 * H)
    by = 0.78 * D
    bx = 0.95 * vis.hw(by)
    z0 = 0.0
    for kk, (col, th) in enumerate((("#8f9c80", 0.18), ("#e1d3b6", 0.13), ("#80604a", 0.16))):
        _box("book%d" % kk, root, _principled("book%d" % kk, col, rough=0.7),
             bx - 0.6 * H + kk * 0.06 * H, bx + 0.6 * H, by - 0.42 * H, by + 0.42 * H, z0, z0 + th * H)
        z0 += th * H
    # A dried lavender, daisy and wheat bunch lying on the cloth, left.
    _dried_bunch(root, H, R, vis)
    # Window daylight: broad, warm, from behind-left through the glass (the soft
    # rim on the fur), a gentle room bounce from the front right.
    # r5: the window is THE light — a strong golden key raking from behind-left
    # (lit cheek, soft far side, a warm rim on the fur), the front bounce eased.
    light((wx0 * 0.6, D - 3, wz0 + 0.55 * (wz1 - wz0)), (0, 0, 0.45 * H), 2.0, 0.6 * s, GOLD)
    light((0.6 * s, -0.25 * s, 0.8 * s), (0.0, 0.5 * D, 0.2 * s), 0.35, 1.2 * s, WARM_SOFT)


def _dried_bunch(root, H, R, vis):
    """A full dried armful (r5: ~56 stems, was 18) lying on the cloth left of
    the piece: lavender spikes, daisies, wheat ears and a haze of gypsophila,
    bound with a twine wrap, heads splaying away to the back left into the blur."""
    stem = _principled("stem", "#8e8a5e", rough=0.8)
    lav = _principled("lavender", "#8a73a6", rough=0.85, sheen=0.3)
    lav2 = _principled("lavender2", "#6e5a8e", rough=0.85, sheen=0.3)
    daisy = _principled("daisy", "#f4f0e6", rough=0.8)
    eye = _principled("daisy_eye", "#d8a238", rough=0.8)
    grass = _principled("wheat", "#dccb9e", rough=0.85)
    gyp = _principled("gyp", "#f6f1e8", rough=0.9)
    # r6: the bundle lies across the front-left of the frame like the cow bar's:
    # tied back-left (just inside the frame), the heads fanning forward and
    # right to rest beside the piece's feet, in focus; the stems' cut ends run
    # away out of frame.
    # r6b: the bundle must lie BESIDE the piece, never across its feet: tied out
    # past the left edge, the heads reach the piece's near-left corner and stop.
    tx, ty = -(0.9 * vis.hw(0) + 0.1 * H), 0.1 * H
    a0 = math.radians(-50)                          # 0 = +x; -50 deg = forward-right
    ax, ay = math.cos(a0), math.sin(a0)
    px, py = -ay, ax                                # across the bundle
    lav_pts, lav2_pts, dai_pts, eye_pts, gr_pts, gyp_pts = [], [], [], [], [], []
    N = 56
    for kk in range(N):
        lane = (kk - (N - 1) / 2) / ((N - 1) / 2)   # -1..1 across the bundle
        lane = lane * (0.7 + 0.3 * _hash01(kk, 5))
        L = (0.36 + 0.26 * _hash01(kk, 1)) * H
        spread = 0.04 * H + 0.2 * H * abs(lane)
        zb = 0.22 + 0.06 * H * _hash01(kk, 6)      # stems pile up on each other
        base = (tx - ax * 0.9 * H + px * lane * 0.07 * H, ty - ay * 0.9 * H + py * lane * 0.07 * H, zb)
        tip = (tx + ax * L + px * lane * spread * 2.2, ty + ay * L + py * lane * spread * 2.2,
               zb + (0.02 + 0.14 * _hash01(kk, 2)) * H)
        mid = (tx + ax * L * 0.4 + px * lane * spread * 0.6, ty + ay * L * 0.4 + py * lane * spread * 0.6,
               zb + 0.05 * H)
        _curve("stem%d" % kk, root, stem, [base, (tx + px * lane * 0.04 * H, ty + py * lane * 0.04 * H, zb + 0.03 * H), mid, tip], 0.006 * H)
        kind = (kk * 7) % 5                         # 0,1 lavender; 2 daisy; 3 wheat; 4 gypsophila
        dx, dy = (tip[0] - mid[0]), (tip[1] - mid[1])
        n = math.hypot(dx, dy) or 1.0
        dx, dy = dx / n, dy / n
        for j in range(16):
            t = 0.55 + 0.45 * j / 15
            p = (mid[0] + (tip[0] - mid[0]) * (t - 0.4) / 0.6, mid[1] + (tip[1] - mid[1]) * (t - 0.4) / 0.6,
                 mid[2] + (tip[2] - mid[2]) * (t - 0.4) / 0.6 + 0.02 * H)
            if kind in (0, 1) and j > 5:
                # a lavender spike: whorls of florets packed round the stem
                for q in range(3):
                    ang = j * 1.9 + q * 2.1
                    off = 0.016 * H
                    (lav_pts if (kk + q) % 2 else lav2_pts).append(
                        (p[0] - dy * off * math.cos(ang), p[1] + dx * off * math.cos(ang),
                         p[2] + off * math.sin(ang), (0.012 + 0.005 * (q % 2)) * H))
            elif kind == 2 and j == 15:
                dai_pts.append((p[0], p[1], p[2], (0.038 + 0.014 * _hash01(kk, 3)) * H))
                eye_pts.append((p[0], p[1], p[2] + 0.02 * H, 0.016 * H))
            elif kind == 3 and j > 8:
                off = 0.016 * H * (1 if j % 2 else -1)
                gr_pts.append((p[0] - dy * off, p[1] + dx * off, p[2], 0.02 * H))
            elif kind == 4 and j > 7 and j % 2:
                for q in range(4):
                    ang = q * 1.57 + j
                    gyp_pts.append((p[0] + 0.05 * H * math.cos(ang) - dy * 0.03 * H * math.sin(ang),
                                    p[1] + 0.05 * H * math.sin(ang) + dx * 0.03 * H * math.sin(ang),
                                    p[2] + 0.03 * H * math.cos(ang * 0.7), 0.012 * H))
    _spheres("lavender", root, lav, lav_pts, 0.02 * H, subdiv=1)
    _spheres("lavender2", root, lav2, lav2_pts, 0.02 * H, subdiv=1)
    d = _spheres("daisies", root, daisy, dai_pts, 0.05 * H, subdiv=2)
    d.scale = (1.0, 1.0, 0.35)                          # flat-faced daisy heads
    d.location = (0.0, 0.0, 0.13 * H)
    _spheres("daisy_eyes", root, eye, eye_pts, 0.02 * H, subdiv=1)
    _spheres("wheat", root, grass, gr_pts, 0.02 * H, subdiv=1)
    _spheres("gyp", root, gyp, gyp_pts, 0.012 * H, subdiv=1)
    # the twine wrap: four turns round the bundle's waist, a short loose end
    twine = _principled("twine", "#b59a6a", rough=0.9)
    rb = 0.09 * H
    pts = []
    for i in range(41):
        t = i / 40.0
        ang = t * 4 * 2 * math.pi
        along = (t - 0.5) * 0.12 * H
        pts.append((tx + ax * along + px * rb * math.cos(ang), ty + ay * along + py * rb * math.cos(ang),
                    0.22 + 0.05 * H + rb * 0.8 * math.sin(ang)))
    pts.append((pts[-1][0] - 0.12 * H, pts[-1][1] - 0.1 * H, 0.23))
    pts.append((pts[-1][0] - 0.1 * H, pts[-1][1] - 0.16 * H, 0.23))
    _curve("tie", root, twine, pts, 0.012 * H)


def _stage_linen(root, H, R, s, D, vis, light):
    _ground(root, wood_material("table_wood", "#b99470", "#7f5b3e"), s, D)
    lin = linen_material("throw", "#d8ccb6")

    def heap(x, y):
        # a soft heap of the same throw rising behind the piece
        return (0.55 * H * math.exp(-((y - 0.26 * s) / (0.10 * s)) ** 2)
                * (0.7 + 0.3 * math.sin(x / H * 1.7 + 0.6)) * _smoothstep(0.12 * s, 0.2 * s, y + 0.06 * s))
    _throw("throw", root, lin, vis, H, R, D, 0.07, back=0.5, seed=1.1, heap=heap, wl_scale=2.0)
    plaster = plaster_material("wall", "#eee6d8")
    _box("wall", root, plaster, -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    # A stoneware vase with dried pampas, out of focus back left.
    glaze = _principled("vase", "#cdbfa9", rough=0.6, spec=0.3)
    vy = 0.62 * D
    vx = -0.62 * vis.hw(vy)
    _cyl("vase", root, glaze, vx, vy, 0.0, 0.32 * H, 0.2 * H, 1.2 * H)
    plume = _principled("pampas", "#e9dcc2", rough=0.95, sheen=0.8)
    stem = _principled("pstem", "#b49a6c", rough=0.8)
    pts = []
    for kk in range(7):
        a = math.radians(-32 + kk * 10.5)
        top = (vx + math.sin(a) * 1.0 * H, vy + 0.15 * H * math.cos(kk), 1.2 * H + math.cos(a) * 1.7 * H)
        _curve("pst%d" % kk, root, stem, [(vx, vy, 1.1 * H), top], 0.014 * H)
        for j in range(12):
            t = j / 11.0
            pts.append((top[0] + math.sin(a) * 0.6 * H * t, top[1], top[2] + math.cos(a) * 0.6 * H * t,
                        (0.10 + 0.07 * math.sin(math.pi * t)) * H))
    _spheres("pampas", root, plume, pts, 0.1 * H, subdiv=2)
    # Window light from the left, light washing the wall.
    light((-1.2 * s, 0.1 * s, 0.8 * s), (0, 0, 0.4 * H), 1.6, 0.7 * s, GOLD)
    light((0.3 * s, 0.35 * D, 1.2 * s), (0.0, D, 0.25 * s), 0.9, 1.6 * s, WARM_SOFT)


def _stage_nursery(root, H, R, s, D, vis, light):
    knit = knit_material("blanket", "#f2eadc", stitch_cm=1.7, rough=0.97)
    _ground(root, _principled("dresser", "#efe7dc", rough=0.6), s, D)
    _throw("blanket", root, knit, vis, H, R, D, 0.04, back=0.42, seed=2.2)
    plaster = plaster_material("wall", "#f2ddd3")
    _box("wall", root, plaster, -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    oak = wood_material("oak", "#dcbb90", "#b58e62", along_x=False)
    # A picture frame stood against the wall, back left.
    fy = 0.62 * D
    fx = -0.6 * vis.hw(fy)
    fw, fb = 0.72 * vis.hw(fy), 0.07 * vis.hw(fy)
    fh = 1.25 * fw
    _box("frame_l", root, oak, fx - fw / 2, fx - fw / 2 + fb, fy, fy + fb, 0.0, fh)
    _box("frame_r", root, oak, fx + fw / 2 - fb, fx + fw / 2, fy, fy + fb, 0.0, fh)
    _box("frame_b", root, oak, fx - fw / 2, fx + fw / 2, fy, fy + fb, 0.0, fb)
    _box("frame_t", root, oak, fx - fw / 2, fx + fw / 2, fy, fy + fb, fh - fb, fh)
    _box("frame_card", root, _principled("card", "#f7f2ea", rough=0.9),
         fx - fw / 2 + fb, fx + fw / 2 - fb, fy + fb * 0.5, fy + fb * 0.7, fb, fh - fb)
    # r5: a soft printed nursery motif on the card — a dusty-pink moon and a
    # scatter of little stars (flat, a hair proud of the card, so they read as
    # print through the blur), and a heart below.
    ink = _principled("ink", "#d4a8a2", rough=0.95)
    cy_ = fy + fb * 0.48
    _plate("moon", root, ink, fx + 0.1 * fw, cy_, 0.56 * fh, 0.17 * fw, fb * 0.05)
    _plate("moon_bite", root, _principled("card2", "#f7f2ea", rough=0.9), fx + 0.17 * fw, cy_ - fb * 0.012,
           0.6 * fh, 0.14 * fw, fb * 0.05)
    for i, (sx_, sz_, sr_) in enumerate(((-0.25, 0.72, 0.05), (-0.3, 0.5, 0.035), (-0.12, 0.82, 0.03), (0.28, 0.8, 0.04))):
        _star_prism("cstar%d" % i, root, ink, fx + sx_ * fw, cy_, sz_ * fh - 0.55 * sr_ * fw, sr_ * fw, fb * 0.05)
    _spheres("heart", root, ink,
             [(fx - 0.06 * fw, fy + fb * 0.45, 0.3 * fh, 0.07 * fw),
              (fx + 0.06 * fw, fy + fb * 0.45, 0.3 * fh, 0.07 * fw),
              (fx, fy + fb * 0.45, 0.24 * fh, 0.065 * fw)], 0.06 * fw)
    # A chunky sanded wooden star in front of it.
    sy = 0.34 * D
    _star_prism("star", root, oak, -0.55 * vis.hw(sy), sy, 0.0, 0.6 * H, 0.25 * H, bevel=0.035 * H)
    # A white lantern glowing, back right, with little warm star lights inside.
    ly = 0.55 * D
    lx = 0.62 * vis.hw(ly)
    lw, lh = 0.95 * H, 1.6 * H
    white = _principled("lantern", "#ded6cc", rough=0.5, spec=0.35)   # r6: warm grey so it reads against the wall
    p = 0.09 * H
    for i, (ox, oy) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1))):
        _box("lp%d" % i, root, white, lx + ox * lw / 2 - p, lx + ox * lw / 2 + p,
             ly + oy * lw / 2 - p, ly + oy * lw / 2 + p, 0.0, lh)
    _box("lbase", root, white, lx - lw / 2 - p, lx + lw / 2 + p, ly - lw / 2 - p, ly + lw / 2 + p, 0, 0.1 * H)
    _box("ltop", root, white, lx - lw / 2 - p, lx + lw / 2 + p, ly - lw / 2 - p, ly + lw / 2 + p, lh, lh + 0.08 * H)
    _cyl("lroof", root, white, lx, ly, lh + 0.08 * H, 0.75 * lw, 0.06 * lw, 0.45 * H, seg=4)
    glow = _emit_mat("lglow", (1.0, 0.74, 0.45), 30.0)
    # r5: frosted panes with star cut-outs glowing through (the bunny bar's
    # lantern) — the pane is a translucent sheet, the stars thin emissive plates.
    pane = _principled("pane", "#fbf8f2", rough=0.7)
    pane.node_tree.nodes["Principled BSDF"].inputs["Transmission Weight"].default_value = 0.35
    pane.node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = 0.85
    for side, (ox, oy) in (("f", (0, -1)), ("l", (-1, 0)), ("r", (1, 0))):
        pz0, pz1 = 0.12 * H, lh - 0.02 * H
        if oy:
            _box("pane_" + side, root, pane, lx - lw / 2 + p, lx + lw / 2 - p, ly + oy * lw / 2 - 0.01 * H,
                 ly + oy * lw / 2 + 0.01 * H, pz0, pz1)
        else:
            _box("pane_" + side, root, pane, lx + ox * lw / 2 - 0.01 * H, lx + ox * lw / 2 + 0.01 * H,
                 ly - lw / 2 + p, ly + lw / 2 - p, pz0, pz1)
    cut = _emit_mat("cut", (1.0, 0.8, 0.5), 12.0)
    for i, (sx_, sz_, sr_) in enumerate(((0.0, 0.62, 0.17), (-0.26, 0.36, 0.1), (0.25, 0.3, 0.09), (0.22, 0.8, 0.08))):
        _star_prism("lstar%d" % i, root, cut, lx + sx_ * lw, ly - lw / 2 - 0.02 * H, sz_ * lh - 0.55 * sr_ * lw,
                    sr_ * lw, 0.02 * H)
    _spheres("lbulbs", root, glow, [(lx + 0.25 * lw * (_hash01(kk, 3) - 0.5), ly + 0.25 * lw * (_hash01(kk, 4) - 0.5),
                                     0.2 * lh + 0.6 * lh * _hash01(kk, 5)) for kk in range(9)], 0.05 * H, subdiv=3)
    light((lx, ly, 0.5 * lh), (lx, ly - 5, 0.0), 0.04, 0.5 * lw, (1.0, 0.72, 0.42))
    # A lilac knit blanket heaped up on the right.
    lilac = knit_material("lilac", "#b8a2cb", stitch_cm=1.6)
    hx0 = max(R * 1.45, 0.5 * vis.hw(0))

    wr = _folds(H, 0.0, 0.05, lift=0.0, seed=3.3)

    def lheap(x, y):
        u = (x - hx0) / (0.6 * vis.hw(0))
        return wr(x, y) + 0.03 + max(0.0, 0.5 * H * _smoothstep(0.0, 0.5, u) * math.exp(-((y - 0.1 * s) / (0.3 * s)) ** 2)
                          * (0.8 + 0.2 * math.sin(y / H * 2.3))) * _smoothstep(-0.15 * s, 0.0, y)   # r6: fades at its near edge
    _cloth("lilac", root, lilac, hx0, 1.4 * vis.hw(0.3 * D), -0.15 * s, 0.4 * D, 120, lheap)
    # r5: a golden window key from the left, the wall wash eased
    # r6: a soft warm daylight key (not gold: the bar nursery is blush and lavender)
    light((-1.2 * s, 0.0, 0.9 * s), (0, 0, 0.4 * H), 1.4, 0.8 * s, WARM_SOFT)
    light((0.0, 0.4 * D, 1.2 * s), (0.0, D, 0.25 * s), 1.0, 1.6 * s, (1.0, 0.96, 0.94))


def _stage_christmas(root, H, R, s, D, vis, light):
    knit = knit_material("throw", "#f3e9d6", stitch_cm=1.8)   # r5: warmer cream
    _ground(root, wood_material("table", "#8f6a4a", "#5d4130"), s, D)
    _throw("throw", root, knit, vis, H, R, D, 0.045, back=0.4, seed=0.9)
    plaster = plaster_material("wall", "#d6bc98", mottle=0.08)
    _box("wall", root, plaster, -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    needle = _principled("needle", "#294a2f", rough=0.6, spec=0.3)
    twig = _principled("twig", "#5a4030", rough=0.9)
    berry = _principled("berry", "#ad1c22", rough=0.18, spec=0.5, coat=0.5)
    wire = _principled("wire", "#3a2c20", rough=0.6)
    bulb = _emit_mat("bulb", (1.0, 0.72, 0.38), 45.0)
    nl = 0.3 * H
    # Pine sprigs framing both sides: one at mid depth each side, one reaching
    # across the near foreground (soft, out of focus), a bough across the back.
    y1 = 0.22 * s
    _pine_sprig("pine_l", root, needle, twig, (-1.25 * vis.hw(y1), y1, 1.25 * H), (-0.55 * vis.hw(y1), y1 - 2, 0.85 * H), 0.15 * H, nl)
    _pine_sprig("pine_r", root, needle, twig, (1.25 * vis.hw(y1), y1, 1.45 * H), (0.58 * vis.hw(y1), y1 - 2, 1.0 * H), 0.2 * H, nl)
    yf = -0.18 * s
    _pine_sprig("pine_f", root, needle, twig, (-1.3 * vis.hw(yf), yf, 0.2 * H), (-0.62 * vis.hw(yf), yf + 1, 0.15 * H), 0.04 * H, nl)
    _pine_sprig("pine_f2", root, needle, twig, (1.3 * vis.hw(yf), yf, 0.2 * H), (0.7 * vis.hw(yf), yf - 1, 0.12 * H), 0.04 * H, nl)
    yb = 0.6 * D
    zb = vis.ztop(yb) - 0.35 * H
    _pine_sprig("pine_back", root, needle, twig, (-1.3 * vis.hw(yb), yb, zb + 0.2 * H),
                (1.3 * vis.hw(yb), yb, zb), 0.5 * H, 0.45 * H, density=18)
    bpts = []
    ends = ((-0.58 * vis.hw(y1), y1 - 2, 0.82 * H), (0.6 * vis.hw(y1), y1 - 2, 0.98 * H),
            (-0.66 * vis.hw(yf), yf + 1, 0.16 * H), (0.74 * vis.hw(yf), yf - 1, 0.14 * H))
    for kk, (bx, by, bz) in enumerate(ends):
        for j in range(6):
            a = j * 1.05 + kk
            bpts.append((bx + 0.11 * H * math.cos(a), by + 0.08 * H * math.sin(a), bz + 0.06 * H * (j % 2) - 0.05 * H,
                         (0.07 + 0.015 * _hash01(j, kk)) * H))
    _spheres("berries", root, berry, bpts, 0.07 * H)
    # Fairy lights: a scatter of warm bulbs at different depths on the back wall
    # and the bough (deep bokeh), and a string through each side sprig.
    # r5 mid-ground: a candle lantern glowing back-left, a pinecone front-left.
    _candle_lantern(root, 0.72 * H, -0.95 * vis.hw(0.6 * D), 0.6 * D, light)
    _pinecone(root, 0.62 * H, -1.0 * vis.hw(-0.16 * s), -0.16 * s)
    pts = []
    for kk in range(110):
        # two depth bands (r5): a far scatter on the wall and a nearer band
        # round the bough, so the bokeh discs come in two sizes
        y = D - 1.0 - (0.45 * D) * _hash01(kk, 7) ** 2 if kk % 3 else 0.55 * D + 0.1 * D * _hash01(kk, 7)
        z = vis.zmid(y) + (vis.ztop(y) - vis.zmid(y) + 0.3 * H) * _hash01(kk, 8)
        if z < 0.5:
            continue
        x = (2 * _hash01(kk, 9) - 1) * 1.15 * vis.hw(y)
        pts.append((x, y, z, (0.06 + 0.04 * _hash01(kk, 10)) * H))
    _spheres("fairy_bg", root, bulb, pts, 0.07 * H, subdiv=3)
    _fairy_string("fl_l", root, wire, bulb, (-1.25 * vis.hw(y1), y1 + 0.5, 1.35 * H), (-0.55 * vis.hw(y1), y1 - 1.5, 0.95 * H), 0.12 * H, 6, 0.04 * H)
    _fairy_string("fl_r", root, wire, bulb, (1.25 * vis.hw(y1), y1 + 0.5, 1.55 * H), (0.58 * vis.hw(y1), y1 - 1.5, 1.1 * H), 0.12 * H, 6, 0.04 * H)
    _fairy_string("fl_back", root, wire, bulb, (-1.3 * vis.hw(yb), yb - 1, zb + 0.15 * H),
                  (1.3 * vis.hw(yb), yb - 1, zb - 0.05 * H), 0.45 * H, 24, 0.06 * H)
    light((-1.2 * s, 0.0, 0.9 * s), (0, 0, 0.4 * H), 1.3, 0.7 * s, GOLD)
    light((0.0, 0.4 * D, 1.2 * s), (0.0, D, 0.25 * s), 0.45, 1.6 * s, (1.0, 0.82, 0.6))


def _candle_lantern(root, H, x, y, light):
    """A black-iron candle lantern (four posts, a pitched top, a ring) with a
    cream pillar candle and a warm flame inside — the glow in the trees bar."""
    iron = _principled("iron", "#2a2522", rough=0.45, spec=0.5)
    wax = _principled("wax", "#f1e7d2", rough=0.5, spec=0.2)
    wax.node_tree.nodes["Principled BSDF"].inputs["Subsurface Weight"].default_value = 0.3
    w, h = 0.8 * H, 1.5 * H
    p = 0.035 * H
    for i, (ox, oy) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1))):
        _box("cl_post%d" % i, root, iron, x + ox * w / 2 - p, x + ox * w / 2 + p, y + oy * w / 2 - p, y + oy * w / 2 + p, 0.0, h)
    _box("cl_base", root, iron, x - w / 2 - p, x + w / 2 + p, y - w / 2 - p, y + w / 2 + p, 0, 0.06 * H)
    _box("cl_top", root, iron, x - w / 2 - p, x + w / 2 + p, y - w / 2 - p, y + w / 2 + p, h, h + 0.05 * H)
    _cyl("cl_roof", root, iron, x, y, h + 0.05 * H, 0.72 * w, 0.05 * w, 0.4 * H, seg=4)
    ring = [(x + 0.12 * H * math.cos(a * math.pi / 8), y, h + 0.55 * H + 0.12 * H * math.sin(a * math.pi / 8)) for a in range(17)]
    _curve("cl_ring", root, iron, ring, 0.02 * H)
    _cyl("candle", root, wax, x, y, 0.06 * H, 0.22 * H, 0.22 * H, 0.55 * H)
    flame = _emit_mat("flame", (1.0, 0.62, 0.22), 120.0)
    bm = bmesh.new()
    m = Matrix.Translation(Vector((x, y, 0.72 * H))) @ Matrix.Diagonal((1.0, 1.0, 2.2, 1.0))
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=0.05 * H, matrix=m)
    _bm_object("flame", bm, root, flame, smooth=True)
    light((x, y, 0.75 * H), (x, y - 5, 0.1 * H), 0.16, 0.3 * H, (1.0, 0.66, 0.3))


def _pinecone(root, H, x, y):
    """A pinecone lying on its side: a lathe body under spiralling scale plates
    (phyllotaxis), the near scales catching the light."""
    body = _principled("cone_body", "#4a3222", rough=0.9)
    scale = _principled("cone_scale", "#7a5a3c", rough=0.8, spec=0.2)
    L, r = 0.55 * H, 0.17 * H
    root2 = bpy.data.objects.new("pinecone", None)
    bpy.context.scene.collection.objects.link(root2)
    root2.parent = root
    root2.location = (x, y, r * 0.9)
    root2.rotation_euler = (0.0, math.radians(82), math.radians(35))
    prof = [(0.0, 0.0), (0.55 * r, 0.03 * L), (0.95 * r, 0.3 * L), (0.9 * r, 0.6 * L), (0.55 * r, 0.88 * L), (0.0, L)]
    _lathe("cone_core", root2, body, 0.0, 0.0, [(rr * 0.85, zz) for rr, zz in prof], seg=24)
    bm = bmesh.new()
    n = 70
    for k in range(n):
        t = (k + 0.5) / n
        z = t * L
        rr = r * (0.55 + 0.45 * math.sin(math.pi * min(1.0, t * 1.15))) * (1.0 if t < 0.85 else 0.9 - (t - 0.85) * 3)
        ang = k * 2.399963
        c, sn = math.cos(ang), math.sin(ang)
        base = Vector((rr * 0.8 * c, rr * 0.8 * sn, z))
        out = Vector((c, sn, 0.0))
        up = Vector((0, 0, 1))
        tip = base + out * rr * 0.55 + up * rr * 0.35
        side = Vector((-sn, c, 0)) * rr * 0.28
        v = [bm.verts.new(base - side), bm.verts.new(base + side), bm.verts.new(tip + side * 0.5), bm.verts.new(tip - side * 0.5)]
        bm.faces.new(v)
        # a little thickness so the scale edge catches light
        v2 = [bm.verts.new(base - side + up * 0.02 * H), bm.verts.new(base + side + up * 0.02 * H),
              bm.verts.new(tip + side * 0.5 + up * 0.02 * H), bm.verts.new(tip - side * 0.5 + up * 0.02 * H)]
        bm.faces.new(list(reversed(v2)))
    _bm_object("cone_scales", bm, root2, scale, smooth=False)


def grade_golden(scene, warmth=1.0):
    """Stage-only colour balance after the saturation grade: warm gain (golden
    highlights), a faint warm gamma, shadows left neutral so the grade reads as
    light, not a yellow filter."""
    nt = getattr(scene, "node_tree", None)
    if warmth <= 0.0 or nt is None:
        return
    comp = nt.nodes.get("Composite")
    if not comp or not comp.inputs["Image"].links:
        return
    src = comp.inputs["Image"].links[0].from_socket
    cb = nt.nodes.new("CompositorNodeColorBalance")
    cb.correction_method = "LIFT_GAMMA_GAIN"
    w = warmth
    cb.lift = (1.0, 1.0 - 0.004 * w, 1.0 - 0.012 * w)
    cb.gamma = (1.0 + 0.01 * w, 1.0, 1.0 - 0.035 * w)
    cb.gain = (1.0 + 0.04 * w, 1.0 - 0.005 * w, 1.0 - 0.09 * w)
    nt.links.new(src, cb.inputs["Image"])
    nt.links.new(cb.outputs["Image"], comp.inputs["Image"])


def grade_saturation(scene, sat):
    scene.use_nodes = True
    nt = getattr(scene, "node_tree", None)
    if nt is None:
        return
    rl = nt.nodes.get("Render Layers")
    comp = nt.nodes.get("Composite")
    if not rl or not comp:
        return
    hs = nt.nodes.new("CompositorNodeHueSat")
    hs.inputs["Saturation"].default_value = sat
    nt.links.new(rl.outputs["Image"], hs.inputs["Image"])
    nt.links.new(hs.outputs["Image"], comp.inputs["Image"])


main()
