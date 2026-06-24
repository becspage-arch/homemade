/**
 * Tiny deterministic 3-vector + rotation maths for the Loom render engine.
 *
 * Self-contained on purpose: the engine must produce byte-stable output from a
 * pattern document with no randomness and no external maths dependency, so a
 * designer's Studio preview equals exactly what a buyer later renders.
 */

export interface Vec2 {
  x: number
  y: number
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

export function v(x: number, y: number, z: number): Vec3 {
  return { x, y, z }
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

export function scale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s }
}

export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

export function length(a: Vec3): number {
  return Math.sqrt(dot(a, a))
}

export function normalize(a: Vec3): Vec3 {
  const l = length(a)
  if (l < 1e-9) return { x: 0, y: 0, z: 0 }
  return { x: a.x / l, y: a.y / l, z: a.z / l }
}

export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x
}

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** 2D helpers — the fabric plane is 2D; world units are millimetres. */
export function v2(x: number, y: number): Vec2 {
  return { x, y }
}

export function dist2(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function lerp2(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

/** Unit direction from a to b (zero vector if coincident). */
export function dir2(a: Vec2, b: Vec2): Vec2 {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const l = Math.hypot(dx, dy)
  if (l < 1e-9) return { x: 0, y: 0 }
  return { x: dx / l, y: dy / l }
}

/** Left-hand perpendicular of a 2D unit vector. */
export function perp2(a: Vec2): Vec2 {
  return { x: -a.y, y: a.x }
}
