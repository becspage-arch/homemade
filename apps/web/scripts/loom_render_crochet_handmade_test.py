"""Unit tests for the handmade yarn switches in loom_render_crochet.py (the
pure-numpy parts; Blender is stubbed, so this runs with plain python3).

    python3 apps/web/scripts/loom_render_crochet_handmade_test.py
"""
import math
import os
import sys
import types
import unittest

sys.modules.setdefault("bpy", types.ModuleType("bpy"))
mu = types.ModuleType("mathutils")
mu.Matrix = object
mu.Vector = object
sys.modules.setdefault("mathutils", mu)
sys.modules.setdefault("bmesh", types.ModuleType("bmesh"))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np  # noqa: E402
# the renderer calls main() at import (Blender runs it as a script), so load
# its source without that last call
_src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "loom_render_crochet.py")
R = types.ModuleType("loom_render_crochet")
R.__file__ = _src
_code = open(_src).read()
_code = _code[:_code.rindex("\nmain()")]
exec(compile(_code, _src, "exec"), R.__dict__)


def helix(n=400, r=10.0, pitch=2.0):
    return [(r * math.cos(t), r * math.sin(t), pitch * t) for t in np.linspace(0, 12 * math.pi, n)]


class HandmadeParams(unittest.TestCase):
    def test_off_is_the_same_dict(self):
        for fibre, fp in R.FIBRE_PARAMS.items():
            self.assertIs(R.handmade_params(fp), fp, fibre)
            self.assertIs(R.handmade_params(dict(fp, handmade=0)).get("hm_jitter", 0), 0, fibre)

    def test_switch_turns_every_knob_on_and_scales(self):
        full = R.handmade_params(dict(R.FIBRE_PARAMS["chenille"], handmade=1))
        half = R.handmade_params(dict(R.FIBRE_PARAMS["chenille"], handmade=0.5))
        for k, v in R.HANDMADE_PRESET.items():
            self.assertGreater(full[k], 0, k)
            self.assertAlmostEqual(half[k], v * 0.5, msg=k)
        for k, v in R.HANDMADE_FIXED.items():
            self.assertEqual(full[k], v)

    def test_explicit_knob_wins(self):
        fp = R.handmade_params(dict(R.FIBRE_PARAMS["cotton"], handmade=1, hm_jitter=0.0, hm_halo=0.9))
        self.assertEqual(fp["hm_jitter"], 0.0)
        self.assertEqual(fp["hm_halo"], 0.9)

    def test_presets_inside_their_ranges(self):
        rng = dict(hm_jitter=0.5, hm_loft=0.5, hm_tension=0.3, hm_heather=1, hm_drift=1, hm_crevice=1,
                   hm_velvet=1, hm_nap=1, hm_ripple=1, hm_loop_twist=1, hm_loop_pile=3, hm_pale_pile=1, hm_halo=1, hm_fleck=0.5)
        for k, v in R.HANDMADE_PRESET.items():
            self.assertTrue(0 < v <= rng[k], k)


class Noise(unittest.TestCase):
    def test_deterministic_bounded_and_seeded(self):
        P = np.random.default_rng(3).uniform(-50, 50, (5000, 3))
        a = R.hm_noise(P, 4.0, 17)
        self.assertTrue(np.array_equal(a, R.hm_noise(P, 4.0, 17)))
        self.assertLessEqual(np.abs(a).max(), 1.0)
        self.assertGreater(a.std(), 0.2)
        self.assertFalse(np.allclose(a, R.hm_noise(P, 4.0, 18)))

    def test_smooth_at_stitch_scale(self):
        t = np.linspace(0, 40, 4001)
        P = np.stack([t, 0.3 * t, 0.1 * t], axis=1)
        a = R.hm_noise(P, 4.0, 5)
        step = np.abs(np.diff(a)).max()
        self.assertLess(step, 0.05)          # 0.01 mm apart: no jumps, the strand never tears


class Displace(unittest.TestCase):
    def test_off_leaves_points_alone(self):
        poly = helix()
        out, rf = R.hm_displace([poly], 1.0, {})
        self.assertTrue(np.allclose(np.array(out[0]), np.array(poly)))
        self.assertTrue(np.allclose(rf[0], 1.0))

    def test_amplitudes_bounded_by_the_knobs(self):
        fp = R.handmade_params({"handmade": 1})
        r = 1.3
        poly = helix()
        out, rf = R.hm_displace([poly], r, fp, ripple=True)
        d = np.linalg.norm(np.array(out[0]) - np.array(poly), axis=1)
        bound = r * (math.sqrt(3) * fp["hm_jitter"] + fp["hm_loft"] + 0.5 * fp["hm_tension"])
        self.assertLessEqual(d.max(), bound + 1e-9)
        self.assertGreater(d.max(), 0.05 * r)
        rf = np.array(rf[0])
        self.assertLessEqual(rf.max(), (1 + fp["hm_tension"]) * (1 + 0.09 * fp["hm_ripple"]) + 1e-9)
        self.assertGreaterEqual(rf.min(), (1 - fp["hm_tension"]) * (1 - 0.09 * fp["hm_ripple"]) - 1e-9)

    def test_wobble_off_by_default_and_slow_when_on(self):
        # hm_wobble is not in the preset: handmade 1 alone never sets it
        fp = R.handmade_params({"handmade": 1})
        self.assertEqual(R.hm_amt(fp, "hm_wobble"), 0)
        poly = helix()
        base, _ = R.hm_displace([poly], 1.0, {"hm_jitter": 0.0})
        self.assertTrue(np.allclose(np.array(base[0]), np.array(poly)))
        out, rf = R.hm_displace([poly], 1.0, {"hm_wobble": 0.6})
        d = np.linalg.norm(np.array(out[0]) - np.array(poly), axis=1)
        self.assertLessEqual(d.max(), 0.6 * math.sqrt(3) + 1e-9)
        self.assertGreater(d.max(), 0.05)
        self.assertTrue(np.allclose(rf[0], 1.0))
        # slower than the stitch jitter: neighbouring points barely differ
        step = np.linalg.norm(np.diff(np.array(out[0]) - np.array(poly), axis=0), axis=1)
        jit, _ = R.hm_displace([poly], 1.0, {"hm_jitter": 0.6})
        jstep = np.linalg.norm(np.diff(np.array(jit[0]) - np.array(poly), axis=0), axis=1)
        self.assertLess(step.max(), 0.5 * jstep.max())

    def test_loop_mult_and_wobble_are_not_in_the_preset(self):
        fp = R.handmade_params(dict(R.FIBRE_PARAMS["chenille"], handmade=1))
        self.assertNotIn("hm_loop_mult", fp)
        self.assertNotIn("hm_loop_wobble", fp)
        self.assertNotIn("hm_wobble", fp)
        # cow-fable-1024f: the loop-only pile and tone knobs are opt-in too
        self.assertNotIn("hm_loop_bare", fp)
        self.assertNotIn("hm_loop_tone", fp)
        self.assertEqual(R.hm_amt(fp, "hm_loop_bare"), 0)
        self.assertNotIn("hm_loop_calm", fp)
        self.assertEqual(R.hm_amt(fp, "hm_loop_calm"), 0)

    def test_catch_light_elevation_defaults_to_where_it_sat(self):
        # cow-fable-1024g: `photoCatchElev` is 22 in both photo tables (the
        # angle the catch-light was hard-coded at), so a scene without it
        # renders exactly as before, and a view that sets it wins.
        self.assertEqual(R.PHOTO_V2["photoCatchElev"], 22.0)
        self.assertEqual(R.PHOTO_V1["photoCatchElev"], 22.0)
        self.assertEqual(R.photo_opts({"photo": "v2"})["photoCatchElev"], 22.0)
        self.assertEqual(R.photo_opts({"photo": "v2", "photoCatchElev": 45})["photoCatchElev"], 45)

    def test_loop_tone_scales_the_hex_and_one_is_identity(self):
        self.assertEqual(R.tone_hex("#694535", 1.0), "#694535")
        self.assertEqual(R.tone_hex("#694535", 0.9), "#5e3e30")
        self.assertEqual(R.tone_hex("#ffffff", 1.2), "#ffffff")
        self.assertEqual(R.tone_hex("#000000", 0.5), "#000000")

    def test_plies_of_one_stroke_move_together(self):
        fp = R.handmade_params({"handmade": 1, "hm_loft": 0.0, "hm_tension": 0.0})
        a = helix()
        b = [(x + 0.2, y, z) for x, y, z in a]
        out, _ = R.hm_displace([a, b], 1.0, fp)
        da = np.array(out[0]) - np.array(a)
        db = np.array(out[1]) - np.array(b)
        self.assertLess(np.abs(da - db).max(), 0.05)

    def test_seed_changes_the_hand(self):
        poly = helix()
        o1, _ = R.hm_displace([poly], 1.0, R.handmade_params({"handmade": 1, "hm_seed": 1}))
        o2, _ = R.hm_displace([poly], 1.0, R.handmade_params({"handmade": 1, "hm_seed": 2}))
        self.assertFalse(np.allclose(np.array(o1[0]), np.array(o2[0])))


class MemSaver(unittest.TestCase):
    def test_off_unless_asked(self):
        self.assertFalse(R.mem_saver_on({"view": {"resY": 850}, "fibreTune": {"handmade": 1}}))
        self.assertFalse(R.mem_saver_on({}))
        self.assertTrue(R.mem_saver_on({"view": {"memSaver": 1}}))
        self.assertTrue(R.mem_saver_on({"view": {}, "fibreTune": {"mem_saver": 1}}))

    def test_free_scene_data_empties_in_place(self):
        st = {"hex": "#fff", "filaments": [[[0, 0, 0], [1, 1, 1]]]}
        data = {"strokes": [st], "view": {}}
        alias = data["strokes"]
        R.free_scene_data(data)
        self.assertEqual(data, {})
        self.assertEqual(st, {})
        self.assertEqual(alias, [st])


if __name__ == "__main__":
    unittest.main()
