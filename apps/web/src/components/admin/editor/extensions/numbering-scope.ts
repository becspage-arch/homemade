/**
 * Numbering scope attribute for orderedList.
 *
 * Phase location_climate_paper_001 — Part 7. The original brief named
 * this `bodyToolboxItem`, but no node by that name exists in the editor;
 * the thread-tying tutorial uses standard ordered lists for its method
 * steps, so this extension hangs the attr off `orderedList` itself.
 *
 * Values:
 *   'continue'    — default. Step numbering continues from the previous
 *                   ordered list in the same body. Current behaviour.
 *   'restart'     — step counter resets to 1, no header change.
 *   'alternative' — renders a "Method 2 (alternative)" header above the
 *                   list and resets the counter to 1. The renderer
 *                   tracks the running "Method" index across the body so
 *                   the first alternative becomes "Method 2", the second
 *                   "Method 3", etc.
 *
 * Renderer logic lives in `apps/web/src/components/public/tutorial-content/
 * tutorial-content.tsx`. The editor side only persists the attr; the
 * surface is a small toolbar pill that toggles between the three values
 * when an ordered list is selected (follow-up: editor UI).
 */

import { Extension } from '@tiptap/core'

export type NumberingScope = 'continue' | 'restart' | 'alternative'

export const NumberingScopeExtension = Extension.create({
  name: 'numberingScope',

  addGlobalAttributes() {
    return [
      {
        types: ['orderedList'],
        attributes: {
          numberingScope: {
            default: 'continue' as NumberingScope,
            parseHTML: (el): NumberingScope => {
              const raw = el.getAttribute('data-numbering-scope')
              if (raw === 'restart' || raw === 'alternative') return raw
              return 'continue'
            },
            renderHTML: (attrs) => {
              const scope = (attrs as { numberingScope?: NumberingScope }).numberingScope
              if (!scope || scope === 'continue') return {}
              return { 'data-numbering-scope': scope }
            },
          },
        },
      },
    ]
  },
})
