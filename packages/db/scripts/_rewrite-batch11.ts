/**
 * Batch 11 rewrites. Encodes specific text replacements and node removals
 * to bring 50 voice-check-failing tutorial bodies under grade 12 and remove
 * safety / source duplicate blocks. Applied in-place to each JSON file.
 *
 * Run: pnpm --filter "@homemade/db" exec tsx scripts/_rewrite-batch11.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch11')

interface FileRewrites {
  textReplacements?: { find: string; replace: string }[]
  removeBeforeYouStartHeading?: boolean
  removeTrailingSourceBlock?: boolean
}

const rewrites: Record<string, FileRewrites> = {
  // ---------- RECIPES ----------
  'mujadara.json': {
    textReplacements: [
      {
        find: "Mujadara is sometimes called 'the dish of the poor' in the Levant, which means it is the dish that everyone eats because it is filling, cheap, and good. It appears in records from medieval Egypt and has been eaten continuously across the Arab world for centuries. The combination of lentils and rice is as old as grain cultivation in the Fertile Crescent, and the slow-fried onion on top is the version that made the dish great rather than merely nutritious. In Lebanese households it is served with raw onion, plain yoghurt, and a squeeze of lemon, which together make a complete meal from three pantry ingredients.",
        replace:
          "Mujadara is sometimes called 'the dish of the poor' in the Levant. That just means it is the dish everyone eats. It is filling, cheap, and good. The pairing of lentils and rice goes back as far as grain farming in the region. Slow-fried onions on top are what made the dish loved, not merely useful. In Lebanese homes it comes with raw onion, plain yoghurt, and a squeeze of lemon.",
      },
    ],
  },
  'mujaddara.json': {
    textReplacements: [
      {
        find: "Keep the heat at medium; 35 to 40 minutes is not optional, golden onions are fine but the dish needs the bitter-sweet intensity of dark caramelisation",
        replace:
          "Keep the heat at medium. Cook for 35 to 40 minutes. Golden is not enough. The dish needs dark, jammy onions with a bitter-sweet edge.",
      },
    ],
  },
  'mulled-wine.json': {
    textReplacements: [
      {
        find: "Mulled wine is the drink that appears at the moment the Christmas season begins in Britain: at markets, at office parties, at the first cold weekend of November. The tradition of heating wine with spices is old enough that a version appears in medieval cookery manuscripts, but the specific combination that is now standard owes something to the German Glühwein tradition that entered British culture through the Christmas market boom of the 1990s and 2000s. It is the smell as much as the taste that matters.",
        replace:
          "Mulled wine arrives the moment Christmas starts in Britain. You smell it at markets, at office parties, on the first cold weekend of November. Heating wine with spices is an old idea. The current shape owes a lot to German Glühwein and the rise of British Christmas markets. The smell matters as much as the taste.",
      },
    ],
  },
  'mulligatawny-soup.json': {
    textReplacements: [
      {
        find: "Mulligatawny is colonial cuisine at its most transparent: an attempt by British cooks in India to recreate the familiar format of a meat soup using the spices and ingredients around them. The result is a dish that belongs fully to neither tradition but has its own distinct character. It returned to Britain with the colonial population and became a fixture of Victorian and Edwardian upper-class households, appearing in Mrs Beeton and in menus from the grand hotels of the era. It has survived that association and settled into British cooking as a warming, slightly exotic winter soup.",
        replace:
          "Mulligatawny is colonial cooking laid bare. British cooks in India tried to make a meat soup using local spices. The result belongs to neither tradition but has its own clear character. The soup came back to Britain with the colonial families. It became a Victorian and Edwardian favourite. Today it sits in British cooking as a warming winter soup.",
      },
    ],
  },
  'mulligatawny.json': {
    textReplacements: [
      {
        find: "Mulligatawny is one of the oldest Anglo-Indian dishes still in active use: a Victorian-era soup that survived into modern British cooking through its genuine quality. The apple-and-spice combination gives it a character that other creamed soups don't have. It appears in old-fashioned English restaurants and country house dining, but is well suited to home cooking: the ingredients are pantry staples and the technique is simple blending. Its connection to Indian cooking is historical rather than stylistic, the flavour profile is more English cream soup than curry-house dish.",
        replace:
          "Mulligatawny is one of the oldest Anglo-Indian dishes still in use. It is a Victorian-era soup that lasted because the taste is good. The apple-and-spice mix gives it a character other creamed soups don't have. It suits home cooking. The ingredients are pantry staples and the technique is simple blending. Its link to Indian cooking is historical, not stylistic. The flavour is closer to an English cream soup than a curry-house dish.",
      },
    ],
  },
  'musakhan.json': {
    textReplacements: [
      {
        find: "Musakhan is the Palestinian national dish, traditionally made in October at the olive harvest when the new oil is pressed. In Palestinian villages the dish was historically brought to the communal oven (the taboon) in large trays, with the whole family contributing to the preparation and the meal eaten communally from a shared platter. The flavour of fresh-pressed olive oil in the onions and on the chicken is considered essential to the dish at its best. Musakhan has gained wider recognition through Palestinian diaspora cooking and through Sami Tamimi's work, which placed it on the map for non-Arab audiences. The dish is a study in simplicity: four main ingredients, direct technique, generous seasoning.",
        replace:
          "Musakhan is the Palestinian national dish. It is made in October, when the new olive oil is pressed. The dish was once brought to the village oven in big trays. Whole families ate it together from a shared platter. The taste of fresh-pressed oil in the onions and on the chicken is the point. Palestinian diaspora cooking has carried it to wider audiences. The dish is a study in simplicity: four main ingredients, direct technique, generous seasoning.",
      },
    ],
  },
  'mushroom-bhaji.json': {
    textReplacements: [
      {
        find: "Mushroom bhaji is the simplest dry-spiced side on the British Indian menu and among the quickest to make. It is often ordered as a filler alongside a main curry and rice, providing a textural and flavour contrast without the preparation complexity of saag aloo or aloo gobi. The earthiness of the mushrooms absorbs the cumin and turmeric well, a combination that appears in Indian cooking far less frequently than mushrooms in Western cooking, but with equally successful results.",
        replace:
          "Mushroom bhaji is the simplest dry-spiced side on the British Indian menu. It is also one of the fastest to make. People order it as a filler next to a main curry and rice. It gives texture and flavour contrast without the work of saag aloo or aloo gobi. The earthy mushrooms hold the cumin and turmeric well. Indian cooking uses mushrooms less than Western cooking does, but the result is just as good.",
      },
    ],
  },
  'mushroom-puffs.json': {
    textReplacements: [
      {
        find: "Bake in the oven by placing them on a baking sheet (which is lined with butter paper) at 180 degree celsius for 25 minutes or until they are puffed up completely and turn golden in colour.",
        replace:
          "Place them on a baking sheet lined with butter paper. Bake at 180°C for 25 minutes. The puffs should rise fully and turn golden.",
      },
    ],
  },
  'mutabal.json': {
    textReplacements: [
      {
        find: "Mutabal belongs to the Levantine mezze table alongside hummus, labneh, and fattoush. The name is sometimes used interchangeably with baba ghanoush in Western menus, but the two are distinct: mutabal includes tahini and is smoother and richer; baba ghanoush is a simpler preparation of aubergine with olive oil, lemon, and garlic. Both depend entirely on the charring method for their character. The dish is served at room temperature as part of a spread, not as a standalone starter, and eaten with pitta or flatbread as the utensil.",
        replace:
          "Mutabal sits on the Levantine mezze table next to hummus, labneh, and fattoush. Western menus often call it baba ghanoush, but the two are different. Mutabal has tahini, which makes it smoother and richer. Baba ghanoush is just aubergine, olive oil, lemon, and garlic. Both rely on the charring step for their flavour. Serve at room temperature as part of a spread. Eat it with pitta or flatbread as the utensil.",
      },
    ],
  },
  'mutton-pie.json': {
    textReplacements: [
      {
        find: "Mutton pie sits in the same tradition as the British steak and kidney pie: a savoury, substantial winter dish that makes the most of a flavourful cut of meat. It is a dish that rewards patience and advance planning, and one that improves overnight in the refrigerator before the pastry lid goes on.",
        replace:
          "Mutton pie sits beside steak and kidney pie in the British winter tradition. It is hearty, savoury, and built around a flavourful cut. The dish rewards patience and a bit of planning. It tastes better after a night in the fridge before the pastry lid goes on.",
      },
    ],
  },
  'navarin-dagneau.json': {
    removeBeforeYouStartHeading: true,
    textReplacements: [
      {
        find: " is lighter than a bourguignon, the vegetables go in during the final 35 minutes rather than being cooked separately and added at the end. Add them too early and they will collapse; add them at the right stage and they absorb the lamb cooking liquor and become tender while still holding their shape.",
        replace:
          " is lighter than a bourguignon. The vegetables go in for the final 35 minutes, not cooked separately and added at the end. Too early and they collapse. At the right point they soak up the lamb juices and stay tender while keeping their shape.",
      },
    ],
  },
  'no-churn-ice-cream.json': {
    textReplacements: [
      {
        find: "No-churn ice cream using condensed milk became widely known in British home cooking during the latter decades of the twentieth century, when ice cream makers were not standard kitchen equipment. The condensed milk method solves the structural problem of hand-frozen ice cream, the large ice crystals that form without churning, by using concentrated sugar to lower the freezing point. Versions of the recipe appear regularly in British food magazines from the 1980s onward and have remained popular as an accessible alternative to the custard-based method.",
        replace:
          "Condensed-milk ice cream became a British home-kitchen staple in the late 20th-century, when most homes had no ice cream maker. Big ice crystals are the usual problem with hand-frozen ice cream. Condensed milk fixes that. The concentrated sugar lowers the freezing point so the mix sets smooth. It still wins as the easy alternative to a custard-based recipe.",
      },
    ],
  },
  'oeufs-en-cocotte.json': {
    removeBeforeYouStartHeading: true,
  },
  'ojja-merguez.json': {
    textReplacements: [
      {
        find: "Ojja is an everyday Tunisian dish, eaten for lunch or dinner with bread and salad. The merguez version is the most popular, though ojja bil kefta (with minced meat balls) and ojja bil gambari (with prawns) are also common. It has structural similarities to shakshuka (both are eggs cooked in a spiced tomato base) but the harissa and merguez give the Tunisian version a heat and richness that distinguishes it. In France, where Tunisian food has had significant influence, ojja appears in couscous restaurants and in the home kitchens of the diaspora alongside brik and lablabi.",
        replace:
          "Ojja is an everyday Tunisian dish, eaten for lunch or dinner with bread and salad. The merguez version is the most loved. Ojja bil kefta uses minced meat balls. Ojja bil gambari uses prawns. The base is close to shakshuka: eggs cooked in a spiced tomato sauce. What sets ojja apart is the harissa heat and the richness of merguez. In France, where Tunisian food has shaped the diaspora kitchens, ojja sits alongside brik and lablabi.",
      },
    ],
  },
  'onion-bhaji.json': {
    textReplacements: [
      {
        find: "Onion bhaji is the most ordered starter in the British Indian restaurant tradition, consistently appearing at the top of starter sales data. It succeeds because the combination (crisp batter, sweet caramelised onion interior, green chilli heat, coriander freshness) is straightforward and reliable. Served with tamarind chutney or mint raita, it functions as an interlude between arriving at the table and the main dishes. At home it requires attention to oil temperature but is otherwise one of the simpler deep-frying projects.",
        replace:
          "Onion bhaji is the most ordered starter in the British Indian restaurant tradition. It works because the mix is simple and reliable: crisp batter, sweet onion centre, green chilli heat, fresh coriander. Serve with tamarind chutney or mint raita while you wait for the mains. At home it asks for care with the oil temperature, but it is one of the easier deep-frying jobs.",
      },
    ],
  },
  'osso-buco-alla-milanese.json': {
    textReplacements: [
      {
        find: "Osso buco is a Milanese dish, part of the same tradition as cotoletta alla milanese and risotto alla milanese. The combination of braised shin and saffron risotto is the classic pairing, the marrow from the bone enriches the risotto if you stir it in at the table. The gremolata is what separates the Milanese version from other regional braises: the fresh lemon and garlic cut through the richness of the long-cooked meat in a way no amount of extra seasoning during cooking achieves.",
        replace:
          "Osso buco is a Milanese dish, part of the same tradition as cotoletta and risotto alla milanese. The classic pairing is braised shin with saffron risotto. Stir the marrow into the risotto at the table and the dish lifts. The gremolata is what sets the Milanese version apart. Fresh lemon and garlic cut through the rich, long-cooked meat in a way no extra seasoning can.",
      },
    ],
  },
  'ossobuco-alla-milanese.json': {
    textReplacements: [
      {
        find: "Ossobuco alla milanese is the signature dish of Milan (a city with a serious, understated cooking culture that prizes technique over decoration. The name means 'hollow bone': the osso is the shin cross-cut, the buco is the marrow cavity at the centre. The marrow is eaten with a narrow spoon directly from the bone, which is one of the better arguments for ordering this dish. The gremolata is specific to the Milanese version and is not present in other regional variants) it is the counterpoint to the richness of the braise, and the dish is not complete without it.",
        replace:
          "Ossobuco alla milanese is the signature dish of Milan. The city's cooking is serious and understated and trusts technique over decoration. The name means 'hollow bone'. The osso is the shin cross-cut. The buco is the marrow cavity at the centre. The marrow is eaten with a narrow spoon, straight from the bone. That alone is a good reason to order it. Gremolata is specific to the Milanese version. It cuts through the rich braise, and the dish is not complete without it.",
      },
    ],
  },
  'oxtail-stew-jamaican.json': {
    textReplacements: [
      {
        find: "Let the stew cool completely, refrigerate overnight, and lift off the solidified fat layer before reheating",
        replace:
          "Let the stew cool fully. Chill overnight. Lift off the set fat layer before reheating.",
      },
    ],
  },
  'oxtail-stew.json': {
    textReplacements: [
      {
        find: "Oxtail stew has been a fixture in British cookery since at least the eighteenth century, when braised oxtail appears in recipe collections including those of Hannah Glasse and Mrs Beeton. It was a dish of economy: oxtail was cheap because it required long cooking and significant effort to eat, but the quality of the braising liquid it produced was out of proportion to its price. The nose-to-tail revival of the late 1990s and 2000s brought oxtail back into restaurant and domestic cooking after a period of neglect, and its reputation as one of the finest braising cuts is now widely acknowledged.",
        replace:
          "Braised oxtail has shown up in British cookery since at least the 18th-century, in cookery books by Hannah Glasse and Mrs Beeton. It used to be a cheap cut. The long cooking and bony eating put people off. The braising liquid was always rich beyond its price. The nose-to-tail revival of the early 2000s brought oxtail back into kitchens. Today it is one of the best-loved braising cuts.",
      },
    ],
  },
  // ---------- TAPPING ----------
  'tapping-for-abundance-through-the-family-line.json': {
    textReplacements: [
      {
        find: "Even though I've carried generational anxiety about money, I deeply and completely accept myself.",
        replace:
          "Even though money worry runs in my family line, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-am-i-spoiling-them.json': {
    textReplacements: [
      {
        find: "Even though part of me believes struggle is what builds character, and that removing it is risky, I deeply and completely accept myself.",
        replace:
          "Even though part of me thinks struggle builds character and softness is risky, I deeply and completely accept myself.",
      },
      {
        find: "Even though I'm afraid that my generosity might become their limitation, I honour that fear and I am open to releasing it now.",
        replace:
          "Even though I fear my giving might hold them back, I honour that fear and I am ready to let it go.",
      },
    ],
  },
  'tapping-for-calm-with-overflow.json': {
    textReplacements: [
      {
        find: "Even though overflow once felt like something that had to be spent or lost before it could be taken, I deeply and completely accept myself.",
        replace:
          "Even though overflow once felt like something I had to spend or lose, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-diet-guilt.json': {
    textReplacements: [
      {
        find: "Even though I feel guilty about what I just ate and the voice telling me I've ruined everything is loud, I deeply and completely accept myself.",
        replace:
          "Even though I feel guilty about what I just ate and a loud voice says I've ruined it all, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-emotional-overload-at-bedtime.json': {
    textReplacements: [
      {
        find: "Even though I'm still holding the residue of everyone's feelings, I deeply and completely accept myself.",
        replace:
          "Even though I'm still holding the leftover feelings of the day, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-fear-of-repeating-family-patterns.json': {
    removeTrailingSourceBlock: true,
    textReplacements: [
      {
        find: "Even though I am afraid I am becoming the family money pattern, I deeply and completely accept myself.",
        replace:
          "Even though I fear I am turning into the family money story, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-health-anxiety.json': {
    textReplacements: [
      {
        find: "A five-minute EFT tapping practice for health anxiety. The script works through the specific pattern of fear, checking, and catastrophic interpretation of physical symptoms, toward a place where the body's ordinary uncertainty is more tolerable.",
        replace:
          "A five-minute tapping practice for health anxiety. The script names the fear, the checking, and the worst-case stories you tell about a small symptom. It moves you toward a place where the body's everyday signals feel less scary.",
      },
      {
        find: "Even though I am afraid that something is physically wrong and I can't stop thinking about it, I deeply and completely accept myself.",
        replace:
          "Even though I fear something is wrong with my body and I can't stop thinking about it, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-im-always-behind.json': {
    textReplacements: [
      {
        find: "A five-minute EFT tapping practice for the chronic feeling of being behind. The script works through the specific catching-up anxiety and the life-timeline comparison, toward a place where the current position is the real starting point rather than a deficit.",
        replace:
          "A five-minute tapping practice for the constant sense of being behind. The script works with the catching-up worry and the way you compare your timeline to other people's. It moves you to a place where today is the real start, not a deficit.",
      },
      {
        find: "Even though I measure myself against a timeline that nobody actually agreed to, I accept today as the real starting point.",
        replace:
          "Even though I measure myself against a timeline I never agreed to, I accept today as the real start.",
      },
    ],
  },
  'tapping-for-inherited-religion.json': {
    removeTrailingSourceBlock: true,
    textReplacements: [
      {
        find: "Even though questioning my inherited religion feels like a betrayal of the people who gave it to me, I deeply and completely accept myself.",
        replace:
          "Even though doubting the faith I was raised in feels like a betrayal of those who taught it, I deeply and completely accept myself.",
      },
      {
        find: "Even though I don't have a replacement framework and the not-knowing is uncomfortable, I deeply and completely accept myself.",
        replace:
          "Even though I don't have a new framework yet and the not-knowing is uneasy, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-massive-cashflow.json': {
    textReplacements: [
      {
        find: "Even though massive monthly cashflow once felt unrealistic, I deeply and completely accept myself.",
        replace:
          "Even though big monthly cashflow once felt out of reach, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-money-sex-power-taboo.json': {
    removeTrailingSourceBlock: true,
    textReplacements: [
      {
        find: "A five-minute tapping practice for the cultural rule that women who claim money and power should expect to pay for it somewhere else. The script works with the guilt or self-monitoring that arises when financial authority and desire feel like they belong to different women, not the same one.",
        replace:
          "A five-minute tapping practice for the old rule that women who claim money and power must pay for it somewhere else. The script works with the guilt and self-watching that come up when financial power and desire feel like they belong to two different women, not one.",
      },
      {
        find: "Even though I've absorbed a rule that says money and desire and authority don't all belong to me at once, I honour what that's been protecting, and I am open to releasing it now.",
        replace:
          "Even though an old rule says money, desire, and power cannot all be mine, I honour what it guards, and I let it go.",
      },
      {
        find: "Under nose: the self-monitoring every time I step into authority.",
        replace: "Under nose: the self-watching every time I step into power.",
      },
    ],
  },
  'tapping-for-pleasure-guilt.json': {
    textReplacements: [
      {
        find: "A five-minute EFT tapping practice for the guilt that shadows pleasure. The script works through the specific pattern of enjoyment followed by the feeling that the enjoyment was wrong, unearned, or selfish, toward a place where pleasure is allowed to exist without requiring a justification.",
        replace:
          "A five-minute tapping practice for the guilt that follows pleasure. The script names the pattern: a moment of enjoyment, then the feeling that it was wrong or selfish. It moves you toward a place where pleasure does not need a reason.",
      },
      {
        find: "Collarbone: The difficulty of letting something feel good without immediately pulling away.",
        replace:
          "Collarbone: how hard it is to let something feel good without pulling away.",
      },
    ],
  },
  'tapping-for-safety-in-stillness.json': {
    removeTrailingSourceBlock: true,
    textReplacements: [
      {
        find: "Even though stillness feels uncomfortable and unsafe, I deeply and completely accept myself.",
        replace:
          "Even though stillness feels uneasy and unsafe, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-safety-receiving-a-big-sum.json': {
    textReplacements: [
      {
        find: "Even though receiving large amounts feels overwhelming, I deeply and completely accept myself.",
        replace:
          "Even though receiving large sums feels too much, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-self-forgiveness.json': {
    textReplacements: [
      {
        find: "Even though forgiving myself feels like letting myself off too easily, I am open to the possibility that I am allowed to continue.",
        replace:
          "Even though forgiving myself feels like letting myself off too easy, I am open to the idea that I am allowed to move on.",
      },
    ],
  },
  'tapping-for-spotting-profitable-ideas.json': {
    textReplacements: [
      {
        find: "Even though I doubt my ability to spot opportunities, I deeply and completely accept myself.",
        replace:
          "Even though I doubt that I can spot good ideas, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-stillness-without-dread.json': {
    textReplacements: [
      {
        find: "Even though calm has felt unfamiliar and even a little dangerous, I deeply and completely accept myself.",
        replace:
          "Even though calm has felt strange, even a bit risky, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-the-new-family-story.json': {
    textReplacements: [
      {
        find: "Even though our family history was struggle, I deeply and completely accept myself.",
        replace:
          "Even though our family story has been struggle, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-the-over-promised-week.json': {
    removeTrailingSourceBlock: true,
    textReplacements: [
      {
        find: "Even though I feel resentful of the commitments I made and guilty for feeling resentful, I deeply and completely accept myself.",
        replace:
          "Even though I feel angry at the things I said yes to and guilty for feeling angry, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-for-the-parent-money-tangle.json': {
    textReplacements: [
      {
        find: "A five-minute tapping practice for the emotional tangle that arrives when parents need financial support. The feelings that show up in this situation tend not to be simple: guilt about having more, obligation that edges into resentment, love that doesn't resolve the logistics, and an undercurrent of fear about what it means for your own financial future. The script names the tangle and works toward giving from full rather than from duty.",
        replace:
          "A five-minute tapping practice for the knot of feeling that shows up when parents need money help. The feelings here are rarely clean: guilt about having more, a sense of duty that turns to anger, love that does not fix the logistics, fear about your own future. The script names the knot and moves you toward giving from full, not from duty.",
      },
      {
        find: "Even though giving to them sometimes feels like obligation rather than love, and that makes me feel like a bad daughter, I deeply and completely accept myself.",
        replace:
          "Even though giving to them sometimes feels like duty, not love, and that makes me feel like a bad daughter, I deeply and completely accept myself.",
      },
      {
        find: "Even though I'm scared that supporting them will compromise what I've built, and I'm not allowed to say that out loud, I honour that fear and I am open to releasing it.",
        replace:
          "Even though I fear that helping them will cost what I've built, and I'm not allowed to say it, I honour that fear and I am ready to let it go.",
      },
    ],
  },
  'tapping-for-the-unearned-money.json': {
    textReplacements: [
      {
        find: "Even though this money arrived without me earning it in the usual way and I don't fully trust that I can keep it, I deeply and completely accept myself.",
        replace:
          "Even though this money came without me earning it the usual way, and I don't trust I can keep it, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-to-anchor-trust-in-multi-million-investments.json': {
    textReplacements: [
      {
        find: "A five-minute tapping practice from Day 75 of a 12-week money programme. The script works with the intimidation of large-scale investing and the fear of making costly mistakes at a multi-million level, and moves toward settled confidence in handling those deals with due diligence and a strong team.",
        replace:
          "A five-minute tapping practice for trust in large-scale investing. The script works with the worry that comes with multi-million decisions and the fear of costly mistakes. It moves you toward steady confidence backed by due diligence and a strong team.",
      },
      {
        find: "Even though multi-million investments once felt intimidating, I deeply and completely accept myself.",
        replace:
          "Even though multi-million deals once felt scary, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-to-build-generational-wealth.json': {
    textReplacements: [
      {
        find: "Even though I've never seen generational wealth built in my family, I deeply and completely accept myself.",
        replace:
          "Even though no one in my family has built lasting wealth, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-to-celebrate-daily-freedom-and-joy.json': {
    textReplacements: [
      {
        find: "Even though I sometimes forget to celebrate, I deeply and completely accept myself.",
        replace:
          "Even though I sometimes forget to mark the wins, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-to-celebrate-luxury-and-simplicity-together.json': {
    textReplacements: [
      {
        find: "Even though I worried that simplicity and abundance might clash, I deeply and completely accept myself.",
        replace:
          "Even though I once feared that simple living and abundance might clash, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-to-give-freely-without-fear.json': {
    textReplacements: [
      {
        find: "Even though generosity sometimes felt unsafe, I deeply and completely accept myself.",
        replace:
          "Even though giving has sometimes felt unsafe, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-to-release-money-procrastination.json': {
    textReplacements: [
      {
        find: "Even though I sometimes delay important money tasks, I deeply and completely accept myself.",
        replace:
          "Even though I sometimes put off money tasks, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-to-see-myself-as-someone-who-has-it.json': {
    textReplacements: [
      {
        find: "Even though this new identity feels unfamiliar, I deeply and completely accept myself.",
        replace:
          "Even though this new sense of self feels strange, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-to-trust-legacy-property-building.json': {
    textReplacements: [
      {
        find: "Even though I doubted I could own multiple valuable properties, I deeply and completely accept myself.",
        replace:
          "Even though I once doubted I could own several valuable homes, I deeply and completely accept myself.",
      },
    ],
  },
  'tapping-to-welcome-property-and-investment.json': {
    textReplacements: [
      {
        find: "Even though I've feared big property or investment decisions, I deeply and completely accept myself.",
        replace:
          "Even though big property and investing choices have scared me, I deeply and completely accept myself.",
      },
    ],
  },
  'the-inspired-opportunity-activation.json': {
    textReplacements: [
      {
        find: "This week, I am grateful for every idea, opportunity, and connection that is guiding me toward greater wealth.",
        replace:
          "This week, I welcome every idea and every door that opens, and I move with each one.",
      },
    ],
  },
}

// ---- Walker / mutator ----

function replaceTextInTree(node: any, find: string, replace: string): boolean {
  let changed = false
  if (!node || typeof node !== 'object') return changed
  if (typeof node.text === 'string' && node.text === find) {
    node.text = replace
    changed = true
  }
  if (Array.isArray(node.content)) {
    for (const c of node.content) {
      if (replaceTextInTree(c, find, replace)) changed = true
    }
  }
  // Also walk troubleshooter items in attrs
  if (node.attrs && typeof node.attrs === 'object' && Array.isArray(node.attrs.items)) {
    for (const item of node.attrs.items) {
      if (!item || typeof item !== 'object') continue
      for (const k of ['fix', 'cause', 'symptom'] as const) {
        if (typeof item[k] === 'string' && item[k] === find) {
          item[k] = replace
          changed = true
        }
      }
    }
  }
  return changed
}

function removeBeforeYouStartHeading(body: any): boolean {
  if (!body || !Array.isArray(body.content)) return false
  for (let i = 0; i < body.content.length; i++) {
    const n = body.content[i]
    if (n?.type === 'heading' && Array.isArray(n.content)) {
      const text = n.content
        .map((c: any) => (typeof c.text === 'string' ? c.text : ''))
        .join('')
        .toLowerCase()
      if (text.includes('before you start')) {
        body.content.splice(i, 1)
        return true
      }
    }
  }
  return false
}

function removeTrailingSourceBlock(body: any): boolean {
  if (!body || !Array.isArray(body.content)) return false
  // Find the trailing heading "Where this practice comes from" + the following paragraph.
  for (let i = body.content.length - 2; i >= 0; i--) {
    const n = body.content[i]
    const next = body.content[i + 1]
    if (
      n?.type === 'heading' &&
      Array.isArray(n.content) &&
      n.content
        .map((c: any) => (typeof c.text === 'string' ? c.text : ''))
        .join('')
        .toLowerCase()
        .includes('where this practice comes from') &&
      next?.type === 'paragraph'
    ) {
      body.content.splice(i, 2)
      return true
    }
  }
  return false
}

let totalFiles = 0
let totalReplacements = 0
let totalRemovals = 0
const misses: string[] = []

for (const [file, fr] of Object.entries(rewrites)) {
  const path = resolve(dir, file)
  const raw = readFileSync(path, 'utf8')
  const data = JSON.parse(raw)
  let fileChanged = false

  if (fr.removeBeforeYouStartHeading) {
    const ok = removeBeforeYouStartHeading(data.body)
    if (ok) {
      totalRemovals++
      fileChanged = true
    } else {
      misses.push(`${file}: removeBeforeYouStartHeading miss`)
    }
  }

  if (fr.removeTrailingSourceBlock) {
    const ok = removeTrailingSourceBlock(data.body)
    if (ok) {
      totalRemovals++
      fileChanged = true
    } else {
      misses.push(`${file}: removeTrailingSourceBlock miss`)
    }
  }

  for (const { find, replace } of fr.textReplacements ?? []) {
    const ok = replaceTextInTree(data.body, find, replace)
    if (ok) {
      totalReplacements++
      fileChanged = true
    } else {
      misses.push(`${file}: text not found: "${find.slice(0, 60)}..."`)
    }
  }

  if (fileChanged) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
    totalFiles++
  }
}

console.log(`Files modified: ${totalFiles}`)
console.log(`Text replacements: ${totalReplacements}`)
console.log(`Node removals: ${totalRemovals}`)
if (misses.length) {
  console.log(`Misses (${misses.length}):`)
  for (const m of misses) console.log('  ' + m)
}
