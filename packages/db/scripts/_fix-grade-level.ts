import fs from 'fs';
import path from 'path';

const fixes: Array<{ file: string; blockIdx: number; newText: string }> = [
  {
    file: '19-how-to-manage-cross-stitch-thread-colours.json',
    blockIdx: 10,
    newText: 'With colours organised, try the parking technique next. It helps when many colours share the same rows. Parked needles and a colour key together make large projects easier to manage.',
  },
  {
    file: '21-cross-stitch-simple-dog-portrait.json',
    blockIdx: 8,
    newText: 'Try a more detailed animal next. The animals sub-category has pieces that use fractional stitches to soften curved edges on ears and noses.',
  },
  {
    file: '24-cross-stitch-rabbit-in-meadow.json',
    blockIdx: 7,
    newText: 'The butterfly-on-lavender pattern is in the same sub-category. It has a meadow setting with more complex wings and a different palette.',
  },
  {
    file: '25-cross-stitch-butterfly-on-lavender.json',
    blockIdx: 7,
    newText: 'The florals sub-category has botanical companion pieces. A lavender stem on its own suits a small hoop. You can also pair this butterfly with a lavender spray in matching colours.',
  },
  {
    file: '26-cross-stitch-poppy-and-seed-head.json',
    blockIdx: 7,
    newText: 'Three botanical stems make a good wall group. Stitch the poppy, daffodil, and tulip separately and frame each in an identical slim frame.',
  },
  {
    file: '27-cross-stitch-tulip-trio.json',
    blockIdx: 7,
    newText: 'The peony bloom in this sub-category has more colour gradation and a higher stitch count. Try it once multi-colour groupings feel manageable.',
  },
  {
    file: '28-cross-stitch-peony-bloom.json',
    blockIdx: 8,
    newText: 'Once a multi-colour bloom feels comfortable, try a design with fractional stitches at the petal edges. The peony works well with full crosses. A rose or camellia rewards the extra detail.',
  },
  {
    file: '29-cross-stitch-daffodil-sprig.json',
    blockIdx: 7,
    newText: 'The botanical fern frond in the same sub-category makes a good companion piece. It uses the same narrow vertical shape but in a green-only palette.',
  },
  {
    file: '31-cross-stitch-gather-quote.json',
    blockIdx: 8,
    newText: 'Once a single word feels easy, try the uppercase alphabet practice piece. It covers all 26 letters in one sampler and works as a reference for custom word pieces.',
  },
  {
    file: '32-cross-stitch-alphabet-uppercase-practice.json',
    blockIdx: 6,
    newText: 'Once the full alphabet feels easy, try the family name banner or house name sampler. Both use these letter shapes in personalised pieces with decorative borders.',
  },
  {
    file: '33-cross-stitch-family-name-banner.json',
    blockIdx: 8,
    newText: 'The house name sampler in this sub-category uses the same alphabet and a similar bordered layout. The house name is the centrepiece instead of a family surname.',
  },
  {
    file: '34-cross-stitch-house-name-sampler.json',
    blockIdx: 8,
    newText: 'Once personalised samplers feel comfortable, try the be-kind small hoop or the gather quote piece. Both are quicker finishes that use a single word.',
  },
  {
    file: '37-cross-stitch-bi-pride-banner.json',
    blockIdx: 7,
    newText: 'The coming-out hoop in this sub-category adds a text element to a flag piece. Try it once a plain banner feels comfortable.',
  },
  {
    file: '38-cross-stitch-coming-out-hoop.json',
    blockIdx: 7,
    newText: 'The all-are-welcome sampler in this sub-category is a larger piece. It has a full border, a more complex layout, and several motifs. It is a big step up from this hoop.',
  },
  {
    file: '40-cross-stitch-all-are-welcome-sampler.json',
    blockIdx: 7,
    newText: 'For a larger piece with more corner motifs and a wider border, try the family name banner or house name sampler. Both are in the quotes-and-sayings sub-category and can be stitched in pride palette colours.',
  },
];

const baseDir = path.resolve(process.cwd(), '../../docs/cross-stitch-bulk-002-briefs');

for (const fix of fixes) {
  const filePath = path.join(baseDir, fix.file);
  const d = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const block = d.body.content[fix.blockIdx];

  if (!block || block.type !== 'paragraph') {
    console.error('SKIP ' + fix.file + ': block[' + fix.blockIdx + '] is ' + (block?.type ?? 'missing'));
    continue;
  }

  block.content = [{ type: 'text', text: fix.newText }];

  fs.writeFileSync(filePath, JSON.stringify(d, null, 2), 'utf-8');
  console.log('FIXED: ' + fix.file + ' block[' + fix.blockIdx + ']');
}

console.log('\nDone.');
