// Shape of the picker references the editor needs at mount time. The picker
// is the same in every editor instance; the picker UI itself is portalled
// out of the TipTap content tree so it can render full-page overlays.

export interface GlossaryRef {
  id: string
  term: string
  slug: string
  definition: string
  categoryName?: string | null
}

export interface TutorialRef {
  id: string
  slug: string
  title: string
  categoryName: string
}

export interface EditorPickers {
  glossary: GlossaryRef[]
  tutorials: TutorialRef[]
}

// Augment TipTap's per-editor Storage so each extension's storage slot is
// typed when accessed via `editor.storage`.
declare module '@tiptap/core' {
  interface Storage {
    subTutorialCard: { tutorials: TutorialRef[] }
    glossaryTooltip: { glossary: GlossaryRef[] }
  }
}
