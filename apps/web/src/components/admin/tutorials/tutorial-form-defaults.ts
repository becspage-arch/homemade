import type { JSONContent } from '@tiptap/core'

import type { TutorialFormDefaults } from './tutorial-form'

/**
 * Recipe / technique metadata starts blank for a new tutorial. Field-by-field
 * defaults are repeated in `apps/web/src/app/admin/tutorials/[id]/page.tsx`
 * for the edit screen where the existing row carries the values.
 */
export const EMPTY_RECIPE_DEFAULTS: Pick<
  TutorialFormDefaults,
  | 'type'
  | 'servings'
  | 'yieldDescription'
  | 'prepMinutes'
  | 'cookMinutes'
  | 'restingMinutes'
  | 'chillingMinutes'
  | 'scalable'
  | 'freezable'
  | 'freezeNotes'
  | 'batchable'
  | 'batchNotes'
  | 'makeAheadNotes'
  | 'dietaryFlags'
  | 'cuisine'
  | 'mealType'
  | 'mood'
  | 'temperatureCelsius'
  | 'temperatureNote'
  | 'foundational'
  | 'leftoverTutorialId'
  | 'aliases'
> = {
  type: 'TECHNIQUE',
  servings: '',
  yieldDescription: '',
  prepMinutes: '',
  cookMinutes: '',
  restingMinutes: '',
  chillingMinutes: '',
  scalable: true,
  freezable: false,
  freezeNotes: '',
  batchable: false,
  batchNotes: '',
  makeAheadNotes: '',
  dietaryFlags: [],
  cuisine: '',
  mealType: '',
  mood: [],
  temperatureCelsius: '',
  temperatureNote: '',
  foundational: false,
  leftoverTutorialId: null,
  aliases: '',
}

export const EMPTY_TUTORIAL_BODY: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}
