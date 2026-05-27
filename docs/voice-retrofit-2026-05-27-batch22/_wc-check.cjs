/**
 * Compare word count between current PUBLISHED body (post-apply) and the
 * pre-apply snapshot in revisedFrom for each batch slug. Flag drops > 20%.
 * Uses Prisma via @homemade/db.
 */
const path = require('path')
const fs = require('fs')

function wc(node) {
  if (!node) return 0
  if (typeof node.text === 'string') return node.text.trim().split(/\s+/).filter(Boolean).length
  let total = 0
  if (Array.isArray(node.content)) for (const c of node.content) total += wc(c)
  if (node.attrs) {
    for (const v of Object.values(node.attrs)) {
      if (typeof v === 'string') total += v.trim().split(/\s+/).filter(Boolean).length
      if (Array.isArray(v)) for (const it of v) total += wc(it)
    }
  }
  return total
}

module.exports = { wc }
