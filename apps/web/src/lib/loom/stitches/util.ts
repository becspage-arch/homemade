/** Path helpers shared by the stitch primitives. World units are millimetres. */

import type { Vec2 } from '../core/vec'

export function pathLength(path: Vec2[]): number {
  let len = 0
  for (let i = 1; i < path.length; i++) {
    len += Math.hypot(path[i]!.x - path[i - 1]!.x, path[i]!.y - path[i - 1]!.y)
  }
  return len
}

/** Point at arc-length `d` along a polyline, plus the unit tangent there. */
export function pointAt(path: Vec2[], d: number): { p: Vec2; t: Vec2 } {
  if (path.length === 1) return { p: path[0]!, t: { x: 1, y: 0 } }
  let acc = 0
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!
    const b = path[i]!
    const seg = Math.hypot(b.x - a.x, b.y - a.y)
    if (seg < 1e-9) continue
    if (acc + seg >= d || i === path.length - 1) {
      const u = Math.max(0, Math.min(1, (d - acc) / seg))
      return {
        p: { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u },
        t: { x: (b.x - a.x) / seg, y: (b.y - a.y) / seg },
      }
    }
    acc += seg
  }
  const a = path[path.length - 2]!
  const b = path[path.length - 1]!
  const seg = Math.hypot(b.x - a.x, b.y - a.y) || 1
  return { p: b, t: { x: (b.x - a.x) / seg, y: (b.y - a.y) / seg } }
}

/** Left perpendicular of a unit vector (screen y down -> this points "up-left"). */
export function leftNormal(t: Vec2): Vec2 {
  return { x: -t.y, y: t.x }
}
