/**
 * Copies every UserPatternPhoto row forward into the unified UGCPhoto model.
 *
 * The old table is left in place, untouched and unused — nothing drops it and
 * nothing reads it after this runs. Re-running is safe: rows already carried
 * over are skipped on (userId, patternId, patternType, mediaId).
 *
 *   cd packages/db && pnpm exec tsx scripts/migrate-user-pattern-photos.ts
 *   cd packages/db && pnpm exec tsx scripts/migrate-user-pattern-photos.ts --dry
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

/** The subset of a UserPatternPhoto row the mapper needs. */
export interface LegacyPatternPhoto {
  id: string
  userId: string
  patternId: string
  patternType: string
  mediaId: string
  caption: string | null
  status: string
  reviewedAt: Date | null
  reviewedByUserId: string | null
  reviewNotes: string | null
  isFeatured: boolean
  isHero: boolean
  createdAt: Date
}

/** The UGCPhoto insert the mapper produces. */
export interface MappedMakerPhoto {
  userId: string
  tutorialId: null
  patternId: string
  patternType: string
  mediaId: string
  caption: string | null
  status: 'PENDING_MODERATION' | 'APPROVED' | 'REJECTED'
  rejectionReason: string | null
  removedAt: Date | null
  isFeatured: boolean
  isHero: boolean
  moderatedAt: Date | null
  moderatedById: string | null
  gateVerdict: { decision: string; reasons: string[]; source: 'migrated' } | null
  createdAt: Date
}

/**
 * UserPhotoStatus → UGCPhotoStatus. The old model had a fourth state,
 * RESCINDED (a photo the member pulled), which the unified model expresses as
 * REJECTED + `removedAt` — removed photos never show anywhere.
 */
export function mapLegacyPatternPhoto(row: LegacyPatternPhoto): MappedMakerPhoto {
  const rescinded = row.status === 'RESCINDED'
  const status =
    row.status === 'APPROVED'
      ? 'APPROVED'
      : row.status === 'REJECTED' || rescinded
        ? 'REJECTED'
        : 'PENDING_MODERATION'

  const reason = row.reviewNotes?.trim() || null

  return {
    userId: row.userId,
    tutorialId: null,
    patternId: row.patternId,
    patternType: row.patternType,
    mediaId: row.mediaId,
    caption: row.caption,
    status,
    rejectionReason: status === 'REJECTED' ? (reason ?? 'Not accepted.') : null,
    // A rescinded photo was already off the site; keep it off.
    removedAt: rescinded ? (row.reviewedAt ?? row.createdAt) : null,
    // Curation only survives on a photo that is actually approved.
    isFeatured: status === 'APPROVED' && row.isFeatured,
    isHero: status === 'APPROVED' && row.isHero,
    moderatedAt: row.reviewedAt,
    moderatedById: row.reviewedByUserId,
    // These predate the AI gate. Record where the verdict came from rather than
    // inventing gate reasons the model never gave.
    gateVerdict:
      status === 'PENDING_MODERATION'
        ? null
        : {
            decision: status === 'APPROVED' ? 'approve' : 'reject',
            reasons: reason ? [reason] : [],
            source: 'migrated',
          },
    createdAt: row.createdAt,
  }
}

async function main(): Promise<void> {
  const dry = process.argv.includes('--dry')
  const { prisma } = await import('../src')

  const legacy = await prisma.userPatternPhoto.findMany({ orderBy: { createdAt: 'asc' } })
  console.log(`UserPatternPhoto rows: ${legacy.length}`)
  if (legacy.length === 0) {
    console.log('Nothing to carry over.')
    await prisma.$disconnect()
    return
  }

  let inserted = 0
  let skipped = 0
  for (const row of legacy) {
    const mapped = mapLegacyPatternPhoto(row as unknown as LegacyPatternPhoto)
    const already = await prisma.uGCPhoto.findFirst({
      where: {
        userId: mapped.userId,
        patternId: mapped.patternId,
        patternType: mapped.patternType as never,
        mediaId: mapped.mediaId,
      },
      select: { id: true },
    })
    if (already) {
      skipped++
      continue
    }
    if (dry) {
      inserted++
      continue
    }
    await prisma.uGCPhoto.create({
      data: {
        userId: mapped.userId,
        patternId: mapped.patternId,
        patternType: mapped.patternType as never,
        mediaId: mapped.mediaId,
        caption: mapped.caption,
        status: mapped.status as never,
        rejectionReason: mapped.rejectionReason,
        removedAt: mapped.removedAt,
        isFeatured: mapped.isFeatured,
        isHero: mapped.isHero,
        moderatedAt: mapped.moderatedAt,
        moderatedById: mapped.moderatedById,
        gateVerdict: mapped.gateVerdict ?? undefined,
        createdAt: mapped.createdAt,
      },
    })
    inserted++
  }

  console.log(`${dry ? 'Would insert' : 'Inserted'}: ${inserted}. Already present: ${skipped}.`)
  await prisma.$disconnect()
}

// Only run the DB pass when invoked directly, so the test file can import the
// mapper without opening a connection.
if (process.argv[1] && process.argv[1].endsWith('migrate-user-pattern-photos.ts')) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
