# notes/ — the project memory, in the repo

Rebecca's decision (6 September 2026): the repo stays public until the build is done (free GitHub Actions minutes), and the project memory lives here anyway so that every session, cloud or laptop, reads and updates it directly. No skill rebuilds, no pasting.

- Read `INDEX.md` first, then `master_orchestrator.md` and `playbook_category_signoff.md`.
- `todo.md` is the shared to-do — only things still to do, one line each. `project/` holds per-project state; `feedback_*.md` are standing rules; `reference_*.md` and `deploy_cdk_gotchas.md` are facts about how the system behaves.
- A `feedback_*` file is one of Rebecca's standing rules. Never soften or drop a rule on your own judgement. If she changes one, put a dated "Superseded" or "Correction" line at the top of the file pointing at the newer rule, and trim the old body to what still applies.
- Update a file in the same session that changes the fact it records; the edit rides the next train to `main`. Finished work is recorded in `BUILD_PROGRESS.md`, not here.
- Never put a credential, token, key or connection string in here. The repo is public. `.env.credentials` and `.secrets/` stay gitignored.
- The `homemade-standards` skill and Rebecca's laptop auto-memory are older fallback copies of these files, not the source (`CLAUDE.md` says the same).
- Double-bracket wiki links in these files date from the old memory system. Several point at files that were never brought into `notes/`; where that happens the line says so rather than inventing a file.

Audited end to end on 6 September 2026 against the repository and the live database; corrections carry their date.
