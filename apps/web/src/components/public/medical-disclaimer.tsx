import type { TutorialType } from '@homemade/db'

/**
 * Tutorial types that carry a visible medical disclaimer at the foot of the
 * body. These are the three types whose in-body disclaimer rule was removed
 * on the basis that "the site-wide disclaimer covers it" — so the site-wide
 * disclaimer has to actually render somewhere the reader sees it. It does, here.
 *
 * REMEDY + HERB_PROFILE are herbal-medicine; PRACTICE is mindset. All three can
 * be read as treatment guidance, so all three carry the line.
 */
const DISCLAIMER_TYPES: ReadonlySet<string> = new Set(['REMEDY', 'HERB_PROFILE', 'PRACTICE'])

export function tutorialNeedsMedicalDisclaimer(type: TutorialType | string): boolean {
  return DISCLAIMER_TYPES.has(String(type))
}

/**
 * The single locked medical-disclaimer line (feedback_homemade_voice.md).
 * One sentence, worldwide-friendly, no em dashes, no "GP"/"physician".
 * Rendered once at the bottom of the body for the types above.
 */
export function MedicalDisclaimer() {
  return (
    <aside className="tutorial-medical-disclaimer" role="note" aria-label="Medical disclaimer">
      <p className="tutorial-medical-disclaimer-text">
        Not medical advice. Consult a medical professional for ongoing or serious symptoms.
      </p>
    </aside>
  )
}
