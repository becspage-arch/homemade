---
name: no-md-handoffs
description: "Rebecca doesn't read .md deliverables; put synthesis / strategy results in chat as plain English, not in a docs/*.md file"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 469fdc14-ecef-4ade-8083-66a7ac6fb146
---

When a session is asked to produce a strategy / synthesis / planning deliverable, the result goes in the chat reply, not in a markdown file.

**Why:** Rebecca said directly (2026-05-25): "I don't know why the orchestrator asked for a doc. I don't like reading .md docs." She works through chat, not through opening files in an editor. A .md deliverable means she has to do extra work to read what I already produced.

**How to apply:**
- If a master-orchestrator prompt asks for a doc as the deliverable, still produce the synthesis in chat. The doc can land as a supporting reference, but the chat reply must contain the actual conclusions, options, and questions in readable form.
- Questions to Rebecca go in plain English in chat, never as a "see §7 of the doc" pointer.
- Tables and code blocks are fine in chat. Long rewrite examples are fine in chat. The constraint is on .md files, not on length.
- If a doc is genuinely useful as a reference (e.g. a worker prompt to paste into a follow-up session), produce it AND put the key content in chat.
- Master orchestrator prompts I write in future for myself: stop specifying ".md deliverable" as the output. Specify "summary in chat + any necessary reference files".
