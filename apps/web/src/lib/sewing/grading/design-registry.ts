// SPDX-License-Identifier: MIT
// Design registry. The single place where freesewing designs are
// catalogued. Adding a new design = adding an entry here; no change to
// grader.ts is needed.
//
// The importer is lazy so production bundles don't pay the cost for
// designs nobody is drafting in this process.

import type { SewingDesignConfig } from './types'

// Bella body block — measurements required by `bella.back.measurements`
// in @freesewing/bella@4.9.0. Verified at install time from the package
// source.
const BELLA_REQUIRED = [
  'highBust',
  'chest',
  'underbust',
  'waist',
  'waistBack',
  'bustSpan',
  'neck',
  'hpsToBust',
  'hpsToWaistFront',
  'hpsToWaistBack',
  'shoulderToShoulder',
  'shoulderSlope',
]

// Brian body block — measurements per `brian.base.measurements` in
// @freesewing/brian@4.9.0. highBust is an optional measurement that
// enables the draftForHighBust option.
const BRIAN_REQUIRED = [
  'biceps',
  'chest',
  'hpsToBust',
  'hpsToWaistBack',
  'neck',
  'shoulderToShoulder',
  'shoulderSlope',
  'waistToArmpit',
  'waistToHips',
]
const BRIAN_OPTIONAL = ['highBust']

// Aaron knit T-shirt — inherits brian.front + brian.back via design
// composition. front.measurements adds 'hips'.
const AARON_REQUIRED = [...BRIAN_REQUIRED, 'hips']

// S-5e additions. Required + optional measurement lists collected by
// walking each freesewing design's part inheritance chain at install
// time (designSlug.measurements + part.from.measurements transitively).
// Verified against @freesewing/<slug>@4.9.0 sources on 2026-06-11.
const BEE_REQUIRED = [
  'bustPointToUnderbust', 'bustSpan', 'chest', 'highBust', 'hpsToBust',
  'hpsToWaistBack', 'hpsToWaistFront', 'neck', 'shoulderSlope',
  'shoulderToShoulder', 'underbust', 'waist', 'waistBack',
]

const BENT_REQUIRED = [
  'biceps', 'chest', 'hpsToBust', 'hpsToWaistBack', 'neck', 'shoulderSlope',
  'shoulderToElbow', 'shoulderToShoulder', 'shoulderToWrist',
  'waistToArmpit', 'waistToHips', 'wrist',
]
const BENT_OPTIONAL = ['highBust']

const CARLITA_REQUIRED = [
  'biceps', 'bustSpan', 'chest', 'highBust', 'hpsToBust', 'hpsToWaistBack',
  'neck', 'seat', 'shoulderSlope', 'shoulderToElbow', 'shoulderToShoulder',
  'shoulderToWrist', 'waist', 'waistToArmpit', 'waistToFloor',
  'waistToHips', 'waistToSeat', 'wrist',
]

const CARLTON_REQUIRED = [
  'biceps', 'chest', 'hpsToBust', 'hpsToWaistBack', 'neck', 'seat',
  'shoulderSlope', 'shoulderToElbow', 'shoulderToShoulder',
  'shoulderToWrist', 'waist', 'waistToArmpit', 'waistToFloor',
  'waistToHips', 'waistToSeat', 'wrist',
]
const CARLTON_OPTIONAL = ['highBust']

const CATHRIN_REQUIRED = ['hips', 'underbust', 'waist', 'waistToHips', 'waistToUnderbust']

const CHARLIE_REQUIRED = [
  'crossSeam', 'crossSeamFront', 'knee', 'seat', 'seatBack', 'waist',
  'waistBack', 'waistToFloor', 'waistToHips', 'waistToKnee', 'waistToSeat',
  'waistToUpperLeg',
]

const DIANA_REQUIRED = [
  'biceps', 'chest', 'hips', 'hpsToBust', 'hpsToWaistBack', 'neck',
  'shoulderSlope', 'shoulderToShoulder', 'shoulderToWrist', 'waist',
  'waistToArmpit', 'waistToHips', 'wrist',
]
const DIANA_OPTIONAL = ['highBust']

const HUEY_REQUIRED = [
  'biceps', 'chest', 'head', 'hips', 'hpsToBust', 'hpsToWaistBack', 'neck',
  'shoulderSlope', 'shoulderToShoulder', 'shoulderToWrist', 'waistToArmpit',
  'waistToHips', 'wrist',
]
const HUEY_OPTIONAL = ['highBust']

const NOBLE_REQUIRED = [
  'bustSpan', 'chest', 'highBust', 'hpsToBust', 'hpsToWaistBack',
  'hpsToWaistFront', 'neck', 'shoulderSlope', 'shoulderToShoulder',
  'underbust', 'waist', 'waistBack',
]

const ONYX_REQUIRED = [
  'ankle', 'biceps', 'chest', 'crossSeam', 'head', 'hips', 'hpsToWaistBack',
  'hpsToWaistFront', 'inseam', 'neck', 'seat', 'shoulderToWrist',
  'upperLeg', 'waist', 'waistToArmpit', 'waistToHips', 'waistToSeat',
  'waistToUpperLeg', 'wrist',
]
const ONYX_OPTIONAL = ['highBust']

const PENELOPE_REQUIRED = ['seat', 'waist', 'waistToHips', 'waistToKnee', 'waistToSeat']
const PENELOPE_OPTIONAL = ['seatBack', 'waistBack']

const SANDY_REQUIRED = ['hips', 'waist', 'waistToFloor', 'waistToHips']

const SIMON_REQUIRED = [
  'biceps', 'chest', 'hips', 'hpsToBust', 'hpsToWaistBack', 'neck',
  'shoulderSlope', 'shoulderToShoulder', 'shoulderToWrist', 'waist',
  'waistToArmpit', 'waistToHips', 'wrist',
]
const SIMON_OPTIONAL = ['highBust']

const TITAN_REQUIRED = [
  'crossSeam', 'crossSeamFront', 'knee', 'seat', 'seatBack', 'waist',
  'waistBack', 'waistToFloor', 'waistToHips', 'waistToKnee', 'waistToSeat',
  'waistToUpperLeg',
]

const WARALEE_REQUIRED = ['crotchDepth', 'inseam', 'seat', 'waistToHips']
const WARALEE_OPTIONAL = ['waist', 'waistBack']

export const SEWING_DESIGN_REGISTRY: Record<string, SewingDesignConfig> = {
  bella: {
    slug: 'bella',
    name: 'Bella body block',
    description:
      'A fitted bodice block for women, drafted to your bust, waist, and hip with optional high-bust adjustment. Use it as the base for your own designs or as a fit check before you cut a new pattern.',
    freesewingPackage: '@freesewing/bella',
    importer: () => import('@freesewing/bella'),
    designExportName: 'Bella',
    genderFamily: 'WOMENS',
    skillLevel: 'IMPROVER',
    requiredMeasurements: BELLA_REQUIRED,
    optionalMeasurements: [],
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'How much room sits between the bodice and your chest.',
        default: 4,
        min: -4,
        max: 20,
        step: 0.5,
      },
      waistEase: {
        type: 'pct',
        label: 'Waist ease',
        description: 'Ease at the waist. Negative values draw the bodice in.',
        default: 3,
        min: -4,
        max: 20,
        step: 0.5,
      },
      hipsEase: {
        type: 'pct',
        label: 'Hip ease',
        description: 'How much room sits between the bodice and your hips.',
        default: 4,
        min: -4,
        max: 20,
        step: 0.5,
      },
      draftForHighBust: {
        type: 'bool',
        label: 'Adjust for high bust',
        description:
          'On if your full-bust measurement is much larger than your high-bust. Drafts to high-bust then grades the bust dart.',
        default: false,
      },
    },
    hackHandles: [
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: -4, max: 20, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'waistEase',
        attachTo: 'waistline',
        range: { min: -4, max: 20, step: 0.5, unit: 'pct' },
        label: 'Waist ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'hipsEase',
        attachTo: 'hem',
        range: { min: -4, max: 20, step: 0.5, unit: 'pct' },
        label: 'Hip ease',
        axis: 'horizontal',
      },
    ],
  },
  brian: {
    slug: 'brian',
    name: 'Brian body block',
    description:
      'A men’s body block for a fitted woven top. Use it as a starting point for shirts, tunics, and outerwear or as a fit check before cutting your own design.',
    freesewingPackage: '@freesewing/brian',
    importer: () => import('@freesewing/brian'),
    designExportName: 'Brian',
    genderFamily: 'MENS',
    skillLevel: 'IMPROVER',
    requiredMeasurements: BRIAN_REQUIRED,
    optionalMeasurements: BRIAN_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Room between the bodice and your chest.',
        default: 8,
        min: -4,
        max: 25,
        step: 0.5,
      },
      bicepsEase: {
        type: 'pct',
        label: 'Biceps ease',
        description: 'Room around the upper arm.',
        default: 15,
        min: 0,
        max: 30,
        step: 0.5,
      },
      shoulderEase: {
        type: 'pct',
        label: 'Shoulder ease',
        description: 'Width added to the shoulder line.',
        default: 0,
        min: -2,
        max: 10,
        step: 0.5,
      },
      collarEase: {
        type: 'pct',
        label: 'Collar ease',
        description: 'Room around the neck.',
        default: 5,
        min: 0,
        max: 15,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'Body length added below the waist.',
        default: 0,
        min: -10,
        max: 25,
        step: 0.5,
      },
      sleeveLengthBonus: {
        type: 'pct',
        label: 'Sleeve length bonus',
        description: 'Sleeve length added past the wrist.',
        default: 0,
        min: -20,
        max: 50,
        step: 0.5,
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: -10, max: 25, step: 0.5, unit: 'pct' },
        label: 'Body length',
        axis: 'vertical',
      },
      {
        optionKey: 'sleeveLengthBonus',
        attachTo: 'sleeveCuff',
        range: { min: -20, max: 50, step: 0.5, unit: 'pct' },
        label: 'Sleeve length',
        axis: 'vertical',
      },
      {
        optionKey: 'collarEase',
        attachTo: 'neckline',
        range: { min: 0, max: 15, step: 0.5, unit: 'pct' },
        label: 'Neckline ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: -4, max: 25, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
    ],
  },
  aaron: {
    slug: 'aaron',
    name: 'Aaron knit A-shirt',
    description:
      'A simple knit A-shirt with shoulder straps and a scooped neckline. Beginner-friendly, works in light jersey or stretch fabrics.',
    freesewingPackage: '@freesewing/aaron',
    importer: () => import('@freesewing/aaron'),
    designExportName: 'Aaron',
    genderFamily: 'UNISEX',
    skillLevel: 'BEGINNER',
    requiredMeasurements: AARON_REQUIRED,
    optionalMeasurements: BRIAN_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Knit fabrics often want negative ease for a fitted look.',
        default: -4,
        min: -10,
        max: 10,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'Body length added below the waist.',
        default: 4,
        min: -10,
        max: 25,
        step: 0.5,
      },
      armholeDrop: {
        type: 'pct',
        label: 'Armhole drop',
        description: 'How deep the armhole sits below the shoulder line.',
        default: 4,
        min: 0,
        max: 15,
        step: 0.5,
      },
      shoulderStrapWidth: {
        type: 'pct',
        label: 'Shoulder strap width',
        description: 'Width of the strap across the shoulder.',
        default: 15,
        min: 5,
        max: 30,
        step: 0.5,
      },
      shoulderStrapPlacement: {
        type: 'pct',
        label: 'Shoulder strap placement',
        description: 'How far in from the shoulder edge the strap sits.',
        default: 40,
        min: 20,
        max: 80,
        step: 1,
      },
      backlineBend: {
        type: 'pct',
        label: 'Back neckline curve',
        description: 'How deeply the back neckline curves down.',
        default: 10,
        min: 0,
        max: 40,
        step: 1,
      },
      necklineDrop: {
        type: 'pct',
        label: 'Front neckline drop',
        description: 'How low the front neckline sits.',
        default: 20,
        min: 0,
        max: 50,
        step: 1,
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: -10, max: 25, step: 0.5, unit: 'pct' },
        label: 'Body length',
        axis: 'vertical',
      },
      {
        optionKey: 'necklineDrop',
        attachTo: 'neckline',
        range: { min: 0, max: 50, step: 1, unit: 'pct' },
        label: 'Front neckline',
        axis: 'vertical',
      },
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: -10, max: 10, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'armholeDrop',
        attachTo: 'sleeveCuff',
        range: { min: 0, max: 15, step: 0.5, unit: 'pct' },
        label: 'Armhole drop',
        axis: 'vertical',
      },
    ],
  },
  bee: {
    slug: 'bee',
    name: 'Bee bikini top',
    description:
      'A women\'s bikini top with band-tie straps, drafted to your bust and high-bust measurements. Knit or woven fabrics with light interfacing.',
    freesewingPackage: '@freesewing/bee',
    importer: () => import('@freesewing/bee'),
    designExportName: 'Bee',
    genderFamily: 'WOMENS',
    skillLevel: 'INTERMEDIATE',
    requiredMeasurements: BEE_REQUIRED,
    optionalMeasurements: [],
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Room between the cups and your chest.',
        default: 11,
        min: 5,
        max: 20,
        step: 0.5,
      },
      waistEase: {
        type: 'pct',
        label: 'Band ease',
        description: 'Room around the band at the underbust.',
        default: 5,
        min: 1,
        max: 20,
        step: 0.5,
      },
      bandTieWidth: {
        type: 'pct',
        label: 'Band tie width',
        description: 'How wide the band-tie straps sit.',
        default: 3,
        min: 1,
        max: 9,
        step: 0.5,
      },
      ties: {
        type: 'bool',
        label: 'Use ties at the back',
        description: 'On for a tied back. Off for a smooth back band.',
        default: true,
      },
    },
    hackHandles: [
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: 5, max: 20, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'waistEase',
        attachTo: 'hem',
        range: { min: 1, max: 20, step: 0.5, unit: 'pct' },
        label: 'Band ease',
        axis: 'horizontal',
      },
    ],
  },
  bent: {
    slug: 'bent',
    name: 'Bent body block',
    description:
      'A men\'s body block with a two-part tailored sleeve. Use it as the base for blazers, jackets, and structured shirts.',
    freesewingPackage: '@freesewing/bent',
    importer: () => import('@freesewing/bent'),
    designExportName: 'Bent',
    genderFamily: 'MENS',
    skillLevel: 'ADVANCED',
    requiredMeasurements: BENT_REQUIRED,
    optionalMeasurements: BENT_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Room between the body and your chest.',
        default: 8,
        min: -4,
        max: 25,
        step: 0.5,
      },
      bicepsEase: {
        type: 'pct',
        label: 'Biceps ease',
        description: 'Room around the upper arm.',
        default: 15,
        min: 0,
        max: 30,
        step: 0.5,
      },
      collarEase: {
        type: 'pct',
        label: 'Collar ease',
        description: 'Room around the neck.',
        default: 5,
        min: 0,
        max: 15,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'Body length added below the waist.',
        default: 0,
        min: -10,
        max: 25,
        step: 0.5,
      },
      sleeveLengthBonus: {
        type: 'pct',
        label: 'Sleeve length bonus',
        description: 'Sleeve length added past the wrist.',
        default: 0,
        min: -20,
        max: 50,
        step: 0.5,
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: -10, max: 25, step: 0.5, unit: 'pct' },
        label: 'Body length',
        axis: 'vertical',
      },
      {
        optionKey: 'sleeveLengthBonus',
        attachTo: 'sleeveCuff',
        range: { min: -20, max: 50, step: 0.5, unit: 'pct' },
        label: 'Sleeve length',
        axis: 'vertical',
      },
      {
        optionKey: 'collarEase',
        attachTo: 'neckline',
        range: { min: 0, max: 15, step: 0.5, unit: 'pct' },
        label: 'Collar ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: -4, max: 25, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
    ],
  },
  carlita: {
    slug: 'carlita',
    name: 'Carlita coat',
    description:
      'A women\'s long coat with welt chest pockets, collar, and a back belt. Tailored construction in medium-to-heavy wovens.',
    freesewingPackage: '@freesewing/carlita',
    importer: () => import('@freesewing/carlita'),
    designExportName: 'Carlita',
    genderFamily: 'WOMENS',
    skillLevel: 'ADVANCED',
    requiredMeasurements: CARLITA_REQUIRED,
    optionalMeasurements: [],
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Room between the coat and your chest.',
        default: 12,
        min: 0,
        max: 30,
        step: 0.5,
      },
      bicepsEase: {
        type: 'pct',
        label: 'Biceps ease',
        description: 'Room around the upper arm.',
        default: 15,
        min: 0,
        max: 35,
        step: 0.5,
      },
      collarEase: {
        type: 'pct',
        label: 'Collar ease',
        description: 'Room around the neck.',
        default: 8,
        min: 0,
        max: 20,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'How much length added past the waist for a longer coat.',
        default: 0,
        min: -10,
        max: 25,
        step: 0.5,
      },
      sleeveLengthBonus: {
        type: 'pct',
        label: 'Sleeve length bonus',
        description: 'Sleeve length added past the wrist.',
        default: 0,
        min: -20,
        max: 30,
        step: 0.5,
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: -10, max: 25, step: 0.5, unit: 'pct' },
        label: 'Body length',
        axis: 'vertical',
      },
      {
        optionKey: 'sleeveLengthBonus',
        attachTo: 'sleeveCuff',
        range: { min: -20, max: 30, step: 0.5, unit: 'pct' },
        label: 'Sleeve length',
        axis: 'vertical',
      },
      {
        optionKey: 'collarEase',
        attachTo: 'neckline',
        range: { min: 0, max: 20, step: 0.5, unit: 'pct' },
        label: 'Collar ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: 0, max: 30, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
    ],
  },
  carlton: {
    slug: 'carlton',
    name: 'Carlton coat',
    description:
      'A men\'s long coat with welt chest pockets, collar, and a back belt. Tailored construction in medium-to-heavy wovens.',
    freesewingPackage: '@freesewing/carlton',
    importer: () => import('@freesewing/carlton'),
    designExportName: 'Carlton',
    genderFamily: 'MENS',
    skillLevel: 'ADVANCED',
    requiredMeasurements: CARLTON_REQUIRED,
    optionalMeasurements: CARLTON_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Room between the coat and your chest.',
        default: 12,
        min: 0,
        max: 30,
        step: 0.5,
      },
      bicepsEase: {
        type: 'pct',
        label: 'Biceps ease',
        description: 'Room around the upper arm.',
        default: 15,
        min: 0,
        max: 35,
        step: 0.5,
      },
      collarEase: {
        type: 'pct',
        label: 'Collar ease',
        description: 'Room around the neck.',
        default: 8,
        min: 0,
        max: 20,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'How much length added past the waist for a longer coat.',
        default: 0,
        min: -10,
        max: 25,
        step: 0.5,
      },
      sleeveLengthBonus: {
        type: 'pct',
        label: 'Sleeve length bonus',
        description: 'Sleeve length added past the wrist.',
        default: 0,
        min: -20,
        max: 30,
        step: 0.5,
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: -10, max: 25, step: 0.5, unit: 'pct' },
        label: 'Body length',
        axis: 'vertical',
      },
      {
        optionKey: 'sleeveLengthBonus',
        attachTo: 'sleeveCuff',
        range: { min: -20, max: 30, step: 0.5, unit: 'pct' },
        label: 'Sleeve length',
        axis: 'vertical',
      },
      {
        optionKey: 'collarEase',
        attachTo: 'neckline',
        range: { min: 0, max: 20, step: 0.5, unit: 'pct' },
        label: 'Collar ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: 0, max: 30, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
    ],
  },
  cathrin: {
    slug: 'cathrin',
    name: 'Cathrin underbust corset',
    description:
      'A panelled underbust corset / waist trainer. Eleven or thirteen panels, boned, with back lacing. Specialist construction in coutil with light boning.',
    freesewingPackage: '@freesewing/cathrin',
    importer: () => import('@freesewing/cathrin'),
    designExportName: 'Cathrin',
    genderFamily: 'WOMENS',
    skillLevel: 'EXPERT',
    requiredMeasurements: CATHRIN_REQUIRED,
    optionalMeasurements: [],
    verifyTolerance: 0.05,
    options: {
      waistReduction: {
        type: 'pct',
        label: 'Waist reduction',
        description: 'How much the corset draws the waist in.',
        default: 10,
        min: 2,
        max: 20,
        step: 0.5,
      },
      panels: {
        type: 'enum',
        label: 'Number of panels',
        description: 'Eleven panels for an everyday corset; thirteen for stronger shaping.',
        default: '13',
        values: [
          { value: '11', label: '11 panels' },
          { value: '13', label: '13 panels' },
        ],
      },
      backOpening: {
        type: 'pct',
        label: 'Back opening width',
        description: 'How far apart the back panels sit at the laces.',
        default: 4,
        min: 3,
        max: 10,
        step: 0.5,
      },
      hipRise: {
        type: 'pct',
        label: 'Hip rise',
        description: 'How high the corset sits at the hip line.',
        default: 5,
        min: 0,
        max: 15,
        step: 0.5,
      },
    },
    hackHandles: [
      {
        optionKey: 'waistReduction',
        attachTo: 'waistline',
        range: { min: 2, max: 20, step: 0.5, unit: 'pct' },
        label: 'Waist reduction',
        axis: 'horizontal',
      },
      {
        optionKey: 'hipRise',
        attachTo: 'hem',
        range: { min: 0, max: 15, step: 0.5, unit: 'pct' },
        label: 'Hip rise',
        axis: 'vertical',
      },
    ],
  },
  charlie: {
    slug: 'charlie',
    name: 'Charlie chinos',
    description:
      'Men\'s chino trousers with welt back pockets, belt loops, and a fly-front closure. Cotton twill or canvas.',
    freesewingPackage: '@freesewing/charlie',
    importer: () => import('@freesewing/charlie'),
    designExportName: 'Charlie',
    genderFamily: 'MENS',
    skillLevel: 'INTERMEDIATE',
    requiredMeasurements: CHARLIE_REQUIRED,
    optionalMeasurements: [],
    verifyTolerance: 0.05,
    options: {
      waistEase: {
        type: 'pct',
        label: 'Waist ease',
        description: 'Room around the waistband.',
        default: 2,
        min: 0,
        max: 10,
        step: 0.5,
      },
      backPocketWidth: {
        type: 'pct',
        label: 'Back pocket width',
        description: 'How wide the welt pockets sit at the back.',
        default: 55,
        min: 50,
        max: 60,
        step: 1,
      },
      backPocketDepth: {
        type: 'pct',
        label: 'Back pocket depth',
        description: 'How deep the welt pockets reach.',
        default: 60,
        min: 40,
        max: 80,
        step: 1,
      },
      backPocketFacing: {
        type: 'bool',
        label: 'Faced back pockets',
        description: 'On for a self-fabric facing visible at the pocket mouth.',
        default: true,
      },
    },
    hackHandles: [
      {
        optionKey: 'waistEase',
        attachTo: 'waistline',
        range: { min: 0, max: 10, step: 0.5, unit: 'pct' },
        label: 'Waist ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'backPocketDepth',
        attachTo: 'pocket',
        range: { min: 40, max: 80, step: 1, unit: 'pct' },
        label: 'Back pocket depth',
        axis: 'vertical',
      },
      {
        optionKey: 'backPocketWidth',
        attachTo: 'pocket',
        range: { min: 50, max: 60, step: 1, unit: 'pct' },
        label: 'Back pocket width',
        axis: 'horizontal',
      },
    ],
  },
  diana: {
    slug: 'diana',
    name: 'Diana draped top',
    description:
      'A women\'s knit top with a draped neckline. Beginner-friendly in light jersey or stretch fabrics.',
    freesewingPackage: '@freesewing/diana',
    importer: () => import('@freesewing/diana'),
    designExportName: 'Diana',
    genderFamily: 'WOMENS',
    skillLevel: 'BEGINNER',
    requiredMeasurements: DIANA_REQUIRED,
    optionalMeasurements: DIANA_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Knit fabrics work with smaller ease than wovens.',
        default: 8,
        min: -4,
        max: 20,
        step: 0.5,
      },
      hipsEase: {
        type: 'pct',
        label: 'Hip ease',
        description: 'Room around the hips.',
        default: 6,
        min: -4,
        max: 20,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'Body length added below the waist.',
        default: 0,
        min: -10,
        max: 25,
        step: 0.5,
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: -10, max: 25, step: 0.5, unit: 'pct' },
        label: 'Body length',
        axis: 'vertical',
      },
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: -4, max: 20, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'hipsEase',
        attachTo: 'hem',
        range: { min: -4, max: 20, step: 0.5, unit: 'pct' },
        label: 'Hip ease',
        axis: 'horizontal',
      },
    ],
  },
  huey: {
    slug: 'huey',
    name: 'Huey zip-up hoodie',
    description:
      'A zip-up hoodie with kangaroo pocket, ribbed cuffs, and an adjustable hood. Sweatshirt fleece or French terry.',
    freesewingPackage: '@freesewing/huey',
    importer: () => import('@freesewing/huey'),
    designExportName: 'Huey',
    genderFamily: 'UNISEX',
    skillLevel: 'INTERMEDIATE',
    requiredMeasurements: HUEY_REQUIRED,
    optionalMeasurements: HUEY_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Room between the hoodie and your chest.',
        default: 15,
        min: -4,
        max: 35,
        step: 0.5,
      },
      hipsEase: {
        type: 'pct',
        label: 'Hip ease',
        description: 'Room around the hips.',
        default: 8,
        min: 4,
        max: 12,
        step: 0.5,
      },
      bicepsEase: {
        type: 'pct',
        label: 'Biceps ease',
        description: 'Room around the upper arm.',
        default: 15,
        min: 0,
        max: 50,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'Body length added below the waist.',
        default: 0,
        min: -4,
        max: 60,
        step: 0.5,
      },
      ribbing: {
        type: 'bool',
        label: 'Ribbed cuffs and hem',
        description: 'On for ribbed knit cuffs and hem.',
        default: true,
      },
      pocket: {
        type: 'bool',
        label: 'Kangaroo pocket',
        description: 'On for a front kangaroo pocket.',
        default: true,
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: -4, max: 60, step: 0.5, unit: 'pct' },
        label: 'Body length',
        axis: 'vertical',
      },
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: -4, max: 35, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'hipsEase',
        attachTo: 'hem',
        range: { min: 4, max: 12, step: 0.5, unit: 'pct' },
        label: 'Hip ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'pocket',
        attachTo: 'pocket',
        range: { min: 0, max: 1, step: 1, unit: 'pct' },
        label: 'Kangaroo pocket',
        axis: 'horizontal',
      },
    ],
  },
  noble: {
    slug: 'noble',
    name: 'Noble princess seam bodice',
    description:
      'A women\'s princess seam bodice block with shoulder or armhole dart options. Use as the base for fitted tops and dresses.',
    freesewingPackage: '@freesewing/noble',
    importer: () => import('@freesewing/noble'),
    designExportName: 'Noble',
    genderFamily: 'WOMENS',
    skillLevel: 'INTERMEDIATE',
    requiredMeasurements: NOBLE_REQUIRED,
    optionalMeasurements: [],
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Room between the bodice and your chest.',
        default: 11,
        min: 5,
        max: 20,
        step: 0.5,
      },
      waistEase: {
        type: 'pct',
        label: 'Waist ease',
        description: 'Room at the waist. Negative values draw the bodice in.',
        default: 5,
        min: 1,
        max: 20,
        step: 0.5,
      },
      dartPosition: {
        type: 'enum',
        label: 'Bust dart position',
        description: 'Shoulder for a hidden dart from the shoulder line; armhole for a side-bust dart.',
        default: 'shoulder',
        values: [
          { value: 'shoulder', label: 'Shoulder dart' },
          { value: 'armhole', label: 'Armhole dart' },
        ],
      },
    },
    hackHandles: [
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: 5, max: 20, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'waistEase',
        attachTo: 'hem',
        range: { min: 1, max: 20, step: 0.5, unit: 'pct' },
        label: 'Waist ease',
        axis: 'horizontal',
      },
    ],
  },
  onyx: {
    slug: 'onyx',
    name: 'Onyx one-piece',
    description:
      'A one-piece garment with neckband or hood, optional skirt, and a front or back zipper. Works for jumpsuits, onesies, and all-in-one designs.',
    freesewingPackage: '@freesewing/onyx',
    importer: () => import('@freesewing/onyx'),
    designExportName: 'Onyx',
    genderFamily: 'UNISEX',
    skillLevel: 'ADVANCED',
    requiredMeasurements: ONYX_REQUIRED,
    optionalMeasurements: ONYX_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Room between the body and your chest.',
        default: 0,
        min: -40,
        max: 50,
        step: 0.5,
      },
      hipsEase: {
        type: 'pct',
        label: 'Hip ease',
        description: 'Room around the hips.',
        default: 0,
        min: -40,
        max: 50,
        step: 0.5,
      },
      neckStyle: {
        type: 'enum',
        label: 'Neck style',
        description: 'Neckband for a flat collar; hood for an attached hood.',
        default: 'neckband',
        values: [
          { value: 'neckband', label: 'Neckband' },
          { value: 'hood', label: 'Hood' },
        ],
      },
      skirt: {
        type: 'bool',
        label: 'Add a skirt section',
        description: 'On for a flared skirt below the waist instead of legs.',
        default: false,
      },
      legLength: {
        type: 'pct',
        label: 'Leg length',
        description: 'How long the legs sit. Lower values for shorts.',
        default: 20,
        min: 0,
        max: 120,
        step: 1,
      },
    },
    hackHandles: [
      {
        optionKey: 'legLength',
        attachTo: 'bodyHem',
        range: { min: 0, max: 120, step: 1, unit: 'pct' },
        label: 'Leg length',
        axis: 'vertical',
      },
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: -40, max: 50, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'hipsEase',
        attachTo: 'waistline',
        range: { min: -40, max: 50, step: 0.5, unit: 'pct' },
        label: 'Hip ease',
        axis: 'horizontal',
      },
    ],
  },
  penelope: {
    slug: 'penelope',
    name: 'Slim pencil skirt',
    description:
      'A women\'s fitted pencil skirt with curved darts, back vent, and side or back zip placement. Mid-weight woven fabrics.',
    freesewingPackage: '@freesewing/penelope',
    importer: () => import('@freesewing/penelope'),
    designExportName: 'Penelope',
    genderFamily: 'WOMENS',
    skillLevel: 'IMPROVER',
    requiredMeasurements: PENELOPE_REQUIRED,
    optionalMeasurements: PENELOPE_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      waistEase: {
        type: 'pct',
        label: 'Waist ease',
        description: 'Room around the waistband.',
        default: 1,
        min: 0,
        max: 8,
        step: 0.5,
      },
      seatEase: {
        type: 'pct',
        label: 'Seat ease',
        description: 'Room around the hip line.',
        default: 1,
        min: 0,
        max: 8,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'How much length added past the knee.',
        default: 0,
        min: -50,
        max: 50,
        step: 1,
      },
      backVent: {
        type: 'bool',
        label: 'Back vent',
        description: 'On for a back vent for easier walking.',
        default: true,
      },
      zipperLocation: {
        type: 'enum',
        label: 'Zipper location',
        description: 'Back seam for a centred-back zip; side seam for an invisible side zip.',
        default: 'backSeam',
        values: [
          { value: 'backSeam', label: 'Back seam' },
          { value: 'sideSeam', label: 'Side seam' },
        ],
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: -50, max: 50, step: 1, unit: 'pct' },
        label: 'Skirt length',
        axis: 'vertical',
      },
      {
        optionKey: 'waistEase',
        attachTo: 'waistline',
        range: { min: 0, max: 8, step: 0.5, unit: 'pct' },
        label: 'Waist ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'seatEase',
        attachTo: 'hem',
        range: { min: 0, max: 8, step: 0.5, unit: 'pct' },
        label: 'Seat ease',
        axis: 'horizontal',
      },
    ],
  },
  sandy: {
    slug: 'sandy',
    name: 'Sandy circle skirt',
    description:
      'A women\'s circle skirt drafted from your waist measurement. Adjustable circle ratio from a full circle down to a quarter circle.',
    freesewingPackage: '@freesewing/sandy',
    importer: () => import('@freesewing/sandy'),
    designExportName: 'Sandy',
    genderFamily: 'WOMENS',
    skillLevel: 'BEGINNER',
    requiredMeasurements: SANDY_REQUIRED,
    optionalMeasurements: [],
    verifyTolerance: 0.05,
    options: {
      lengthBonus: {
        type: 'pct',
        label: 'Length',
        description: 'How long the skirt sits relative to the waist-to-floor measurement.',
        default: 50,
        min: 10,
        max: 100,
        step: 1,
      },
      circleRatio: {
        type: 'pct',
        label: 'Circle ratio',
        description: 'Full circle (100) for a wide flare; quarter circle (20) for a lighter A-line.',
        default: 50,
        min: 20,
        max: 100,
        step: 1,
      },
      waistbandWidth: {
        type: 'pct',
        label: 'Waistband width',
        description: 'How wide the waistband sits.',
        default: 4,
        min: 1,
        max: 8,
        step: 0.5,
      },
      waistbandShape: {
        type: 'enum',
        label: 'Waistband shape',
        description: 'Straight for a rectangular band; curved to follow the hip line.',
        default: 'straight',
        values: [
          { value: 'straight', label: 'Straight' },
          { value: 'curved', label: 'Curved' },
        ],
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: 10, max: 100, step: 1, unit: 'pct' },
        label: 'Skirt length',
        axis: 'vertical',
      },
      {
        optionKey: 'circleRatio',
        attachTo: 'hem',
        range: { min: 20, max: 100, step: 1, unit: 'pct' },
        label: 'Circle ratio',
        axis: 'horizontal',
      },
    ],
  },
  simon: {
    slug: 'simon',
    name: 'Simon button-down shirt',
    description:
      'A men\'s button-down shirt with stand collar, cuffs, and box pleat options. Cotton or linen wovens.',
    freesewingPackage: '@freesewing/simon',
    importer: () => import('@freesewing/simon'),
    designExportName: 'Simon',
    genderFamily: 'MENS',
    skillLevel: 'IMPROVER',
    requiredMeasurements: SIMON_REQUIRED,
    optionalMeasurements: SIMON_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Room between the shirt and your chest.',
        default: 8,
        min: -4,
        max: 25,
        step: 0.5,
      },
      collarEase: {
        type: 'pct',
        label: 'Collar ease',
        description: 'Room around the neck.',
        default: 5,
        min: 0,
        max: 15,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'Body length added below the waist.',
        default: 0,
        min: -10,
        max: 25,
        step: 0.5,
      },
      sleeveLengthBonus: {
        type: 'pct',
        label: 'Sleeve length bonus',
        description: 'Sleeve length added past the wrist.',
        default: 0,
        min: -20,
        max: 30,
        step: 0.5,
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: -10, max: 25, step: 0.5, unit: 'pct' },
        label: 'Body length',
        axis: 'vertical',
      },
      {
        optionKey: 'sleeveLengthBonus',
        attachTo: 'sleeveCuff',
        range: { min: -20, max: 30, step: 0.5, unit: 'pct' },
        label: 'Sleeve length',
        axis: 'vertical',
      },
      {
        optionKey: 'collarEase',
        attachTo: 'neckline',
        range: { min: 0, max: 15, step: 0.5, unit: 'pct' },
        label: 'Collar ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'chestEase',
        attachTo: 'waistline',
        range: { min: -4, max: 25, step: 0.5, unit: 'pct' },
        label: 'Chest ease',
        axis: 'horizontal',
      },
    ],
  },
  titan: {
    slug: 'titan',
    name: 'Titan trouser block',
    description:
      'A unisex trouser block. Use as a starting point for tailored trousers, joggers, or wide-leg pants.',
    freesewingPackage: '@freesewing/titan',
    importer: () => import('@freesewing/titan'),
    designExportName: 'Titan',
    genderFamily: 'UNISEX',
    skillLevel: 'IMPROVER',
    requiredMeasurements: TITAN_REQUIRED,
    optionalMeasurements: [],
    verifyTolerance: 0.05,
    options: {
      waistEase: {
        type: 'pct',
        label: 'Waist ease',
        description: 'Room around the waistband.',
        default: 2,
        min: 0,
        max: 10,
        step: 0.5,
      },
      seatEase: {
        type: 'pct',
        label: 'Seat ease',
        description: 'Room around the hip line.',
        default: 2,
        min: 0,
        max: 10,
        step: 0.5,
      },
      kneeEase: {
        type: 'pct',
        label: 'Knee ease',
        description: 'Room around the knee. Higher values for wide-leg shapes.',
        default: 6,
        min: 1,
        max: 25,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'How much length added past the floor measurement.',
        default: 2,
        min: -20,
        max: 10,
        step: 0.5,
      },
      fitKnee: {
        type: 'bool',
        label: 'Fit at the knee',
        description: 'On for a slimmer leg below the knee.',
        default: false,
      },
    },
    hackHandles: [
      {
        optionKey: 'lengthBonus',
        attachTo: 'bodyHem',
        range: { min: -20, max: 10, step: 0.5, unit: 'pct' },
        label: 'Leg length',
        axis: 'vertical',
      },
      {
        optionKey: 'waistEase',
        attachTo: 'waistline',
        range: { min: 0, max: 10, step: 0.5, unit: 'pct' },
        label: 'Waist ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'seatEase',
        attachTo: 'hem',
        range: { min: 0, max: 10, step: 0.5, unit: 'pct' },
        label: 'Seat ease',
        axis: 'horizontal',
      },
      {
        optionKey: 'kneeEase',
        attachTo: 'hem',
        range: { min: 1, max: 25, step: 0.5, unit: 'pct' },
        label: 'Knee ease',
        axis: 'horizontal',
      },
    ],
  },
  waralee: {
    slug: 'waralee',
    name: 'Waralee wrap pants',
    description:
      'Unisex wrap pants with an overlapping front and ties at the waist. Light woven fabrics. Beginner-friendly construction.',
    freesewingPackage: '@freesewing/waralee',
    importer: () => import('@freesewing/waralee'),
    designExportName: 'Waralee',
    genderFamily: 'UNISEX',
    skillLevel: 'BEGINNER',
    requiredMeasurements: WARALEE_REQUIRED,
    optionalMeasurements: WARALEE_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      legSize: {
        type: 'pct',
        label: 'Leg width',
        description: 'How wide the legs sit at the bottom.',
        default: 75,
        min: 50,
        max: 90,
        step: 1,
      },
      waistRaise: {
        type: 'pct',
        label: 'Waist raise',
        description: 'Lift the waistband above the natural waist. Negative values drop it.',
        default: 0,
        min: -20,
        max: 40,
        step: 1,
      },
      waistOverlap: {
        type: 'pct',
        label: 'Waist overlap',
        description: 'How far the front panels overlap at the waist.',
        default: 50,
        min: 10,
        max: 100,
        step: 1,
      },
      frontPocket: {
        type: 'bool',
        label: 'Front pockets',
        description: 'On for front welt pockets.',
        default: true,
      },
      backPocket: {
        type: 'bool',
        label: 'Back pockets',
        description: 'On for back patch pockets.',
        default: true,
      },
      knotPlacement: {
        type: 'enum',
        label: 'Knot placement',
        description: 'Where the wrap ties knot.',
        default: 'front',
        values: [
          { value: 'front', label: 'Front' },
          { value: 'back', label: 'Back' },
          { value: 'traditional', label: 'Traditional (side)' },
        ],
      },
    },
    hackHandles: [
      {
        optionKey: 'legSize',
        attachTo: 'hem',
        range: { min: 50, max: 90, step: 1, unit: 'pct' },
        label: 'Leg width',
        axis: 'horizontal',
      },
      {
        optionKey: 'waistRaise',
        attachTo: 'waistline',
        range: { min: -20, max: 40, step: 1, unit: 'pct' },
        label: 'Waist raise',
        axis: 'vertical',
      },
      {
        optionKey: 'waistOverlap',
        attachTo: 'waistline',
        range: { min: 10, max: 100, step: 1, unit: 'pct' },
        label: 'Waist overlap',
        axis: 'horizontal',
      },
      {
        optionKey: 'frontPocket',
        attachTo: 'pocket',
        range: { min: 0, max: 1, step: 1, unit: 'pct' },
        label: 'Front pockets',
        axis: 'horizontal',
      },
    ],
  },
}

export type RegisteredDesignSlug = keyof typeof SEWING_DESIGN_REGISTRY

export function getDesignConfig(slug: string): SewingDesignConfig | null {
  return SEWING_DESIGN_REGISTRY[slug] ?? null
}

/**
 * Snapshot of every registered design. The personalisation Studio's
 * picker page reads this; the registry is the single source of truth so
 * adding a design = adding a registry entry, no other change required.
 */
export function listDesigns(): SewingDesignConfig[] {
  return Object.values(SEWING_DESIGN_REGISTRY)
}

/**
 * Resolve the per-option default value for a design. Returns an object
 * keyed by option name with the option's documented default. The Studio
 * pre-fills its option panel with this, and the wrapper falls back to it
 * when an option is missing from the request.
 */
export function getDesignDefaults(
  slug: string,
): Record<string, number | string | boolean> {
  const cfg = getDesignConfig(slug)
  if (!cfg || !cfg.options) return {}
  const out: Record<string, number | string | boolean> = {}
  for (const [name, meta] of Object.entries(cfg.options)) {
    if (meta.type === 'pct') {
      // Freesewing accepts percentages as fractions (4% -> 0.04).
      out[name] = Number((meta.default / 100).toFixed(4))
    } else if (meta.type === 'mm') {
      out[name] = meta.default
    } else if (meta.type === 'bool') {
      out[name] = meta.default
    } else {
      out[name] = meta.default
    }
  }
  return out
}

/**
 * Lazily load a design's freesewing constructor. Throws if the slug is
 * unknown so callers see a clean error rather than an opaque undefined
 * later in `new Design(...)`.
 */
export async function loadDesignConstructor(slug: string): Promise<unknown> {
  const cfg = getDesignConfig(slug)
  if (!cfg) throw new Error(`Unknown freesewing design slug: ${slug}`)
  const mod = await cfg.importer()
  const ctor = mod[cfg.designExportName]
  if (typeof ctor !== 'function') {
    throw new Error(
      `Design constructor ${cfg.designExportName} not found in ${cfg.freesewingPackage}`,
    )
  }
  return ctor
}
