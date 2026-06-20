import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/bulk-batch-047-briefs/';

function load(f) { return JSON.parse(readFileSync(join(dir, f), 'utf8')); }
function save(f, d) { writeFileSync(join(dir, f), JSON.stringify(d, null, 2)); }

function setBodyText(data, idx, newText) {
  const node = data.body.content[idx];
  if (!node || node.type !== 'paragraph') {
    console.log('SKIP: not a paragraph at', idx, 'in', data.slug);
    return false;
  }
  node.content = [{ type: 'text', text: newText }];
  return true;
}

function setMethodStep(data, listIdx, itemIdx, newText) {
  const listNode = data.body.content[listIdx];
  if (!listNode || listNode.type !== 'orderedList') return false;
  const listItem = listNode.content[itemIdx];
  const para = listItem?.content?.find(n => n.type === 'paragraph');
  if (!para) return false;
  para.content = [{ type: 'text', text: newText }];
  return true;
}

// bangers-and-mash body[4] - equipment note
{
  const d = load('bangers-and-mash.json');
  setBodyText(d, 4, 'You need a roasting pan for the sausages, a large saucepan for the potatoes, and a frying pan for the gravy. The sausages need room in the pan, so make sure they fit in a single layer.');
  save('bangers-and-mash.json', d);
  console.log('Fixed bangers-and-mash[4]');
}

// boiled-bacon-and-cabbage body[0] - intro
{
  const d = load('boiled-bacon-and-cabbage.json');
  setBodyText(d, 0, 'Boiled bacon and cabbage is a cured bacon joint simmered slowly in water with vegetables. It is served with the cooking cabbage, carrots, and a parsley sauce made from the cooking liquid. The joint needs a long, gentle simmer. Rush it and the meat stays tough.');
  // body[12] - where-lives
  setBodyText(d, 12, 'Boiled bacon and cabbage is the traditional Sunday dinner of Irish cooking. It has been made across the country since at least the eighteenth century. It is sometimes confused with corned beef and cabbage, which is the Irish-American version. Irish immigrants in America used beef when they could not afford pork. The original dish uses pork: a salted joint simmered until the fat is soft. The parsley sauce is the standard accompaniment.');
  save('boiled-bacon-and-cabbage.json', d);
  console.log('Fixed boiled-bacon-and-cabbage[0] and [12]');
}

// boxty body[7] - where-lives
{
  const d = load('boxty.json');
  setBodyText(d, 7, 'Boxty comes from the north and west of Ireland, particularly Ulster and Connacht. Potato was the primary staple there, and boxty was part of the daily bread tradition. It appears in Irish cooking books from the nineteenth century alongside griddle bread and soda farls. The two-potato method, mixing mash and grated potato, is what makes boxty unique. It gives a texture that a plain potato cake or a rosti cannot match.');
  save('boxty.json', d);
  console.log('Fixed boxty[7]');
}

// coronation-chicken body[7] - where-lives
{
  const d = load('coronation-chicken.json');
  setBodyText(d, 7, 'Coronation chicken was created by Constance Spry and Rosemary Hume for the coronation of Queen Elizabeth II in June 1953. It was served as poulet reine Elizabeth to 350 guests. The original used a complex spice blend with apricot and cream. The simpler version with curry powder and mayonnaise spread through home cooking in the following decades. It is now found at sandwich counters, supermarket deli sections, and buffet tables across the country.');
  save('coronation-chicken.json', d);
  console.log('Fixed coronation-chicken[7]');
}

// cucumber-sandwich body[8] - where-lives
{
  const d = load('cucumber-sandwich.json');
  setBodyText(d, 8, 'The cucumber sandwich is the defining item of British afternoon tea. It became a shorthand for refinement and restraint. Oscar Wilde used it as comic punctuation in The Importance of Being Earnest. It has appeared in nearly every satire of English upper-class manners since. You find it at Wimbledon, at Buckingham Palace garden parties, and at village fetes across England.');
  save('cucumber-sandwich.json', d);
  console.log('Fixed cucumber-sandwich[8]');
}

// devilled-eggs body[10] - where-lives
{
  const d = load('devilled-eggs.json');
  setBodyText(d, 10, 'Devilled eggs appear in Victorian cookbooks as a supper or luncheon item. They were grouped with devilled kidneys and devilled bones as highly seasoned preparations. In British cooking, devilled means seasoned with mustard, cayenne, or similar hot spices. The American variation became more elaborate over time. The British version was already a buffet and picnic standby a century before that.');
  save('devilled-eggs.json', d);
  console.log('Fixed devilled-eggs[10]');
}

// devilled-mackerel body[7] - where-lives
{
  const d = load('devilled-mackerel.json');
  setBodyText(d, 7, 'Devilling meat and fish was popular in British cooking throughout the nineteenth century. It meant grilling with mustard, cayenne, and strong sauces. Devilled kidneys, devilled bones, and devilled fish all appear in Victorian cookbooks of the period. Mackerel suits this treatment well. Its oily richness carries strong seasoning that would overwhelm a leaner white fish.');
  save('devilled-mackerel.json', d);
  console.log('Fixed devilled-mackerel[7]');
}

// egg-and-chips body[13] - where-lives
{
  const d = load('egg-and-chips.json');
  setBodyText(d, 13, 'Egg and chips is one of the most common quick meals in Britain. It turns up at home for a weeknight supper and on nearly every transport-cafe menu. Its simplicity is the point. The combination of fried egg and potato appears across many food cultures. The British version, with malt vinegar and ketchup on the side, is its own thing: informal, filling, and without pretension.');
  save('egg-and-chips.json', d);
  console.log('Fixed egg-and-chips[13]');
}

// scotch-woodcock body[7] - where-lives
{
  const d = load('scotch-woodcock.json');
  setBodyText(d, 7, 'Scotch woodcock was a savoury course at Victorian and Edwardian dinner parties. It came after the pudding as a sharp finish before the port. The anchovy-on-egg combination earned it the whimsical name of a game bird. It fell from formal menus in the mid-twentieth century. It survives as a breakfast or late-night supper dish, especially in households that keep anchovy paste.');
  save('scotch-woodcock.json', d);
  console.log('Fixed scotch-woodcock[7]');
}

// singin-hinnies body[7] - where-lives
{
  const d = load('singin-hinnies.json');
  setBodyText(d, 7, 'Singin hinnies come from Northumbria, particularly Tyneside. They are the northern English equivalent of the Welsh cake: a griddle cake made from similar ingredients but with a slightly higher fat content. Dorothy Hartley documented them as part of a pattern of British regional griddle breads. They developed where coal-fired iron ranges replaced open-hearth baking.');
  save('singin-hinnies.json', d);
  console.log('Fixed singin-hinnies[7]');
}

// smoked-haddock-chowder body[10] - where-lives
{
  const d = load('smoked-haddock-chowder.json');
  setBodyText(d, 10, 'This soup is closely related to cullen skink, the classic Scottish smoked haddock and potato soup from the fishing town of Cullen in Moray. The chowder version is thicker and richer. It uses leek as well as onion and finishes with double cream. Both soups belong to a long tradition of Scottish east-coast cooking. Fishing communities there built soups from smoked fish and root vegetables, using smoked haddock as a preserved staple through the winter.');
  save('smoked-haddock-chowder.json', d);
  console.log('Fixed smoked-haddock-chowder[10]');
}

// smoked-salmon-sandwich body[7] - where-lives
{
  const d = load('smoked-salmon-sandwich.json');
  setBodyText(d, 7, "Smoked salmon in Britain is closely linked to Jewish deli culture. Eastern European Jewish immigrants brought it to London's East End from the 1880s onwards. The classic pairing of smoked salmon with cream cheese, capers, and onion comes from this tradition. By the second half of the twentieth century, smoked salmon moved into mainstream British food culture. It now appears on hotel menus, at Christmas tables, and at deli counters across the country.");
  save('smoked-salmon-sandwich.json', d);
  console.log('Fixed smoked-salmon-sandwich[7]');
}

// stovies - where-lives (find by heading)
{
  const d = load('stovies.json');
  const nodes = d.body.content;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].type === 'heading') {
      const heading = (nodes[i].content || []).map(n => n.text || '').join('');
      if (heading === 'Where this dish lives' && nodes[i + 1]?.type === 'paragraph') {
        nodes[i + 1].content = [{ type: 'text', text: 'Stovies are made from leftovers, cooked without fuss, and eaten with oatcakes or bread. The dish varies by region and by family. Some are dry; some are almost soupy. Some use tinned corned beef instead of roast leftovers; some skip the meat entirely. The word comes from the Scots verb stove, meaning to cook in a closed pot over low heat.' }];
        console.log('Fixed stovies where-lives');
        break;
      }
    }
  }
  save('stovies.json', d);
}

// tuna-pasta-bake body[12] - where-lives
{
  const d = load('tuna-pasta-bake.json');
  setBodyText(d, 12, "Tuna pasta bake became a British staple in the 1980s and 1990s as tinned tuna grew popular and pasta moved into mainstream home cooking. It sits alongside chicken casserole and shepherd's pie as a dish British families make on rotation. Each household has its own slight version. Pasta, white sauce, tinned fish, and melted cheese: it belongs to the same family as macaroni cheese and fish pie. Filling, reliable, and made from what is in the cupboard.");
  save('tuna-pasta-bake.json', d);
  console.log('Fixed tuna-pasta-bake[12]');
}

// treacle-tart body[10] - where-lives
{
  const d = load('treacle-tart.json');
  setBodyText(d, 10, "Treacle tart has been made in Britain since Lyle's Golden Syrup became widely available in the 1880s. It is one of the few British puddings with no clear equivalent elsewhere in European cooking. The name is slightly misleading: the filling uses golden syrup, not black treacle. Treacle tart is Harry Potter's favourite dessert in the novels, which gave it international recognition. It has been on British school-dinner menus and home tables for well over a century.");
  save('treacle-tart.json', d);
  console.log('Fixed treacle-tart[10]');
}

// chicken-goujons body[10] - where-lives
{
  const d = load('chicken-goujons.json');
  setBodyText(d, 10, 'Chicken goujons appeared on British pub menus in the 1980s and quickly became one of the most popular items in casual dining. They sit between the formal breadcrumbed escalope and the frozen chicken nugget. They work well in both settings: in a pub basket with garlic mayo, or at home as a Friday-night dinner for children and adults. The name comes from the French goujon, a small fried fish.');
  save('chicken-goujons.json', d);
  console.log('Fixed chicken-goujons[10]');
}

// bread-and-butter-pudding: fix method step body[7]>orderedList>listItem[0]>paragraph
// Split compound sentence: "Warm ... until steaming but not boiling, then pour... whisking constantly."
{
  const d = load('bread-and-butter-pudding.json');
  // body[7] is the orderedList
  const listNode = d.body.content[7];
  if (listNode && listNode.type === 'orderedList' && listNode.content?.[0]) {
    const li = listNode.content[0];
    const para = li.content?.find(n => n.type === 'paragraph');
    if (para) {
      const txt = para.content.map(n => n.text || '').join('');
      // Rewrite: split compound sentence
      const newTxt = txt
        .replace(
          'until steaming but not boiling, then pour onto the egg mixture, whisking constantly.',
          'until steaming but not boiling. Pour the hot liquid slowly onto the egg mixture, whisking as you go.'
        );
      para.content = [{ type: 'text', text: newTxt }];
      console.log('Fixed bread-and-butter-pudding method step');
    }
  }
  // body[12] - add gloss for Mrs Beeton in where-lives
  const para12 = d.body.content[12];
  if (para12 && para12.type === 'paragraph') {
    const txt = para12.content.map(n => n.text || '').join('');
    const newTxt = txt
      .replace('Mrs Beeton included it in the 1861 Book of Household Management under nursery puddings.', 'Victorian cookery writer Mrs Beeton included it in the 1861 Book of Household Management under nursery puddings.')
      .replace('Nico Ladenis in London made a bread and butter pudding famous enough to be cited in food-writing of the period.', 'A London restaurant made a bread and butter pudding famous enough to be cited in food-writing of the period.');
    para12.content = [{ type: 'text', text: newTxt }];
    console.log('Fixed bread-and-butter-pudding where-lives (Mrs Beeton gloss)');
  }
  save('bread-and-butter-pudding.json', d);
}
