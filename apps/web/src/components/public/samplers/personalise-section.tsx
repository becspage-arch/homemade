import Link from 'next/link'
import { UpgradeBlock } from '@/components/premium'
import { SAMPLER_KINDS, type SamplerKind } from '@/lib/studio/generation/samplers/kinds'
import { PersonaliseForm } from './personalise-form'
import './samplers.css'

/**
 * "Make it yours" — the section on a sampler's pattern page where the words
 * change.
 *
 * A section, not a dialog. The maker types a name and watches the piece they
 * are looking at become theirs, in place, with the chart underneath it the
 * whole time. Nothing pops up and nothing is hidden behind a click.
 *
 * The form and the live preview are open to everybody, because they are the
 * shop window and they cost a font pass. Keeping the copy is the premium
 * action: making a pattern of your own is create-your-own
 * (`notes/project/project_premium_free_spec.md`). Stitching the catalogue piece
 * as it stands stays free with an account, the same as every other free
 * pattern in the library.
 */
export function PersonaliseSection({
  patternId,
  patternName,
  kind,
  values,
  previewBaseUrl,
  gridWidth,
  gridHeight,
  isPremium,
  patternPath,
}: {
  patternId: string
  patternName: string
  kind: SamplerKind
  /** The wording the catalogue copy is charted with. The form starts here. */
  values: Record<string, string>
  previewBaseUrl: string | null
  gridWidth: number
  gridHeight: number
  isPremium: boolean
  patternPath: string
}) {
  const spec = SAMPLER_KINDS[kind]
  return (
    <section className="sampler-personalise" id="make-it-yours">
      <div className="sampler-personalise-head">
        <h2>Make it yours</h2>
        <p>{spec.blurb} The chart changes as you type.</p>
      </div>

      <PersonaliseForm
        patternId={patternId}
        patternName={patternName}
        kind={kind}
        initialValues={values}
        previewBaseUrl={previewBaseUrl}
        gridWidth={gridWidth}
        gridHeight={gridHeight}
        isPremium={isPremium}
        patternPath={patternPath}
      />

      {!isPremium && (
        <UpgradeBlock
          message="Keep a sampler with your own name and date on it."
          rationale="Premium covers making patterns of your own, printing them, and the designer library. This sampler is free to stitch as it is."
          gate="sampler_personalise"
          productArea="cross_stitch"
        />
      )}

      <p className="sampler-personalise-foot">
        Prefer it as it is?{' '}
        <Link href={`/studio/cross-stitch?patternId=${patternId}`}>Stitch this sampler</Link> as
        charted. That is free with an account.
      </p>
    </section>
  )
}
