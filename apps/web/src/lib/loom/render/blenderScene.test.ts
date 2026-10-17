/**
 * Hero stage VARIANTS (job stages): a pattern always gets the same set, a hand
 * pick wins, every variant id is reachable, and the ids match the Python
 * renderer's STAGE_VARIANTS table in the same order.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  HERO_PHOTO_STAGE3_KNOBS,
  HERO_PHOTO_STAGE3_STARTS,
  HERO_PHOTO_V2_DEFAULTS,
  HERO_STAGE_VARIANTS,
  heroPhotoView,
  pickHeroStageVariant,
} from './blenderScene'
import { buildCowProgram, COW_DEFAULTS } from '../crochet/engine/cowPreset'
import { compositionScene } from '../crochet/engine/composition'

test('a slug always picks the same variant', () => {
  const a = pickHeroStageVariant('nursery', 'sleepy-bunny-nightcap')
  for (let i = 0; i < 5; i++) assert.equal(pickHeroStageVariant('nursery', 'sleepy-bunny-nightcap'), a)
  assert.ok((HERO_STAGE_VARIANTS.nursery as readonly string[]).includes(a!))
})

test('studio has no variant; an explicit valid id wins; an invalid one is ignored', () => {
  assert.equal(pickHeroStageVariant('studio', 'x'), undefined)
  assert.equal(pickHeroStageVariant('christmas', 'x', 'snow'), 'snow')
  assert.equal(pickHeroStageVariant('christmas', 'x', 'nope'), pickHeroStageVariant('christmas', 'x'))
})

test('slugs spread over every variant of every stage', () => {
  for (const [stage, ids] of Object.entries(HERO_STAGE_VARIANTS)) {
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) seen.add(pickHeroStageVariant(stage as 'linen', `pattern-${i}`)!)
    assert.deepEqual([...seen].sort(), [...ids].sort(), stage)
  }
})

test('the TS variant table matches the Python renderer', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const py = readFileSync(join(here, '../../../../scripts/loom_render_crochet.py'), 'utf8')
  for (const [stage, ids] of Object.entries(HERO_STAGE_VARIANTS)) {
    const m = py.match(new RegExp(`"${stage}": \\(([^)]*)\\)`))
    assert.ok(m, `STAGE_VARIANTS["${stage}"] missing in the Python`)
    const pyIds = [...m![1]!.matchAll(/"([^"]+)"/g)].map((x) => x[1])
    assert.deepEqual(pyIds, [...ids], stage)
  }
})

test('photo: unset / v1 writes nothing (existing heroes unchanged); v2 and knobs pass through', () => {
  assert.deepEqual(heroPhotoView(), {})
  assert.deepEqual(heroPhotoView('v1'), {})
  assert.deepEqual(heroPhotoView('v2'), { photo: 'v2' })
  assert.deepEqual(heroPhotoView('v2', { photoFstop: 4, photoKey: undefined }), { photo: 'v2', photoFstop: 4 })
  assert.deepEqual(heroPhotoView(undefined, { photoProps: 'v2' }), { photoProps: 'v2' })
  // an unknown key never reaches the scene
  assert.deepEqual(heroPhotoView('v2', { nope: 1 } as never), { photo: 'v2' })
})

test('the TS photo v2 knobs and defaults match PHOTO_V2 in the Python renderer', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const py = readFileSync(join(here, '../../../../scripts/loom_render_crochet.py'), 'utf8')
  const m = py.match(/PHOTO_V2 = dict\(([\s\S]*?)\n\)/)
  assert.ok(m, 'PHOTO_V2 missing in the Python')
  const pyKv: Record<string, unknown> = {}
  for (const x of m![1]!.matchAll(/(photo\w+)=("[^"]*"|[-\d.]+|None)/g)) {
    const raw = x[2]!
    pyKv[x[1]!] = raw.startsWith('"') ? raw.slice(1, -1) : raw === 'None' ? null : Number(raw)
  }
  assert.deepEqual(pyKv, { ...HERO_PHOTO_V2_DEFAULTS })
  const v1 = py.match(/PHOTO_V1 = dict\(([\s\S]*?)\n\)/)
  assert.ok(v1, 'PHOTO_V1 missing in the Python')
  const v1Keys = [...v1![1]!.matchAll(/(photo\w+)=/g)].map((x) => x[1])
  assert.deepEqual(v1Keys.sort(), Object.keys(HERO_PHOTO_V2_DEFAULTS).sort())
})

test('stage 3: the new knobs are off in PHOTO_V2 and PHOTO_V1 alike (today\'s v2 and v1 render unchanged)', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const py = readFileSync(join(here, '../../../../scripts/loom_render_crochet.py'), 'utf8')
  const parse = (name: string) => {
    const m = py.match(new RegExp(`${name} = dict\\(([\\s\\S]*?)\\n\\)`))
    assert.ok(m, `${name} missing in the Python`)
    const kv: Record<string, unknown> = {}
    for (const x of m![1]!.matchAll(/(photo\w+)=("[^"]*"|[-\d.]+|None)/g)) {
      const raw = x[2]!
      kv[x[1]!] = raw.startsWith('"') ? raw.slice(1, -1) : raw === 'None' ? null : Number(raw)
    }
    return kv
  }
  const off = parse('PHOTO_STAGE3_OFF')
  assert.deepEqual(Object.keys(off).sort(), [...HERO_PHOTO_STAGE3_KNOBS].sort())
  const v1 = parse('PHOTO_V1')
  for (const k of HERO_PHOTO_STAGE3_KNOBS) {
    assert.equal(off[k], HERO_PHOTO_V2_DEFAULTS[k], k)
    assert.equal(v1[k], HERO_PHOTO_V2_DEFAULTS[k], k)
  }
  // the starting values only name stage-3 knobs
  for (const knobs of Object.values(HERO_PHOTO_STAGE3_STARTS)) {
    for (const k of Object.keys(knobs!)) assert.ok((HERO_PHOTO_STAGE3_KNOBS as readonly string[]).includes(k), k)
  }
})

test('stage 3: v1 and today\'s v2 write the same scene as before; knobs pass through only when set', () => {
  // the cow's real program (its stage, zoom, camera); an empty compiled body so
  // the test stays fast (the photo keys live in the view, not the strokes)
  const prog = { ...buildCowProgram({ ...COW_DEFAULTS, size: 'M', stage: 'windowsill' }), accessories: [] }
  const cc = { yr: 0.3, placed: [], hair: [], embroidery: [], props: [], problems: [] } as unknown as Parameters<
    typeof compositionScene
  >[1]
  const plain = JSON.parse(JSON.stringify(compositionScene({ ...prog, photo: undefined, photoKnobs: undefined }, cc)))
  const v1 = JSON.parse(JSON.stringify(compositionScene({ ...prog, photo: 'v1' }, cc)))
  const v2 = JSON.parse(JSON.stringify(compositionScene({ ...prog, photo: 'v2' }, cc)))
  // v1 = no photo at all; v2 = the same scene plus only `photo: 'v2'`
  assert.deepEqual(v1, plain)
  assert.deepEqual(v2, { ...plain, view: { ...plain.view, photo: 'v2' } })
  for (const k of HERO_PHOTO_STAGE3_KNOBS) {
    assert.equal(k in v2.view, false, k)
    assert.equal(k in v1.view, false, k)
  }
  const s3 = JSON.parse(
    JSON.stringify(compositionScene({ ...prog, photo: 'v2', photoKnobs: HERO_PHOTO_STAGE3_STARTS.windowsill }, cc)),
  )
  assert.deepEqual(s3, { ...plain, view: { ...plain.view, photo: 'v2', ...HERO_PHOTO_STAGE3_STARTS.windowsill } })
})
