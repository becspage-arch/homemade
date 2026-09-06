/**
 * THE MAKER-PHOTO BAR — the three rules a member's finished-project photo has to
 * pass, and the only thing either judge is allowed to judge on.
 *
 * Its own module, and deliberately free of `server-only`, so the API gate
 * (`maker-photo-gate.ts`) and the routine's judging CLI
 * (`scripts/maker-photos-judge.ts`) read the SAME words. Two modes, one bar: the
 * rules must not be able to drift apart depending on who is looking.
 *
 * They are about safety and honesty, not photography. A dim, wonky, cluttered
 * snap of a real finished piece is exactly what a real maker sends, and
 * rejecting it for being unstyled would be rejecting the point.
 */
export const MAKER_PHOTO_RULES = [
  'IT IS THE CRAFT. The photo shows a real finished or in-progress piece of needlework, crochet, knitting or another Homemade craft. Not a screenshot of the pattern or the chart, not a picture of a screen, not an unrelated photo.',
  'IT IS SAFE AND PRIVATE. No nudity or sexual content, no violence, no hate imagery, no alcohol or drugs as the subject, no readable personal information (an address, a document, a screen full of someone’s details), and no child as the subject of the photo.',
  'IT IS THEIR OWN WORK. It reads as a real photograph the member took, not a stock image, a shop listing, a magazine page or a watermarked or credited photo belonging to somebody else.',
] as const

/** What is explicitly NOT a reject — the half of the bar that is easiest to get wrong. */
export const MAKER_PHOTO_NOT_A_REJECT =
  'This is a real person’s real photograph of their own work, usually taken on a phone in ordinary light. Dim, blurry, wonky, cluttered background, a hand or an arm holding the piece, a pet or a mug in the frame, a wonky or unfinished piece, work that does not much resemble the pattern — none of these is a reject. A person in the photo wearing or holding their own work is fine. Judge only the three rules.'
