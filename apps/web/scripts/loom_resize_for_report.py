"""SCRATCH (not shipped): resize hero PNGs down to a reportable JPEG size using
Blender's bundled Python (no other image lib is available in this environment).
Run: blender.exe --background --python loom_resize_for_report.py
"""
import bpy

TARGET_W = 1400

D = r"C:\Users\Rebecca\Projects\code\homemade\.claude\worktrees\loom-stitch-engine\.loom-scratch\crochet"
jobs = [
    (D + r"\stitch-fpdc-yr2.4-hero.png",    D + r"\report-fpdc.jpg"),
    (D + r"\stitch-bpdc-yr2.4-hero.png",    D + r"\report-bpdc.jpg"),
    (D + r"\stitch-postrib-yr2.4-hero.png", D + r"\report-postrib-final.jpg"),
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
