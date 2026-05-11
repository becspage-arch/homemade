'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { JSONContent } from '@tiptap/core'

import { InfoPanel } from './extensions/info-panel'
import { SuppliesCard } from './extensions/supplies-card'
import { SubTutorialCard } from './extensions/sub-tutorial-card'
import { PullQuote } from './extensions/pull-quote'
import { GlossaryTooltip } from './extensions/glossary-tooltip'
import { ProductCard } from './extensions/product-card'
import { VarietiesPanel } from './extensions/varieties-panel'
import { Troubleshooter } from './extensions/troubleshooter'
import { Toolbar } from './toolbar'
import type { GlossaryRef, TutorialRef } from './types'

import './editor.css'

interface TiptapEditorProps {
  initialContent: JSONContent
  glossary: GlossaryRef[]
  tutorials: TutorialRef[]
  /** Name of the hidden input that stays in sync with the editor JSON. */
  hiddenInputName: string
  /** Fires on every editor update with the latest JSON. Optional. */
  onChange?: (json: JSONContent) => void
}

const DEFAULT_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

export function TiptapEditor({
  initialContent,
  glossary,
  tutorials,
  hiddenInputName,
  onChange,
}: TiptapEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const initialJson = useMemo(
    () => sanitiseDoc(initialContent),
    [initialContent],
  )
  const initialJsonString = useMemo(
    () => JSON.stringify(initialJson),
    [initialJson],
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          protocols: ['http', 'https', 'mailto'],
        },
      }),
      InfoPanel,
      SuppliesCard,
      SubTutorialCard,
      PullQuote,
      GlossaryTooltip,
      ProductCard,
      VarietiesPanel,
      Troubleshooter,
    ],
    content: initialJson,
    editorProps: {
      attributes: {
        class: 'min-h-96 px-4 py-6',
      },
    },
    onUpdate({ editor }) {
      const json = editor.getJSON()
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = JSON.stringify(json)
      }
      onChange?.(json)
    },
  })

  // Seed storage for picker-aware extensions so they can render their lookups
  // without having to fetch live data per render.
  useEffect(() => {
    if (!editor) return
    editor.storage.subTutorialCard = { tutorials }
    editor.storage.glossaryTooltip = { glossary }
  }, [editor, tutorials, glossary])

  return (
    <div className="rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)]">
      {editor && <Toolbar editor={editor} glossary={glossary} />}
      <EditorContent editor={editor} />
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={hiddenInputName}
        defaultValue={initialJsonString}
      />
    </div>
  )
}

function sanitiseDoc(doc: unknown): JSONContent {
  if (!doc || typeof doc !== 'object') return DEFAULT_DOC
  const candidate = doc as JSONContent
  if (candidate.type !== 'doc') return DEFAULT_DOC
  if (!Array.isArray(candidate.content) || candidate.content.length === 0) {
    return DEFAULT_DOC
  }
  return candidate
}
