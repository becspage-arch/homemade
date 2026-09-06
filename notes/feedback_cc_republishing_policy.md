---
name: cc-republishing-policy-original-in-our-voice-attribution-friendly-inclusion
description: Republish-friendly Creative Commons content (verified by licence terms) can be included on Homemade with attribution. Authored patterns and tutorials remain Homemade-original in Homemade voice; we never republish a CC pattern as-is or in a re-registered rewrite.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8c388de1-e20d-4a69-99a1-a2c7fa389b60
---

Locked 2026-06-09 in the knitting deep-dive session. Surfaced when
considering free CC pattern catalogues (Tin Can Knits, Knitty,
Drops) as sources for the knitting build.

## The rule

There are two distinct things we do with external content:

1. **Inclusion with attribution.** When a CC source explicitly
   permits redistribution (CC-BY, CC-BY-SA, CC0, public domain),
   we may include the content on Homemade as-is or in light
   formatting, with clear attribution and a link to the source.
   This applies to teaching diagrams, public-domain pattern
   illustrations, technique reference material.
2. **Reference for original authoring.** When a source is study-
   only (CC-BY-NC, all-rights-reserved, paid patterns we own
   physical copies of), we read the source as one of many inputs
   and write a Homemade-original tutorial / pattern in Homemade
   voice. We never republish, never paraphrase closely, never
   re-register.

The default action when sourcing content is to **author original
in our voice**. Inclusion-with-attribution is the exception, not
the default, and requires a positive confirmation of the licence
terms before publishing.

## How to apply when authoring

- **Always check the source licence first.** Find the licence
  page on the source site. Screenshot or quote the relevant
  clause into the worker session log so the call is auditable.
- **CC-BY / CC-BY-SA / CC0 / public domain** → eligible for
  inclusion with attribution. Format consistently with the rest of
  Homemade voice; attribution sits in the tutorial's `sources`
  array.
- **CC-BY-NC** → study only. Homemade authors original. Source
  goes in `inspirationSources` or omitted entirely.
- **All-rights-reserved patterns we own physical copies of**
  (Brooklyn Tweed, PetiteKnit, etc.) → study only. Homemade
  authors original. Source named in our internal research notes,
  not in published material.
- **Public domain pre-1928** (Weldon's, Dillmont, Mary Thomas
  1938 in UK PD) → eligible for inclusion. Original engravings and
  text remain in the public domain in their original form.

## What "Homemade voice" means here

Per [[feedback_homemade_voice]] and the voice spec at
`docs/voice-spec-quick-reference.md`. Calm, second-person, matter-
of-fact, technique-precise, no AI-tells, no platitudes. A pattern
written in our voice will read different from any CC source even
where the technical content overlaps.

## Why not just republish CC-BY content

Voice is the brand. Even where the licence permits republishing, a
mixed voice across the library degrades the felt sense of the
product. Inclusion-with-attribution is reserved for content where
the original form (a public-domain engraving, an academic
reference diagram) is exactly what the reader needs, and rewriting
would lose something.
