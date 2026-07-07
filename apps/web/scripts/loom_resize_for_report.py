"""SCRATCH (not shipped): resize hero PNGs down to a reportable JPEG size using
Blender's bundled Python (no other image lib is available in this environment).
Run: blender.exe --background --python loom_resize_for_report.py
"""
import bpy

TARGET_W = 1400

D = r"C:\Users\Rebecca\Projects\code\homemade\.claude\worktrees\loom-stitch-engine\.loom-scratch\crochet"
jobs = [
    (D + r"\stitch-sc-yr1.3-hero.png", D + r"\report-sc-fine.jpg"),
    (D + r"\stitch-sc-yr2-hero.png",   D + r"\report-sc-worsted.jpg"),
    (D + r"\stitch-dc-yr1.3-hero.png", D + r"\report-dc-fine.jpg"),
    (D + r"\stitch-dc-yr2-hero.png",   D + r"\report-dc-worsted.jpg"),
    (D + r"\stitch-ch-yr1.3-hero.png", D + r"\report-ch-fine.jpg"),
    (D + r"\stitch-ch-yr2-hero.png",   D + r"\report-ch-worsted.jpg"),
]

for src, dst in jobs:
    img = bpy.data.images.load(src)
    w, h = img.size
    scale = TARGET_W / w
    new_w, new_h = int(w * scale), int(h * scale)
    img.scale(new_w, new_h)
    img.file_format = 'JPEG'
    img.filepath_raw = dst
    scene = bpy.context.scene
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 82
    img.save_render(dst, scene=scene)
    print(f"wrote {dst} ({new_w}x{new_h})")
    bpy.data.images.remove(img)
