import type { ReactNode } from 'react'

interface TutorialJumpChipsProps {
  isRecipe: boolean
  /** Cooking-mode toggle (client component) — recipes only. */
  cookingModeSlot?: ReactNode
}

/**
 * Sage-outline pill chips for in-page navigation. Recipes get
 * "Jump to method ↓" + the cooking-mode toggle. Techniques get
 * "Jump to method ↓" only.
 *
 * "Cook hands-free →" is the cooking-mode label — names the user
 * benefit, not the feature (brand rule).
 */
export function TutorialJumpChips({
  isRecipe,
  cookingModeSlot,
}: TutorialJumpChipsProps) {
  return (
    <div className="tutorial-jump-chips">
      <a className="tutorial-jump-chip" href="#method">
        Jump to method ↓
      </a>
      {isRecipe && cookingModeSlot}
    </div>
  )
}
