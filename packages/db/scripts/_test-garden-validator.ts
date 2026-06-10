/**
 * Quick validator dry-run for garden cleanup A. Runs four cases:
 *
 *   1. soil-compost WITHOUT plantSlug              → expected: PASS
 *   2. soil-compost WITH plantSlug                  → expected: REJECT
 *      (garden.plantSlug not used on activity-axis guides)
 *   3. vegetables WITHOUT plantSlug                 → expected: REJECT
 *      (plantSlug required on plant-bearing guides)
 *   4. vegetables WITH plantSlug                    → expected: PASS
 *
 * No DB access; only the in-memory `validateInput`. The Species-table
 * lookup (upload-tutorial.ts side) is exercised against the live DB.
 */

import { validateInput, type TutorialUploadInput } from './upload-tutorial-types.js'

interface Case {
  label: string
  input: TutorialUploadInput
  expectPass: boolean
  expectMessageMatch?: RegExp
}

function makeBaseBody(): TutorialUploadInput['body'] {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'placeholder body for validator dry-run.' }],
      },
    ],
  } as TutorialUploadInput['body']
}

function makeBase(subCategorySlug: string, plantSlug?: string): TutorialUploadInput {
  return {
    slug: 'validator-test',
    title: 'Validator test',
    excerpt: 'Validator test',
    type: 'GROWING_GUIDE',
    categorySlug: 'garden',
    subCategorySlug,
    difficulty: 'BEGINNER',
    sourceType: 'SYNTHESISED',
    sourceNotes: 'test',
    garden: {
      ...(plantSlug ? { plantSlug } : {}),
      subTopic: 'growing',
      plantingMonths: ['march'],
      containerFriendly: false,
      indoorFriendly: false,
      regionsApplicable: ['UK'],
    },
    body: makeBaseBody(),
  } as TutorialUploadInput
}

const CASES: Case[] = [
  {
    label: 'soil-compost WITHOUT plantSlug',
    input: makeBase('soil-compost'),
    expectPass: true,
  },
  {
    label: 'soil-compost WITH plantSlug',
    input: makeBase('soil-compost', 'comfrey'),
    expectPass: false,
    expectMessageMatch: /not used on activity-axis guides/,
  },
  {
    label: 'vegetables WITHOUT plantSlug',
    input: makeBase('vegetables'),
    expectPass: false,
    expectMessageMatch: /required on plant-bearing guides/,
  },
  {
    label: 'vegetables WITH plantSlug',
    input: makeBase('vegetables', 'tomato'),
    expectPass: true,
  },
]

let failed = 0
for (const c of CASES) {
  let actualPass = false
  let message = ''
  try {
    validateInput(c.input)
    actualPass = true
  } catch (err) {
    actualPass = false
    message = (err as Error).message
  }
  const ok =
    actualPass === c.expectPass &&
    (!c.expectMessageMatch || c.expectMessageMatch.test(message))
  const status = ok ? '✓' : '✗'
  console.log(
    `${status} ${c.label.padEnd(38)} -> ${actualPass ? 'PASS' : 'REJECT'}${
      message ? ` :: ${message}` : ''
    }`,
  )
  if (!ok) failed += 1
}

if (failed > 0) {
  console.error(`\n${failed} case(s) failed.`)
  process.exit(1)
}
console.log('\nAll 4 cases behave as expected.')
