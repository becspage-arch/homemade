---
name: feedback_verify_by_code_not_browser
description: "Don't drive Rebecca's browser to verify site changes — it stalls/crashes her machine. Verify via code/DB/git, or ask her to look."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1cc3ab43-43c7-4006-b396-ba7c9e0cb8ab
---

Driving the connected Chrome automation to verify live-site changes repeatedly STALLED and
**crashed Rebecca's computer** (2026-06-30 — heavy live SPA pages never reach `document_idle`;
screenshots/get_page_text time out; it locks up her machine). She asked me to stop.

**How to apply:** default to verifying by CODE — query the DB (read-only tsx from the main
checkout or a pnpm-installed worktree), `git`/`git grep` against origin/main, read the source.
That confirms almost everything: is the category `isPublicVisible`, did the commit land on
origin/main, how many rows are PUBLIC, does the gate fire, etc. For the one thing code can't
judge — does it visually LOOK right — ask **Rebecca** to look (the page is live for her), don't
drive her browser. Only use browser automation if she explicitly asks, and stop at the first
stall. Earlier in the session light dashboard tasks (Clerk, Cloudflare) worked; the heavy live
pattern-grid/pattern pages are what lock up. Relates to [[feedback_customer_eye_renders]] (her
eye is still the final quality say) and the Cloudflare-foregrounding note.
