---
name: tiptap-text-node-type
description: "Every text leaf in a TipTap body MUST have \"type\": \"text\" — the public renderer silently drops nodes that fall to its default case"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 469fdc14-ecef-4ade-8083-66a7ac6fb146
---

When authoring or rewriting TipTap body content, every text-bearing leaf must have `"type": "text"` set explicitly.

```json
{
  "type": "text",
  "text": "Heat the oven to 180°C..."
}
```

NOT:
```json
{
  "text": "Heat the oven to 180°C..."
}
```

**Why:** The public tutorial renderer (`apps/web/src/components/public/tutorial-content/tutorial-content.tsx`) is a switch on `node.type`. Nodes with no `type` field fall through to the default case, which calls `renderChildren(node.content)`. Text leaves have no `content` array — so they render as empty. Discovered 2026-05-25 during the voice-pilot: 9 of 10 rewritten tutorials had text nodes missing the type field, which made the entire orderedList content silently disappear on the public page.

**How to apply:**
- Every worker prompt that authors or rewrites TipTap content must include this rule explicitly.
- The voice-check script should be extended with a structural-validation rule that flags text leaves without `type: "text"` (binary error, no warning tier).
- When rewriting via JSON edit, double-check freshly-authored text nodes carry the type field — it's the single most common silent-failure mode.

**Other TipTap structural requirements (same family of bug):**
- `paragraph` nodes need `"type": "paragraph"`.
- `heading` nodes need `"type": "heading"` plus `attrs.level`.
- `listItem` nodes need `"type": "listItem"` and their `content` must be an array (typically containing one `paragraph` node).
- `orderedList` / `bulletList` need `"type"` plus a `content` array of `listItem` nodes.

All of these are easy to get right when copying from a working example. They're easy to get wrong when authoring from scratch.
