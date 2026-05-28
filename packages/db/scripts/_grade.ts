import { fleschKincaidGrade } from './voice-check-lib.js'

const lines = [
  // candidates for tapping-for-abundance-through-the-family-line
  'Even though family money worry runs in my line, I deeply and completely accept myself.',
  'Even though money worry runs in my family line, I deeply and completely accept myself.',
  'Even though old money fear sits in my family line, I deeply and completely accept myself.',
  'Even though money worry runs in my family. I deeply and completely accept myself.',
  // candidates for tapping-for-inherited-religion
  'Even though doubting the faith I was raised in feels like a betrayal of those who taught it, I deeply and completely accept myself.',
  'Even though asking new questions about my religion feels like a betrayal of those who taught it, I deeply and completely accept myself.',
  'Even though questioning the religion I was raised in feels disloyal to those who taught it, I deeply and completely accept myself.',
  'Even though doubting my old faith feels disloyal, I deeply and completely accept myself.',
  // candidates for money-sex-power-taboo
  'Even though I have soaked up a rule that money, desire, and power cannot all be mine at once, I honour what it guards, and I am ready to let it go.',
  'Even though I learned a rule that money and power and desire cannot all be mine, I honour what it guards, and I am ready to let it go.',
  'Even though an old rule says money, desire, and power cannot all be mine, I honour what it guards, and I let it go.',
]
for (const l of lines) {
  console.log(fleschKincaidGrade(l)?.toFixed(2), '|', l)
}
