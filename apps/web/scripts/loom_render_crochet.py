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
    # FLUFF (sleepy-bunny pass): a cut-strand pompom in a soft fluffy yarn —
    # the bar's cream pompom on its lilac nightcap. Chenille's plump single
    # strand and matte pile material with NO depth treatment (a cream pompom
    # in wool or chenille rendered as a grey knobbly ball: proofs/bunny r1),
    # plus a real hair fringe so the cut ends read as fuzz, not worms.
    "fluff": dict(
        specular=0.04, sheen=0.45, sheen_rough=0.5, aniso=0.0,
        base_mult=1.0, cavity_amt=0.0, cavity_dist_mm=2.0, cavity_pow=1.5,
        cavity_shade=0.32, rim_amt=0.25, rim_mode="lift", rim_tint=0.5,
        rim_pow=2.5, rim_blend=0.5, rim_alpha=0.0, sat_mult=1.0, depth_by_lum=True,
        subsurf=0.0, bump1=0.25, bump2=0.12, rough_lo=0.8, rough_hi=0.95,
        rough=1.0, sheen_tint_mix=0.5, crush_scale=7.0, crush_amt=0.08,
        fleck_scale=45.0, fleck_amt=0.3,
        pile_scale=90.0, pile_bump=0.3,
        # A pompom is ~3000 short strands (~0.9 M mm2 of surface): 5/mm2 was
        # 4.5 M hairs and the 8 GB probe task was OOM-killed (bunny r2).
        pile_density=1.2, pile_children=6, pile_len_mm=2.2, pile_lean=0.9,
        pile_radius_mm=0.04, pile_tip_lift=0.3,
        flyaway=0.0, halo=None,
        strand="single", strand_mult=1.3,
    ),
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


# ---------------------------------------------------------------------------
# HANDMADE YARN SWITCHES (crochet-bar job yarn2, 17 Oct 2026). Every knob is
# OFF unless a scene asks for it through `fibreTune`, so every existing render
# is unchanged. All of it is RENDER-ONLY: the audited stitch geometry (and its
# geometryHash) is never touched; the renderer perturbs the strand it sweeps.
#
#   fibreTune.handmade: 0..1   the one preset switch. 1 turns every knob below
#                              on at its HANDMADE_PRESET value; 0.5 = half the
#                              amplitude. An explicit hm_* in fibreTune wins
#                              (and is used as given, not scaled).
#
# Stitch irregularity (a maker's hand): a smooth, seeded value-noise field whose
# lattice is one stitch across (`hm_cell_r` strand radii), so neighbouring
# stitches differ while one stitch moves as a whole:
#   hm_jitter   0..0.5  centreline shift, x the strand radius: stitch size + tilt
#   hm_loft     0..0.5  outward puff, x the strand radius: loop height
#   hm_tension  0..0.3  strand radius +- fraction: tight vs loose stitches
#                       (a tight stitch is also drawn a little inward)
#   hm_cell_r   3..8    the stitch scale of all the variation, in strand radii
#   hm_seed     int     the maker (another seed = another hand)
# Heathered colour:
#   hm_heather  0..1    per-stitch drift: value +-16%, hue +-0.01, sat +-6% at 1
#   hm_drift    0..1    a slower drift over a few stitches (dye/spin variation)
#   hm_crevice  0..1    extra crevice darkening, added to the fibre's own cavity
# Chenille velvet (strand "single" fibres only):
#   hm_velvet   0..1    crest lift (stitch tops catch the light) vs the deep
#                       crevice, and a per-stitch sheen strength (nap patches)
#   hm_fleck    0..0.5  added to chenille's lit pile-tip flecks (`fleck_amt`)
#   hm_nap      0..1    nap direction: a smooth per-stitch tilt of the shading
#                       normal, so some stitches catch the light and some don't
#   hm_ripple   0..1    lumpy pile along the strand: radius +- 9% at 1
#   hm_loop_twist 0..1  loops much fatter than the fabric strand (the cow's
#                       fringe) twist round their own axis: a helix of
#                       0.35 x radius at 1, one turn per `hm_loop_pitch_r` radii
#   hm_loop_pitch_r 2..6  (2.6)
#   hm_loop_ripple 1..3   the loops' ripple as a multiple of hm_ripple (2)
#   hm_loop_pile 0..3   pile-hair density multiplier on those loops (forces pile
#                       on even when `pile_max_radius_mm` would skip them)
#   hm_pale_pile 0..1   pile on pale yarn too (pile_dark_only skips it), at this
#                       fraction of the density and no tip lift
#   hm_loop_ratio 1.2..2  a group is a "loop" when its radius is this many
#                       times the toy's main strand radius
# Cotton halo (ply / replied fibres only):
#   hm_halo     0..1    faint fibre haze at the silhouette plus sparse short
#                       fine fibre hairs (1.8 hairs/mm2 x 0.55 mm at 1)
#   hm_halo_max_hairs   the halo's hair budget over the whole toy (400 000)
# ---------------------------------------------------------------------------
HANDMADE_PRESET = dict(
    hm_jitter=0.3, hm_loft=0.22, hm_tension=0.14,
    hm_heather=0.7, hm_drift=0.5, hm_crevice=0.35,
    hm_velvet=0.75, hm_nap=0.5, hm_ripple=0.5, hm_fleck=0.2,
    hm_loop_twist=0.8, hm_loop_pile=1.5, hm_pale_pile=0.4,
    hm_halo=0.5,
)
# constants that ride along with the switch but are not amplitudes
HANDMADE_FIXED = dict(hm_cell_r=4.5, hm_seed=1, hm_loop_pitch_r=2.6, hm_loop_ratio=1.4, hm_loop_ripple=2.0)


def handmade_params(fp):
    """`fp` with the handmade switch expanded (a new dict; `fp` is unchanged).
    No `handmade` and no hm_* key = the same dict back, so off is a no-op."""
    h = float(fp.get("handmade", 0) or 0)
    if h <= 0 and not any(k.startswith("hm_") for k in fp):
        return fp
    out = dict(fp)
    for k, v in HANDMADE_PRESET.items():
        if k not in fp:
            out[k] = v * h
    for k, v in HANDMADE_FIXED.items():
        out.setdefault(k, v)
    return out


def hm_amt(fp, key):
    return float(fp.get(key, 0) or 0)


def _hm_hash(ix, iy, iz, salt):
    """Integer lattice -> [-1, 1), vectorised (numpy uint64, wraps by design)."""
    import numpy as np
    with np.errstate(over="ignore"):
        h = (ix.astype(np.uint64) * np.uint64(0x9E3779B185EBCA87)
             ^ iy.astype(np.uint64) * np.uint64(0xC2B2AE3D27D4EB4F)
             ^ iz.astype(np.uint64) * np.uint64(0x165667B19E3779F9)
             ^ np.uint64(salt & 0xFFFFFFFFFFFF) * np.uint64(0x27D4EB2F165667C5))
        h ^= h >> np.uint64(31)
        h *= np.uint64(0xBF58476D1CE4E5B9)
        h ^= h >> np.uint64(29)
    return (h >> np.uint64(11)).astype(np.float64) / float(1 << 53) * 2.0 - 1.0


def hm_noise(P, cell, salt):
    """Smooth seeded value noise in [-1, 1] at points P (N x 3, mm) with a
    lattice `cell` mm across: C1-continuous (smoothstep trilinear), so the
    strand it displaces never tears."""
    import numpy as np
    q = np.asarray(P, dtype=np.float64) / max(cell, 1e-6)
    i = np.floor(q).astype(np.int64)
    f = q - i
    u = f * f * (3.0 - 2.0 * f)
    acc = np.zeros(len(q))
    for dx in (0, 1):
        wx = u[:, 0] if dx else 1.0 - u[:, 0]
        for dy in (0, 1):
            wy = u[:, 1] if dy else 1.0 - u[:, 1]
            for dz in (0, 1):
                wz = u[:, 2] if dz else 1.0 - u[:, 2]
                acc += wx * wy * wz * _hm_hash(i[:, 0] + dx, i[:, 1] + dy, i[:, 2] + dz, salt)
    return acc


def hm_displace(polys, r_mm, fp, ripple=False):
    """Stitch irregularity on one stroke's polylines (mm), render-only.
    Returns (new polys as lists of tuples, per-point radius factors per poly).
    Every poly of a stroke (its plies) sees the SAME field, so plies move
    together and a stitch shifts, tilts, puffs or tightens as one."""
    import numpy as np
    jit, loft, ten = hm_amt(fp, "hm_jitter"), hm_amt(fp, "hm_loft"), hm_amt(fp, "hm_tension")
    rip = hm_amt(fp, "hm_ripple") if ripple else 0.0
    cell = fp.get("hm_cell_r", 4.5) * r_mm
    seed = int(fp.get("hm_seed", 1)) * 1000003
    arrs = [np.asarray(p, dtype=np.float64).reshape(-1, 3) for p in polys]
    allp = np.concatenate(arrs) if arrs else np.zeros((0, 3))
    centroid = allp.mean(axis=0) if len(allp) else np.zeros(3)
    out_p, out_r = [], []
    for P in arrs:
        if len(P) == 0:
            out_p.append([])
            out_r.append([])
            continue
        d = np.zeros_like(P)
        rf = np.ones(len(P))
        if jit > 0:
            for k in range(3):
                d[:, k] += jit * r_mm * hm_noise(P, cell, seed + 11 * (k + 1))
        if loft > 0 or ten > 0:
            o = P - centroid
            o /= np.maximum(np.linalg.norm(o, axis=1, keepdims=True), 1e-9)
            nl = hm_noise(P, cell, seed + 101) if loft > 0 else np.zeros(len(P))
            nt = hm_noise(P, cell, seed + 202) if ten > 0 else np.zeros(len(P))
            # loft puffs a loop out (or sinks it); a tight stitch (nt < 0) is
            # thinner and drawn in a little, a loose one plumper and proud.
            d += o * (r_mm * (loft * nl + 0.5 * ten * nt))[:, None]
            rf *= 1.0 + ten * nt
        if rip > 0:
            rf *= 1.0 + 0.09 * rip * hm_noise(P, 0.9 * r_mm, seed + 303)
        Q = P + d
        out_p.append([tuple(q) for q in Q.tolist()])
        out_r.append(rf.tolist())
    return out_p, out_r


def hm_strand_colour(nt, col, base, fp, cell_bu):
    """Heathered colour (render-only): a per-stitch value/hue/sat drift (smooth
    Voronoi cells one stitch across) plus a slower drift over a few stitches.
    Returns the new colour socket (unchanged when both knobs are 0)."""
    het, dri = hm_amt(fp, "hm_heather"), hm_amt(fp, "hm_drift")
    if het <= 0 and dri <= 0:
        return col
    tex = nt.nodes.new("ShaderNodeTexCoord")
    seed = float(fp.get("hm_seed", 1))

    def offset_coords():
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Location"].default_value = (seed * 7.31, seed * 3.17, seed * 5.53)
        nt.links.new(tex.outputs["Object"], mp.inputs["Vector"])
        return mp.outputs["Vector"]
    terms = []   # (separate-colour node, amplitude)
    if het > 0:
        vor = nt.nodes.new("ShaderNodeTexVoronoi")
        vor.voronoi_dimensions = "3D"
        try:
            vor.feature = "SMOOTH_F1"
            vor.inputs["Smoothness"].default_value = 0.5
        except Exception:
            pass
        vor.inputs["Scale"].default_value = 1.0 / max(cell_bu, 1e-4)
        nt.links.new(offset_coords(), vor.inputs["Vector"])
        sep = nt.nodes.new("ShaderNodeSeparateColor")
        nt.links.new(vor.outputs["Color"], sep.inputs["Color"])
        terms.append((sep, het))
    if dri > 0:
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = 1.0 / max(3.0 * cell_bu, 1e-4)
        nz.inputs["Detail"].default_value = 1.0
        nt.links.new(offset_coords(), nz.inputs["Vector"])
        sep = nt.nodes.new("ShaderNodeSeparateColor")
        nt.links.new(nz.outputs["Color"], sep.inputs["Color"])
        terms.append((sep, dri * 0.8))

    def summed(channel, scale, centre):
        # centre + scale * sum(amp * 2 * (channel - 0.5))
        sock = None
        for sep, amp in terms:
            m = nt.nodes.new("ShaderNodeMath")
            m.operation = "MULTIPLY_ADD"
            nt.links.new(sep.outputs[channel], m.inputs[0])
            m.inputs[1].default_value = 2.0 * amp * scale
            m.inputs[2].default_value = -amp * scale + (centre if sock is None else 0.0)
            if sock is not None:
                a = nt.nodes.new("ShaderNodeMath")
                a.operation = "ADD"
                nt.links.new(sock, a.inputs[0])
                nt.links.new(m.outputs[0], a.inputs[1])
                sock = a.outputs[0]
            else:
                sock = m.outputs[0]
        return sock
    hsv = nt.nodes.new("ShaderNodeHueSaturation")
    nt.links.new(summed(0, 0.01, 0.5), hsv.inputs["Hue"])
    nt.links.new(summed(2, 0.06, 1.0), hsv.inputs["Saturation"])
    nt.links.new(summed(1, 0.16, 1.0), hsv.inputs["Value"])
    nt.links.new(col, hsv.inputs["Color"])
    return hsv.outputs["Color"]


def hm_crevice_fp(fp):
    """The fibre's cavity knobs with `hm_crevice` added (a copy)."""
    c = hm_amt(fp, "hm_crevice")
    if c <= 0:
        return fp
    out = dict(fp)
    out["cavity_amt"] = min(1.0, fp.get("cavity_amt", 0.0) + c)
    return out


def hm_nap_normal(nt, normal, cell_bu, amt):
    """Tilt the shading normal by a smooth per-stitch vector noise: the nap of
    each stitch lies its own way, so it catches the light or doesn't."""
    if amt <= 0:
        return normal
    tex = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 1.0 / max(cell_bu, 1e-4)
    nz.inputs["Detail"].default_value = 0.5
    nt.links.new(tex.outputs["Object"], nz.inputs["Vector"])
    ctr = nt.nodes.new("ShaderNodeVectorMath")
    ctr.operation = "MULTIPLY_ADD"
    nt.links.new(nz.outputs["Color"], ctr.inputs[0])
    ctr.inputs[1].default_value = (2 * amt, 2 * amt, 2 * amt)
    ctr.inputs[2].default_value = (-amt, -amt, -amt)
    add = nt.nodes.new("ShaderNodeVectorMath")
    add.operation = "ADD"
    nt.links.new(normal, add.inputs[0])
    nt.links.new(ctr.outputs[0], add.inputs[1])
    nrm = nt.nodes.new("ShaderNodeVectorMath")
    nrm.operation = "NORMALIZE"
    nt.links.new(add.outputs[0], nrm.inputs[0])
    return nrm.outputs[0]


def hm_velvet_colour(nt, col, fp, r_bu):
    """Chenille crest vs crevice: where the strand is open to the room (a
    stitch's top) the pile catches the light and lifts; the crevice keeps the
    fibre's own deep cavity. HSV value lift keeps the hue and chroma."""
    v = hm_amt(fp, "hm_velvet")
    if v <= 0:
        return col
    ao = nt.nodes.new("ShaderNodeAmbientOcclusion")
    ao.samples = 6
    ao.inputs["Distance"].default_value = max(r_bu * 1.5, 1e-4)
    p2 = nt.nodes.new("ShaderNodeMath")
    p2.operation = "POWER"
    nt.links.new(ao.outputs["AO"], p2.inputs[0])
    p2.inputs[1].default_value = 2.0
    # value x (1 - 0.35v) deep in a crevice up to x (1 + 0.4v) on an open crest
    val = nt.nodes.new("ShaderNodeMath")
    val.operation = "MULTIPLY_ADD"
    nt.links.new(p2.outputs[0], val.inputs[0])
    val.inputs[1].default_value = 0.75 * v
    val.inputs[2].default_value = 1.0 - 0.35 * v
    hsv = nt.nodes.new("ShaderNodeHueSaturation")
    nt.links.new(val.outputs[0], hsv.inputs["Value"])
    nt.links.new(col, hsv.inputs["Color"])
    return hsv.outputs["Color"]


def hm_halo_colour(nt, col, base, fp):
    """Cotton halo: the loose surface fibres at a strand's silhouette scatter
    light, so the edge reads a little paler and softer (a faint haze)."""
    h = hm_amt(fp, "hm_halo")
    if h <= 0:
        return col
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    pw = nt.nodes.new("ShaderNodeMath")
    pw.operation = "POWER"
    nt.links.new(lw.outputs["Facing"], pw.inputs[0])
    pw.inputs[1].default_value = 2.0
    fac = nt.nodes.new("ShaderNodeMath")
    fac.operation = "MULTIPLY"
    nt.links.new(pw.outputs[0], fac.inputs[0])
    fac.inputs[1].default_value = 0.35 * h
    lum = 0.2126 * base[0] + 0.7152 * base[1] + 0.0722 * base[2]
    haze = tuple(min(1.0, 0.55 * c + 0.45 * lum + 0.06) for c in base[:3]) + (1.0,)
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    nt.links.new(fac.outputs[0], mx.inputs[0])
    nt.links.new(col, mx.inputs[6])
    mx.inputs[7].default_value = haze
    return mx.outputs[2]


def yarn_material(name, hexcol, sheen, fibre="cotton", fp=None, cell_bu=0.0):
    """The CORE strand material for one yarn fibre look (STITCH_ENGINE yarn-
    fibre pass). The ply DEFINITION comes from the real ply geometry (nPly
    distinct tubes spiralling — yarnLoop.pliedFilaments), so this only ever
    tunes how the surface itself reads: cotton's satiny plied sheen with a
    whisper of haze, wool's softer matte haze with a hint of stray fibre,
    or chenille/velvet's matte plump core (their pile halo is a separate
    object — see `fuzz_shell_material`). `fibre` unset/unknown falls back to
    cotton, so every pre-existing call site is unaffected."""
    if fp is None:
        fp = FIBRE_PARAMS.get(fibre, FIBRE_PARAMS["cotton"])
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    base = hex_to_lin(hexcol)
    set_in(bsdf, "Base Color", base)
    hm_col = any(hm_amt(fp, k) > 0 for k in ("hm_heather", "hm_drift", "hm_crevice", "hm_halo"))
    if hm_col:
        # handmade switches (render-only, off by default): heathered colour,
        # deeper crevices and the cotton halo, see HANDMADE_PRESET.
        rgb = nt.nodes.new("ShaderNodeRGB")
        rgb.outputs[0].default_value = base
        col = hm_strand_colour(nt, rgb.outputs[0], base, fp, cell_bu)
        col = cavity_nodes(nt, col, base, hm_crevice_fp(fp))
        col = hm_halo_colour(nt, col, base, fp)
        nt.links.new(col, bsdf.inputs["Base Color"])
    elif fp.get("cavity_amt", 0.0) > 0:
        # fine cotton (and any fibre that asks): shade the valleys between
        # stitches, see `cavity_nodes`. Absent from cotton/wool/velvet, so
        # their renders are unchanged.
        rgb = nt.nodes.new("ShaderNodeRGB")
        rgb.outputs[0].default_value = base
        nt.links.new(cavity_nodes(nt, rgb.outputs[0], base, fp), bsdf.inputs["Base Color"])
    set_in(bsdf, "Specular IOR Level", fp["specular"])
    set_in(bsdf, "Sheen Weight", fp["sheen"])
    set_in(bsdf, "Sheen Roughness", fp["sheen_rough"])
    # `sheen_tint_mix` (motifs r9, additive: absent = the white sheen every
    # fibre had): a white sheen at weight 0.6 / roughness 0.7 lays a near-
    # constant pale veil over a mid or dark dye, so three dusty roses (#946070,
    # #8a5868, #7a4a5a) rendered the same clean pink. Tinting the sheen toward
    # the base colour keeps the dye's depth; a scene asks for it via fibreTune.
    stm = fp.get("sheen_tint_mix") if fp.get("strand") == "replied" or fp.get("sheen_tint_mix_core") else None
    if stm:
        tint = tuple(1.0 - stm + stm * min(1.0, c / max(base[0], base[1], base[2], 1e-6)) for c in base[:3]) + (1.0,)
        set_in(bsdf, "Sheen Tint", tint)
    else:
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
    # handmade: a gentle per-stitch tilt (each stitch sits its own way)
    last_normal = hm_nap_normal(nt, last_normal, cell_bu, 0.35 * hm_amt(fp, "hm_nap"))
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


def chenille_material(name, hexcol, fp, cell_bu=0.0, r_bu=0.0):
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
    if hm_amt(fp, "hm_fleck") > 0:
        fp = dict(fp, fleck_amt=fp.get("fleck_amt", 0.0) + hm_amt(fp, "hm_fleck"))
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
    # handmade (off by default): heathered per-stitch colour drift
    col = hm_strand_colour(nt, col, base, fp, cell_bu)
    # Crevice shadow (Fable r5): on a real chenille toy the valleys between
    # stitches go deep, warm brown while the stitch tops stay lit, and that
    # value range is most of what reads as "deep plush" rather than flat
    # orange tubing. Cycles' own bounce light fills those valleys because the
    # plump strands are bright and close together, so an AO term darkens the
    # colour towards a saturated crevice shade where the strand is hemmed in.
    col = cavity_nodes(nt, col, base, hm_crevice_fp(fp))
    # handmade velvet: the crest of each stitch catches the light
    col = hm_velvet_colour(nt, col, fp, r_bu)
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
    if hm_amt(fp, "hm_velvet") > 0:
        # handmade velvet: the nap lies a different way stitch to stitch, so
        # the sheen is strong on some stitches and weak on others.
        nv = nt.nodes.new("ShaderNodeTexNoise")
        nv.inputs["Scale"].default_value = 1.0 / max(cell_bu, 1e-4)
        nv.inputs["Detail"].default_value = 0.5
        nt.links.new(tex.outputs["Object"], nv.inputs["Vector"])
        sw = nt.nodes.new("ShaderNodeMapRange")
        sw.inputs["From Min"].default_value = 0.3
        sw.inputs["From Max"].default_value = 0.7
        s0 = fp.get("sheen", 1.0)
        sw.inputs["To Min"].default_value = s0 * (1.0 - 0.6 * hm_amt(fp, "hm_velvet"))
        sw.inputs["To Max"].default_value = min(1.0, s0 * (1.0 + 1.2 * hm_amt(fp, "hm_velvet")) + 0.15 * hm_amt(fp, "hm_velvet"))
        nt.links.new(nv.outputs["Fac"], sw.inputs["Value"])
        nt.links.new(sw.outputs["Result"], bsdf.inputs["Sheen Weight"])
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
    nt.links.new(hm_nap_normal(nt, bump.outputs["Normal"], cell_bu, 0.6 * hm_amt(fp, "hm_nap")), bsdf.inputs["Normal"])
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
    if fp.get("pile_max_hairs"):
        # handmade cotton halo: a hard memory budget (the bunny's fine cotton
        # plus its pompom pile ran the 8 GB probe out of memory, yarn2 r2)
        total = min(total, int(fp["pile_max_hairs"]))
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
        key = (st["hex"], round(st["radiusMm"], 3), round(st.get("sheen", 0.7), 2), round(st.get("metallic", 0.0), 2))
        groups.setdefault(key, []).append(st)

    def drape_z(bx, by):
        if not drape:
            return 0.0
        cx, cy, amp, fx, fy = drape
        return amp * (math.sin((bx - cx) * fx) + math.cos((by - cy) * fy)
                      + 0.5 * math.sin((bx - cx + by - cy) * fx * 0.6))

    # `handmade_params` is a no-op unless the scene's fibreTune asks for the
    # handmade switches (HANDMADE_PRESET), so every existing render is unchanged.
    fpb = handmade_params(FIBRE_PARAMS.get(fibre, FIBRE_PARAMS["cotton"]))
    has_halo = bool(fpb.get("halo"))
    strand = fpb.get("strand", "ply")
    hm_geo = any(hm_amt(fpb, k) > 0 for k in ("hm_jitter", "hm_loft", "hm_tension", "hm_ripple", "hm_loop_twist"))
    # the toy's main strand radius (the radius carrying the most points): a
    # group much fatter than it is a loop (the cow's fringe), see hm_loop_ratio
    by_r = {}
    for st in strokes:
        k = round(st["radiusMm"], 3)
        by_r[k] = by_r.get(k, 0) + sum(len(f) for f in st["filaments"])
    main_r = max(by_r, key=by_r.get) if by_r else 1.0

    def is_loop(radius):
        return radius > main_r * fpb.get("hm_loop_ratio", 1.4)

    def stroke_polys(st):
        """The polylines to sweep for one stroke, the radius (mm) of each and
        per-point radius factors (None = constant): the scene's own plies
        untouched for 'ply' (cotton/wool/velvet, so their renders are
        unchanged), or the strand rebuilt from the plies' centreline for
        'single' (chenille) / 'replied' (fine cotton). The handmade switches
        (off by default) perturb the strand here, render-only."""
        if strand == "ply":
            if not hm_geo:
                return st["filaments"], st["radiusMm"], None
            _c, spread = strand_centre(st["filaments"])
            polys, rfs = hm_displace(st["filaments"], spread + st["radiusMm"], fpb)
            return polys, st["radiusMm"], rfs
        centre, spread = strand_centre(st["filaments"])
        if not spread:
            return st["filaments"], st["radiusMm"], None
        bundle = (spread + st["radiusMm"]) * fpb.get("strand_mult", 1.0)
        rf = None
        if hm_geo:
            cs, rfs = hm_displace(centre, bundle, fpb, ripple=(strand == "single"))
            centre, rf = cs, rfs[0]
            tw = hm_amt(fpb, "hm_loop_twist")
            if strand == "single" and tw > 0 and is_loop(st["radiusMm"]):
                # a fat chenille loop twists round its own axis (a helix of
                # the strand itself): reads as twisted chenille, not a noodle
                centre = replied(centre[0], 0.35 * tw * bundle, 1,
                                 1.0 / max(fpb.get("hm_loop_pitch_r", 2.6) * bundle, 1e-6))
                if rf:
                    # and a lumpier pile (chenille loops bobble along their length)
                    _p, extra = hm_displace(centre, bundle, dict(fpb, hm_jitter=0, hm_loft=0, hm_tension=0,
                                                                 hm_ripple=hm_amt(fpb, "hm_ripple") * (fpb.get("hm_loop_ripple", 2.0) - 1.0),
                                                                 hm_seed=int(fpb.get("hm_seed", 1)) + 7), ripple=True)
                    rf = [a * b for a, b in zip(rf, extra[0])]
        if strand == "single":
            return centre, bundle, ([rf] if rf else None)
        ply_r = bundle * fpb.get("ply_frac", 0.52)
        return replied(centre[0], bundle - ply_r, len(st["filaments"]),
                       fpb.get("twist_turns_per_mm", 0.1)), ply_r, ([rf] * len(st["filaments"]) if rf else None)

    def write_points(cu, mult):
        for st in group:
            polys, rad_mm, rfs = stroke_polys(st)
            # radiusMm is now the PLY tube radius (crisp plied model, §11): bevel
            # it 1:1 so the nPly plies stay distinct (a fatter multiplier merges
            # them back into a smooth roving tube). The ply spread reaches the
            # target outer radius, so the yarn still fills the fabric. `mult` >1
            # grows the halo shell (see build_yarn's fuzz-halo pass) outside the
            # core strand without changing the core's own radius.
            r = rad_mm * S * 1.02 * mult
            zlift = st["radiusMm"] * S * 1.02  # halo lifts with the CORE strand, not its own bigger radius
            for pi, poly in enumerate(polys):
                if len(poly) < 2:
                    continue
                sp = cu.splines.new("POLY")
                sp.points.add(len(poly) - 1)
                rf = rfs[pi] if rfs else None
                for i, p in enumerate(poly):
                    bx = p[0] * S
                    by = -p[1] * S
                    sp.points[i].co = (bx, by, p[2] * S + zlift + z_offset + drape_z(bx, by), 1.0)
                    sp.points[i].radius = r * rf[i] if rf else r

    for (hexcol, radius, sheen, metallic), group in groups.items():
        cu = bpy.data.curves.new("yarn", type="CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = 1.0
        cu.bevel_resolution = 3 if strand == "single" else 2
        cu.resolution_u = 2
        cu.use_fill_caps = True
        write_points(cu, 1.0)
        ob = bpy.data.objects.new("yarn_" + hexcol.lstrip("#"), cu)
        # handmade: the stitch scale of the colour/nap variation (BU), from
        # the group's strand radius (only read when a handmade knob is on)
        r_out_mm = radius
        if fpb is not FIBRE_PARAMS.get(fibre) and group:
            _c, spr = strand_centre(group[0]["filaments"])
            r_out_mm = (spr + radius) * (fpb.get("strand_mult", 1.0) if strand != "ply" else 1.0)
        cell_bu = fpb.get("hm_cell_r", 4.5) * r_out_mm * S
        if strand == "single" and fpb.get("material", "pile") == "pile":
            ymat = chenille_material("y_" + hexcol, hexcol, fpb, cell_bu, r_out_mm * S)
        else:
            ymat = yarn_material("y_" + hexcol, hexcol, sheen, fibre, fpb, cell_bu)
        if metallic > 0:
            # A metallic thread (the spiral trees' gold star and cord, strokes[].metallic):
            # the plied yarn surface blended toward a brushed metal. Absent from
            # every other scene, so they are unchanged.
            mb = ymat.node_tree.nodes.get("Principled BSDF")
            set_in(mb, "Metallic", metallic)
            set_in(mb, "Roughness", 0.32)
            set_in(mb, "Sheen Weight", 0.1)
        ob.data.materials.append(ymat)
        bpy.context.collection.objects.link(ob)
        if strand == "single" and fpb.get("pile_density", 0) > 0:
            # `pile_dark_only` (Highland cow, 2026-10-10): the hair-curve pile
            # on the mid/dark yarn only — on cream it reads as grey whiskers
            # (proofs/yarn r6-bunny-chenille), on deep brown as lit pile tips.
            # `pile_max_radius_mm` (cow r18): no pile on strand groups fatter
            # than this — the fringe's loose loops are drawn plump (strandYr
            # 1.35) and the bar's rings are smooth chenille, not fuzzy worms.
            dark_ok = not fpb.get("pile_dark_only") or depth_weight(hex_to_lin(hexcol)) > 0.75
            size_ok = radius <= fpb.get("pile_max_radius_mm", 1e9)
            lp = hm_amt(fpb, "hm_loop_pile")
            if dark_ok and lp > 0 and is_loop(radius):
                # handmade: the fat loops (cow fringe) get their own, denser
                # pile so they read as fuzzy chenille, not smooth tubes
                add_pile_hairs(ob, hexcol, dict(fpb, pile_density=fpb["pile_density"] * lp,
                                                pile_tip_lift=min(fpb.get("pile_tip_lift", 0.18), 0.15)))
            elif dark_ok and size_ok:
                add_pile_hairs(ob, hexcol, fpb)
            elif not dark_ok and size_ok and hm_amt(fpb, "hm_pale_pile") > 0:
                # handmade: a sparser pile on pale yarn too (the bar cow's cream
                # muzzle is fuzzy), with no tip lift so it stays cream
                add_pile_hairs(ob, hexcol, dict(fpb, pile_density=fpb["pile_density"] * hm_amt(fpb, "hm_pale_pile"),
                                                pile_tip_lift=0.0))
        elif strand != "single" and hm_amt(fpb, "hm_halo") > 0:
            # handmade cotton halo: sparse, short, fine fibres standing off
            # the strand (the faint fuzz of a real cotton)
            h = hm_amt(fpb, "hm_halo")
            pts_all = sum(by_r.values()) or 1
            share = sum(sum(len(f) for f in st["filaments"]) for st in group) / pts_all
            # emit from a cheap proxy (one low-poly tube on the centreline at
            # the strand's outer radius), not the plies: a mesh copy of every
            # ply ran the bunny out of the 8 GB probe's memory (yarn2 r2b)
            pcu = bpy.data.curves.new("yarn_halo_proxy", type="CURVE")
            pcu.dimensions = "3D"
            pcu.bevel_depth = 1.0
            pcu.bevel_resolution = 1
            pcu.resolution_u = 1
            for st in group:
                polys, rad_mm, _rfs = stroke_polys(st)
                cl, spread = strand_centre(polys)
                rr = (spread + rad_mm) * S
                for poly in cl:
                    if len(poly) < 2:
                        continue
                    poly = poly[::2] + ([poly[-1]] if len(poly) % 2 == 0 else [])
                    sp = pcu.splines.new("POLY")
                    sp.points.add(len(poly) - 1)
                    for i, q in enumerate(poly):
                        bx, by = q[0] * S, -q[1] * S
                        sp.points[i].co = (bx, by, q[2] * S + st["radiusMm"] * S * 1.02 + z_offset + drape_z(bx, by), 1.0)
                        sp.points[i].radius = rr
            pob = bpy.data.objects.new("yarnhaloproxy_" + hexcol.lstrip("#"), pcu)
            bpy.context.collection.objects.link(pob)
            add_pile_hairs(pob, hexcol, dict(
                fpb, pile_density=1.8 * h, pile_children=4, pile_len_mm=0.55,
                pile_lean=1.0, pile_radius_mm=0.012, pile_tip_lift=0.3,
                pile_max_hairs=fpb.get("hm_halo_max_hairs", 400000) * share))
            bpy.data.objects.remove(pob)
            bpy.data.curves.remove(pcu)
            try:
                bpy.context.scene.cycles_curves.shape = "RIBBONS"
                bpy.context.scene.cycles_curves.subdivisions = 1
            except Exception:
                pass

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
        if pr.get("branch"):
            # A hanging branch (spiral trees, round 11): a bark-covered twig
            # along a polyline in loom mm, its radius tapering along it.
            build_branch(pr, z_offset)
            continue
        if pr.get("torusMinor") is not None:
            # A metal ring (the doll keyring): a unit-radius torus in its local
            # x/y plane, carried by the same axes matrix as an ellipsoid.
            bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=float(pr["torusMinor"]),
                                             major_segments=96, minor_segments=24)
        else:
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
        if pr.get("metal"):
            ob.data.materials.append(metal_material(pr["hex"]))
        else:
            ob.data.materials.append(prop_material(pr["hex"], float(pr.get("gloss", 0.85))))


def bark_material(hexcol):
    """Grey-brown twig bark: dark furrows (stretched voronoi cracks along the
    branch), lighter weathered ridges, rough, with a strong bump."""
    mat = _principled("bark", hexcol, rough=0.92, spec=0.15)
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    # Spiral r5: furrows a few mm wide, stretched ~2 cm along the twig (at
    # (0.35, 3, 3) x 3.5 the cracks were ~1 mm: sub-pixel on an 800 px hero,
    # so the branch rendered as a smooth brown pole).
    vec = _obj_coords(nt, (0.2, 1.4, 1.4))  # r6: r5 cells read a touch large and regular
    vo = nt.nodes.new("ShaderNodeTexVoronoi")
    vo.feature = "DISTANCE_TO_EDGE"
    vo.inputs["Scale"].default_value = 3.5
    nt.links.new(vec, vo.inputs["Vector"])
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 2.5
    nz.inputs["Detail"].default_value = 8.0
    nt.links.new(vec, nz.inputs["Vector"])
    crack = _math(nt, "POWER", _math(nt, "MULTIPLY", vo.outputs["Distance"], 4.0, clamp=True), 0.6)
    tone = _math(nt, "MULTIPLY", crack, nz.outputs["Fac"])
    base = hex_to_lin(hexcol)
    dark = tuple(c * 0.35 for c in base[:3]) + (1.0,)
    light = tuple(min(1.0, c * 1.6 + 0.02) for c in base[:3]) + (1.0,)
    nt.links.new(_mix_rgb(nt, tone, dark, light), bsdf.inputs["Base Color"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.7
    nt.links.new(tone, bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def build_branch(pr, z_offset):
    """`pr.branch` = list of [x, y, z, radius] in loom mm (same y flip and
    z_offset as the yarn)."""
    pts = pr["branch"]
    cu = bpy.data.curves.new("branch", type="CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 1.0
    cu.bevel_resolution = 6
    cu.use_fill_caps = True
    sp = cu.splines.new("NURBS")
    sp.points.add(len(pts) - 1)
    for i, q in enumerate(pts):
        sp.points[i].co = (q[0] * S, -q[1] * S, q[2] * S + z_offset, 1.0)
        sp.points[i].radius = q[3] * S
    sp.use_endpoint_u = True
    sp.order_u = 3
    ob = bpy.data.objects.new("branch", cu)
    bpy.context.scene.collection.objects.link(ob)
    if pr.get("wood"):
        # A smooth wooden DOWEL (tapestry fix, additive): a turned rod with the
        # grain along its length, not bark. Only a prop that asks for it.
        light_hex, dark_hex = pr["wood"][0], pr["wood"][1]
        ob.data.materials.append(wood_material("dowel", light_hex, dark_hex, along_x=True, rough=0.5))
        return
    ob.data.materials.append(bark_material(pr.get("hex", "#6e5a48")))


def metal_material(hexcol):
    """Polished nickel-plated steel: a keyring's split ring and jump ring."""
    mat = bpy.data.materials.new("metal_" + hexcol.lstrip("#"))
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    set_in(bsdf, "Base Color", hex_to_lin(hexcol))
    set_in(bsdf, "Metallic", 1.0)
    set_in(bsdf, "Roughness", 0.18)
    return mat


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
    # A HUNG piece (spiral trees on a branch) floats `liftMm` above the table.
    # Absent from every other scene, so they are unchanged.
    z_offset += view.get("liftMm", 0.0) * S
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
        # `view.stageHeightMm` (spiral trees, additive): size the set's props from
        # the piece itself rather than the whole hung content (cord + lift).
        H=(view["stageHeightMm"] * S) if view.get("stageHeightMm") else (maxz_bu + z_offset),
        cam=cam, tgt=tgt, view=view, key_energy=key.data.energy,
        face=face_point(data, z_offset, cx, cy, yaw_r) if stage_of(view) != "studio" else None,
        footprint=footprint_polar(data, cx, cy, yaw_r) if stage_of(view) != "studio" else None,
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
STAGE_ZOOM_BY = {"linen": 1.08, "windowsill": 1.02, "nursery": 0.9, "christmas": 1.02, "wall": 1.0}
STAGE_ASPECT = 1.0      # square listing photo (the bunny and tree bars)
# "wall" (motifs r9, additive): an upright WALL HANGING shot straight on — a
# plaster wall just behind the hung piece, a pale oak sideboard top below it,
# window light from the left. Only a scene that asks for it gets it.
STAGE_IDS = ("linen", "windowsill", "nursery", "christmas", "wall")


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
    return photo_camera_view(view, v)   # photo v2: the three-quarter eye line (off = unchanged)


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
    po = photo_opts(view)
    _PHOTO.clear()
    _PHOTO.update(props=po["photoProps"], blanket=po["photoBlanket"], crumple=po["photoCrumple"],
                  foot=ctx.get("footprint"))
    if po["photoFrame"]:
        # hold the piece at a set share of the frame height: slide the camera
        # along its own line (its aim, turn and tilt are kept)
        bpy.context.view_layer.update()
        dv = cam.location - tgt.location
        s_new = max(ctx["H"], 1.0) / (po["photoFrame"] * 2.0 * 18.0 / cam.data.lens)
        cam.location = tgt.location + dv.normalized() * s_new
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
        lt.data.energy *= _tune(view, stage, "key", "stageKeyMult", STAGE_KEY_MULT.get(stage, 0.9))

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
        ob = _area("stage_light", None, to_world(loc), to_world(aim), e, size, color)
        set_lights.append(ob)
        return ob
    set_lights = []

    k = dict(root=root, H=H, R=R, s=s, D=D, vis=vis, light=room_light)
    variant = stage_variant(view, stage)
    if variant in VARIANT_BUILDERS:
        build, wrgb, wstr = VARIANT_BUILDERS[variant]
        build(**k)
        _world(scene, wrgb, wstr)
    elif stage == "windowsill":
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
    elif stage == "wall":
        _stage_wall(gap=view.get("wallGapCm", 3.0), **k)
        _world(scene, (0.98, 0.95, 0.90), 0.5)
    if po["photoLight"] == "window":
        builder_lights = list(set_lights)
        _photo_lights(view, po, root, H, R, s, room_light, builder_lights, ctx.get("lights", []), scene)
    if po["photoAmbient"] != 1.0 and scene.world:
        bgn = scene.world.node_tree.nodes["Background"]
        bgn.inputs["Strength"].default_value *= po["photoAmbient"]

    # Camera: a real shallow depth of field, focused on the piece.
    cd = cam.data
    cd.dof.use_dof = True
    cd.dof.focus_object = None
    cd.dof.focus_distance = s
    cd.dof.aperture_fstop = view.get("stageFstop", STAGE_FSTOP)
    if po["photoFstop"]:
        # photo v2: a real wide aperture (f/N -> N/100 at this 100x scale)
        cd.dof.aperture_fstop = po["photoFstop"] / 100.0
    if po["photoFocus"] == "face" and ctx.get("face"):
        fe = bpy.data.objects.new("photo_focus", None)
        fe.location = ctx["face"]
        scene.collection.objects.link(fe)
        cd.dof.focus_object = fe
        print("[photo] focus on the face at (%.1f, %.1f, %.1f), %.1f from the camera" % (
            ctx["face"][0], ctx["face"][1], ctx["face"][2], (cam.location - Vector(ctx["face"])).length))
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
        "stageExposure", scene.view_settings.exposure + _tune(view, stage, "exposure", "_none", STAGE_EXPOSURE_LIFT.get(stage, 0.0)))
    scene.view_settings.exposure += po["photoExposure"]
    # Round 5: a touch more contrast and a warm golden grade (lifted warm
    # highlights, slightly cool-neutral shadows) over the AgX base look.
    scene.view_settings.look = view.get("stageLook", "AgX - Medium High Contrast")
    grade_golden(scene, _tune(view, stage, "warmth", "stageWarmth", STAGE_WARMTH.get(stage, 0.65)))
    if view.get("photo"):
        print("[photo]", view.get("photo"), " ".join("%s=%s" % (k[5:], v) for k, v in po.items()))
    print("[stage]", stage, variant, "s=%.1f D=%.1f H=%.1f R=%.1f fstop=%.3f hw0=%.1f ynear=%.1f" % (
        s, D, H, R, cd.dof.aperture_fstop, vis.hw(0), vis.y_near()))


# High-key, airy listing photos: lift the exposure a touch over the studio grade
# (the set is darker than a blown-out white sweep). Christmas stays moodier so
# the fairy-light bokeh glows.
STAGE_EXPOSURE_LIFT = {"linen": 0.15, "windowsill": 0.1, "nursery": 0.2, "christmas": 0.0, "wall": 0.2}
# Round 5: ease the flat studio key+fill so the set's own warm window key rakes
# across the piece (contrast, a lit side and a soft side) instead of an even wash.
STAGE_KEY_MULT = {"linen": 0.7, "windowsill": 0.6, "nursery": 0.75, "christmas": 0.65, "wall": 0.7}
# r6: how golden the grade is (1 = r5's full gold, which read as a yellow filter
# on the windowsill and fought the blush/lavender nursery palette).
STAGE_WARMTH = {"linen": 0.65, "windowsill": 0.6, "nursery": 0.3, "christmas": 0.75, "wall": 0.45}


def _ground(root, mat, s, D, z=0.0):
    return _box("stage_ground", root, mat, -3 * s, 3 * s, -3 * s, D + 2, z - 2.0, z)


# the cloths under the piece that photo v2 crumples (props on top keep their own)
_PHOTO_CLOTHS = ("napkin", "throw", "blanket", "sheet", "plaid", "fur")


def _throw(name, root, mat, vis, H, R, D, amp, back=0.45, lift=0.04, seed=0.0, heap=None, wl_scale=1.0,
           right=None, hem=0.0):
    """A cloth that fills the whole bottom of the frame and runs back into the
    room, flat under the piece, folding everywhere else. `right` (a fraction of
    the visible half-width at the piece) ends the cloth short of the frame on
    the right so the table shows, and `hem` (a radius, toy units) rolls a
    stitched hem along that edge — a napkin, not an infinite sheet."""
    y0 = min(vis.y_near() - 4.0, -R * 2)
    y1 = back * D
    if _PHOTO.get("blanket", "none") != "none" and name in _PHOTO_CLOTHS:
        right = None        # photo v2: the cloth runs out of frame on both sides (the bar)
    x1 = vis.hw(y1) * 1.15
    xr = x1 if right is None else right * vis.hw(0)
    f = _folds(H, R, amp, lift=lift, seed=seed, wl_scale=wl_scale)
    if _PHOTO.get("blanket", "none") != "none" and name in _PHOTO_CLOTHS:
        # photo v2: the cloth under the toy, softly crumpled (and optionally
        # swapped for a knit or linen), and remembered so props lie ON it
        f0 = f
        cr = _crumple(H, R, _PHOTO.get("crumple", 0.045), seed=seed)

        def f(x, y):
            return max(0.02, f0(x, y) + cr(x, y))
        if _PHOTO["blanket"] == "knit":
            mat = knit_material(name + "_v2", "#efe6d6", stitch_cm=1.6, rough=0.96)
        elif _PHOTO["blanket"] == "linen":
            mat = linen_material(name + "_v2", "#d8cab2")
    if heap:
        def h(x, y):
            return f(x, y) + heap(x, y)
    else:
        h = f
    _PHOTO["ground"] = h
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
    if _PHOTO.get("props") == "v2":
        _bunch_v2(root, H, R, vis, _PHOTO.get("ground") or (lambda x, y: 0.04), _PHOTO.get("foot"))
    else:
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


def _stage_wall(root, H, R, s, D, vis, light, gap=3.0):
    """A wall hanging, shot straight on (camera tilt ~84-88): the piece hangs
    in front of a soft warm-white plaster wall `gap` cm behind its centre, over
    a pale oak sideboard top (the stage ground, at z = 0; the scene lifts the
    piece with `liftMm`). A stoneware vase with dried grasses stands on the
    sideboard back left and a small potted plant back right, both soft; a
    window to the left lights the wall in a warm wash. The piece is untouched."""
    oak = wood_material("sideboard", "#d8c3a0", "#b8996f", rough=0.5)
    _box("stage_ground", root, oak, -3 * s, 3 * s, -3 * s, gap + 1.0, -3.0, 0.0)
    plaster = plaster_material("wall", "#efe8dc", mottle=0.04)
    _box("wall", root, plaster, -3 * s, 3 * s, gap, gap + 3.0, -3.0, 3.0 * s)
    # A hanging string from the piece's top corners up out of frame is the
    # maker's; here the cord is yarn in the scene when the piece has one.
    # r10: the vase stood in front of the piece's left end and the pot was big and
    # close; both now sit just inside the frame edges, smaller.
    hw = vis.hw(gap * 0.5)
    glaze = _principled("vase", "#d9cdb8", rough=0.55, spec=0.3)
    vx, vy = -0.92 * hw, gap * 0.6
    vh = 0.3 * H
    _lathe("vase", root, glaze, vx, vy, [(0.0, 0.0), (0.16 * vh, 0.0), (0.2 * vh, 0.3 * vh), (0.17 * vh, 0.7 * vh), (0.1 * vh, 0.92 * vh), (0.11 * vh, vh)], seg=48)
    stem = _principled("dstem", "#b9a070", rough=0.85)
    plume = _principled("dplume", "#e3d4b4", rough=0.95, sheen=0.8)
    pts = []
    for kk in range(6):
        a = math.radians(-26 + kk * 10.4)
        top = (vx + math.sin(a) * 0.55 * vh, vy + 0.12 * vh * math.cos(kk * 1.3), vh + math.cos(a) * 1.25 * vh)
        _curve("dst%d" % kk, root, stem, [(vx, vy, 0.9 * vh), top], 0.012 * vh)
        for j in range(10):
            t = j / 9.0
            pts.append((top[0] + math.sin(a) * 0.4 * vh * t, top[1], top[2] + math.cos(a) * 0.4 * vh * t,
                        (0.07 + 0.05 * math.sin(math.pi * t)) * vh))
    _spheres("dried", root, plume, pts, 0.07 * vh, subdiv=2)
    # A terracotta pot of trailing green, back right.
    terra = _principled("pot", "#b9774f", rough=0.7, spec=0.2)
    px, py = 0.93 * hw, gap * 0.5
    ph = 0.15 * H
    _cyl("pot", root, terra, px, py, 0.0, 0.09 * H, 0.11 * H, ph)
    leaf_mat = _principled("plant", "#6f8f4e", rough=0.6, sheen=0.3)
    specs = []
    for kk in range(14):
        a = kk * 2.4
        rr = 0.04 * H + 0.07 * H * _hash01(kk, 2.0)
        specs.append(((px + math.cos(a) * rr, py + math.sin(a) * rr * 0.6, ph + 0.015 * H + 0.03 * H * _hash01(kk, 5.0)),
                      a + 0.4, 0.06 * H + 0.03 * H * _hash01(kk, 9.0), 0.032 * H, 0.25, 0, -0.1 - 0.3 * _hash01(kk, 3.0)))
    _leaves("plant_leaves", root, leaf_mat, specs)
    # Window light from the left washing the wall, a soft fill from the front right.
    light((-1.3 * s, -0.2 * s, 0.9 * s), (0, gap, 0.5 * H), 1.7, 0.8 * s, GOLD)
    light((0.6 * s, -0.9 * s, 0.7 * s), (0.0, 0.0, 0.5 * H), 0.7, 1.6 * s, WARM_SOFT)


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


# --- STAGE VARIANTS (job stages) -------------------------------------------
# Each set comes in four variants so a shelf of listings does not all look the
# same: different props, surface, palette, light direction and time of day.
# `view.stageVariant` names one (an id, or an index); absent = the first, which
# is the original set above, unchanged. The TS side (`HERO_STAGE_VARIANTS` in
# blenderScene.ts) picks one per pattern from a hash of its slug; the order of
# the ids below must match it. Everything is still procedural and the piece is
# still never touched.

STAGE_VARIANTS = {
    "linen": ("throw", "basket", "worktable", "dried"),
    "windowsill": ("garden", "rain", "autumn", "spring"),
    "nursery": ("lantern", "cot", "shelf", "rug"),
    "christmas": ("pine", "baubles", "snow", "gifts"),
}

# Per-variant grade/zoom (falls back to the stage's own value when absent).
VARIANT_TUNE = {
    "basket": dict(warmth=0.55, exposure=0.15, key=0.7),
    "worktable": dict(warmth=0.35, exposure=0.1, key=0.7),
    "dried": dict(warmth=0.5, exposure=0.2, key=0.7),
    "rain": dict(warmth=0.0, exposure=0.25, key=0.8),
    "autumn": dict(warmth=0.75, exposure=0.05, key=0.6),
    "spring": dict(warmth=0.2, exposure=0.25, key=0.75),
    "cot": dict(warmth=0.15, exposure=0.25, key=0.8),
    "shelf": dict(warmth=0.45, exposure=0.15, key=0.75),
    "rug": dict(warmth=0.25, exposure=0.22, key=0.8),
    "baubles": dict(warmth=0.8, exposure=0.0, key=0.65),
    "snow": dict(warmth=0.0, exposure=0.05, key=0.7),
    "gifts": dict(warmth=0.7, exposure=0.05, key=0.65),
}


def stage_variant(view, stage):
    ids = STAGE_VARIANTS.get(stage)
    if not ids:
        return None
    v = view.get("stageVariant")
    if isinstance(v, int) and not isinstance(v, bool):
        return ids[v % len(ids)]
    if isinstance(v, str) and v in ids:
        return v
    return ids[0]


def _tune(view, stage, key, view_key, base):
    vid = stage_variant(view, stage)
    if view_key in view:
        return view[view_key]
    return VARIANT_TUNE.get(vid, {}).get(key, base)


# ---- shared prop helpers --------------------------------------------------

def _beside(R, H, half, side):
    """x for a NEAR prop of half-width `half` so it clears the piece's
    footprint (R) with a small gap: near props sit beside the piece, never
    in front of it (r1: a bauble and a gift covered the paws)."""
    return side * (R * 1.2 + half + 0.12 * H)


def _rbox(name, root, mat, x0, x1, y0, y1, z0, z1, bevel, rot_z=0.0):
    """A box with rounded (bevelled) edges, optionally turned about its centre."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for vt in bm.verts:                       # r2: real size first, then an absolute bevel
        vt.co.x *= (x1 - x0)
        vt.co.y *= (y1 - y0)
        vt.co.z *= (z1 - z0)
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=min(bevel, 0.45 * min(x1 - x0, y1 - y0, z1 - z0)),
                    segments=3, profile=0.5, affect="EDGES")
    cxm, cym = 0.5 * (x0 + x1), 0.5 * (y0 + y1)
    c, sn = math.cos(rot_z), math.sin(rot_z)
    for vt in bm.verts:
        lx, ly = vt.co.x, vt.co.y
        vt.co.x = cxm + lx * c - ly * sn
        vt.co.y = cym + lx * sn + ly * c
        vt.co.z = z0 + vt.co.z + 0.5 * (z1 - z0)
    return _bm_object(name, bm, root, mat, smooth=True)


def _ring(name, root, mat, centre, r, tube, axis="z", n=48):
    cx_, cy_, cz_ = centre
    pts = []
    for k in range(n + 1):
        a = 2 * math.pi * k / n
        if axis == "z":
            pts.append((cx_ + r * math.cos(a), cy_ + r * math.sin(a), cz_))
        elif axis == "y":
            pts.append((cx_ + r * math.cos(a), cy_, cz_ + r * math.sin(a)))
        else:
            pts.append((cx_, cy_ + r * math.cos(a), cz_ + r * math.sin(a)))
    return _curve(name, root, mat, pts, tube)


def _leaf_bm(bm, centre, ang, L, W, curl=0.2, lobes=0, tilt=0.0):
    """One flat leaf (an almond outline, a raised midrib, edges curling up) as a
    fan of triangles. `lobes` > 0 scallops the edge (an oak / maple-ish leaf)."""
    x0, y0, z0 = centre
    c, sn = math.cos(ang), math.sin(ang)
    n = 14
    mid = [bm.verts.new((x0, y0, z0 + 0.04 * L))]
    left, right = [], []
    for i in range(1, n):
        t = i / n
        w = W * math.sin(math.pi * t) ** 0.8
        if lobes:
            w *= 0.75 + 0.25 * abs(math.cos(math.pi * lobes * t))
        u = t * L
        zc = z0 + curl * L * (t - 0.5) ** 2 + tilt * u + 0.05 * L * math.sin(math.pi * t)
        for side, lst in ((1, left), (-1, right)):
            lx, ly = u, side * w
            lst.append(bm.verts.new((x0 + lx * c - ly * sn, y0 + lx * sn + ly * c, zc + curl * 0.6 * w)))
        mid.append(bm.verts.new((x0 + u * c, y0 + u * sn, zc + 0.05 * L)))
    tip = bm.verts.new((x0 + L * c, y0 + L * sn, z0 + curl * L * 0.25 + tilt * L))
    mid.append(tip)
    for i in range(n - 1):
        a, b = mid[i], mid[i + 1]
        for lst in (left, right):
            p0 = lst[i - 1] if i > 0 else None
            if p0 is None:
                bm.faces.new((a, lst[0], b)) if lst is left else bm.faces.new((a, b, lst[0]))
            else:
                if lst is left:
                    bm.faces.new((a, p0, lst[i], b))
                else:
                    bm.faces.new((a, b, lst[i], p0))
    for lst in (left, right):
        if lst is left:
            bm.faces.new((mid[-2], lst[-1], tip))
        else:
            bm.faces.new((mid[-2], tip, lst[-1]))


def _leaves(name, root, mat, specs, smooth=True):
    bm = bmesh.new()
    for sp in specs:
        _leaf_bm(bm, *sp)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _bm_object(name, bm, root, mat, smooth=smooth)


def glass_material(name, tint="#eef3f0", rough=0.05):
    mat = _principled(name, tint, rough=rough, spec=0.5)
    b = mat.node_tree.nodes["Principled BSDF"]
    set_in(b, "Transmission Weight", 1.0)
    set_in(b, "IOR", 1.45)
    return mat


def rug_material(name, hexcol, pile=55.0):
    """A soft short-pile rug / faux fur: a strong sheen and a fine tufted bump."""
    mat = _principled(name, hexcol, rough=0.95, sheen=1.0, spec=0.05)
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = pile
    nz.inputs["Detail"].default_value = 6.0
    nt.links.new(_obj_coords(nt, (1, 1, 1)), nz.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.7
    bump.inputs["Distance"].default_value = 0.2
    nt.links.new(nz.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    base = _lin(hexcol)
    a = tuple(c * 0.78 for c in base[:3]) + (1.0,)
    nt.links.new(_mix_rgb(nt, nz.outputs["Fac"], a, base), bsdf.inputs["Base Color"])
    return mat


def gingham_material(name, light_hex, dark_hex, check_cm=1.2):
    """Woven gingham: crossed stripes, white / half / full where they overlap,
    over the linen weave's soft thread bump."""
    mat = _principled(name, light_hex, rough=0.88, sheen=0.3, spec=0.15)
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    sc = 1.0 / check_cm
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(_obj_coords(nt, (sc, sc, sc)), sep.inputs["Vector"])
    sx = _math(nt, "LESS_THAN", _math(nt, "FRACT", sep.outputs["X"]), 0.5)
    sy = _math(nt, "LESS_THAN", _math(nt, "FRACT", sep.outputs["Y"]), 0.5)
    f = _math(nt, "MULTIPLY", _math(nt, "ADD", sx, sy), 0.5)
    lt, dk = _lin(light_hex), _lin(dark_hex)
    nt.links.new(_mix_rgb(nt, f, lt, dk), bsdf.inputs["Base Color"])
    wv = nt.nodes.new("ShaderNodeTexWave")
    wv.inputs["Scale"].default_value = 40.0
    wv.inputs["Distortion"].default_value = 1.0
    nt.links.new(_obj_coords(nt, (1, 1, 1)), wv.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.25
    nt.links.new(wv.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def sky_material(name, stops, strength, blob=0.6, speckle=0.0):
    """A generalised `outside_material`: a vertical gradient through `stops`
    ((pos, (r, g, b)), ...) with soft noise blobs (trees, hedges, cloud), and
    optional bright `speckle` (falling snow). Only ever seen far out of focus."""
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
    cr.elements[0].position, cr.elements[0].color = stops[0][0], tuple(stops[0][1]) + (1.0,)
    cr.elements[1].position, cr.elements[1].color = stops[-1][0], tuple(stops[-1][1]) + (1.0,)
    for pos, col in stops[1:-1]:
        e = cr.elements.new(pos)
        e.color = tuple(col) + (1.0,)
    nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 4.0
    nz.inputs["Detail"].default_value = 2.0
    nt.links.new(tc.outputs["Generated"], nz.inputs["Vector"])
    mixc = nt.nodes.new("ShaderNodeMix")
    mixc.data_type = "RGBA"
    mixc.blend_type = "MULTIPLY"
    mixc.inputs["Factor"].default_value = blob
    nt.links.new(ramp.outputs["Color"], mixc.inputs[6])
    nt.links.new(nz.outputs["Color"], mixc.inputs[7])
    col = mixc.outputs[2]
    if speckle > 0.0:
        vo = nt.nodes.new("ShaderNodeTexVoronoi")
        vo.inputs["Scale"].default_value = 90.0
        nt.links.new(tc.outputs["Generated"], vo.inputs["Vector"])
        dot = _math(nt, "LESS_THAN", vo.outputs["Distance"], 0.12)
        col = _mix_rgb(nt, _math(nt, "MULTIPLY", dot, speckle), (0, 0, 0, 1), (1, 1, 1, 1))
        add = nt.nodes.new("ShaderNodeMix")
        add.data_type = "RGBA"
        add.blend_type = "ADD"
        add.inputs["Factor"].default_value = 1.0
        nt.links.new(mixc.outputs[2], add.inputs[6])
        nt.links.new(col, add.inputs[7])
        col = add.outputs[2]
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(col, em.inputs["Color"])
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def _window_wall(root, H, s, D, vis, plaster, frame, outside, x0f, x1f, ledge_f=0.22, rows=(0.45, 0.9),
                 cols=3, out_strength_y=0.9):
    """The back wall with a multi-pane window from x0f..x1f of the visible half
    width at the wall, its painted ledge and the bright world beyond it."""
    hwD = vis.hw(D)
    W = 2.5 * hwD
    wx0, wx1 = x0f * hwD, x1f * hwD
    ledge_h = ledge_f * H
    wz0, wz1 = ledge_h, vis.ztop(D) + 0.6 * H
    t = 3.0
    _box("wall_l", root, plaster, -W, wx0, D, D + t, 0, wz1 + 30)
    _box("wall_r", root, plaster, wx1, W, D, D + t, 0, wz1 + 30)
    _box("wall_b", root, plaster, wx0, wx1, D, D + t, 0, wz0)
    _box("wall_t", root, plaster, wx0, wx1, D, D + t, wz1, wz1 + 30)
    fb = 0.9
    fy0, fy1 = D + 0.5 * t, D + 0.5 * t + 1.2
    _box("wf_bot", root, frame, wx0, wx1, fy0, fy1, wz0, wz0 + fb * 1.6)
    _box("wf_l", root, frame, wx0, wx0 + fb * 1.4, fy0, fy1, wz0, wz1)
    _box("wf_r", root, frame, wx1 - fb * 1.4, wx1, fy0, fy1, wz0, wz1)
    for i in range(1, cols):
        mx = wx0 + (wx1 - wx0) * i / float(cols)
        _box("wf_mull%d" % i, root, frame, mx - fb * 0.5, mx + fb * 0.5, fy0, fy1, wz0, wz1)
    for zf in rows:
        mz = wz0 + (vis.ztop(D) - wz0) * zf
        _box("wf_tran%.0f" % (zf * 10), root, frame, wx0, wx1, fy0, fy1, mz - fb * 0.5, mz + fb * 0.5)
    _box("ledge", root, frame, -W, W, D - 0.12 * s, D + 0.5 * t, 0, ledge_h)
    oy = D + out_strength_y * s
    ob = _box("outside", root, outside, -2.0 * vis.hw(oy), 2.0 * vis.hw(oy), oy, oy + 1, -2, vis.ztop(oy) + 5)
    ob.visible_shadow = False
    return dict(wx0=wx0, wx1=wx1, wz0=wz0, wz1=wz1, fy0=fy0)


def _yarn_ball(name, root, hexcol, x, y, r, seed=0.0, tail=None):
    """A wound ball of yarn: a core under ~18 wraps of plump strand laid on great
    circles at scattered angles (the criss-cross of a hand-wound ball)."""
    mat = _principled(name, hexcol, rough=0.85, sheen=0.6, spec=0.15)
    core = _principled(name + "_core", tuple(c * 0.82 for c in _lin(hexcol)[:3]) + (1.0,), rough=0.9, sheen=0.5)
    _spheres(name + "_core", root, core, [(x, y, r * 0.96)], r * 0.9, subdiv=3)
    th = r * 0.045                             # r2: ~70 fine wraps (18 thick ones read as a plastic cage)
    cu = bpy.data.curves.new(name + "_wraps", type="CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = th
    cu.bevel_resolution = 2
    for k in range(70):
        a = _hash01(k, seed + 1) * math.pi * 2
        b = math.asin(2 * _hash01(k, seed + 2) - 1)
        nx_, ny_, nz_ = math.cos(a) * math.cos(b), math.sin(a) * math.cos(b), math.sin(b)
        n = Vector((nx_, ny_, nz_)).normalized()
        u = n.cross(Vector((0, 0, 1)) if abs(nz_) < 0.9 else Vector((1, 0, 0))).normalized()
        v = n.cross(u)
        rr = r * (0.92 + 0.05 * _hash01(k, seed + 3))
        sp = cu.splines.new("POLY")
        sp.points.add(40)
        for i in range(41):
            t = 2 * math.pi * i / 40
            p = (u * math.cos(t) + v * math.sin(t)) * rr
            sp.points[i].co = (x + p.x, y + p.y, r * 0.96 + p.z, 1.0)
    ob = bpy.data.objects.new(name + "_wraps", cu)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = root
    cu.materials.append(mat)
    if tail:
        _curve(name + "_tail", root, mat, [(x, y - r * 0.6, r * 0.25)] + tail, th)


# ---- linen variants -------------------------------------------------------

def _stage_linen_basket(root, H, R, s, D, vis, light):
    """Linen + a wicker basket of yarn balls back left, two balls rolled out
    front right; afternoon light from the right."""
    _ground(root, wood_material("table_wood", "#c4a07a", "#8a6646"), s, D)
    lin = linen_material("throw", "#dccfb8")
    _throw("throw", root, lin, vis, H, R, D, 0.05, back=0.5, seed=2.7, wl_scale=1.8)
    _box("wall", root, plaster_material("wall", "#efe5d6"), -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    wicker = linen_material("wicker", "#a8875e", weave=0.9)
    by = 0.42 * D
    bx = -0.62 * vis.hw(by)
    br, bh = 0.85 * H, 0.75 * H
    _lathe("basket", root, wicker, bx, by, [(0.0, 0.02), (br * 0.82, 0.02), (br * 0.9, 0.05 * bh), (br, 0.6 * bh),
                                             (br * 1.04, bh), (br * 0.98, bh * 1.02), (br * 0.94, 0.6 * bh), (br * 0.84, 0.1 * bh), (0.0, 0.1 * bh)])
    _ring("basket_rim", root, wicker, (bx, by, bh), br * 1.02, 0.05 * H)
    cols = ("#c98f87", "#e8dcc6", "#9fae94", "#d9b46f", "#b9a7c8")
    for i, (ox, oy, rr) in enumerate(((-0.35, -0.2, 0.36), (0.3, -0.25, 0.34), (0.0, 0.25, 0.38), (-0.4, 0.35, 0.33), (0.42, 0.3, 0.32))):
        r = rr * H
        _yarn_ball("ball%d" % i, root, cols[i], bx + ox * br, by + oy * br, r, seed=i * 3.1)
        for ob in [o for o in bpy.data.objects if o.name.startswith("ball%d" % i)]:
            ob.location.z += bh * 0.62
    y2 = -0.02 * s
    x2 = _beside(R, H, 0.22 * H, 1)
    _yarn_ball("ballf1", root, "#c98f87", x2, y2, 0.22 * H, seed=11.0,
               tail=[(x2 - 0.25 * H, y2 - 0.3 * H, 0.06), (x2 - 0.1 * H, y2 - 0.5 * H, 0.06),
                     (x2 - 0.4 * H, y2 - 0.7 * H, 0.06)])
    y3 = 0.25 * s
    _yarn_ball("ballf2", root, "#e8dcc6", 0.85 * vis.hw(y3), y3, 0.28 * H, seed=17.0)
    light((1.3 * s, 0.05 * s, 0.7 * s), (0, 0, 0.4 * H), 1.6, 0.7 * s, GOLD)
    light((-0.4 * s, 0.35 * D, 1.2 * s), (0.0, D, 0.25 * s), 0.8, 1.6 * s, WARM_SOFT)


def _scissors(root, H, x, y, ang, metal, handle):
    """Small embroidery scissors lying flat: two tapered blades, two ring bows."""
    bm = bmesh.new()
    L = 0.75 * H
    c, sn = math.cos(ang), math.sin(ang)

    def P(u, v, z):
        return (x + u * c - v * sn, y + u * sn + v * c, z)
    for side in (1, -1):
        prof = [(0.0, 0.0), (0.1, 0.05), (0.5, 0.04), (1.0, 0.004)]
        top, bot = [], []
        for u, w in prof:
            vv = side * 0.012 * H + side * 0.02 * H * (1 - u)
            top.append(bm.verts.new(P(u * L, vv + w * H * 0.5, 0.05 + (0.01 if side > 0 else 0.0))))
            bot.append(bm.verts.new(P(u * L, vv - w * H * 0.5, 0.05 + (0.01 if side > 0 else 0.0))))
        for i in range(len(prof) - 1):
            bm.faces.new((top[i], top[i + 1], bot[i + 1], bot[i]))
    _bm_object("scissor_blades", bm, root, metal, smooth=False)
    for side in (1, -1):
        cx_, cy_, _ = P(-0.17 * H, side * 0.1 * H, 0)
        _ring("scissor_bow%d" % side, root, handle, (cx_, cy_, 0.06), 0.1 * H, 0.025 * H)
        _curve("scissor_shank%d" % side, root, handle, [P(-0.08 * H, side * 0.07 * H, 0.06), P(0.04 * H, side * 0.015 * H, 0.06)], 0.022 * H)
    _spheres("scissor_pivot", root, metal, [P(0.06 * H, 0.0, 0.08)], 0.025 * H)


def _hook(root, H, x, y, ang, shaft_mat, grip_mat):
    c, sn = math.cos(ang), math.sin(ang)
    L = 1.15 * H

    def P(u, z):
        return (x + u * c, y + u * sn, z)
    r = 0.025 * H
    _curve("hook_shaft", root, shaft_mat, [P(0.0, r), P(L, r)], r)
    _curve("hook_tip", root, shaft_mat, [P(L, r), P(L + 0.04 * H, r * 1.1), P(L + 0.06 * H, r * 1.6)], r * 0.7)
    _curve("hook_grip", root, grip_mat, [P(0.0, r * 1.5), P(0.45 * L, r * 1.5)], r * 1.9)


def _stage_linen_worktable(root, H, R, s, D, vis, light):
    """A maker's oak worktable: no cloth, a crochet hook and brass scissors laid
    beside the piece, a yarn ball with its strand running to the hook, a stack
    of folded swatches back right; clear morning light from the left."""
    _ground(root, wood_material("worktable", "#c79a6a", "#7d5435", rough=0.45), s, D)
    _box("wall", root, plaster_material("wall", "#e9e4dc"), -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    brass = metal_material("#c9a35a")
    steel = metal_material("#bfc4c8")
    grip = _principled("grip", "#c98f87", rough=0.4, spec=0.4)
    y0 = -0.08 * s
    _hook(root, H, 0.42 * vis.hw(y0), y0 - 0.1 * H, math.radians(18), steel, grip)
    y1 = 0.12 * s
    _scissors(root, H, -0.75 * vis.hw(y1), y1, math.radians(-30), brass, brass)
    yb = 0.38 * s
    _yarn_ball("ball", root, "#9fae94", 0.75 * vis.hw(yb), yb, 0.3 * H, seed=4.0,
               tail=[(0.62 * vis.hw(yb), yb - 0.6 * H, 0.06), (0.55 * vis.hw(y0), y0 + 0.2 * H, 0.06),
                     (0.5 * vis.hw(y0), y0, 0.06)])
    # folded swatches (little knit squares) stacked back right
    ys = 0.6 * D
    xs = 0.8 * vis.hw(ys)
    z = 0.0
    for i, col in enumerate(("#e8dcc6", "#c98f87", "#d9b46f")):
        _rbox("swatch%d" % i, root, knit_material("sw%d" % i, col, stitch_cm=0.6), xs - 0.55 * H, xs + 0.55 * H,
              ys - 0.5 * H, ys + 0.5 * H, z, z + 0.12 * H, 0.04 * H, rot_z=0.08 * (i - 1))
        z += 0.12 * H
    # a stoneware mug of hooks back left
    mug = _principled("mug", "#d8cfc0", rough=0.45, spec=0.4, coat=0.2)
    my = 0.55 * D
    mx = -0.6 * vis.hw(my)
    _lathe("hookmug", root, mug, mx, my, [(0, 0), (0.3 * H, 0), (0.32 * H, 0.05 * H), (0.32 * H, 0.75 * H),
                                          (0.29 * H, 0.75 * H), (0.29 * H, 0.1 * H), (0, 0.1 * H)])
    for k in range(4):
        a = -0.25 + 0.17 * k
        _curve("mughook%d" % k, root, [steel, grip][k % 2], [(mx + 0.05 * H * k - 0.08 * H, my, 0.1 * H),
                                                             (mx + math.sin(a) * 1.0 * H, my + 0.05 * H, 1.35 * H)], 0.035 * H)
    light((-1.2 * s, -0.1 * s, 1.0 * s), (0, 0, 0.4 * H), 1.5, 0.8 * s, WARM_SOFT)
    light((0.5 * s, 0.35 * D, 1.2 * s), (0.0, D, 0.25 * s), 0.8, 1.6 * s, WARM_SOFT)


def _stage_linen_dried(root, H, R, s, D, vis, light):
    """A pale blush linen with a stoneware jar of bunny-tail grass and dried
    stems back right, loose dried rose heads scattered front left; soft light
    from the back left."""
    _ground(root, wood_material("table_wood", "#d2b897", "#a5825f"), s, D)
    lin = linen_material("throw", "#e6d3c9")
    _throw("throw", root, lin, vis, H, R, D, 0.06, back=0.5, seed=4.4, wl_scale=1.9)
    _box("wall", root, plaster_material("wall", "#f0e4dc"), -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    jar = _principled("jar", "#c8b7a6", rough=0.7, spec=0.25)
    jy = 0.5 * D
    jx = 0.6 * vis.hw(jy)
    _lathe("jar", root, jar, jx, jy, [(0, 0), (0.32 * H, 0), (0.42 * H, 0.35 * H), (0.38 * H, 0.75 * H),
                                      (0.22 * H, 0.95 * H), (0.24 * H, 1.05 * H), (0.2 * H, 1.05 * H), (0.18 * H, 0.95 * H)])
    stem = _principled("dstem", "#a89770", rough=0.8)
    tail = _principled("bunnytail", "#efe6d6", rough=1.0, sheen=1.0)
    rust = _principled("rustpod", "#a8735a", rough=0.85)
    tails, pods = [], []
    for k in range(13):
        a = math.radians(-40 + 80 * k / 12.0) + 0.1 * (_hash01(k, 3) - 0.5)
        Lk = (1.4 + 0.6 * _hash01(k, 4)) * H
        top = (jx + math.sin(a) * Lk * 0.7, jy + 0.2 * H * (_hash01(k, 5) - 0.5), 1.0 * H + math.cos(a) * Lk)
        mid = (jx + math.sin(a) * Lk * 0.3, jy, 1.0 * H + math.cos(a) * Lk * 0.5)
        _curve("dst%d" % k, root, stem, [(jx, jy, 0.8 * H), mid, top], 0.012 * H)
        if k % 3 == 2:
            for j in range(5):
                pods.append((top[0] - math.sin(a) * 0.06 * H * j, top[1], top[2] - math.cos(a) * 0.06 * H * j, 0.05 * H))
        else:
            for j in range(6):
                t = j / 5.0
                tails.append((top[0] + math.sin(a) * 0.12 * H * t, top[1], top[2] + math.cos(a) * 0.12 * H * t,
                              (0.07 + 0.035 * math.sin(math.pi * t)) * H))
    _spheres("bunnytails", root, tail, tails, 0.08 * H, subdiv=2)
    _spheres("pods", root, rust, pods, 0.05 * H, subdiv=2)
    # loose dried rose heads front left: tight petal balls in dusty rose
    rose = _principled("rose", "#b9837f", rough=0.8, sheen=0.3)
    rose2 = _principled("rose2", "#d7a9a0", rough=0.8, sheen=0.3)
    leaf = _principled("rleaf", "#8a8b66", rough=0.8)
    pts, pts2, lv = [], [], []
    for i, (fx, fy) in enumerate(((-0.72, -0.12), (-0.55, 0.02), (-0.82, 0.12), (0.5, -0.2))):
        y = fy * s
        x = fx * vis.hw(y)
        rr = (0.09 + 0.03 * _hash01(i, 6)) * H
        for k in range(14):
            a = k * 2.399963
            rad = rr * 0.55 * math.sqrt((k + 0.5) / 14)
            (pts if i % 2 == 0 else pts2).append((x + rad * math.cos(a), y + rad * math.sin(a), 0.06 + rr * (0.9 - 0.4 * (k / 14)), rr * 0.45))
        lv.append(((x + 0.1 * H, y - 0.05 * H, 0.05), math.radians(-30 + 70 * i), 0.22 * H, 0.06 * H, 0.25))
    _spheres("roses", root, rose, pts, 0.04 * H, subdiv=2)
    _spheres("roses2", root, rose2, pts2, 0.04 * H, subdiv=2)
    _leaves("rose_leaves", root, leaf, lv)
    light((-1.0 * s, 0.6 * s, 0.9 * s), (0, 0, 0.4 * H), 1.8, 0.8 * s, WARM)
    light((0.6 * s, -0.2 * s, 0.9 * s), (0, 0.3 * D, 0.1 * s), 0.45, 1.4 * s, WARM_SOFT)


# ---- windowsill variants ------------------------------------------------

def _stage_windowsill_rain(root, H, R, s, D, vis, light):
    """A grey rainy afternoon: a pale painted sill, the window to the RIGHT with
    rain drops on the glass and a slate-green garden beyond, a steaming mug and
    two books back left; soft cool daylight."""
    _ground(root, wood_material("sill_wood", "#d9d4cc", "#b3aca1", rough=0.6), s, D)
    plaster = plaster_material("wall", "#dedbd5")
    frame = wood_material("window_frame", "#ecebe6", "#c9c6bd", along_x=False, rough=0.7)
    out = sky_material("outside", ((0.0, (0.30, 0.36, 0.33)), (0.35, (0.55, 0.60, 0.60)), (0.62, (0.86, 0.89, 0.92))), 2.0, blob=0.5)
    w = _window_wall(root, H, s, D, vis, plaster, frame, out, -0.35, 1.1)
    # drops on the glass: tiny clear beads, seen as glinting specks in the blur
    drop = glass_material("drop", "#ffffff", rough=0.0)
    pts = []
    for k in range(160):
        x = w["wx0"] + (w["wx1"] - w["wx0"]) * _hash01(k, 21)
        z = w["wz0"] + (w["wz1"] - w["wz0"]) * _hash01(k, 22)
        pts.append((x, w["fy0"] - 0.2, z, (0.08 + 0.12 * _hash01(k, 23) ** 2) * H * 0.8))
    _spheres("drops", root, drop, pts, 0.03 * H, subdiv=2)
    # a soft grey-blue knit throw under the piece
    knit = knit_material("throw", "#c9ced2", stitch_cm=1.5)
    _throw("throw", root, knit, vis, H, R, D, 0.04, back=0.32, seed=1.7, right=0.85, hem=0.04 * H)
    mug = _principled("mug", "#8e9e94", rough=0.35, spec=0.45, coat=0.3)
    my = 0.45 * D
    mx = -0.6 * vis.hw(my)
    m_ = 0.7                                   # r2: a mug at mug size (was a bucket)
    _lathe("mug", root, mug, mx, my, [(0, 0), (0.34 * H * m_, 0), (0.37 * H * m_, 0.05 * H * m_), (0.38 * H * m_, 0.75 * H * m_),
                                      (0.35 * H * m_, 0.77 * H * m_), (0.34 * H * m_, 0.12 * H * m_), (0, 0.12 * H * m_)])
    _cyl("tea", root, _principled("tea", "#6a4630", rough=0.1, spec=0.6), mx, my, 0.55 * H * m_, 0.345 * H * m_, 0.345 * H * m_, 0.06 * H)
    _curve("mug_handle", root, mug, [(mx - 0.36 * H * m_, my, 0.62 * H * m_), (mx - 0.56 * H * m_, my, 0.55 * H * m_),
                                     (mx - 0.56 * H * m_, my, 0.3 * H * m_), (mx - 0.36 * H * m_, my, 0.22 * H * m_)], 0.05 * H * m_)
    by = 0.6 * D
    bx = -0.85 * vis.hw(by)
    z0 = 0.0
    for kk, (col, th) in enumerate((("#6f7f8c", 0.2), ("#e3ddd0", 0.15))):
        _box("book%d" % kk, root, _principled("book%d" % kk, col, rough=0.7),
             bx - 0.7 * H, bx + 0.7 * H, by - 0.45 * H, by + 0.45 * H, z0, z0 + th * H)
        z0 += th * H
    light((w["wx1"] * 0.6, D - 3, w["wz0"] + 0.55 * (w["wz1"] - w["wz0"])), (0, 0, 0.45 * H), 1.6, 0.9 * s, (0.86, 0.92, 1.0))
    light((-0.6 * s, -0.25 * s, 0.8 * s), (0.0, 0.5 * D, 0.2 * s), 0.4, 1.2 * s, WARM_SOFT)


def _pumpkin(root, H, x, y, r, hexcol, name="pumpkin"):
    mat = _principled(name, hexcol, rough=0.45, spec=0.35)
    bm = bmesh.new()
    seg, rings = 48, 20
    verts = []
    for j in range(rings + 1):
        t = j / rings
        ph = math.pi * t
        row = []
        for k in range(seg):
            a = 2 * math.pi * k / seg
            rib = 1.0 - 0.09 * abs(math.cos(a * 4)) ** 0.6
            rr = r * math.sin(ph) * rib
            row.append(bm.verts.new((x + rr * math.cos(a), y + rr * math.sin(a), r * 0.82 * (1 - math.cos(ph)) * (1 - 0.12 * math.sin(ph)))))
        verts.append(row)
    for j in range(rings):
        for k in range(seg):
            bm.faces.new((verts[j][k], verts[j][(k + 1) % seg], verts[j + 1][(k + 1) % seg], verts[j + 1][k]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    _bm_object(name, bm, root, mat, smooth=True)
    _curve(name + "_stalk", root, _principled(name + "_st", "#6b5a3a", rough=0.9),
           [(x, y, r * 1.5), (x + 0.05 * r, y, r * 1.75), (x + 0.15 * r, y, r * 1.85)], 0.09 * r)


def _stage_windowsill_autumn(root, H, R, s, D, vis, light):
    """Late October: a walnut sill, low golden sun raking in from the RIGHT, an
    amber garden beyond, fallen leaves (rust, ochre, oxblood) and two small
    pumpkins; a mustard knit under the piece."""
    _ground(root, wood_material("sill_wood", "#8f6646", "#5a3c26"), s, D)
    plaster = plaster_material("wall", "#e4d4bd")
    frame = wood_material("window_frame", "#d9c8aa", "#a88d66", along_x=False, rough=0.75)
    out = sky_material("outside", ((0.0, (0.55, 0.30, 0.10)), (0.3, (0.85, 0.52, 0.22)), (0.6, (1.0, 0.86, 0.62))), 2.6, blob=0.65)
    w = _window_wall(root, H, s, D, vis, plaster, frame, out, -0.9, 0.55)
    lin = linen_material("throw", "#cdb595")    # r3: the mustard knit read as a straw mat
    _throw("throw", root, lin, vis, H, R, D, 0.08, back=0.3, seed=3.1, wl_scale=1.4, right=0.7, hem=0.03 * H)
    _pumpkin(root, H, 0.7 * vis.hw(0.6 * D), 0.6 * D, 0.4 * H, "#c27a40")
    _pumpkin(root, H, 1.0 * vis.hw(0.7 * D), 0.7 * D, 0.3 * H, "#e6dcc6", name="pumpkin2")
    cols = ("#9c4a26", "#b98a3a", "#6e2a24", "#a8642e")
    for ci, col in enumerate(cols):
        specs = []
        for k in range(4):
            kk = ci * 4 + k
            y = (-0.2 + 0.55 * _hash01(kk, 31)) * s
            side = -1 if _hash01(kk, 32) < 0.62 else 1
            x = side * (0.45 + 0.6 * _hash01(kk, 33)) * vis.hw(y)
            if abs(x) < R * 1.3 and y < R:
                x = side * (R * 1.4 + 0.3 * H)
            L = (0.3 + 0.1 * _hash01(kk, 34)) * H        # r4: broader, flatter leaves lying on the cloth
            zc = 0.1 + (0.07 * H if abs(x) < 0.7 * vis.hw(y) else 0.0)
            specs.append(((x, y, zc), 2 * math.pi * _hash01(kk, 35), L, L * 0.38, 0.05, 0, 0.0))
        _leaves("leaves%d" % ci, root, _principled("leaf%d" % ci, col, rough=0.7, sheen=0.2), specs)
        stalk = _principled("leafstalk%d" % ci, "#5a3a22", rough=0.8)
        for j, sp in enumerate(specs):
            (lx, ly, lz), la, L = sp[0], sp[1], sp[2]
            _curve("lstalk%d_%d" % (ci, j), root, stalk, [(lx, ly, lz + 0.02 * L), (lx - 0.18 * L * math.cos(la), ly - 0.18 * L * math.sin(la), lz)], 0.008 * H)
    light((w["wx1"] * 1.4, D * 0.6, 0.45 * s), (0, 0, 0.45 * H), 2.4, 0.5 * s, (1.0, 0.72, 0.45))
    light((-0.7 * s, -0.25 * s, 0.8 * s), (0.0, 0.5 * D, 0.2 * s), 0.25, 1.2 * s, WARM)


def _stage_windowsill_spring(root, H, R, s, D, vis, light):
    """A fresh spring morning: a white sill, sage gingham under the piece, a
    glass jar of tulips back right and a pale blue-green garden beyond; bright
    cool morning light from the left."""
    _ground(root, wood_material("sill_wood", "#f1eee8", "#d8d3c8", rough=0.5), s, D)
    plaster = plaster_material("wall", "#f2f0ea")
    frame = wood_material("window_frame", "#f6f5f1", "#dcd9d0", along_x=False, rough=0.6)
    out = sky_material("outside", ((0.0, (0.48, 0.62, 0.38)), (0.33, (0.72, 0.84, 0.62)), (0.62, (0.90, 0.95, 1.0))), 2.4, blob=0.5)
    w = _window_wall(root, H, s, D, vis, plaster, frame, out, -1.05, 0.4)
    ging = gingham_material("gingham", "#f4f4ee", "#9db394", check_cm=0.9)
    _throw("napkin", root, ging, vis, H, R, D, 0.07, back=0.32, seed=0.8, wl_scale=1.4, right=0.8, hem=0.03 * H)
    jy = 0.55 * D
    jx = 0.82 * vis.hw(jy)                      # r3: clear of the head
    if _PHOTO.get("props") == "v2":
        jx = 0.55 * vis.hw(jy)                  # photo v2: the whole jug and its tulips in frame
    # r4: a speckled cream stoneware jug (the clear jar refracted into abstract shapes)
    jug = _principled("jug", "#f1ebdf", rough=0.35, spec=0.45, coat=0.25)
    _lathe("jar", root, jug, jx, jy, [(0, 0), (0.3 * H, 0), (0.33 * H, 0.06 * H), (0.35 * H, 0.45 * H),
                                      (0.27 * H, 0.8 * H), (0.25 * H, 0.95 * H), (0.23 * H, 0.95 * H), (0.22 * H, 0.82 * H)])
    stem = _principled("tstem", "#6f9a55", rough=0.6)
    cols = ("#f2a7b4", "#f7d36b", "#f2a7b4", "#fbf1e6", "#e98ba0", "#f7d36b", "#fbf1e6")
    lv = []
    for k, col in enumerate(cols):
        a = math.radians(-30 + 60 * k / 6.0)
        Lk = (1.35 + 0.35 * _hash01(k, 41)) * H
        zmax = min(1.9 * H, vis.ztop(jy) - 0.55 * H)     # r2: the heads sit IN frame
        top = (jx + math.sin(a) * Lk * 0.45, jy + 0.12 * H * (_hash01(k, 42) - 0.5),
               min(0.9 * H + math.cos(a) * Lk * 0.7, zmax - 0.25 * H * _hash01(k, 43)))
        _curve("tst%d" % k, root, stem, [(jx + 0.05 * H * (k - 3), jy, 0.08 * H), (jx + math.sin(a) * 0.2 * H, jy, 0.9 * H), top], 0.025 * H)
        cup = _principled("tulip%d" % k, col, rough=0.5, sheen=0.3)
        _lathe("tulip%d" % k, root, cup, top[0], top[1], [(0, top[2] - 0.02 * H), (0.12 * H, top[2] + 0.05 * H),
                                                         (0.15 * H, top[2] + 0.18 * H), (0.11 * H, top[2] + 0.32 * H), (0.0, top[2] + 0.36 * H)], seg=24)
        lv.append(((jx + math.sin(a) * 0.25 * H, jy - 0.05 * H, 0.9 * H), math.pi / 2 + a * 1.6, 0.6 * H, 0.09 * H, 0.0, 0, 0.6))
    _leaves("tulip_leaves", root, _principled("tleaf", "#7fa866", rough=0.5), lv)
    light((w["wx0"] * 0.6, D - 3, w["wz0"] + 0.6 * (w["wz1"] - w["wz0"])), (0, 0, 0.45 * H), 1.8, 0.8 * s, (0.97, 0.98, 1.0))
    light((0.6 * s, -0.25 * s, 0.8 * s), (0.0, 0.5 * D, 0.2 * s), 0.45, 1.2 * s, WARM_SOFT)


# ---- nursery variants ---------------------------------------------------

def _bunting(root, H, a, b, sag, count, cols, flag_w, flag_h):
    """A string of fabric pennant flags sagging between two points."""
    twine = _principled("bunting_string", "#f2ece2", rough=0.9)
    pts = []
    N = 40
    for i in range(N + 1):
        t = i / N
        pts.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t - sag * math.sin(math.pi * t)))
    _curve("bunting_string", root, twine, pts, 0.012 * H)
    for ci, col in enumerate(cols):
        bm = bmesh.new()
        for k in range(ci, count, len(cols)):
            t = (k + 0.5) / count
            p = (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t - sag * math.sin(math.pi * t))
            dz = -sag * math.pi * math.cos(math.pi * t) / count
            sway = 0.04 * flag_w * math.sin(k * 1.7)
            v = [bm.verts.new((p[0] - flag_w / 2, p[1], p[2] - dz / 2)), bm.verts.new((p[0] + flag_w / 2, p[1], p[2] + dz / 2)),
                 bm.verts.new((p[0] + sway, p[1] + 0.05 * flag_w, p[2] - flag_h))]
            bm.faces.new(v)
        mat = knit_material("flag%d" % ci, col, stitch_cm=0.35) if ci % 2 else linen_material("flag%d" % ci, col, weave=10.0)
        ob = _bm_object("flags%d" % ci, bm, root, mat, smooth=False)
        sol = ob.modifiers.new("thick", "SOLIDIFY")
        sol.thickness = 0.02 * H


def _stage_nursery_cot(root, H, R, s, D, vis, light):
    """In the cot: a crisp white cotton sheet, white painted cot rails behind,
    a pastel bunting strung across the top and a pale dove-grey wall; soft
    morning light from the right."""
    sheet = linen_material("sheet", "#f4f1ec", weave=11.0)
    _ground(root, _principled("mattress", "#f3efe8", rough=0.8), s, D)
    _throw("sheet", root, sheet, vis, H, R, D, 0.05, back=0.5, seed=5.2, wl_scale=1.6)
    _box("wall", root, plaster_material("wall", "#e4e6e8", mottle=0.04), -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    paint = _principled("cotpaint", "#f5f3ef", rough=0.4, spec=0.4)
    ry = 0.62 * D
    hw = vis.hw(ry)
    top = vis.zmid(ry) + 0.55 * (vis.ztop(ry) - vis.zmid(ry))
    _rbox("cot_rail_top", root, paint, -1.3 * hw, 1.3 * hw, ry - 0.12 * H, ry + 0.12 * H, top, top + 0.22 * H, 0.06 * H)
    _rbox("cot_rail_bot", root, paint, -1.3 * hw, 1.3 * hw, ry - 0.12 * H, ry + 0.12 * H, 0.0, 0.25 * H, 0.06 * H)
    nb = 11
    for i in range(nb):
        x = -1.2 * hw + 2.4 * hw * i / (nb - 1)
        _cyl("cot_bar%d" % i, root, paint, x, ry, 0.2 * H, 0.05 * H, 0.05 * H, top - 0.15 * H, seg=24)
    by = 0.45 * D                              # r2: strung IN FRONT of the rails
    bz = vis.ztop(by) - 0.15 * H
    _bunting(root, H, (-1.2 * vis.hw(by), by, bz), (1.2 * vis.hw(by), by, bz + 0.1 * H), 0.6 * H, 13,
             ("#efc6c4", "#cfe3d6", "#f6e3a8", "#c9d9ec"), 0.55 * H, 0.65 * H)
    # a little muslin square folded beside the piece, front right
    y = -0.05 * s
    xm = _beside(R, H, 0.3 * H, 1)
    _rbox("muslin", root, linen_material("muslin", "#d9e6dc", weave=6.0), xm - 0.3 * H, xm + 0.4 * H,
          y - 0.35 * H, y + 0.35 * H, 0.05, 0.07 * H, 0.025 * H, rot_z=0.25)
    light((1.2 * s, 0.1 * s, 0.9 * s), (0, 0, 0.4 * H), 1.5, 0.9 * s, (1.0, 0.97, 0.94))
    light((-0.3 * s, 0.4 * D, 1.2 * s), (0.0, D, 0.25 * s), 1.0, 1.6 * s, (0.98, 0.98, 1.0))


def _stage_nursery_shelf(root, H, R, s, D, vis, light):
    """A nursery bookshelf: a pale oak shelf, a soft sage wall, a row of upright
    picture books on the left, a little potted plant and a wooden rainbow on
    the right; warm light from the left."""
    oak = wood_material("shelf", "#e2c49a", "#b99266", rough=0.5)
    _ground(root, oak, s, D)
    _box("shelf_front", root, oak, -3 * s, 3 * s, vis.y_near() - 6.0, vis.y_near() - 4.0, -6.0, 0.0)
    _box("wall", root, plaster_material("wall", "#dfe6d8", mottle=0.05), -3 * s, 3 * s, D * 0.55, D * 0.55 + 3, 0, 2.5 * s)
    by = 0.28 * D
    x = -0.45 * vis.hw(by)
    cols = ("#e9b8b0", "#f4e6c4", "#a9c4b4", "#c7b8d8", "#f0d29a", "#e3e0d6", "#b7cfe0")
    for i, col in enumerate(cols):
        th = (0.16 + 0.08 * _hash01(i, 51)) * H
        hgt = (1.15 + 0.4 * _hash01(i, 52)) * H
        dep = (0.7 + 0.15 * _hash01(i, 53)) * H
        lean = 0.0 if i < len(cols) - 1 else -0.25
        ob = _rbox("book%d" % i, root, _principled("book%d" % i, col, rough=0.6), x - th, x, by - dep / 2, by + dep / 2,
                   0.0, hgt, 0.02 * H)
        if lean:
            ob.rotation_euler = (0, lean, 0)
        x -= th + 0.01 * H
    # wooden rainbow (nested arches) and a potted plant on the right
    ry = 0.3 * D
    rx = 0.55 * vis.hw(ry)
    for i, col in enumerate(("#d98c7a", "#e8b77a", "#b5c49a", "#9fb7c9")):
        rad = (0.75 - 0.15 * i) * H
        arch = [(rx + rad * math.cos(math.pi * k / 30), ry, 0.0 + rad * math.sin(math.pi * k / 30)) for k in range(31)]
        _curve("arch%d" % i, root, _principled("arch%d" % i, col, rough=0.55), arch, 0.075 * H)
    py = 0.42 * D
    px = 0.95 * vis.hw(py)
    pot = _principled("pot", "#e9dccb", rough=0.6)
    _lathe("pot", root, pot, px, py, [(0, 0), (0.3 * H, 0), (0.38 * H, 0.55 * H), (0.4 * H, 0.6 * H), (0, 0.6 * H)])
    leaf = _principled("plantleaf", "#6f9466", rough=0.5, spec=0.3)
    lv = []
    for k in range(11):
        a = k * 2.399963
        lv.append(((px, py, 0.55 * H), a, (0.45 + 0.2 * _hash01(k, 54)) * H, 0.16 * H, -0.3, 0, 0.45 + 0.3 * _hash01(k, 55)))
    _leaves("plant", root, leaf, lv)
    light((-1.2 * s, 0.0, 0.9 * s), (0, 0, 0.4 * H), 1.5, 0.8 * s, WARM_SOFT)
    light((0.3 * s, 0.25 * D, 1.0 * s), (0.0, 0.55 * D, 0.25 * s), 0.8, 1.4 * s, WARM_SOFT)


def _stage_nursery_rug(root, H, R, s, D, vis, light):
    """Playtime on the floor: a soft mint pile rug, chunky pastel wooden blocks
    (a little tower back right, one tumbled front left) and a stacking-ring toy
    back left, against a warm white wall; light from above right."""
    _ground(root, wood_material("floor", "#e6d2b6", "#c4a882", rough=0.5), s, D)
    rug = rug_material("rug", "#cfe3d8")
    _throw("rug", root, rug, vis, H, R, D, 0.012, back=0.55, seed=6.1, wl_scale=2.2)
    _box("wall", root, plaster_material("wall", "#f3eee7"), -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    bcols = ("#efc0bb", "#f5dfa0", "#bcd3e6", "#e0c49e", "#cbbfe0")
    by = 0.35 * D
    bx = 0.62 * vis.hw(by)
    b = 0.32 * H
    z = 0.05
    for i, (ox, oy, rz) in enumerate(((0.0, 0.0, 0.1), (0.55, 0.1, -0.15), (0.25, 0.0, 0.3))):
        zz = 0.05 if i < 2 else 0.05 + b
        if i == 2:
            ox = 0.28
        _rbox("block%d" % i, root, wood_material("block%d" % i, bcols[i], bcols[i], rough=0.5),
              bx + ox * H * 1.0 - b / 2, bx + ox * H * 1.0 + b / 2, by + oy * H - b / 2, by + oy * H + b / 2,
              zz, zz + b, 0.06 * H, rot_z=rz)
    y = -0.02 * s
    x = _beside(R, H, 0.2 * H, -1)
    ob = _rbox("block_f", root, wood_material("block_f", bcols[4], bcols[4], rough=0.5), x - b / 2, x + b / 2, y - b / 2, y + b / 2,
               0.0, b, 0.06 * H, rot_z=0.5)
    ob.location = (0, 0, 0.12)
    # stacking rings, back left
    ry = 0.55 * D
    rx = -0.6 * vis.hw(ry)
    wood = wood_material("ringbase", "#e2c69c", "#bf9b6c")
    _cyl("ring_base", root, wood, rx, ry, 0.0, 0.6 * H, 0.6 * H, 0.12 * H)
    _cyl("ring_peg", root, wood, rx, ry, 0.12 * H, 0.08 * H, 0.08 * H, 1.3 * H, seg=24)
    z = 0.12 * H
    for i, col in enumerate(("#bcd3e6", "#f5dfa0", "#efc0bb", "#cbbfe0")):
        rr = (0.48 - 0.08 * i) * H
        tube = 0.12 * H
        _ring("ring%d" % i, root, _principled("ring%d" % i, col, rough=0.45, spec=0.35), (rx, ry, z + tube), rr - tube, tube)
        z += 2 * tube
    _spheres("ring_top", root, wood, [(rx, ry, z + 0.12 * H)], 0.14 * H, subdiv=3)
    light((1.0 * s, 0.2 * s, 1.2 * s), (0, 0, 0.4 * H), 1.5, 0.9 * s, (1.0, 0.97, 0.93))
    light((-0.5 * s, 0.4 * D, 1.2 * s), (0.0, D, 0.25 * s), 0.9, 1.6 * s, (1.0, 0.98, 0.96))


# ---- christmas variants -------------------------------------------------

def _bokeh(root, D, H, vis, n, col, strength, near=0.55, salt=7.0, name="fairy_bg"):
    bulb = _emit_mat(name + "_m", col, strength)
    pts = []
    for kk in range(n):
        y = D - 1.0 - ((1 - near) * D) * _hash01(kk, salt) ** 2 if kk % 3 else near * D + 0.1 * D * _hash01(kk, salt)
        z = vis.zmid(y) + (vis.ztop(y) - vis.zmid(y) + 0.3 * H) * _hash01(kk, salt + 1)
        if z < 0.5:
            continue
        x = (2 * _hash01(kk, salt + 2) - 1) * 1.15 * vis.hw(y)
        pts.append((x, y, z, (0.06 + 0.04 * _hash01(kk, salt + 3)) * H))
    _spheres(name, root, bulb, pts, 0.07 * H, subdiv=3)


def _bauble(root, H, x, y, z, r, mat, cap, name):
    _spheres(name, root, mat, [(x, y, z)], r, subdiv=4)
    _cyl(name + "_cap", root, cap, x, y, z + r * 0.9, r * 0.22, r * 0.2, r * 0.25, seg=16)
    _ring(name + "_loop", root, cap, (x, y, z + r * 1.25), r * 0.1, r * 0.03, axis="y", n=16)


def _stage_christmas_baubles(root, H, R, s, D, vis, light):
    """A fir branch reaching in across the top of the frame hung with glass
    baubles (red, gold, champagne) on ribbon, the piece on a white faux-fur
    throw, deep green wall with gold bokeh; candle-warm key from the right."""
    _ground(root, wood_material("table", "#6e4c34", "#45301f"), s, D)
    fur = rug_material("fur", "#f4efe6", pile=35.0)
    _throw("fur", root, fur, vis, H, R, D, 0.03, back=0.45, seed=7.3, wl_scale=1.5)
    _box("wall", root, plaster_material("wall", "#4a5a46", mottle=0.08), -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    needle = _principled("needle", "#2b4a30", rough=0.6, spec=0.3)
    twig = _principled("twig", "#4e3626", rough=0.9)
    y1 = 0.18 * s
    zt = vis.ztop(y1)
    _pine_sprig("branch", root, needle, twig, (1.4 * vis.hw(y1), y1, zt + 0.1 * H), (-0.9 * vis.hw(y1), y1 - 1, zt - 0.25 * H), 0.25 * H, 0.33 * H, density=30)
    _pine_sprig("branch2", root, needle, twig, (1.4 * vis.hw(y1 + 4), y1 + 4, zt - 0.1 * H), (0.2 * vis.hw(y1), y1 + 3, zt - 0.45 * H), 0.1 * H, 0.3 * H)
    red = _principled("bred", "#a3161d", rough=0.12, spec=0.6, coat=0.8)
    gold = metal_material("#d8b25a")
    champ = _principled("bchamp", "#e8d9bd", rough=0.2, spec=0.6, coat=0.6)
    ribbon = _principled("ribbon", "#8e1a1f", rough=0.5, sheen=0.5)
    for i, (fx, drop, rr, m) in enumerate(((-0.7, 0.5, 0.17, red), (0.62, 0.42, 0.15, gold), (-0.2, 0.22, 0.11, champ), (1.0, 0.7, 0.14, red))):
        x = fx * vis.hw(y1)
        ztop_ = zt - 0.25 * H + (0.35 * H) * (fx + 0.9) / 2.3
        z = ztop_ - drop * H
        _curve("bthread%d" % i, root, ribbon, [(x, y1 - 0.5, ztop_), (x, y1 - 0.5, z + rr * H * 1.3)], 0.012 * H)
        _bauble(root, H, x, y1 - 0.5, z, rr * H, m, gold, "bauble%d" % i)
    # two baubles resting on the fur, front left and back right
    yf = -0.05 * s
    _bauble(root, H, _beside(R, H, 0.15 * H, -1), yf, 0.15 * H, 0.15 * H, gold, gold, "bauble_f")
    yb = 0.3 * s
    _bauble(root, H, 0.75 * vis.hw(yb), yb, 0.2 * H, 0.2 * H, red, gold, "bauble_b")
    _bokeh(root, D, H, vis, 120, (1.0, 0.76, 0.42), 40.0, salt=13.0)
    light((1.2 * s, -0.05 * s, 0.8 * s), (0, 0, 0.4 * H), 1.3, 0.7 * s, GOLD)
    light((0.0, 0.4 * D, 1.2 * s), (0.0, D, 0.25 * s), 0.3, 1.6 * s, (1.0, 0.82, 0.6))


def _stage_christmas_snow(root, H, R, s, D, vis, light):
    """A snowy night: a white knit throw on a pale sill, a window behind full of
    blue dusk and falling snow, frosted sprigs, and a candle in a glass holder
    glowing warm against the cold; cool moonlight from the window."""
    _ground(root, wood_material("sill_wood", "#e8e6e2", "#c8c4bc"), s, D)
    plaster = plaster_material("wall", "#d9dde3")
    frame = wood_material("window_frame", "#f1f1ee", "#cfd0cc", along_x=False, rough=0.6)
    out = sky_material("outside", ((0.0, (0.82, 0.86, 0.93)), (0.3, (0.40, 0.50, 0.70)), (0.75, (0.16, 0.22, 0.40))), 1.6, blob=0.35, speckle=0.9)
    w = _window_wall(root, H, s, D, vis, plaster, frame, out, -1.0, 1.0, rows=(0.5,), cols=4)
    # snow drifted along the outside bottom of the panes
    snow = _principled("snow", "#f7f9fc", rough=0.6, sheen=0.5)
    snow.node_tree.nodes["Principled BSDF"].inputs["Subsurface Weight"].default_value = 0.4
    _rbox("snowdrift", root, snow, w["wx0"], w["wx1"], w["fy0"] + 1.3, w["fy0"] + 5.0, w["wz0"], w["wz0"] + 0.5 * H, 0.2 * H)
    knit = knit_material("throw", "#f5f3ef", stitch_cm=1.7)
    _throw("throw", root, knit, vis, H, R, D, 0.045, back=0.32, seed=8.4)
    # falling snow in front of the glass: soft white specks at two depths
    flake = _emit_mat("flake", (0.95, 0.97, 1.0), 2.0)
    pts = []
    for k in range(90):
        y = D - 3 - 0.35 * D * _hash01(k, 61)
        z = vis.zmid(y) + (vis.ztop(y) - vis.zmid(y) + 0.3 * H) * _hash01(k, 62)
        if z < 0.6 * H:
            continue
        pts.append(((2 * _hash01(k, 63) - 1) * vis.hw(y), y, z, (0.025 + 0.025 * _hash01(k, 64)) * H))
    _spheres("flakes", root, flake, pts, 0.03 * H, subdiv=2)
    # frosted fir sprigs, left, and a silver bauble
    needle = _principled("frost_needle", "#7f9a8e", rough=0.6, spec=0.3)
    twig = _principled("twig", "#5a4030", rough=0.9)
    y1 = 0.15 * s
    _pine_sprig("pine_l", root, needle, twig, (-1.3 * vis.hw(y1), y1, 0.3 * H), (-0.62 * vis.hw(y1), y1 - 2, 0.2 * H), 0.05 * H, 0.28 * H)
    yf = -0.15 * s
    _pine_sprig("pine_f", root, needle, twig, (-1.3 * vis.hw(yf), yf, 0.2 * H), (-0.7 * vis.hw(yf), yf + 1, 0.12 * H), 0.03 * H, 0.26 * H)
    silver = metal_material("#cfd4da")
    _bauble(root, H, -0.5 * vis.hw(0.2 * s), 0.2 * s, 0.16 * H, 0.16 * H, silver, silver, "bauble_s")
    # a tea light in a small glass holder, back right (r1: a big grey bin)
    cy = 0.5 * D
    cx = 0.55 * vis.hw(cy)
    hs = 0.55
    wax = _principled("wax", "#f4ede0", rough=0.5, spec=0.2)
    wax.node_tree.nodes["Principled BSDF"].inputs["Subsurface Weight"].default_value = 0.4
    frost = glass_material("holder", "#fff8ee", rough=0.35)   # r3: frosted (clear glass went black)
    _lathe("holder", root, frost, cx, cy, [(0, 0), (0.38 * H * hs, 0), (0.42 * H * hs, 0.6 * H * hs),
                                                                         (0.39 * H * hs, 0.6 * H * hs), (0.35 * H * hs, 0.05 * H), (0, 0.05 * H)])
    _cyl("candle", root, wax, cx, cy, 0.05 * H, 0.3 * H * hs, 0.3 * H * hs, 0.3 * H * hs)
    flame = _emit_mat("flame", (1.0, 0.62, 0.22), 160.0)
    bm = bmesh.new()
    m = Matrix.Translation(Vector((cx, cy, 0.3 * H * hs + 0.12 * H))) @ Matrix.Diagonal((1.0, 1.0, 2.2, 1.0))
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=0.05 * H, matrix=m)
    _bm_object("flame", bm, root, flame, smooth=True)
    light((cx, cy, 0.4 * H), (cx - 2, cy - 5, 0.1 * H), 0.3, 0.3 * H, (1.0, 0.66, 0.3))
    light((0.2 * w["wx0"], D - 3, w["wz0"] + 0.5 * (w["wz1"] - w["wz0"])), (0, 0, 0.45 * H), 1.4, 1.0 * s, (0.80, 0.88, 1.0))
    light((-0.8 * s, -0.2 * s, 0.8 * s), (0, 0, 0.4 * H), 0.4, 1.0 * s, WARM_SOFT)


def _gift(root, H, x, y, w, d, h, paper, ribbon, name, rot=0.0, bow=True):
    _rbox(name, root, paper, x - w / 2, x + w / 2, y - d / 2, y + d / 2, 0.0, h, 0.02 * H, rot_z=rot)
    rw = 0.09 * H
    _rbox(name + "_rx", root, ribbon, x - w / 2 - 0.01, x + w / 2 + 0.01, y - rw / 2, y + rw / 2, -0.01, h + 0.012 * H, 0.01 * H, rot_z=rot)
    _rbox(name + "_ry", root, ribbon, x - rw / 2, x + rw / 2, y - d / 2 - 0.01, y + d / 2 + 0.01, -0.01, h + 0.012 * H, 0.01 * H, rot_z=rot)
    if bow:
        for side in (1, -1):
            c, sn = math.cos(rot), math.sin(rot)
            lx = side * 0.12 * H
            pts = [(x + lx * 0.2 * c, y + lx * 0.2 * sn, h + 0.03 * H), (x + lx * c, y + lx * sn, h + 0.14 * H),
                   (x + lx * 1.3 * c, y + lx * 1.3 * sn, h + 0.05 * H), (x + lx * 0.2 * c, y + lx * 0.2 * sn, h + 0.03 * H)]
            _curve(name + "_bow%d" % side, root, ribbon, pts, 0.04 * H)


def _stage_christmas_gifts(root, H, R, s, D, vis, light):
    """Christmas morning: presents in kraft paper and red-and-cream stripes tied
    with red ribbon and twine, a plaid wool blanket under the piece, warm bokeh
    on a cream wall; morning-gold key from the left."""
    _ground(root, wood_material("floor", "#a77f58", "#6e4d33"), s, D)
    plaid = gingham_material("plaid", "#ece3d3", "#b25a55", check_cm=3.2)
    _throw("plaid", root, plaid, vis, H, R, D, 0.05, back=0.42, seed=9.1, wl_scale=1.6)
    _box("wall", root, plaster_material("wall", "#e8dcc8", mottle=0.06), -3 * s, 3 * s, D, D + 3, 0, 2.5 * s)
    kraft = _principled("kraft", "#a88c6c", rough=0.75)
    stripe = gingham_material("stripe", "#f3ece0", "#c0333a", check_cm=0.5)
    red = _principled("gribbon", "#a8161f", rough=0.35, sheen=0.4, spec=0.4)
    twine = _principled("gtwine", "#e9dcc4", rough=0.9)
    gy = 0.5 * D
    gx = 0.7 * vis.hw(gy)
    _gift(root, H, gx, gy, 0.8 * H, 0.7 * H, 0.55 * H, kraft, red, "gift1", rot=0.15)
    _gift(root, H, gx + 0.05 * H, gy + 0.05 * H, 0.5 * H, 0.45 * H, 0.38 * H, stripe, twine, "gift2", rot=-0.3)
    for ob in [o for o in bpy.data.objects if o.name.startswith("gift2")]:
        ob.location.z += 0.55 * H
    gy2 = 0.65 * D
    _gift(root, H, -0.75 * vis.hw(gy2), gy2, 0.9 * H, 0.75 * H, 0.75 * H, stripe, red, "gift3", rot=-0.1)
    yf = 0.02 * s
    _gift(root, H, _beside(R, H, 0.22 * H, -1), yf, 0.38 * H, 0.38 * H, 0.3 * H, kraft, twine, "gift4", rot=0.5)
    # a sprig with berries on the little gift
    needle = _principled("needle", "#294a2f", rough=0.6, spec=0.3)
    twig = _principled("twig", "#5a4030", rough=0.9)
    x4 = _beside(R, H, 0.22 * H, -1)
    _pine_sprig("gsprig", root, needle, twig, (x4 - 0.15 * H, yf, 0.34 * H), (x4 + 0.15 * H, yf - 0.08 * H, 0.36 * H), 0.0, 0.09 * H, density=18)
    _spheres("gberries", root, _principled("berry", "#ad1c22", rough=0.18, spec=0.5, coat=0.5),
             [(x4 + 0.03 * H * k, yf - 0.05 * H, 0.38 * H + 0.02 * H * (k % 2), 0.03 * H) for k in range(3)], 0.03 * H)
    _bokeh(root, D, H, vis, 90, (1.0, 0.74, 0.42), 40.0, near=0.7, salt=17.0)
    light((-1.2 * s, 0.0, 0.9 * s), (0, 0, 0.4 * H), 1.4, 0.7 * s, GOLD)
    light((0.0, 0.4 * D, 1.2 * s), (0.0, D, 0.25 * s), 0.5, 1.6 * s, (1.0, 0.85, 0.65))


VARIANT_BUILDERS = {
    "basket": (_stage_linen_basket, (0.98, 0.93, 0.86), 0.45),
    "worktable": (_stage_linen_worktable, (0.97, 0.95, 0.92), 0.5),
    "dried": (_stage_linen_dried, (0.99, 0.93, 0.90), 0.45),
    "rain": (_stage_windowsill_rain, (0.86, 0.90, 0.95), 0.6),
    "autumn": (_stage_windowsill_autumn, (0.98, 0.86, 0.70), 0.35),
    "spring": (_stage_windowsill_spring, (0.94, 0.97, 1.0), 0.55),
    "cot": (_stage_nursery_cot, (0.96, 0.97, 0.99), 0.55),
    "shelf": (_stage_nursery_shelf, (0.97, 0.96, 0.92), 0.45),
    "rug": (_stage_nursery_rug, (0.99, 0.97, 0.95), 0.5),
    "baubles": (_stage_christmas_baubles, (0.9, 0.78, 0.62), 0.2),
    "snow": (_stage_christmas_snow, (0.70, 0.78, 0.92), 0.35),
    "gifts": (_stage_christmas_gifts, (0.95, 0.84, 0.70), 0.3),
}


# ---- PHOTO V2 (job stage2): the "photo is flat" fix ------------------------
#
# Every bar photo is shot the way a person shoots a toy by a window: ONE soft
# window key from the side with warm highlights and soft-edged shadows, a gentle
# fill on the far side, a little rim on the contour, a wide aperture that melts
# the room into creamy bokeh while the toy's face stays sharp, a slight turn and
# an eye line at the toy's face, and real props (an airy dried bunch, a softly
# crumpled cloth the toy settles into).
#
# `view.photo: "v2"` turns all of it on; each part is its own knob (a knob set
# on the view wins over the v2 default). Absent = the stage exactly as before.
#   photoLight      "window" | "stage"      the window key rig (v2 "window")
#   photoKey        key strength, x the studio key at the piece   (1.6)
#   photoKeyDeg     key azimuth: 0 = from the camera, 90 = camera left,
#                   180 = from behind; negative = camera right    (80)
#   photoKeyElev    key elevation (deg)                           (30)
#   photoKeySoft    key size / its distance (softness)            (0.55)
#   photoKeySpread  key spread (deg): narrower keeps it off the wall  (70)
#   photoFill       fill strength (the far side)                  (0.15)
#   photoRim        rim strength (behind, the key's side)         (0.9)
#   photoSetLight   x the stage's own lights (window glow, wall)  (0.2)
#   photoStudio     x the studio key/fill kept on the toy         (0.15)
#   photoAmbient    x the world strength                          (0.4)
#   photoExposure   added to the stage exposure                   (0.0)
#   photoFstop      a REAL f-number (f/5.6 -> 0.056 in Blender)   (5.6)
#   photoFocus      "face" | "centre"   focus on the eyes / centre ("face")
#   photoCamera     "threequarter" | "stage"                      ("threequarter")
#   photoYawDeg     the turn, added to the scene's yaw; nursery 6     (16)
#   photoTiltDeg    camera tilt (90 = level; stage = 80); the cow bar
#                   looks down ~13 deg onto the cloth             (77)
#   photoFrame      the piece's height as a fraction of the frame height;
#                   the camera moves along its line to hold it (0 = the
#                   stage's own zoom). The cow bar ~0.7, the bunny ~0.8 (0.68)
#   photoAim        aim height, a fraction of the piece height    (0.5)
#   photoProps      "v2" | "v1"   dried bunch v2, spring jug fix  ("v2")
#   photoBlanket    "auto" | "knit" | "linen" | "none"            ("auto")
#                   auto = the stage's own cloth, softly crumpled
#   photoCrumple    crumple depth, x piece height                 (0.09)
PHOTO_V2 = dict(
    photoLight="window", photoKey=1.6, photoKeyDeg=80.0, photoKeyElev=30.0, photoKeySoft=0.55, photoKeySpread=70.0,
    photoFill=0.15, photoRim=0.9, photoSetLight=0.2, photoStudio=0.15, photoAmbient=0.4,
    photoExposure=0.0, photoFstop=5.6, photoFocus="face", photoCamera="threequarter",
    photoYawDeg=16.0, photoTiltDeg=77.0, photoFrame=0.68, photoAim=0.5,
    photoProps="v2", photoBlanket="auto", photoCrumple=0.09,
)
# The same knobs with v2 OFF: every one is a no-op, so a scene without
# `photo` renders exactly as before.
PHOTO_V1 = dict(
    photoLight="stage", photoKey=2.4, photoKeyDeg=75.0, photoKeyElev=28.0, photoKeySoft=0.55, photoKeySpread=70.0,
    photoFill=0.3, photoRim=0.9, photoSetLight=0.4, photoStudio=0.3, photoAmbient=1.0,
    photoExposure=0.0, photoFstop=None, photoFocus="centre", photoCamera="stage",
    photoYawDeg=16.0, photoTiltDeg=77.0, photoFrame=0.0, photoAim=0.5,
    photoProps="v1", photoBlanket="none", photoCrumple=0.045,
)

# photoFrame per stage when the view does not set it (the bunny bar fills
# the frame far more than the cow bar does)
PHOTO_FRAME_BY = {"nursery": 0.82, "christmas": 0.74, "linen": 0.72, "windowsill": 0.68}
# and its turn: the bunny bar is shot nearly square-on, the cow bar turned a little
PHOTO_YAW_BY = {"nursery": 6.0}

# What the set builders consult while a stage is built (reset per render).
_PHOTO = {}


def photo_opts(view):
    v2 = view.get("photo") == "v2"
    base = PHOTO_V2 if v2 else PHOTO_V1
    po = {k: view.get(k, v) for k, v in base.items()}
    if v2 and "photoFrame" not in view:
        po["photoFrame"] = PHOTO_FRAME_BY.get(view.get("stage"), po["photoFrame"])
    if v2 and "photoYawDeg" not in view:
        po["photoYawDeg"] = PHOTO_YAW_BY.get(view.get("stage"), po["photoYawDeg"])
    return po


def photo_camera_view(view, v):
    """Camera part of v2, applied inside stage_view (before main reads it)."""
    po = photo_opts(view)
    if po["photoCamera"] != "threequarter":
        return v
    v["yawDeg"] = view.get("yawDeg", 0.0) + po["photoYawDeg"]
    if "stageTiltDeg" not in view:
        v["tiltDeg"] = po["photoTiltDeg"]
    v["aimHeightFrac"] = max(view.get("aimHeightFrac", 0.0), po["photoAim"])
    return v


def face_point(data, z_offset, cx, cy, yaw):
    """Where the toy's face is (world BU), for the focus: the mean of the
    notions (safety eyes, nose) in the top half of the piece; failing that,
    the most camera-facing yarn in the face band (60-90% of the height)."""
    props = [p for p in (data.get("props") or []) if not p.get("branch") and p.get("torusMinor") is None]
    zs = [pt[2] for st in data["strokes"] for poly in st["filaments"] for pt in poly[::4]]
    if not zs:
        return None
    zmax = max(zs)
    top = [p for p in props if p["centre"][2] >= 0.55 * zmax]
    if top:
        n = len(top)
        x = sum(p["centre"][0] for p in top) / n
        y = sum(p["centre"][1] for p in top) / n
        z = sum(p["centre"][2] for p in top) / n
        return (x * S, -y * S, z * S + z_offset)
    sx, sy = math.sin(yaw), -math.cos(yaw)       # toward the camera
    band = []
    for st in data["strokes"]:
        for poly in st["filaments"]:
            for pt in poly[::4]:
                if 0.6 * zmax <= pt[2] <= 0.9 * zmax:
                    bx, by = pt[0] * S, -pt[1] * S
                    band.append(((bx - cx) * sx + (by - cy) * sy, bx, by, pt[2] * S + z_offset))
    if not band:
        return None
    band.sort(reverse=True)
    best = band[:max(1, len(band) // 50)]
    n = len(best)
    return (sum(b[1] for b in best) / n, sum(b[2] for b in best) / n, sum(b[3] for b in best) / n)


def footprint_polar(data, cx, cy, yaw, bins=48):
    """The piece's footprint as the farthest yarn in each of `bins` directions
    round its centre, in the STAGE frame (turned with the camera's yaw), so a
    prop can lie right up to the piece without touching it."""
    out = [0.0] * bins
    c, s_ = math.cos(-yaw), math.sin(-yaw)
    for st in data["strokes"]:
        for poly in st["filaments"]:
            for pt in poly[::3]:
                x, y = pt[0] * S - cx, -pt[1] * S - cy
                lx, ly = x * c - y * s_, x * s_ + y * c
                k = int((math.atan2(ly, lx) / (2 * math.pi) + 0.5) * bins) % bins
                r = math.hypot(lx, ly)
                if r > out[k]:
                    out[k] = r
    return out


# r3: a warm window key between WARM and GOLD (full GOLD pushed the brown
# chenille orange)
KEY_V2 = (1.0, 0.88, 0.74)


def _photo_lights(view, po, root, H, R, s, light, set_lights, studio_lights, scene):
    """The window rig: one soft warm key from the side, a broad dim fill on the
    far side, a small rim from behind on the key's side. The stage's own
    lights stay on (they light the room) but eased, the studio key/fill too."""
    for lt in set_lights:
        lt.data.energy *= po["photoSetLight"]
    for lt in studio_lights:
        lt.data.energy *= po["photoStudio"]
    aim = (0.0, 0.0, 0.55 * H)
    r = 0.75 * s

    def at(az_deg, el_deg, dist):
        # az measured from the camera direction (-Y local), positive = camera left
        a = math.radians(az_deg)
        e = math.radians(el_deg)
        return (-dist * math.cos(e) * math.sin(a), -dist * math.cos(e) * math.cos(a), aim[2] + dist * math.sin(e))
    made = []
    key = light(at(po["photoKeyDeg"], po["photoKeyElev"], r), aim, po["photoKey"], po["photoKeySoft"] * r, KEY_V2)
    made.append(key)
    try:
        # r5: a window's light falls on the toy and the sill in front of it,
        # not across the whole room: narrow the key's spread so the wall
        # behind stays in its own (dimmer) light and the toy stands out
        key.data.spread = math.radians(po["photoKeySpread"])
    except Exception:
        pass
    if po["photoFill"] > 0:
        side = -1.0 if po["photoKeyDeg"] >= 0 else 1.0
        made.append(light(at(side * 45.0, 12.0, 1.1 * r), aim, po["photoFill"], 1.4 * r, (1.0, 0.97, 0.94)))
    if po["photoRim"] > 0:
        side = 1.0 if po["photoKeyDeg"] >= 0 else -1.0
        made.append(light(at(side * 150.0, 42.0, 0.8 * r), (0.0, 0.0, 0.7 * H), po["photoRim"], 0.22 * r, GOLD))
    for ob in made:
        try:
            ob.visible_camera = False
        except Exception:
            pass
    return made


def _crumple(H, R, amp, seed=0.0):
    """Soft crumples on top of the stage's folds: ridged Perlin creases at three
    scales (a cloth balled in a hand and shaken out), flat under the piece, and
    a low soft bunching ring round it where the toy's weight presses in."""
    from mathutils import noise
    if amp <= 0:
        return lambda x, y: 0.0
    o = Vector((seed * 7.1, seed * 3.3, seed * 1.7))

    def h(x, y):
        r = math.hypot(x, y * 1.1)
        m = _smoothstep(R * 1.08, R * 1.08 + 0.55 * H, r)
        ring = 0.012 * H * math.exp(-((r - R * 1.18) / (0.12 * H)) ** 2)
        if m <= 0.0:
            return ring
        f = 0.0
        # r3: creases, not dunes — each layer is ridged noise stretched ~3:1
        # along its own direction (and gently warped so the creases curve),
        # the sharp crest of a fold with soft slopes either side
        wx = noise.noise(Vector((x / (0.9 * H), y / (0.9 * H), 1.7)) + o)
        wy = noise.noise(Vector((x / (0.9 * H), y / (0.9 * H), 4.1)) + o)
        xw, yw = x + 0.25 * H * wx, y + 0.25 * H * wy
        for ang, wl, w in ((0.4, 0.5, 1.0), (1.9, 0.32, 0.7), (2.8, 0.2, 0.4), (1.1, 0.12, 0.2)):
            ca, sa = math.cos(ang + seed), math.sin(ang + seed)
            u = xw * ca + yw * sa
            v = -xw * sa + yw * ca
            q = Vector((u / (wl * H * 2.6), v / (wl * H * 0.85), 0.37 + ang)) + o
            n = noise.noise(q)
            f += w * ((1.0 - abs(n)) ** 3 - 0.3)
        return ring + amp * H * m * f
    return h


def _bunch_v2(root, H, R, vis, ground, foot=None):
    """The cow bar's dried bunch, built from real thin parts: ~70 wiry stems
    tied with twine behind the piece's left shoulder, the heads fanning forward
    and left over the cloth — lavender spikes of tiny florets, chamomile
    (white petal fans round a domed yellow eye), wheat ears with awns, mauve
    statice puffs, feathery grass wisps and a haze of gypsophila. Every point
    is kept clear of the piece's footprint."""
    rng_k = [0]

    def rnd(salt):
        rng_k[0] += 1
        return _hash01(rng_k[0], salt)
    keep = R * 1.28 + 0.04 * H

    def keep_at(x, y):
        if not foot:
            return keep
        nb = len(foot)
        k = int((math.atan2(y, x) / (2 * math.pi) + 0.5) * nb) % nb
        # the widest of this bin and its neighbours, plus a finger's gap
        return max(foot[(k - 1) % nb], foot[k], foot[(k + 1) % nb]) + 0.05 * H

    def clear(p):
        d = math.hypot(p[0], p[1])
        kr = keep_at(p[0], p[1])
        if d < kr:
            f = kr / max(d, 1e-6)
            return (p[0] * f, p[1] * f, p[2])
        return p

    def on(x, y, lift):
        return clear((x, y, ground(x, y) + lift))
    stem_cols = ("#8c8a5c", "#9c9466", "#7f7f55", "#a59a6c")
    mats = dict(
        stem=[_principled("b2_stem%d" % i, c, rough=0.75) for i, c in enumerate(stem_cols)],
        lav=_principled("b2_lav", "#7c6a9c", rough=0.8, sheen=0.4),
        lav2=_principled("b2_lav2", "#9583b4", rough=0.8, sheen=0.4),
        petal=_principled("b2_petal", "#f4efe3", rough=0.7, sheen=0.3),
        eye=_principled("b2_eye", "#dcaa3a", rough=0.8),
        wheat=_principled("b2_wheat", "#d8bf88", rough=0.7, sheen=0.2),
        awn=_principled("b2_awn", "#cdb27a", rough=0.7),
        puff=_principled("b2_puff", "#a585a6", rough=0.9, sheen=0.3),
        plume=_principled("b2_plume", "#d4c29c", rough=0.9, sheen=0.5),
        gyp=_principled("b2_gyp", "#f7f3ea", rough=0.9),
    )
    for m in (mats["petal"], mats["plume"]):
        b = m.node_tree.nodes["Principled BSDF"]
        set_in(b, "Subsurface Weight", 0.2)
    curves = {}      # mat key -> list of (pts, radius)
    ells = {}        # mat key -> list of (centre, u, a, b, c)

    def add_curve(key, pts, rad):
        curves.setdefault(key, []).append((pts, rad))

    def add_ell(key, c, u, a, b, cc=None):
        ells.setdefault(key, []).append((c, u, a, b, b if cc is None else cc))
    # the tie, behind the piece's left shoulder; heads fan forward-left
    # (the square listing frame leaves ~15% beside the piece, so the bunch runs
    # from BEHIND the left shoulder out to the frame's front-left corner)
    tx, ty = -0.75 * R, 1.35 * R
    gy = max(-1.3 * R, vis.y_near() + 0.15 * H)
    gx = -0.72 * vis.hw(gy)
    a0 = math.atan2(gy - ty, gx - tx)
    reach = math.hypot(gx - tx, gy - ty)
    ax, ay = math.cos(a0), math.sin(a0)
    px, py = -ay, ax
    N = 130
    kinds = ["lav"] * 36 + ["cham"] * 26 + ["wheat"] * 22 + ["puff"] * 12 + ["wisp"] * 22 + ["gyp"] * 12
    for kk in range(N):
        kind = kinds[(kk * 37) % len(kinds)]
        lane = (rnd(1) * 2 - 1)
        L = (0.45 + 0.65 * rnd(2)) * reach
        tail = (0.3 + 0.3 * rnd(3)) * H
        fan = lane * (0.05 + 0.42 * rnd(4)) - 0.08   # angular spread of the heads (biased away from the piece)
        ca, sa = math.cos(fan), math.sin(fan)
        dx, dy = ax * ca - ay * sa, ay * ca + ax * sa
        stack = 0.06 * H * (1.0 - abs(lane)) + 0.02 * H * rnd(5)
        pts = []
        M = 14
        for j in range(M + 1):
            t = -tail / L + (1 + tail / L) * j / M      # <0 = the cut ends behind the tie
            w = 0.06 * H * lane * max(0.0, t) ** 1.4     # the fan opens past the tie
            bow = 0.03 * H * math.sin(math.pi * max(0.0, min(1.0, t))) * (rnd(6) - 0.3)
            x = tx + dx * L * t + px * (lane * 0.025 * H + w + bow)
            y = ty + dy * L * t + py * (lane * 0.025 * H + w + bow)
            lift = stack * (1.0 - 0.3 * max(0.0, t)) + 0.008 * H + 0.12 * H * math.sin(math.pi * 0.5 * max(0.0, t)) * (0.4 + 0.6 * rnd(7))
            pts.append(on(x, y, lift))
        add_curve(("stem", kk % 4), pts, 0.0032 * H * (0.8 + 0.4 * rnd(8)))
        tip = Vector(pts[-1])
        pre = Vector(pts[-3])
        u = (tip - pre)
        u.z *= 0.3          # r4: heads lie along the cloth (a keep-out push could stand a spike on end)
        u = u.normalized()
        side = Vector((-u.y, u.x, 0.0)).normalized()
        up = u.cross(side).normalized()
        if up.z < 0:
            up = -up
        if kind == "lav":
            spike = (0.17 + 0.08 * rnd(9)) * H
            nw = 11
            for q in range(nw):
                c = tip - u * spike * (1.0 - q / (nw - 1))
                rr = 0.0095 * H * (0.65 + 0.35 * math.sin(math.pi * (q + 1) / (nw + 1)))
                for f in range(4):
                    ang = q * 1.3 + f * math.pi / 2
                    off = side * math.cos(ang) + up * math.sin(ang)
                    fl = (c + off * rr * 0.8 + up * 0.002 * H)
                    add_ell("lav" if (q + f + kk) % 3 else "lav2", fl, (u * 0.6 + off * 0.8).normalized(),
                            0.008 * H, 0.0042 * H)
        elif kind == "cham":
            # 2-3 heads on short pedicels branching off the top
            nh = 2 + int(rnd(10) * 2)
            for hh in range(nh):
                base = tip - u * (0.04 + 0.05 * hh) * H
                br = (u + side * (0.9 if hh % 2 else -0.9) * (0.4 + 0.4 * rnd(11))).normalized()
                c = base + br * (0.035 + 0.02 * rnd(12)) * H + Vector((0, 0, 0.012 * H))
                add_curve(("stem", (kk + hh) % 4), [tuple(base), tuple(c)], 0.0022 * H)
                face = (Vector((0.0, -0.45, 1.0)) + br * 0.3).normalized()
                fs = face.cross(Vector((1, 0, 0))).normalized()
                ft = face.cross(fs).normalized()
                hr = (0.022 + 0.008 * rnd(13)) * H
                add_ell("eye", c + face * 0.0045 * H, face, 0.006 * H, 0.0105 * H, 0.0105 * H)
                npet = 13
                for pp in range(npet):
                    ang = 2 * math.pi * pp / npet + rnd(14) * 0.2
                    d = (fs * math.cos(ang) + ft * math.sin(ang))
                    pc = c + d * hr * 0.62 - face * 0.002 * H
                    add_ell("petal", pc, (d - face * 0.25).normalized(), hr * 0.42, 0.0042 * H, 0.0011 * H)
        elif kind == "wheat":
            ear = (0.12 + 0.04 * rnd(15)) * H
            ng = 16
            for g in range(ng):
                c = tip - u * ear * (1.0 - g / (ng - 1))
                sgn = 1 if g % 2 else -1
                gd = (u * 0.8 + side * sgn * 0.45 + up * 0.2).normalized()
                gc = c + side * sgn * 0.004 * H
                add_ell("wheat", gc, gd, 0.011 * H, 0.005 * H)
                if g > 3:
                    aw = [tuple(gc + gd * 0.008 * H), tuple(gc + gd * 0.05 * H + up * 0.006 * H),
                          tuple(gc + gd * 0.09 * H + up * 0.004 * H)]
                    add_curve("awn", aw, 0.0007 * H)
        elif kind == "puff":
            c0 = tip + up * 0.006 * H
            for b in range(3):
                cb = c0 - u * 0.03 * H * b + side * 0.015 * H * (rnd(16) - 0.5)
                for f in range(16):
                    v = Vector((rnd(17) - 0.5, rnd(18) - 0.5, rnd(19) - 0.5)).normalized()
                    add_ell("puff", cb + v * 0.011 * H, v, 0.0045 * H, 0.0038 * H)
        elif kind == "wisp":
            for f in range(14):
                st0 = tip - u * 0.06 * H * rnd(20)
                d = (u + side * (rnd(21) - 0.5) * 1.4 + up * (rnd(22) - 0.2) * 0.8).normalized()
                ln = (0.03 + 0.05 * rnd(23)) * H
                add_curve("plume", [tuple(st0), tuple(st0 + d * ln * 0.5 + up * 0.004 * H), tuple(st0 + d * ln)],
                          0.0011 * H)
        else:  # gypsophila: a wiry branching spray of tiny white dots
            for b in range(6):
                st0 = tip - u * 0.08 * H * rnd(24)
                d = (u + side * (rnd(25) - 0.5) * 1.6 + up * rnd(26) * 0.6).normalized()
                e = st0 + d * (0.04 + 0.04 * rnd(27)) * H
                add_curve(("stem", 1), [tuple(st0), tuple(e)], 0.0012 * H)
                for f in range(5):
                    v = Vector((rnd(28) - 0.5, rnd(29) - 0.5, rnd(30))).normalized()
                    add_ell("gyp", e + v * 0.008 * H, v, 0.0035 * H, 0.0035 * H)
    # build: one curve object / one mesh per material
    for key, items in curves.items():
        mat = mats["stem"][key[1]] if isinstance(key, tuple) else mats[key]
        cu = bpy.data.curves.new("b2_%s" % (key if isinstance(key, str) else "stem%d" % key[1]), type="CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = 1.0
        cu.bevel_resolution = 1
        cu.use_fill_caps = True
        for pts, rad in items:
            sp = cu.splines.new("POLY")
            sp.points.add(len(pts) - 1)
            for i, p in enumerate(pts):
                sp.points[i].co = (p[0], p[1], p[2], 1.0)
                sp.points[i].radius = rad
        ob = bpy.data.objects.new(cu.name, cu)
        bpy.context.scene.collection.objects.link(ob)
        ob.parent = root
        ob.data.materials.append(mat)
    for key, items in ells.items():
        bm = bmesh.new()
        for c, u, a, b, cc in items:
            u = Vector(u).normalized()
            v = u.cross(Vector((0, 0, 1)))
            if v.length < 1e-4:
                v = u.cross(Vector((1, 0, 0)))
            v.normalize()
            w = u.cross(v).normalized()
            m = Matrix(((u.x * a, v.x * b, w.x * cc, c[0]),
                        (u.y * a, v.y * b, w.y * cc, c[1]),
                        (u.z * a, v.z * b, w.z * cc, c[2]),
                        (0, 0, 0, 1)))
            bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0, matrix=m)
        _bm_object("b2_" + key, bm, root, mats[key], smooth=True)
    # the twine: four turns round the waist, a short loose end
    twine = _principled("b2_twine", "#b39a6c", rough=0.9)
    pts = []
    rb = 0.045 * H
    g0 = ground(tx, ty)
    for i in range(49):
        t = i / 48.0
        ang = t * 4 * 2 * math.pi
        along = (t - 0.5) * 0.05 * H
        pts.append(clear((tx + ax * along + px * rb * math.cos(ang), ty + ay * along + py * rb * math.cos(ang),
                          g0 + 0.035 * H + rb * 0.7 * math.sin(ang))))
    pts.append(on(pts[-1][0] - 0.05 * H, pts[-1][1] - 0.07 * H, 0.004 * H))
    pts.append(on(pts[-1][0] - 0.04 * H, pts[-1][1] - 0.1 * H, 0.003 * H))
    _curve("b2_tie", root, twine, pts, 0.0045 * H)
    print("[photo] bunch v2: %d stems, tie (%.1f, %.1f), heads to (%.1f, %.1f), footprint %s" % (
        N, tx, ty, gx, gy, "polar" if foot else "r %.1f" % keep))


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
