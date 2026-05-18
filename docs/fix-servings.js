const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'bulk-batch-019-briefs');
const files = ['garlic-naan.json', 'peshwari-naan.json', 'plain-naan.json', 'lamb-samosa.json', 'vegetable-samosa.json'];

for (const f of files) {
  const filePath = path.join(dir, f);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.recipe.servings = null;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Fixed ${f}: servings=null, yieldDescription=${data.recipe.yieldDescription}`);
}
