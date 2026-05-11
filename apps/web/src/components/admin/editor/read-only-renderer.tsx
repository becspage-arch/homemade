'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { JSONContent } from '@tiptap/core'

import { InfoPanel } from './extensions/info-panel'
import { SuppliesCard } from './extensions/supplies-card'
import { SubTutorialCard } from './extensions/sub-tutorial-card'
import { PullQuote } from './extensions/pull-quote'
import { GlossaryTooltip } from './extensions/glossary-tooltip'
import type { GlossaryRef, TutorialRef } from './types'

import './editor.css'

interface ReadOnlyRendererProps {
  content: JSONContent
  glossary: GlossaryRef[]
  tutorials: TutorialRef[]
}

export function ReadOnlyRenderer({
  content,
  glossary,
  tutorials,
}: ReadOnlyRendererProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: false,
          protocols: ['http', 'https', 'mailto'],
        },
      }),
      InfoPanel,
      SuppliesCard,
      SubTutorialCard,
      PullQuote,
      GlossaryTooltip,
    ],
    content,
    editorProps: {
      attributes: { class: 'min-h-32 px-4 py-6' },
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.storage.subTutorialCard = { tutorials }
    editor.storage.glossaryTooltip = { glossary }
  }, [editor, tutorials, glossary])

  return (
    <div className="rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)]">
      <EditorContent editor={editor} />
    </div>
  )
}
