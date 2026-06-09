"""Write bulk-batch-035 briefs: British Sunday Roasts and Accompaniments."""
import json
import os

D = r'C:\Users\Rebecca\Projects\code\homemade\docs\bulk-batch-035-briefs'
os.makedirs(D, exist_ok=True)


def w(filename, recipe):
    with open(os.path.join(D, filename), 'w') as f:
        json.dump(recipe, f, indent=2)
    print(f'Written: {filename}')


def para(text):
    return {'type': 'paragraph', 'content': [{'type': 'text', 'text': text}]}


def h2(text):
    return {'type': 'heading', 'attrs': {'level': 2}, 'content': [{'type': 'text', 'text': text}]}


def h3(text):
    return {'type': 'heading', 'attrs': {'level': 3}, 'content': [{'type': 'text', 'text': text}]}


def ol(*steps):
    items = []
    for s in steps:
        if isinstance(s, str):
            items.append({'type': 'listItem', 'content': [
                {'type': 'paragraph', 'content': [{'type': 'text', 'text': s}]}
            ]})
        else:
            items.append({'type': 'listItem', 'content': [{'type': 'paragraph', 'content': list(s)}]})
    return {'type': 'orderedList', 'content': items}


def txt(t):
    return {'type': 'text', 'text': t}


def tt(t, slug):
    return {'type': 'text', 'text': t, 'marks': [{'type': 'glossaryTooltip', 'attrs': {'termSlug': slug}}]}


def trouble(*rows):
    items = [{'symptom': r[0], 'cause': r[1], 'fix': r[2]} for r in rows]
    return {'type': 'troubleshooter', 'attrs': {'items': items}}


def inglist(servings, *items):
    rows = []
    for it in items:
        slug = it[0]
        amt = it[1]
        unit = it[2]
        prep = it[3] if len(it) > 3 else None
        opt = it[4] if len(it) > 4 else False
        grp = it[5] if len(it) > 5 else None
        rows.append({'ingredientSlug': slug, 'amount': amt, 'unit': unit,
                     'prepNote': prep, 'isOptional': opt, 'groupLabel': grp})
    return {'type': 'ingredientsList', 'attrs': {'defaultServings': servings, 'items': rows}}


def tool(slug, opt=False):
    return {'slug': slug, 'isOptional': opt}


def gt(slug, term, defn):
    return {'slug': slug, 'term': term, 'definition': defn}


def recipe(slug, title, subtitle, excerpt, difficulty, season, source_type, source_notes,
           servings, prep, cook, rest, chill, scalable, freezable, freeze_notes,
           batchable, batch_notes, makehead_notes,
           diet_flags, cuisine, meal_type, mood, temp_c, temp_note, foundational,
           tools, glossary, tech_slugs, crit_tech, body_content):
    return {
        'slug': slug,
        'title': title,
        'subtitle': subtitle,
        'excerpt': excerpt,
        'type': 'RECIPE',
        'categorySlug': 'cooking',
        'subCategorySlug': None,
        'difficulty': difficulty,
        'season': season,
        'sourceType': source_type,
        'sourceNotes': source_notes,
        'recipe': {
            'servings': servings,
            'yieldDescription': None,
            'prepMinutes': prep,
            'cookMinutes': cook,
            'restingMinutes': rest,
            'chillingMinutes': chill,
            'scalable': scalable,
            'freezable': freezable,
            'freezeNotes': freeze_notes,
            'batchable': batchable,
            'batchNotes': batch_notes,
            'makeAheadNotes': makehead_notes,
            'dietaryFlags': diet_flags,
            'cuisine': cuisine,
            'mealType': meal_type,
            'mood': mood,
            'temperatureCelsius': temp_c,
            'temperatureNote': temp_note,
            'foundational': foundational
        },
        'recipeTools': tools,
        'glossaryTerms': glossary,
        'techniqueSlugs': tech_slugs,
        'criticalTechniques': crit_tech,
        'body': {'type': 'doc', 'content': body_content}
    }


BEETON = ('Mrs Beeton, Book of Household Management (1861), '
          'Project Gutenberg #10136. Roast meat entries and accompanying sauces.')
ACTON = ('Eliza Acton, Modern Cookery for Private Families (1845), '
         'Project Gutenberg. Roasting methods and basting guidance.')
BEETON_ACTON = f'{BEETON}\n\n{ACTON}'

RESTING_GT = gt('resting', 'Resting',
                'Leaving cooked meat in a warm place before carving, allowing the '
                'muscle fibres to relax and the juices to redistribute so the meat '
                'stays moist when cut.')
SEARING_GT = gt('searing', 'Searing',
                'Cooking the surface of meat at very high heat to develop a brown '
                'crust, adding colour and flavour.')
BASTE_GT = gt('basting', 'Basting',
              'Spooning or brushing pan juices or fat over meat during roasting to '
              'keep the surface moist and encourage browning.')

# ---- 01 roast-beef-sirloin ----
w('01-roast-beef-sirloin.json', recipe(
    'roast-beef-sirloin', 'Roast beef sirloin', 'Salt-rubbed, rested, and served pink',
    'A joint of sirloin roasted hot and fast, rested until the juices settle, and '
    'carved in thick slices. The centrepiece of a British Sunday lunch.',
    'INTERMEDIATE', None, 'PUBLIC_DOMAIN', BEETON_ACTON,
    6, 20, 75, 30, 0, False, False, None, False, None,
    'Salt the joint up to 24 hours ahead and refrigerate uncovered. Bring to room '
    'temperature for an hour before roasting.',
    [], 'british', 'dinner', ['sundayLunch', 'comfortFood', 'dinnerParty'],
    220, 'fan oven; reduce to 180 after the initial blast', False,
    [tool('roasting-pan'), tool('roasting-rack'), tool('thermometer-probe'),
     tool('carving-knife'), tool('chopping-board-large')],
    [RESTING_GT, SEARING_GT], [], [],
    [
        para('Roast sirloin is the joint that earns the name. It runs along the '
             'back of the animal above the ribs: well-exercised enough to have '
             'flavour, tender enough to eat pink. A 1.5 kg boneless sirloin feeds '
             'six and cooks in just over an hour.'),
        para('The two critical things are a probe thermometer and patience. Pull '
             'the joint at 52 degrees C for rare to medium-rare, then rest it for '
             'at least 30 minutes. Cut into it early and the juices run across the '
             'board.'),
        h2('What you need'),
        inglist(6,
                ('beef-sirloin', 1500, 'g', 'boneless, rolled and tied'),
                ('sea-salt-flakes', 2, 'tsp'),
                ('black-pepper-ground', 1, 'tsp'),
                ('unsalted-butter', 30, 'g', 'softened'),
                ('english-mustard-powder', 1, 'tsp', None, True),
                ('onion', 1, 'each', 'halved', False, 'For the trivet'),
                ('carrot', 2, 'each', 'halved lengthways', False, 'For the trivet'),
                ('celery', 2, 'each', 'roughly chopped', False, 'For the trivet'),
                ),
        para('A roasting rack holds the joint above the pan juices so the underside '
             'roasts rather than braises. A V-shaped rack works well for a rolled joint.'),
        h2('Method'),
        h3('Prepare the joint'),
        ol(
            'Take the beef out of the fridge an hour before cooking. Pat it dry '
            'with kitchen paper. Rub all over with the softened butter, then press '
            'in the salt and pepper. If using mustard powder, mix it into the butter first.',
            'Heat the oven to 220 degrees C fan. Scatter the onion, carrot, and '
            'celery across the base of the roasting pan. Set the rack on top and '
            'place the joint fat-side up on the rack.'
        ),
        h3('Roast and probe'),
        ol(
            'Roast at 220 degrees C for 20 minutes to colour the surface, then '
            'reduce to 180 degrees C. Start checking the internal temperature '
            'after another 40 minutes.',
            'Pull the joint when the probe reads 52 degrees C at the thickest '
            'part for rare to medium-rare. For medium, wait for 58 degrees C; '
            'for well done, 68 degrees C. The temperature rises a few more degrees '
            'during resting.'
        ),
        h3('Rest and carve'),
        ol(
            [txt('Transfer the joint to a warm plate and tent loosely with foil. '),
             tt('Rest', 'resting'),
             txt(' for at least 30 minutes, up to 45 for a joint this size.')],
            'Carve across the grain into slices about 1 cm thick. The trivet '
            'vegetables and pan juices are the base of a red wine gravy.'
        ),
        trouble(
            ('The joint is grey throughout, not pink',
             'Overcooked, or the internal temperature climbed too high during resting.',
             'Use a probe thermometer every time. Pull at 52 degrees C for rare to '
             'medium-rare. A 30-minute rest raises the core by about 3 to 5 degrees C.'),
            ('Juices pour out when carved',
             'The joint was not rested long enough.',
             'The minimum rest is 30 minutes; 45 is better for a joint this size. '
             'Keep the foil tent on.'),
            ('The surface is pale rather than browned',
             'The oven was not hot enough at the start, or the joint surface was wet.',
             'Make sure the oven is fully up to temperature. Pat the surface '
             'completely dry before buttering.'),
            ('Probe readings vary across the joint',
             'Uneven thickness, or the probe is touching a fat seam rather than the muscle.',
             'Push the probe into the thickest part of the meat. Take two or three '
             'readings and go by the highest.'),
        ),
        h2('Variations'),
        para('A rub of fresh horseradish mixed into the butter is a good alternative '
             'to mustard powder. Bone-in sirloin needs a slightly longer roast and a '
             'lower temperature because the bone conducts heat unevenly.'),
        h2('Where this dish lives'),
        para('The British Sunday roast is built around beef. Every cookbook from '
             'Mrs Beeton onward devotes pages to it, arguing over basting schedules '
             'and dripping versus butter. The sirloin is the prestige cut: more '
             'expensive than topside, leaner than rib, and well-suited to eating '
             'pink. It reached its current form in nineteenth-century domestic '
             'cooking and has not changed much since.')
    ]
))

# ---- 02 roast-chicken ----
w('02-roast-chicken.json', recipe(
    'roast-chicken', 'Roast chicken', 'Buttered breast, lemon and thyme in the cavity',
    'A whole chicken roasted at high heat with butter under the skin and aromatics inside. '
    'Ready in just over an hour and good enough to eat on its own.',
    'BEGINNER', None, 'PUBLIC_DOMAIN', BEETON_ACTON,
    4, 15, 80, 15, 0, False, False, None, False, None,
    None, [], 'british', 'dinner', ['sundayLunch', 'comfortFood', 'weeknight'],
    200, 'fan oven', False,
    [tool('roasting-pan'), tool('thermometer-probe'), tool('carving-knife'),
     tool('chopping-board-large'), tool('kitchen-twine', True)],
    [RESTING_GT, BASTE_GT], [], [],
    [
        para('Roast chicken is the most forgiving of the Sunday joints. The whole '
             'bird takes about 80 minutes in a hot oven, needs no complicated '
             'preparation, and produces a pan full of golden juices for gravy.'),
        para('Butter pushed under the breast skin keeps the white meat moist. '
             'A lemon and a few sprigs of thyme in the cavity perfume the bird '
             'from the inside without complicating the recipe.'),
        h2('What you need'),
        inglist(4,
                ('chicken-whole', 1, 'each', 'about 1.5 kg, at room temperature'),
                ('unsalted-butter', 50, 'g', 'softened'),
                ('sea-salt-flakes', 1, 'tsp'),
                ('black-pepper-ground', 1, 'tsp'),
                ('lemon', 1, 'each', 'halved'),
                ('thyme', 4, 'sprig'),
                ('garlic', 4, 'clove', 'unpeeled, lightly crushed'),
                ('onion', 1, 'each', 'quartered', False, 'For the trivet'),
                ),
        para('A roasting tin that fits the bird with a couple of centimetres '
             'around it is ideal. Too large and the juices spread thin and burn; '
             'too small and the bird steams.'),
        h2('Method'),
        h3('Prepare the bird'),
        ol(
            'Heat the oven to 200 degrees C fan. Pat the chicken dry inside and '
            'out with kitchen paper.',
            'Loosen the breast skin with your fingers, working from the neck end '
            'down. Push most of the softened butter under the skin and spread it '
            'flat. Rub the remaining butter over the outside of the bird. Season '
            'generously all over with salt and pepper.',
            'Push the lemon halves, thyme sprigs, and crushed garlic into the '
            'cavity. Scatter the quartered onion across the base of the roasting tin.'
        ),
        h3('Roast'),
        ol(
            'Place the chicken breast-side up on the onion trivet. Roast for '
            '20 minutes per 500 g plus 20 minutes extra (about 80 minutes for a '
            '1.5 kg bird).',
            [txt('After 45 minutes, '), tt('baste', 'basting'),
             txt(' the bird with the pan juices. If the juices are catching, '
                 'add a splash of water to the tin.')],
            'The chicken is done when the probe reads 75 degrees C at the '
            'thickest part of the thigh, away from the bone. The juices should '
            'run clear when you pierce the thigh at its deepest point.'
        ),
        h3('Rest and carve'),
        ol(
            [txt('Transfer to a warm board and tent loosely with foil. '),
             tt('Rest', 'resting'),
             txt(' for 15 minutes before carving.')],
            'Carve by removing the legs first, then slicing the breast away from '
            'the carcass. The carcass makes an excellent stock.'
        ),
        trouble(
            ('The breast meat is dry',
             'The bird was overcooked, or the butter did not reach under the skin.',
             'Push butter right under the breast skin before roasting. Check the '
             'internal temperature early; 75 degrees C at the thigh is the target, '
             'not 80 or 85.'),
            ('The skin is pale rather than golden',
             'The oven was not hot enough, or the bird was too cold going in.',
             'Make sure the oven is fully preheated. Pat the skin dry before buttering.'),
            ('The legs are undercooked even when the breast is done',
             'The bird was not at room temperature, or the legs were tucked close '
             'to the body where heat struggles to reach.',
             'Let the bird come to room temperature before roasting. Tie the legs '
             'loosely with kitchen twine to keep them from folding in.'),
            ('Pan juices are burning',
             'The trivet vegetables dried out, or the tin was too large.',
             'Add a splash of water to the tin if the juices start to catch. '
             'The vegetables should be moist, not scorched.')
        ),
        h2('Variations'),
        para('For a simple gravy, pour off most of the fat, set the tin on the hob '
             'over medium heat, and pour in a glass of white wine or chicken stock. '
             'Scrape up the brown bits and let it reduce for a few minutes.'),
        h2('Where this dish lives'),
        para('Roast chicken is the most democratic of the Sunday roasts: affordable, '
             'quick, and universally liked. Its method has changed little since the '
             'nineteenth century, when butter and aromatics stuffed inside the cavity '
             'were already the standard approach. The French call it poulet roti; '
             'the British call it Sunday lunch.')
    ]
))

# ---- 03 roast-leg-of-lamb ----
w('03-roast-leg-of-lamb.json', recipe(
    'roast-leg-of-lamb', 'Roast leg of lamb',
    'Studded with garlic and rosemary, served with mint sauce',
    'A whole leg of lamb studded with garlic slivers and rosemary, roasted until pink '
    'and carved at the table. The classic British Easter joint.',
    'BEGINNER', 'SPRING', 'PUBLIC_DOMAIN', BEETON_ACTON,
    6, 20, 90, 20, 0, False, False, None, False, None,
    'Stud the lamb up to 24 hours ahead, cover loosely and refrigerate. Bring to '
    'room temperature an hour before roasting.',
    [], 'british', 'dinner', ['sundayLunch', 'comfortFood', 'festive'],
    200, 'fan oven', False,
    [tool('roasting-pan'), tool('roasting-rack'), tool('thermometer-probe'),
     tool('carving-knife'), tool('chopping-board-large'), tool('paring-knife')],
    [RESTING_GT,
     gt('studding', 'Studding',
        'Pushing slivers of garlic or sprigs of herbs into slits cut in the surface '
        'of meat, so the flavour works through the joint during roasting.')],
    [], [],
    [
        para('A whole leg of lamb is a generous joint: two kilograms feeds six '
             'people easily and asks very little of the cook. The meat is flavourful '
             'enough to need only garlic and rosemary pressed into small cuts '
             'across the surface.'),
        para('Pink lamb is better than grey. A probe reading of 60 degrees C at '
             'the thickest part gives a warm pink centre; 65 degrees C gives pale '
             'pink throughout.'),
        h2('What you need'),
        inglist(6,
                ('lamb-leg', 2000, 'g'),
                ('garlic', 4, 'clove', 'each sliced into 4 slivers'),
                ('rosemary', 4, 'sprig', 'needles stripped, roughly chopped'),
                ('sea-salt-flakes', 2, 'tsp'),
                ('black-pepper-ground', 1, 'tsp'),
                ('unsalted-butter', 30, 'g', 'softened'),
                ('onion', 2, 'each', 'quartered', False, 'For the trivet'),
                ('carrot', 2, 'each', 'roughly chopped', False, 'For the trivet'),
                ('stock-chicken', 200, 'ml', None, False, 'For the tin'),
                ),
        para('A paring knife is useful for making clean, deep slits in the meat '
             'for the garlic and rosemary to sit in.'),
        h2('Method'),
        h3('Stud and season'),
        ol(
            [txt('Make about 16 deep slits across the surface of the lamb with a '
                 'paring knife. Press a sliver of garlic and a little rosemary into '
                 'each slit. This is '),
             tt('studding', 'studding'),
             txt('.')],
            'Rub the butter all over the joint and season generously with salt '
            'and pepper.'
        ),
        h3('Roast'),
        ol(
            'Heat the oven to 200 degrees C fan. Scatter the onion and carrot '
            'across the base of the roasting pan, pour over the stock, then set '
            'the rack on top. Place the lamb on the rack.',
            'Roast for 20 minutes to colour the surface, then reduce to 180 degrees C. '
            'Continue roasting for about 60 more minutes, checking the temperature '
            'from 45 minutes onward.',
            'Pull the lamb at 60 degrees C for pink throughout; at 65 degrees C '
            'for pale pink; at 72 degrees C for well done.'
        ),
        h3('Rest and carve'),
        ol(
            [txt('Transfer to a warm plate and tent with foil. '),
             tt('Rest', 'resting'),
             txt(' for 20 minutes before carving.')],
            'Carve parallel to the bone, working in long slices from the rounded '
            'top side first, then turning the leg to carve the flatter underside.'
        ),
        trouble(
            ('The meat near the bone is still pink when the outside is done',
             'The bone conducts heat slowly; the meat nearest it is always the last to cook.',
             'This is normal and correct for a pink roast. Check the temperature at '
             'the thickest part of the muscle, away from the bone.'),
            ('The joint is dry and tight',
             'Overcooked past 72 degrees C.',
             'Use a probe thermometer. Lamb dries out quickly above 70 degrees C.'),
            ('The garlic burnt on the surface',
             'The garlic slivers were pushed too shallow or sat proud of the surface.',
             'Push each sliver deep enough that it is covered by the meat. Any '
             'that sit at the surface will char in the oven.'),
            ('The pan juices are thick and dark',
             'The stock evaporated and the vegetables scorched.',
             'Add another 100 ml of stock or water to the tin if the juices start '
             'to catch. This also gives you more liquid for gravy.')
        ),
        h2('Variations'),
        para('Butterflied leg (boned and opened flat) cooks in about 40 minutes '
             'at 200 degrees C and gives more brown surface to carve from. Rub '
             'the opened surface with a paste of garlic, rosemary, and a little '
             'lemon zest before folding back up or roasting flat.'),
        h2('Where this dish lives'),
        para('Roast leg of lamb arrived at the British Easter table partly because '
             'the new season lambs were ready in spring. Mrs Beeton devotes a long '
             'section to it in the 1861 edition, recommending a flour dredge before '
             'roasting to crisp the surface. The garlic-and-rosemary stud is the '
             'twentieth-century French influence that pushed out the older English '
             'approach of plain basting.')
    ]
))

# ---- 04 roast-pork-loin-with-crackling ----
w('04-roast-pork-loin-with-crackling.json', recipe(
    'roast-pork-loin-with-crackling',
    'Roast pork loin with crackling',
    'Scored skin, overnight dry, hot oven start',
    'Pork loin roasted with its skin on, the rind scored and dried so it blisters '
    'into crisp crackling. Served with apple sauce.',
    'INTERMEDIATE', None, 'PUBLIC_DOMAIN', BEETON_ACTON,
    6, 20, 100, 20, 720, False, False, None, False, None,
    'Score and salt the rind the night before, refrigerate uncovered. The dry '
    'surface is what makes the crackling.',
    [], 'british', 'dinner', ['sundayLunch', 'comfortFood'],
    230, 'fan oven; reduce to 180 after the initial blast', False,
    [tool('roasting-pan'), tool('roasting-rack'), tool('thermometer-probe'),
     tool('carving-knife'), tool('chopping-board-large')],
    [RESTING_GT,
     gt('crackling', 'Crackling',
        'The crisp, bubbly layer formed when pork rind is scored, dried and '
        'roasted at high heat. The score marks allow the rind to expand and '
        'blister without splitting.')],
    [], [],
    [
        para('Pork loin with crackling is a Sunday joint that delivers two '
             'textures: tender, juicy meat inside and a crisp, salty rind on '
             'top. The crackling is the prize. Getting it right requires scored '
             'rind, a completely dry surface, and a very hot oven blast at the start.'),
        para('The overnight dry-salt stage is the most important step in the recipe. '
             'Salt draws moisture from the rind; a dry rind crisps rather than steams.'),
        h2('What you need'),
        inglist(6,
                ('pork-loin', 1800, 'g', 'bone-in or boneless, rind on'),
                ('sea-salt-flakes', 3, 'tsp', 'for the rind'),
                ('sea-salt-fine', 1, 'tsp', 'for the flesh side'),
                ('black-pepper-ground', 1, 'tsp'),
                ('fennel-seeds', 1, 'tsp', None, True),
                ('onion', 2, 'each', 'roughly sliced', False, 'For the trivet'),
                ('apple-bramley', 2, 'each', 'roughly chopped', False, 'For the trivet'),
                ),
        para('A sharp knife or a Stanley knife makes the cleanest score lines '
             'in the rind. Aim for lines 1 cm apart, cutting through the rind '
             'but not deep into the fat.'),
        h2('The night before'),
        ol(
            'Score the rind in parallel lines about 1 cm apart, cutting through '
            'the skin and just into the fat beneath.',
            'Pat the rind completely dry. Rub the sea salt flakes firmly into '
            'the score marks. Leave uncovered in the fridge overnight.',
        ),
        h2('Method'),
        h3('Prepare for the oven'),
        ol(
            'Take the pork from the fridge an hour before cooking. Pat the rind '
            'dry again with kitchen paper if any moisture has beaded on the surface.',
            'Rub the flesh side and edges with the fine salt, pepper, and fennel '
            'seeds if using.',
            'Heat the oven to 230 degrees C fan. Scatter the onion and Bramley '
            'apple across the base of the roasting pan and set the rack on top. '
            'Place the pork rind-side up on the rack.',
        ),
        h3('Roast'),
        ol(
            'Roast at 230 degrees C for 30 minutes to blister the rind into '
            [tt('crackling', 'crackling'), txt('. Watch carefully; if it is '
             'catching and darkening too fast, reduce the heat slightly.')],
            'Reduce to 180 degrees C and continue roasting until the probe reads '
            '68 degrees C at the thickest point of the meat, away from any bone. '
            'This takes about 60 to 70 more minutes for a 1.8 kg joint.'
        ),
        h3('Rest and carve'),
        ol(
            [txt('Transfer to a warm board and '),
             tt('rest', 'resting'),
             txt(' for 20 minutes. Do not cover the rind with foil or it will soften.')],
            'Cut down through the crackling between the score lines. Carve the '
            'meat into slices and serve with a piece of crackling on each plate.'
        ),
        trouble(
            ('The crackling is soft rather than crisp',
             'The rind was not dry enough, or the oven was not hot enough at the start.',
             'Overnight drying is essential. If the crackling is still soft after '
             '30 minutes at 230 degrees C, turn the oven to the grill setting for '
             '5 minutes, watching closely.'),
            ('The crackling is hard and tough rather than crunchy',
             'The score lines were too deep, cutting into the meat, or the oven '
             'heat was not high enough to make the rind blister.',
             'Score only through the rind and top layer of fat, not into the meat. '
             'The initial blast needs to be a full 230 degrees C.'),
            ('The meat is dry',
             'Overcooked above 72 degrees C, or a very lean piece of loin.',
             'Pull at 68 to 70 degrees C and rest well. Loin dries out quickly '
             'if overcooked.'),
            ('Rind is uneven: some crisp, some soft',
             'The rind was not level in the tin.',
             'If the joint is uneven, prop the lower end with a wedge of onion '
             'so the rind sits level across the whole surface.')
        ),
        h2('Variations'),
        para('Pork belly gives even more generous crackling and a richer, fattier '
             'result. Score and dry the same way, but roast for three hours at '
             '160 degrees C after the initial blast rather than probing for an '
             'internal temperature.'),
        h2('Where this dish lives'),
        para('Crackling has been the mark of a well-roasted pig in British cooking '
             'since at least the eighteenth century. Charles Lamb, in his Dissertation '
             'on Roast Pig, describes the discovery of crackling with mock-heroic '
             'reverence. Modern butchers score it as a matter of course; the cook '
             'just has to dry it properly.')
    ]
))

print('Recipes 01-04 written')
