import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../../..')
const dir = resolve(root, 'docs/voice-retrofit-2026-05-28-batch18')

interface Rewrite { slug: string; from: string; to: string }

const rewrites: Rewrite[] = [
  {
    slug: 'vegetarian-kedgeree',
    from: 'The Victorian cookery manual by Mrs Beeton (1861) gives a kedgeree close to the smoked-fish version.',
    to: 'The Victorian cookery manual by Mrs Beeton gives a kedgeree close to the smoked-fish version.',
  },
  {
    slug: 'vegetarian-mulligatawny',
    from: 'Mulligatawny began as milagu tannir (pepper water), a thin, sour, well-spiced broth from Tamil Nadu used as a digestive and a condiment. British colonial officers picked it up, thickened it with lentils and meat, sweetened it with apple and onion, and sent it home to England as the main soup of the Anglo-Indian table. By the nineteenth century it was in every British cookery book and club menu, often a long way from the original.',
    to: 'Mulligatawny began as milagu tannir (pepper water), a thin, sour, spiced broth from Tamil Nadu. It was used as a digestive and a condiment. British colonial officers picked it up. They thickened it with lentils and meat, sweetened it with apple and onion, and sent it home to England as the main soup of the Anglo-Indian table. By the nineteenth century it was in every British cookery book and club menu, often a long way from the first dish.',
  },
  {
    slug: 'vinaigrette-salad',
    from: "Vinegret turns up at the Russian table in almost every setting: as part of the zakuski spread before a formal dinner, as an everyday lunch, and as a fixture at the New Year's table next to Olivier salad and herring under a fur coat. Elena Molokhovets, whose cookbook guided Russian middle-class homes through the second half of the nineteenth century, gives several versions of the boiled-root-and-pickle salad. The version known today (beetroot, potato, carrot, sauerkraut, onion) has been more or less stable since then.",
    to: "Vinegret turns up at the Russian table in almost every setting: as part of the zakuski spread before a formal dinner, as an everyday lunch, and as a fixture at the New Year's table next to Olivier salad and herring under a fur coat. Elena Molokhovets wrote a cookbook that guided Russian middle-class homes through the second half of the nineteenth century. She gives several versions of the boiled-root-and-pickle salad. The version known today (beetroot, potato, carrot, sauerkraut, onion) has been more or less stable since then.",
  },
  {
    slug: 'visualise-the-sleep-space',
    from: 'Grounded sensory attention to the sleep space as a pre-sleep practice is set out across sleep-hygiene research and mindfulness work. The specific room-attending form used here is adapted from SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025), which uses attention work to help the nervous system settle before sleep.',
    to: 'Calm body-attention to the sleep space as a pre-sleep practice is well known in sleep research and mindfulness work. The room-attending form used here is adapted from SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025). The book uses attention work to help the body settle before sleep.',
  },
  {
    slug: 'walking-into-the-room-wearing-the-thing-you-bought-yourself',
    from: 'A five-minute visualisation for working with money visibility in a safe imagined space. The image is simple: you walking into a room, wearing or carrying something you bought without apology, feeling easy about it.',
    to: 'A five-minute visualisation for working with money visibility, in a safe imagined space. The image is simple. You walk into a room. You wear or carry something you bought without apology. You feel easy about it.',
  },
  {
    slug: 'walking-into-the-room-wearing-the-thing-you-bought-yourself',
    from: 'Original to homemade.education as a companion visualisation for Day 18 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). Mental rehearsal of this kind draws on standard imagery work in performance psychology.',
    to: 'Original to homemade.education as a companion piece for Day 18 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). Mental rehearsal like this is the same kind of work used in sports and stage practice.',
  },
]

let ok = 0, miss = 0
for (const rw of rewrites) {
  const path = resolve(dir, `${rw.slug}.json`)
  const raw = readFileSync(path, 'utf8')
  if (!raw.includes(rw.from)) {
    console.error(`[MISS] ${rw.slug}: not found`)
    miss++
    continue
  }
  writeFileSync(path, raw.replace(rw.from, rw.to), 'utf8')
  console.log(`[OK]   ${rw.slug}`)
  ok++
}
console.log(`\n${ok} ok, ${miss} miss`)
process.exit(miss > 0 ? 1 : 0)
