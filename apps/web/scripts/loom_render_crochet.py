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
        # subsurface OFF: the plump strands interpenetrate where stitches
        # squash together, and random-walk SSS trapped inside an overlap
        # rendered as dark specks on pale chenille (proofs/yarn r1, r4).
        subsurf=0.0, bump1=0.3, bump2=0.16, rough_lo=0.75, rough_hi=0.92,
        rough=1.0, sheen_tint_mix=0.45, crush_scale=7.0, crush_amt=0.14,
        fleck_scale=45.0, fleck_amt=0.45,
        pile_scale=90.0, pile_bump=0.45,
        # Hair-curve pile fringe (`add_pile_hairs`) is OFF by default: ~46 m
        # of yarn on a toy is ~530,000 mm2 of strand, so even 2 hairs/mm2 ran
        # well past 10 min per hero on the 4 vCPU probe. Opt in per scene
        # (fibreTune pile_density) once renders have a bigger budget.
        pile_density=0.0, pile_children=8, pile_len_mm=0.6, pile_lean=0.7,
        pile_radius_mm=0.045, pile_tip_lift=0.18,
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
    "fine-cotton": dict(
        specular=0.22, sheen=0.35, sheen_rough=0.4, aniso=0.3,
        subsurf=0.08, bump1=0.25, bump2=0.12, rough_lo=0.42, rough_hi=0.6,
        flyaway=0.0, halo=None,
        strand="replied", strand_mult=1.15, ply_frac=0.5, twist_turns_per_mm=0.2,
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
    bm = fp.get("base_mult", 1.0)
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
    cav = fp.get("cavity_amt", 0.0)
    if cav > 0:
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
        # crevice shade: the yarn colour at ~1/3 value, pushed a little redder
        # (the pile's own inter-reflection warms it), never grey.
        cs = fp.get("cavity_shade", 0.32)
        crev = (base[0] * cs * 1.1, base[1] * cs * 0.9, base[2] * cs * 0.85, 1.0)
        cm = nt.nodes.new("ShaderNodeMix")
        cm.data_type = "RGBA"
        nt.links.new(am.outputs[0], cm.inputs[0])
        cm.inputs[6].default_value = crev
        nt.links.new(col, cm.inputs[7])
        col = cm.outputs[2]
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
        ("normal_factor", 1.0), ("factor_random", fp.get("pile_lean", 0.7)),
        ("length_random", 0.5), ("hair_step", 3), ("display_step", 1), ("render_step", 2),
        ("child_type", "SIMPLE"), ("child_nbr", 1), ("rendered_child_count", kids),
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
    grade_saturation(scene, view.get("saturation", 1.2))  # bring warmth back after AgX desaturates (1.4 oversaturated the crisper, less-felted yarn)
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
