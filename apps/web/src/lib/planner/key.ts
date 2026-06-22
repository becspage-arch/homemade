/**
 * Generic material identity key, shared by every provider and the stash so a
 * needed material and an owned one line up. Brand + code is enough for the
 * crafts that catalogue materials (floss, branded yarn); a craft without codes
 * can fall back to the name. Keep this the one place the scheme is defined.
 */
export function materialKey(
  brand: string | null | undefined,
  code: string | null | undefined,
  name?: string | null,
): string {
  const b = (brand ?? '').trim()
  const c = (code ?? '').trim()
  if (b || c) return `${b}:${c}`.toUpperCase()
  return `NAME:${(name ?? '').trim()}`.toUpperCase()
}
