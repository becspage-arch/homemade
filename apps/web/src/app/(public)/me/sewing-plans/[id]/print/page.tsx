import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma, type SewingPlanStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { PrintButton } from './print-button'
import './plan-print.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Print sewing plan · homemade',
  robots: { index: false, follow: false },
}

interface Ctx {
  params: Promise<{ id: string }>
}

const STATUS_LABEL: Record<SewingPlanStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'In progress',
  PAUSED: 'Paused',
  COMPLETED: 'Done',
  ARCHIVED: 'Archived',
}

interface FabricRow {
  id?: string
  name: string
  fabricType?: string
  widthCm?: number
  lengthCm?: number
  notes?: string
}
interface NotionRow {
  id?: string
  name: string
  quantity?: number
  notes?: string
}
interface ThreadRow {
  id?: string
  colour: string
  weight?: string
  notes?: string
}
interface StepRow {
  id?: string
  stepText: string
  isComplete: boolean
  notes?: string
}
interface CuttingPlanShape {
  layoutNotes?: string
  fabricWidthCm?: number
  totalLengthCm?: number
  pieceList?: string[]
}

function asArray<T>(input: unknown): T[] {
  return Array.isArray(input) ? (input as T[]) : []
}

export default async function PlanPrintPage({ params }: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in?redirect_url=/me/sewing-plans')

  const { id } = await params
  const plan = await prisma.userSewingPlan.findFirst({
    where: { id, userId: user.id },
  })
  if (!plan) notFound()

  const fabricList = asArray<FabricRow>(plan.fabricList)
  const notionsList = asArray<NotionRow>(plan.notionsList)
  const threadList = asArray<ThreadRow>(plan.threadList)
  const stepsList = asArray<StepRow>(plan.stepsList)
  const cuttingPlan =
    plan.cuttingPlan && typeof plan.cuttingPlan === 'object'
      ? (plan.cuttingPlan as CuttingPlanShape)
      : null

  const paperClass = user.paperSize === 'LETTER' ? 'paper-letter' : 'paper-a4'

  return (
    <div className={`print-page ${paperClass}`}>
      <div className="print-screen-bar">
        <Link href={`/me/sewing-plans/${plan.id}`} className="print-back">
          ← Back to plan
        </Link>
        <PrintButton />
      </div>

      <header className="print-header">
        <p className="print-overline">Sewing plan</p>
        <h1 className="print-title">{plan.title}</h1>
        <div className="print-meta">
          <span>Status: {STATUS_LABEL[plan.status]}</span>
          <span>Updated {new Date(plan.updatedAt).toLocaleDateString()}</span>
          {plan.patternSlug && <span>Pattern: {plan.patternSlug}</span>}
        </div>
      </header>

      {(fabricList.length > 0 || notionsList.length > 0 || threadList.length > 0) && (
        <section className="print-section">
          <h2>Materials</h2>

          {fabricList.length > 0 && (
            <div className="print-subsection">
              <h3>Fabric</h3>
              <table>
                <thead>
                  <tr>
                    <th>Fabric</th>
                    <th>Type</th>
                    <th>Width</th>
                    <th>Length</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {fabricList.map((f, i) => (
                    <tr key={f.id ?? i}>
                      <td>{f.name}</td>
                      <td>{f.fabricType ?? ''}</td>
                      <td>{f.widthCm != null ? `${f.widthCm} cm` : ''}</td>
                      <td>{f.lengthCm != null ? `${f.lengthCm} cm` : ''}</td>
                      <td>{f.notes ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {notionsList.length > 0 && (
            <div className="print-subsection">
              <h3>Notions</h3>
              <table>
                <thead>
                  <tr>
                    <th>Notion</th>
                    <th>Quantity</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {notionsList.map((n, i) => (
                    <tr key={n.id ?? i}>
                      <td>{n.name}</td>
                      <td>{n.quantity ?? ''}</td>
                      <td>{n.notes ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {threadList.length > 0 && (
            <div className="print-subsection">
              <h3>Thread</h3>
              <table>
                <thead>
                  <tr>
                    <th>Colour</th>
                    <th>Weight</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {threadList.map((t, i) => (
                    <tr key={t.id ?? i}>
                      <td>{t.colour}</td>
                      <td>{t.weight ?? ''}</td>
                      <td>{t.notes ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {cuttingPlan && (cuttingPlan.layoutNotes || cuttingPlan.fabricWidthCm || cuttingPlan.pieceList?.length) && (
        <section className="print-section">
          <h2>Cutting plan</h2>
          <div className="print-cutting-meta">
            {cuttingPlan.fabricWidthCm != null && (
              <span>Fabric width: {cuttingPlan.fabricWidthCm} cm</span>
            )}
            {cuttingPlan.totalLengthCm != null && (
              <span>Total length needed: {cuttingPlan.totalLengthCm} cm</span>
            )}
          </div>
          {cuttingPlan.layoutNotes && (
            <p className="print-paragraph">{cuttingPlan.layoutNotes}</p>
          )}
          {cuttingPlan.pieceList && cuttingPlan.pieceList.length > 0 && (
            <ul className="print-list">
              {cuttingPlan.pieceList.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {stepsList.length > 0 && (
        <section className="print-section">
          <h2>Steps</h2>
          <ol className="print-steps">
            {stepsList.map((s, i) => (
              <li key={s.id ?? i} className={s.isComplete ? 'is-complete' : ''}>
                <span className="print-step-box" aria-hidden>
                  {s.isComplete ? '☑' : '☐'}
                </span>
                <div>
                  <p>{s.stepText}</p>
                  {s.notes && <p className="print-step-notes">{s.notes}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {plan.notes && (
        <section className="print-section">
          <h2>Notes</h2>
          <p className="print-paragraph">{plan.notes}</p>
        </section>
      )}

      <footer className="print-footer">
        <span>homemade.education</span>
      </footer>
    </div>
  )
}
