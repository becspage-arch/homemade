---
name: Worker hand-offs are plain-English summaries, not memos or jargon dumps
description: When a worker session finishes and reports back to Rebecca, it writes a plain conversational summary in the session itself — not a formal memo, not a wall of jargon. Banned phrases (especially "honest") apply to every word workers output. Rebecca reads these on the fly between sessions; the report has to let her answer questions and keep moving.
type: feedback
originSessionId: 51fcaac5-5db7-4df9-82b1-ee909db7152d
---
Two failures observed across recent worker sessions: (1) reports come back styled as formal memos with headings, summaries, status sections, and signed-off sign-offs; (2) reports use banned filler words ("honest"/"honestly"/"genuinely"/"frankly") and lean on heavy tech jargon when plain English would do.

Both make the report harder to read fast and slow down the orchestrator → Rebecca → next-session loop.

## The rule

**Worker hand-off reports are short, plain-English summaries written directly in the session.** Not memos. Not formal documents. Three or four short paragraphs at most, plus a bullet list if it genuinely helps. Written like one engineer telling another what they did.

## Banned phrases (apply to every word, including hand-off reports)

The full anti-AI rule set lives in `feedback_homemade_voice.md`. The ones that show up most in worker reports and need to vanish:

- "honest" / "honestly" / "to be honest" / "I'll be honest" — the worst offender. The word implies the rest was dishonest. Cut every instance.
- "frankly" / "truthfully" — same problem.
- "genuinely" as filler — fine when it means "actually" with information value, cut when it's padding.
- "delve into", "at its core", "tapestry of", "a testament to", "treasure trove", "game-changer", "navigate the complexities" — generic AI fillers.
- "essentially", "fundamentally", "ultimately" used as throat-clearing.
- "I went ahead and...", "I took the liberty of..." — corporate hedge.

## Style rules

- **Plain English.** Match the register of an experienced engineer telling Rebecca what they did. No marketing voice. No academic voice.
- **Concrete over abstract.** "Updated `proxy.ts` to add a 200ms cache" beats "implemented caching improvements to the routing layer."
- **State outcomes first, mechanism second.** Lead with "Site loads correctly for signed-out users now" — then say how.
- **Skip the headings unless the report is genuinely long.** A three-paragraph update doesn't need "## Summary" / "## What I did" / "## Next steps" scaffolding.
- **No sign-offs.** No "Hope this helps!" or "Let me know if you have questions" — just stop when done.
- **British English.** Lower-case where idiomatic.
- **Don't pad commit SHAs with explanation.** "Commit `abc1234`" is fine; "I committed the changes at commit hash abc1234 which contains the following modifications..." is not.

## What to keep in reports

- Commit SHA(s).
- Outcomes (what works now that didn't before).
- Anything scoped out and why.
- Open questions / decisions Rebecca needs to make.
- Newly discovered debt — one line each, not a paragraph each.

## What to cut

- "Summary of changes" preamble.
- Restating the prompt back to her.
- Walls of file paths the orchestrator can look up.
- Apology language ("I should have... I would have...").
- Hedging ("honestly the trickiest part was...").

## How I (orchestrator) apply this

Every worker prompt I write includes a "Hand-off style" block telling the worker to read this memory and follow the rules. It's short and explicit so the worker can't miss it.

## Example — good

> Phase 6 shipped on `a3aaad4`. Creator program is live: users can apply at `/me/creator/apply`, admin reviews at `/admin/creators`, approved creators get a `/makers/{handle}` page and the right to author tutorials via `/me/creator/tutorials`. Pattern testing also wired — tests recruit through `/patterns`, testers submit structured feedback.
>
> Three things I deferred: per-creator analytics dashboards (Phase 8 surface), creator-to-creator messaging, and the resubmit-on-edit moderation flow for creator tutorials. The last one I picked edit-applies-immediately instead so typo fixes don't queue.
>
> One open question for you: when a creator's tutorial is approved, do you want the existing tutorial slug preserved or regenerated? I kept it preserved for now.

## Example — bad

> Hi Rebecca! I've completed the Phase 6 work and wanted to give you an honest summary of where things stand.
>
> ## Summary
> Honestly, this was a fairly significant undertaking. I implemented the comprehensive creator program functionality, leveraging the existing Phase 5 architecture to enable seamless integration. The core deliverables include...
>
> [...]
>
> Hope this helps! Let me know if you have any questions.
