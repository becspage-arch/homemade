import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIR = 'C:/Users/Rebecca/Projects/code/homemade/docs/baking-bulk-033-briefs';

function fixBodyStructure(body) {
  if (!body?.content) return body;

  const newContent = [];
  let methodHeadingInserted = false;
  let i = 0;

  while (i < body.content.length) {
    const node = body.content[i];

    // Drop the "Ingredients" h2 heading — it's redundant now that we have ingredientsList
    if (
      node.type === 'heading' &&
      node.attrs?.level === 2 &&
      node.content?.some(c => /^ingredients$/i.test(c.text ?? ''))
    ) {
      i++;
      continue;
    }

    // Before the first h3 step heading, insert "Method" h2
    if (
      !methodHeadingInserted &&
      node.type === 'heading' &&
      node.attrs?.level === 3
    ) {
      newContent.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Method' }],
      });
      methodHeadingInserted = true;
    }

    newContent.push(node);
    i++;
  }

  return { ...body, content: newContent };
}

const files = readdirSync(DIR).filter(f => f.endsWith('.json')).sort();

for (const file of files) {
  const path = join(DIR, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));

  if (data.body) {
    data.body = fixBodyStructure(data.body);
  }

  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`Fixed structure: ${file}`);
}

console.log(`\nDone — fixed body structure in ${files.length} briefs.`);
