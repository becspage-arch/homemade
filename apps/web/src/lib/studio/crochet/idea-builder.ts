import 'server-only'

/**
 * "Describe an idea" — the guided pattern builder for crochet.
 *
 * The premium spec's flow: the maker says what they want, the assistant says
 * back what it means to build, the maker adjusts, then the assistant writes the
 * actual stitch program. Nothing is stored until that program compiles and
 * passes the loom's audit gate, so a design that came out of a conversation is
 * held to exactly the same bar as one from the catalogue.
 *
 * Runs on the SERVER through the existing thin Anthropic client (the same one
 * the bulk catalogue planner uses). With no key configured the Studio tab says
 * so plainly; there is no stub program path.
 */

import { anthropicConfigured, anthropicJson, anthropicMessage, PLANNER_MODEL } from '@/lib/anthropic'
import { validateAndAudit, type BuiltIdea } from './program-validation'

export interface IdeaMessage {
  role: 'user' | 'assistant'
  content: string
}

export function ideaBuilderAvailable(): boolean {
  return anthropicConfigured()
}

const VOICE = `Write the way a maker who has taught this for years talks at the kitchen table.
Plain words, short sentences, British spelling. No dashes of any kind. No exclamation marks.
Never say "delve", "at its core", "tapestry of", "a testament to", "game-changer", "elevate",
"embrace", "honestly", "frankly", "genuinely". Do not open with "Let's dive in" or "Picture this".
Do not end with a sign-off or a summary. Just stop when you are done.`

const WHAT_WE_CAN_MAKE = `You can build two kinds of thing and nothing else.

1. A FLAT OR ROUND PIECE. One continuous piece of crochet: a square or rectangle of
   colourwork, a stripe panel, a flat circle, or a single stuffed ball.
2. AN AMIGURUMI. Several stuffed balls and tapered tubes crocheted separately and sewn
   together: a body, a head, a muzzle, ears, arms, legs. Safety eyes and a nose can be
   fitted to it.

Everything is worked in one of these stitches: single crochet, half double, double, treble
(UK: double crochet, half treble, treble, double treble). Amigurumi is single crochet only.

Sizes are limited by what can be built while the maker waits: at most 900 stitches in a
flat piece (for example 30 stitches by 30 rows), and at most 900 stitches across all the
pieces of an amigurumi.`

/**
 * The conversation turn: the assistant says back what it intends to build, in
 * house voice, and asks one short question if something important is missing.
 */
export async function ideaChatReply(messages: IdeaMessage[]): Promise<string> {
  const system = `You help a maker design a crochet pattern in the Homemade Studio.

${WHAT_WE_CAN_MAKE}

Your job in this turn is NOT to write the pattern. It is to say back, in three or four
short sentences, what you intend to build: what the thing is, roughly how big in stitches
and rows or in pieces, and the colours. If one important thing is missing, ask ONE short
question about it. If the maker has already told you enough, end with a single line asking
them to say when it sounds right.

If what they asked for is outside what you can build, say so plainly in one sentence and
offer the nearest thing you can build.

${VOICE}`

  return anthropicMessage({
    model: PLANNER_MODEL,
    system,
    prompt: renderTranscript(messages),
    maxTokens: 500,
  })
}

export type { BuiltIdea }

export interface IdeaBuildOutcome {
  built: BuiltIdea | null
  /** Plain-English reasons it could not be built, for the maker to read. */
  problems: string[]
  /** How many times the model was asked to revise. */
  attempts: number
}

const PIECE_SHAPE = `{
  "kind": "piece",
  "program": {
    "name": "short name",
    "form": "grid" | "flat" | "disc" | "sphere",
    "stitch": "sc" | "hdc" | "dc" | "tr",          // required for flat, disc, sphere
    "gridWidth": 24,                                 // grid only: stitches per row
    "grid": [                                        // grid only, bottom row first
      { "stitches": ["sc", ...gridWidth of them],
        "cellColours": ["a", ...gridWidth of them] } // optional, keys into palette
    ],
    "foundation": 24,                                // flat only: chain length
    "rows": [["st","st","inc"], ...],                // flat only, per row, in work order
    "rounds": [6,12,18,24,24,18,12,6],               // disc or sphere only
    "yarnWeight": "worsted",
    "colourHex": "#c25a3c",
    "palette": { "a": "#c25a3c", "b": "#efe6d2" },
    "hookMm": 4,
    "notes": "one or two plain sentences"
  }
}`

const AMIGURUMI_SHAPE = `{
  "kind": "amigurumi",
  "program": {
    "name": "short name",
    "yarnWeight": "worsted",
    "hookMm": 4,
    "tiltDeg": 74, "yawDeg": 26, "aimHeightFrac": 0.5, "distScale": 1.05,
    "marginFactor": 0.3, "groundScale": 40, "lightRig": "product",
    "bgHex": "#f7f5f2", "exposure": 0.34,
    "parts": [
      { "name": "body", "stitch": "sc", "rounds": [6,12,18,24,30,30,30,30,30,30,24,18,12,6],
        "colourHex": "#b5814e", "place": { "on": "ground" } },
      { "name": "head", "stitch": "sc", "rounds": [6,12,18,24,24,24,24,24,24,24,24,18,12,6],
        "colourHex": "#b5814e", "place": { "on": "body", "overlap": 9, "offset": { "y": 2 } } },
      { "name": "ear-l", "stitch": "sc", "rounds": [6,12,12,12,6], "colourHex": "#b5814e",
        "scale": 0.82,
        "place": { "on": "head", "dir": { "x": -0.72, "y": -0.42, "z": 1 }, "seat": 5,
                   "poleIn": true, "surfaceFit": "ellipsoid" } }
    ],
    "props": [
      { "name": "eye-l", "on": "head", "dir": { "x": -0.62, "y": 1, "z": 0.55 },
        "radiusMm": 4, "seat": -0.5, "colourHex": "#141110", "gloss": 0.95 }
    ],
    "notes": "one or two plain sentences"
  }
}`

const BUILD_RULES = `Hard rules for the stitch program.

Pieces worked in the round (rounds arrays, and every amigurumi part) climb in sixes from 6
to the widest round, hold there for at least one round, then come back down in sixes to 6.
For example [6,12,18,24,24,24,24,18,12,6]. A tapered tube may come down in twos instead:
[6,12,12,12,12,12,10,8,6]. Never start anywhere but 6 and never end anywhere but 6.

A grid piece has one entry per stitch in every row, and every row is exactly gridWidth long.
Row order is bottom first. Every colour key used must be in the palette.

An amigurumi part is joined either to "ground" or to a part listed BEFORE it. Use "overlap"
to nestle a head into a body; use "dir" with "poleIn": true and "surfaceFit": "ellipsoid" for
a piece that stands proud, like an ear, a muzzle, an arm or a leg. Keep the whole thing under
900 stitches.`

/**
 * Turn the conversation into a stitch program, then compile and audit it. On a
 * failure the model gets the audit's own words back and revises. Two revisions,
 * then the maker is asked to simplify.
 */
export async function buildIdeaProgram(messages: IdeaMessage[]): Promise<IdeaBuildOutcome> {
  const system = `You write crochet stitch programs for the Homemade Studio.

${WHAT_WE_CAN_MAKE}

${BUILD_RULES}

Reply with JSON and nothing else, in one of these two shapes:

${PIECE_SHAPE}

or

${AMIGURUMI_SHAPE}

${VOICE}`

  let prompt = `${renderTranscript(messages)}\n\nWrite the stitch program for what the maker asked for.`
  let lastProblems: string[] = []
  // Compiling and auditing a program is the slow part, so the revise loop stops
  // once the request has had its share of time rather than running the maker
  // into a gateway timeout.
  const deadline = Date.now() + 25_000

  for (let attempt = 1; attempt <= 3; attempt++) {
    if (attempt > 1 && Date.now() > deadline) break
    let raw: unknown
    try {
      raw = await anthropicJson<unknown>({ model: PLANNER_MODEL, system, prompt, maxTokens: 8000 })
    } catch {
      return {
        built: null,
        attempts: attempt,
        problems: ['The pattern builder could not be reached just now. Try again in a moment.'],
      }
    }

    const outcome = validateAndAudit(raw)
    if (outcome.built) return { ...outcome, attempts: attempt }
    lastProblems = outcome.problems
    prompt =
      `${renderTranscript(messages)}\n\n` +
      `Your last attempt could not be built. What went wrong:\n` +
      lastProblems.map((p) => `- ${p}`).join('\n') +
      `\n\nWrite the whole stitch program again, fixed.`
  }

  return {
    built: null,
    attempts: 3,
    problems: [
      'This one is not coming out as a workable pattern. Try describing something simpler: fewer pieces, or a smaller panel.',
      ...lastProblems,
    ],
  }
}

function renderTranscript(messages: IdeaMessage[]): string {
  return messages
    .slice(-14)
    .map((m) => `${m.role === 'user' ? 'Maker' : 'You'}: ${m.content}`)
    .join('\n\n')
}
