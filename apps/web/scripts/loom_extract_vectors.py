"""Extract the EXACT vector artwork (geometry + per-path colour) from the colour
guide page of a pattern PDF. The PDF is vector — these ARE the designer's lines
and thread colours, not a traced guess. Writes paths.json (points in PDF pts)."""
import fitz, json, sys

def bez(p0, p1, p2, p3, n=8):
    out = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        x = u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x
        y = u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y
        out.append([x, y])
    return out

def main():
    src, out_path, pno = sys.argv[1], sys.argv[2], int(sys.argv[3])
    doc = fitz.open(src)
    page = doc[pno]
    paths = []
    for dr in page.get_drawings():
        col = dr.get("color") or dr.get("fill")
        if not col:
            continue
        rgb = [round(c, 3) for c in col]
        filled = dr.get("fill") is not None
        # Build polylines, SPLITTING at sub-path breaks. One PDF drawing often
        # holds many disconnected sub-paths (all of a flower's petals, or a stem
        # separate from its bloom). If the next item doesn't start where the last
        # ended, that's a moveto — start a new polyline. (Connecting them was what
        # produced the zig-zags + stray diagonal lines.)
        EPS = 0.4
        poly = []
        last = None

        def flush():
            if len(poly) >= 2:
                paths.append({"rgb": rgb, "filled": filled, "pts": list(poly)})
            poly.clear()

        for it in dr["items"]:
            if it[0] == "l":
                s, e = it[1], it[2]
                if last is None or abs(last.x - s.x) > EPS or abs(last.y - s.y) > EPS:
                    flush()
                    poly.append([s.x, s.y])
                poly.append([e.x, e.y])
                last = e
            elif it[0] == "c":
                s = it[1]
                if last is None or abs(last.x - s.x) > EPS or abs(last.y - s.y) > EPS:
                    flush()
                    poly.append([s.x, s.y])
                poly += bez(it[1], it[2], it[3], it[4])
                last = it[4]
            elif it[0] == "re":
                flush()
                r = it[1]
                paths.append({"rgb": rgb, "filled": True,
                              "pts": [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1], [r.x0, r.y0]]})
                last = None
        flush()
    rect = page.rect
    json.dump({"wpt": rect.width, "hpt": rect.height, "paths": paths}, open(out_path, "w"))
    print(f"wrote {len(paths)} paths from page {pno+1}")

main()
