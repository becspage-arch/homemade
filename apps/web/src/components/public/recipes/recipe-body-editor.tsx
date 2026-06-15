'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { JSONContent } from '@tiptap/core'

/**
 * Lightweight recipe-method editor for Makers.
 *
 * StarterKit only: headings, bold, italic, lists, block quotes, links. No
 * glossary / technique / structured-ingredient blocks (those are admin-author
 * surfaces and the ingredients live in their own picker here). Output is plain
 * TipTap JSON the public renderer already walks, so a Maker's method renders
 * with the same look as a library recipe.
 */

const DEFAULT_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] }

function sanitiseDoc(doc: unknown): JSONContent {
  if (!doc || typeof doc !== 'object') return DEFAULT_DOC
  const candidate = doc as JSONContent
  if (candidate.type !== 'doc') return DEFAULT_DOC
  if (!Array.isArray(candidate.content) || candidate.content.length === 0) return DEFAULT_DOC
  return candidate
}

interface RecipeBodyEditorProps {
  initialContent: unknown
  onChange: (json: JSONContent) => void
}

export function RecipeBodyEditor({ initialContent, onChange }: RecipeBodyEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] },
        heading: { levels: [2, 3] },
      }),
    ],
    content: sanitiseDoc(initialContent),
    editorProps: { attributes: { class: 'recipe-editor-area' } },
    onUpdate({ editor }) {
      onChange(editor.getJSON())
    },
  })

  return (
    <div className="recipe-editor">
      {editor && <BodyToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}

function BodyToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="recipe-editor-toolbar">
      <ToolbarButton
        label="H2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label="H3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <ToolbarButton
        label="Text"
        active={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      />
      <span className="recipe-editor-divider" aria-hidden="true" />
      <ToolbarButton
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <span className="recipe-editor-divider" aria-hidden="true" />
      <ToolbarButton
        label="Steps"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        label="Bullets"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Quote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <span className="recipe-editor-divider" aria-hidden="true" />
      <ToolbarButton
        label="Link"
        active={editor.isActive('link')}
        onClick={() => {
          const prev = (editor.getAttributes('link').href as string | undefined) ?? ''
          const url = window.prompt('Link address', prev)
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
          } else if (url !== null) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }
        }}
      />
    </div>
  )
}

function ToolbarButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`recipe-editor-btn${active ? ' is-active' : ''}`}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
