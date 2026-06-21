const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'sprint-worker-1');

// Replace the nth paragraph (0-indexed count of type==='paragraph' nodes in body.content)
// with new simple text. Returns true if found and replaced.
function replacePara(body, paraIndex, newText) {
  let count = -1;
  for (const node of body.content) {
    if (node.type === 'paragraph') {
      count++;
      if (count === paraIndex) {
        node.content = [{ type: 'text', text: newText }];
        return true;
      }
    }
  }
  return false;
}

// Get text of nth paragraph
function getParaText(body, paraIndex) {
  let count = -1;
  for (const node of body.content) {
    if (node.type === 'paragraph') {
      count++;
      if (count === paraIndex) {
        return node.content ? node.content.map(n => n.text || '').join('') : '';
      }
    }
  }
  return '';
}

function countParas(body) {
  return body.content.filter(n => n.type === 'paragraph').length;
}

const rewrites = {
  'beef-wellington.json': {
    last: "Beef Wellington is named after the Duke of Wellington, though the exact link has never been proved. It became a British dinner-party centrepiece from the 1960s onward. The dish needs a good piece of beef and some care with technique. Done well, it is one of the most striking things to put on a table."
  },
  'calzone-di-scarola.json': {
    first: "Calzone di scarola is a stuffed pizza. Two sheets of dough are rolled out, filled with braised escarole, sealed, and baked. The filling is Neapolitan: bitter escarole braised until soft with anchovies, olives, capers, raisins, and pine nuts. This is the classic sweet-and-sour pantry mix. The filling must be dry before it goes in. Wet filling steams rather than bakes and makes the base soft.",
    last: "Calzone di scarola is a Neapolitan Christmas Eve dish. It is part of the Feast of the Seven Fishes: the tradition of eating only fish and vegetables before midnight mass. The filling of escarole with anchovies, capers, and olives is one of the oldest flavour combinations in Neapolitan cooking. It predates the arrival of tomatoes in Italian food."
  },
  'chicken-and-leek-pie.json': {
    last: "Chicken and leek is a classic pairing in British and Celtic cooking. It appears in Welsh cawl and cock-a-leekie broth. The pie version is home-kitchen food rather than restaurant food. It is mild and creamy, and it tends to be a recipe that gets made for the whole family."
  },
  'farfalle-al-salmone.json': {
    last: "Pasta al salmone became a fixture of Italian restaurant menus in the 1980s, when smoked salmon became a prestige ingredient across Europe. The cream and dill combination was drawn from Scandinavian flavours and became a standard dish in trattorias. Farfalle is the usual pasta for it. The butterfly wings hold the cream sauce well."
  },
  'farfalle-estive.json': {
    first: "Farfalle estive is a cold summer pasta. Farfalle is tossed with ripe tomatoes, torn mozzarella, fresh basil, and extra virgin olive oil. The dish only works in summer, when tomatoes are ripe enough to give juice. Out-of-season tomatoes produce a flat result. Dress the pasta 10 to 15 minutes before serving to let the flavours settle.",
    last: "Cold dressed pasta is a summer tradition across Italy. It is eaten for lunch or as part of a cold spread. The Caprese elements of tomato, mozzarella, and basil are used here in the same spirit as the Capri salad, but with pasta to make a more filling dish. In Italy it is common picnic and beach food, often made the night before."
  },
  'fusilli-alla-caprese.json': {
    last: "The caprese combination of tomato, mozzarella, basil, and olive oil comes from the island of Capri. It reflects the Campanian tradition of using a few good ingredients together. Applied to hot pasta it becomes alla caprese. This is a standard summer dish in Campanian home kitchens. The mozzarella melts slightly into the hot pasta, which sets it apart from a cold dressed version."
  },
  'melanzane-ripiene.json': {
    first: "Melanzane ripiene are halved aubergines, scooped out and filled with the aubergine flesh and southern Italian pantry ingredients. Capers, olives, tomato, and garlic make up the filling. Breadcrumbs go on top, and the whole thing bakes until golden. In southern Italy these are eaten as a main course, not a side dish. They are good warm or at room temperature.",
    last: "Stuffed aubergines are a staple of southern Italian and Sicilian cooking. They are a cucina povera dish: a way to make a filling main course from a single vegetable and pantry items. The Sicilian sweet-and-sour mix of capers and olives works well with aubergine. The sharp flavours cut through the richness of the flesh."
  },
  'parmigiana-di-zucchine.json': {
    last: "Parmigiana di zucchine uses the same idea as the aubergine version. A vegetable is fried until golden, layered with tomato and cheese, and baked. It is a late-summer dish, made when courgettes and tomatoes are both in season. In Campania it is often eaten at lunch, made ahead and served at room temperature."
  },
  'pasta-alla-zozzona.json': {
    first: "Pasta alla zozzona is a Roman pasta that breaks the rules. It combines guanciale, sausage, tomatoes, and egg yolks: drawing from carbonara, amatriciana, and gricia at once. The egg yolks go in off the heat, just as in carbonara. The pan must be off the heat before the eggs are added. Toss fast to avoid scrambling.",
    last: "Zozzona became a recognised dish in Roman trattorias in the 2000s. It is most linked with the Testaccio area, where the old working-class food tradition is still strong. The name means dirty or messy in Roman dialect. This fits: the dish is rich, heavily sauced, and breaks the rules that govern carbonara and amatriciana. It is the cook's pasta, not the purist's."
  },
  'patate-al-rosmarino.json': {
    first: "Patate al rosmarino are roasted raw, not parboiled first. This gives a denser interior than a British roast potato but a crisp outside when the heat is high enough. Use waxy potatoes rather than floury ones. Floury potatoes break apart rather than hold their shape. The garlic roasts alongside until sweet. It is part of the dish, not just added for flavour.",
    last: "Patate al rosmarino is the standard potato dish across Italy. It goes alongside roasted meats and grilled fish, or is eaten as a side dish on its own. The method is simpler than a British roast potato: no parboiling, no lard, no coating. The rosemary and garlic give it a fragrance that the plainer British version often lacks."
  },
  'penne-con-broccoli.json': {
    last: "Pasta con broccoli is a standard weeknight dish across southern Italy. In Puglia, orecchiette with broccoli is one of the most well-known pasta pairings in Italian cooking. The anchovy and garlic base is the Puglian version. Some Sicilian versions add pine nuts and raisins. This recipe keeps to the simplest form."
  },
  'penne-con-melanzane.json': {
    last: "Aubergine with tomatoes is the key vegetable pairing in Sicilian and southern Italian cooking. Pasta alla norma: the Catanian version with ricotta salata and fried aubergine: is the most famous form. The simpler penne con melanzane is what most Sicilian households make in summer. The sauce also works as a pizza topping or bruschetta base, and is good cold the next day."
  },
  'penne-con-tonno-e-olive.json': {
    last: "Pasta con tonno is Italian storecupboard cooking. Tuna in olive oil is a pantry staple in Italy in a way it is not in British kitchens. This partly explains why the dish is such a standard weeknight meal in Italy. The Sicilian version adds capers and olives. The Roman version uses a simpler tomato and garlic base."
  },
  'peperoni-ripieni.json': {
    last: "Stuffed peppers appear across Italy with different fillings. In Piedmont they are filled with anchovies and breadcrumbs. In Campania and the south, rice-based fillings are common. In Sicily the filling often includes pine nuts and raisins in the sweet-and-sour tradition. This recipe uses the southern rice-and-herb version."
  },
  'pinzimonio.json': {
    last: "Pinzimonio is a Tuscan antipasto tradition. It is best in autumn when the new season's olive oil is fresh and peppery. In Tuscany it is eaten at the start of a meal alongside bruschetta and sliced meats. It is also eaten as an afternoon snack. The oil is the dish: everything else is just a vehicle for it."
  },
  'pizza-ai-frutti-di-mare.json': {
    last: "Pizza ai frutti di mare is based on the Italian rule that fish and cheese do not go together. This is a firm belief in Italian coastal cooking, not just a convention. The pizza comes from the southern Italian coast, in particular Naples and the Campanian coastline."
  },
  'pizza-al-tartufo.json': {
    last: "Black truffle pizza is linked to the truffle-growing areas of central Italy: Norcia in Umbria and the hills of Le Marche. The fresh black truffle season runs from November to March. During this time it appears on pizza in every restaurant in the area."
  },
  'pizza-capricciosa.json': {
    last: "Pizza capricciosa has been a standard Italian pizzeria pizza since the mid-20th century. Its four toppings: artichoke, ham, mushroom, and olive: reflect the Italian idea of pizza as a platform for varied flavours. The toppings are arranged in quarters, each in its own section rather than mixed together."
  },
  'pizza-dough-same-day.json': {
    last: "Traditional Neapolitan pizza dough uses a 24-hour cold prove with a small amount of yeast. This builds a complex, slightly tangy flavour that is hard to copy in a same-day dough. The same-day version is a home compromise. It is slightly denser and less stretchy, but it is ready within a few hours and good for an everyday pizza night."
  },
  'pizza-prosciutto-e-rucola.json': {
    last: "Pizza prosciutto e rucola is one of the most ordered pizzas in Italian restaurants. Its appeal is the contrast of hot crisp pizza with cold ham and peppery rocket. It became fashionable in the 1990s in northern Italian cities and spread internationally from there."
  },
  'pizza-romana.json': {
    last: "Roman pizza is called pizza scrocchiarella: crunchy pizza. It is the opposite of Neapolitan pizza. Where Naples prizes the soft, charred, high-crust margherita, Rome makes a style that is thin, flat, and very crisp. Roman pizza is sold by the slice in bakeries as street food. The round version is served in restaurants."
  },
  'pizza-siciliana.json': {
    last: "Sfincione is Palermo's iconic street food. It is sold in thick squares from market stalls and bakeries all over the city. It is linked to the Ballarò and Vucciria markets and eaten at any time of day. The Sicilian pantry flavours of anchovy and capers appear here as they do in caponata and stuffed vegetables."
  },
  'pizza-tonno-e-cipolla.json': {
    last: "Pizza tonno e cipolla is a southern Italian home pizza. It is the kind made on a weeknight from cupboard ingredients. It is less showy than prosciutto e rucola but good and filling. In southern Italian pizzerie it is a standard menu item."
  },
  'pomodori-ripieni-di-riso.json': {
    last: "Pomodori ripieni di riso is a Roman summer dish. It is a fixture of the Roman home kitchen from July to September. Families make it on Sundays and eat it at room temperature after church. The collapsed tomatoes and roasted potatoes share a pan. The potatoes absorb the tomato juice as both cook, which gives the dish its depth."
  },
  'rigatoni-alla-genovese.json': {
    first: "Rigatoni alla genovese is a Neapolitan dish, not a Genoese one. It is a sauce of beef braised with a large quantity of onions for 3 to 4 hours. Both cook down to a thick, golden sauce. The name has nothing to do with Genoa or pesto. It is believed to refer to Genoese merchants in 15th-century Naples who brought the dish with them."
  },
  'rigatoni-alla-norcina.json': {
    last: "Norcia is a small walled town in south-east Umbria. It gave Italy the word norcino, meaning pork butcher. The town is also the centre of the Italian black truffle trade from the Valnerina forests. The truffle season runs from late November to early March. During that time the dish is served in every restaurant in the region with fresh truffle shaved at the table. Outside Umbria, the version without truffle is a good weeknight pasta."
  },
  'steak-and-kidney-pie.json': {
    last: "Steak and kidney pie has been at the centre of British pub and home cooking since the mid-nineteenth century. Isabella Beeton (1836 to 1865), the Victorian household writer, described a similar filling baked in a suet crust. The pastry-lid version became the standard pub pie by the early twentieth century. It remains one of the most ordered dishes in British pubs today."
  },
  'steak-and-kidney-pudding.json': {
    last: "Steamed suet puddings were common in British kitchens from the eighteenth century. They needed no oven: just a pot of water on the hob. The steak and kidney version is one of the best known. Isabella Beeton (1836 to 1865), the Victorian household writer, described it in her famous cookbook. It was widely eaten in the Victorian period and remains a traditional British dish."
  },
  'vegetarian-wellington.json': {
    last: "The vegetarian Wellington emerged in the 1980s and 1990s as an answer to a common problem: what to serve vegetarian guests at a roast dinner. The format: something in pastry, sliced at the table: gives it the same ceremony as a beef Wellington. It became a regular feature of British Christmas menus. It is now often made for its own sake, not just as a substitute."
  },
  'verdure-alla-griglia.json': {
    last: "Verdure alla griglia appears at the start of most Italian summer meals as an antipasto. It sits alongside bruschetta and sliced meats. In southern Italian cooking it is also eaten as a main course. A platter of grilled vegetables with good bread is a filling meal. The technique of grilling over high heat and dressing while warm with olive oil and herbs is used throughout Italy."
  }
};

for (const [filename, changes] of Object.entries(rewrites)) {
  const fpath = path.join(dir, filename);
  const data = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  const body = data.body;
  const total = countParas(body);
  let changed = false;

  if (changes.first) {
    const ok = replacePara(body, 0, changes.first);
    if (!ok) console.log('WARN: could not find first para in ' + filename);
    else changed = true;
  }
  if (changes.last) {
    const ok = replacePara(body, total - 1, changes.last);
    if (!ok) console.log('WARN: could not find last para in ' + filename);
    else changed = true;
  }

  // Fix pizza-al-tartufo sourceNotes em-dash
  if (filename === 'pizza-al-tartufo.json' && data.sourceNotes) {
    const before = data.sourceNotes;
    data.sourceNotes = data.sourceNotes.replace(/ — /g, ': ').replace(/—/g, ':');
    if (before !== data.sourceNotes) changed = true;
  }

  if (changed) {
    fs.writeFileSync(fpath, JSON.stringify(data, null, 2));
    console.log(filename + ': saved');
  }
}
console.log('Done.');
