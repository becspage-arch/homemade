import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/bulk-batch-047-briefs/';

function load(f) { return JSON.parse(readFileSync(join(dir, f), 'utf8')); }
function save(f, d) { writeFileSync(join(dir, f), JSON.stringify(d, null, 2)); }
function getText(n) { if (n.type === 'text') return n.text || ''; if (n.content) return n.content.map(getText).join(''); return ''; }

// 1. Run comprehensive em-dash fix on ALL files (sourceNotes only)
{
  const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('fix-'));
  for (const f of files) {
    const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    if (d.sourceNotes && (d.sourceNotes.includes('—') || d.sourceNotes.includes('–'))) {
      d.sourceNotes = d.sourceNotes.replace(/\s*[—–]\s*/g, ', ');
      save(f, d);
      console.log('EM fixed:', f);
    }
  }
}

// 2. Remove servings-yield conflicts (keep servings, remove yieldDescription)
for (const f of ['boxty.json', 'chicken-goujons.json', 'singin-hinnies.json', 'treacle-tart.json']) {
  const d = load(f);
  if (d.recipe?.yieldDescription !== undefined) {
    delete d.recipe.yieldDescription;
    save(f, d);
    console.log('Yield fixed:', f);
  }
}

// 3. bread-and-butter-pudding body[12] - simplify where-lives again
{
  const d = load('bread-and-butter-pudding.json');
  const p = d.body.content[12];
  if (p?.type === 'paragraph') {
    p.content = [{ type: 'text', text: 'Bread and butter pudding appears in British cookery books since the seventeenth century. It was a way to use stale bread. Victorian cookery writer Mrs Beeton included it in her 1861 cookbook under nursery puddings. By the twentieth century it was linked to British school dinners. High-end restaurants revived it in the 1990s. It is now a classic British comfort dessert.' }];
    save('bread-and-butter-pudding.json', d);
    console.log('Fixed bbp[12]');
  }
}

// 4. devilled-mackerel orderedList[4]>li[1]>para - split compound sentence
{
  const d = load('devilled-mackerel.json');
  const list = d.body.content[4];
  if (list?.type === 'orderedList') {
    const li = list.content[1];
    const para = li?.content?.find(n => n.type === 'paragraph');
    if (para) {
      const txt = getText(para);
      // Split the long mix sentence
      const newTxt = txt.replace(
        ', and the juice of half the {{lemon}} together in a small bowl.',
        '. Add the juice of half the {{lemon}}. Mix well.'
      ).replace(
        '{{unsalted-butter}} of melted butter,',
        '{{unsalted-butter}} of melted butter'
      );
      para.content = [{ type: 'text', text: newTxt }];
      save('devilled-mackerel.json', d);
      console.log('Fixed devilled-mackerel method step:', newTxt.substring(0, 80));
    }
  }
}

// 5. spaghetti-bolognese orderedList[5]>li[3]>para - split
{
  const d = load('spaghetti-bolognese.json');
  const list = d.body.content[5];
  if (list?.type === 'orderedList') {
    const li = list.content[3];
    const para = li?.content?.find(n => n.type === 'paragraph');
    if (para) {
      const txt = getText(para);
      // Split the compound add statement
      const newTxt = txt
        .replace(
          'Add {{tinned-tomatoes}} of tinned tomatoes, {{dried-oregano}} of dried oregano, {{bay-leaves}} bay leaves, and {{worcestershire-sauce}} of Worcestershire sauce if using. Season well.',
          'Add {{tinned-tomatoes}} of tinned tomatoes, {{dried-oregano}} of dried oregano, and {{bay-leaves}} bay leaves. Add {{worcestershire-sauce}} of Worcestershire sauce if using. Season well.'
        );
      para.content = [{ type: 'text', text: newTxt }];
      save('spaghetti-bolognese.json', d);
      console.log('Fixed spaghetti-bolognese method step');
    }
  }
}

// 6. spotted-dick orderedList[4]>li[0]>para - split
{
  const d = load('spotted-dick.json');
  const list = d.body.content[4];
  if (list?.type === 'orderedList') {
    const li = list.content[0];
    const para = li?.content?.find(n => n.type === 'paragraph');
    if (para) {
      const txt = getText(para);
      const newTxt = txt.replace(
        'Mix {{self-raising-flour}} of self-raising flour, {{shredded-suet}} of suet, {{caster-sugar}} of caster sugar, {{currants}} of currants, zest of {{lemon}}, and {{sea-salt-fine}} of salt in a large bowl.',
        'Put {{self-raising-flour}} of self-raising flour and {{shredded-suet}} of suet in a large bowl. Add {{caster-sugar}} of caster sugar, {{currants}} of currants, the zest of {{lemon}}, and {{sea-salt-fine}} of salt. Mix together.'
      );
      para.content = [{ type: 'text', text: newTxt }];
      save('spotted-dick.json', d);
      console.log('Fixed spotted-dick method step');
    }
  }
}

// 7. eggy-bread orderedList[4]>li[2]>para - split compound sentence
{
  const d = load('eggy-bread.json');
  const list = d.body.content[4];
  if (list?.type === 'orderedList') {
    const li = list.content[2];
    const para = li?.content?.find(n => n.type === 'paragraph');
    if (para) {
      const txt = getText(para);
      const newTxt = txt.replace(
        'until the butter foams and the foam begins to subside.',
        'until the butter foams. Wait for the foam to start to settle.'
      );
      para.content = [{ type: 'text', text: newTxt }];
      save('eggy-bread.json', d);
      console.log('Fixed eggy-bread method step');
    }
  }
}

// 8. eggy-bread body[7] - where-lives simplify
{
  const d = load('eggy-bread.json');
  const p = d.body.content[7];
  if (p?.type === 'paragraph') {
    p.content = [{ type: 'text', text: "Eggy bread in Britain sits between a breakfast dish and a childhood comfort food. It has been eaten in various forms since the medieval period. An old recipe called poor knights of Windsor describes bread soaked in egg and wine, then fried and served as a dessert. The modern British version is plainer than French pain perdu or American French toast. It is almost always served with something savoury: bacon, sausages, or tomato sauce." }];
    save('eggy-bread.json', d);
    console.log('Fixed eggy-bread body[7]');
  }
}

// 9. devilled-kidneys body[7] - where-lives simplify
{
  const d = load('devilled-kidneys.json');
  const p = d.body.content[7];
  if (p?.type === 'paragraph') {
    p.content = [{ type: 'text', text: 'Devilled kidneys were a standard breakfast dish in Victorian and Edwardian households. They were kept warm in chafing dishes on the breakfast sideboard. The devilling technique, using mustard, cayenne, and strong sauces, was a common way to treat offal and leftover meat. The dish fell from fashion as offal consumption declined in Britain. It is now found in traditional British restaurants and country house hotels.' }];
    save('devilled-kidneys.json', d);
    console.log('Fixed devilled-kidneys[7]');
  }
}

// 10. oxtail-soup body[7] - where-lives simplify
{
  const d = load('oxtail-soup.json');
  const p = d.body.content[7];
  if (p?.type === 'paragraph') {
    p.content = [{ type: 'text', text: 'Oxtail soup was a staple of Victorian and Edwardian British cooking. It appeared on the dinner menus of country houses and working-class households alike. The cheap, collagen-rich joints suited long, slow cooking. By the twentieth century, canned versions made the soup widely available. The fresh, home-braised version is much more flavourful than the tinned product. It is now found on winter restaurant menus and in British food writing focused on revived traditional dishes.' }];
    save('oxtail-soup.json', d);
    console.log('Fixed oxtail-soup[7]');
  }
}

// 11. ham-and-mustard-sandwich body[0] - remove banned 'genuinely'
{
  const d = load('ham-and-mustard-sandwich.json');
  function fixText(nodes) {
    if (!nodes) return;
    for (const n of nodes) {
      if (n.type === 'text' && n.text?.includes('genuinely')) {
        n.text = n.text.replace('thick-cut and genuinely good:', 'thick-cut and good:');
      }
      if (n.content) fixText(n.content);
    }
  }
  fixText(d.body.content);
  save('ham-and-mustard-sandwich.json', d);
  console.log('Fixed ham-and-mustard-sandwich');
}

// 12. pie-and-mash body[14] - remove banned 'fundamentally'
{
  const d = load('pie-and-mash.json');
  function fixText(nodes) {
    if (!nodes) return;
    for (const n of nodes) {
      if (n.type === 'text' && n.text?.includes('fundamentally')) {
        n.text = n.text.replace('has not fundamentally changed in 150 years', 'has not changed in 150 years');
      }
      if (n.content) fixText(n.content);
    }
  }
  fixText(d.body.content);
  save('pie-and-mash.json', d);
  console.log('Fixed pie-and-mash');
}

// 13. toad-in-the-hole body[7] - add gloss for Mrs Beeton
{
  const d = load('toad-in-the-hole.json');
  const p = d.body.content[7];
  if (p?.type === 'paragraph') {
    const txt = getText(p);
    const newTxt = txt.replace(
      'Mrs Beeton listed it',
      'Victorian cookery writer Mrs Beeton listed it'
    );
    p.content = [{ type: 'text', text: newTxt }];
    save('toad-in-the-hole.json', d);
    console.log('Fixed toad-in-the-hole body[7]');
  }
}
