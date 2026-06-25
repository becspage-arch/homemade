import type { RecipeNutrition } from '@/lib/recipes/nutrition'
import './nutrition-panel.css'

interface NutritionPanelProps {
  nutrition: RecipeNutrition
  servings: number | null
}

interface Line {
  label: string
  value: string
  sub?: boolean
}

/**
 * Per-serving nutrition estimate for a recipe. Server-rendered, shown only
 * when every ingredient had USDA per-100g data (the page gates on that), so
 * the panel never displays a figure built on a gap. Clearly labelled as an
 * estimate per the brand voice rules: no thresholds, no health claims.
 */
export function NutritionPanel({ nutrition, servings }: NutritionPanelProps) {
  const lines: Line[] = []
  if (nutrition.protein != null) lines.push({ label: 'Protein', value: `${nutrition.protein} g` })
  if (nutrition.carbohydrate != null)
    lines.push({ label: 'Carbohydrate', value: `${nutrition.carbohydrate} g` })
  if (nutrition.sugar != null) lines.push({ label: 'of which sugars', value: `${nutrition.sugar} g`, sub: true })
  if (nutrition.fat != null) lines.push({ label: 'Fat', value: `${nutrition.fat} g` })
  if (nutrition.saturatedFat != null)
    lines.push({ label: 'of which saturates', value: `${nutrition.saturatedFat} g`, sub: true })
  if (nutrition.fibre != null) lines.push({ label: 'Fibre', value: `${nutrition.fibre} g` })
  if (nutrition.sodiumMg != null)
    lines.push({ label: 'Sodium', value: `${Math.round(nutrition.sodiumMg)} mg` })

  return (
    <section className="nutrition-panel" aria-labelledby="nutrition-heading">
      <div className="nutrition-panel-head">
        <h2 id="nutrition-heading" className="nutrition-panel-title">
          Nutrition
        </h2>
        <span className="nutrition-panel-per">
          {servings && servings > 0 ? 'per serving' : 'per portion'}
        </span>
      </div>

      <div className="nutrition-panel-calories">
        <span className="nutrition-panel-calories-value">{Math.round(nutrition.calories)}</span>
        <span className="nutrition-panel-calories-unit">kcal</span>
      </div>

      {lines.length > 0 && (
        <dl className="nutrition-panel-grid">
          {lines.map((line) => (
            <div
              key={line.label}
              className={`nutrition-panel-row${line.sub ? ' is-sub' : ''}`}
            >
              <dt className="nutrition-panel-label">{line.label}</dt>
              <dd className="nutrition-panel-value">{line.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="nutrition-panel-note">
        An estimate worked out from the ingredients listed. Real amounts shift
        with brands, sizes, and how much you put on the plate.
      </p>
    </section>
  )
}
