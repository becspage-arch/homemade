/**
 * Test FK grade on a list of candidate rewrites.
 */
import { fleschKincaidGrade } from './voice-check-lib.js'

const tests: { label: string; text: string }[] = [
  { label: 'mississippi-pot-roast paragraph[0]',
    text: `The original recipe uses two American convenience packets (ranch dressing mix and gravy mix), and the version here makes both from scratch with dried herbs and spices. The flavour is the same: savoury, slightly tangy, deeply beefy. The pepperoncini add acid and heat that cut through the rich butter. The dish has almost no water added. The beef, butter, and peppers make their own liquid as they cook.` },
  { label: 'mississippi-pot-roast paragraph[11]',
    text: `Mississippi pot roast is one of the few internet-born recipes. Robin Chapman of Columbus, Mississippi made the first version in the early 2000s. It spread by word of mouth and church cookbooks for a decade before going viral on recipe sites around 2013. Within a few years it had been cooked by millions of American home cooks and written up in every major food magazine. The appeal is plain: five ingredients, almost no prep, and a result that punches above the method. It is a modern American comfort food with an origin story you can trace to one person.` },
  { label: 'mississippi-pot-roast troubleshooter item[2] fix',
    text: `Skim the liquid with a spoon after cooking. Or chill it overnight. The fat sets on the surface and lifts off easily.` },
  { label: 'mississippi-pot-roast troubleshooter item[3] fix',
    text: `Use fewer pepperoncini and cut back on the brine. The peppers give background tang, not a dominant heat.` },
  { label: 'molokhia-chicken paragraph[11]',
    text: `Many Egyptians see molokhia as the national dish. It is eaten across all classes and on every occasion, from weeknight dinners to feast days. The thickened jute leaf soup with rice, chicken, and the sharp ta'leya garnish is quintessentially Egyptian. A Fatimid Caliph is said to have banned it once for its supposed aphrodisiac power, which only raised its profile. Outside Egypt, molokhia is cooked across the Arab world in different ways. The Lebanese version keeps the leaves whole. The Tunisian version uses dried leaves. The Egyptian version is always the chopped frozen kind, poured into a broth.` },
  { label: 'monte-cristo paragraph[11]',
    text: `The Monte Cristo is the American version of the French croque-monsieur. The French press their sandwich with butter and béchamel. The Americans dip theirs in egg batter and serve it with jam. The Disneyland link made the sandwich famous. It first appeared on the Blue Bayou Restaurant menu in the mid-1960s and became one of the most recognised theme-park dishes in the country. It was already a diner staple before that. The sweet finish of icing sugar and jam is not for show. It is the proper American presentation.` },
  { label: 'moroccan-carrot-salad paragraph[9]',
    text: `Moroccan carrot salad is a constant on the salad-course table alongside zaalouk and taktouka. It is served with bread before the main dish arrives. It is one of the simplest Moroccan plates: a boiled vegetable dressed with the standard cumin, garlic, and lemon. It needs almost no skill to make well. Outside Morocco it is a useful side dish for grilled meats and fish, and for building a spread for a casual Moroccan meal at home.` },
  { label: 'moroccan-lentil-soup troubleshooter item[4] fix',
    text: `Rinse red lentils in a fine sieve under cold water until the water runs clear. The lentils carry a fine dust that turns to grit in the pot.` },
  { label: 'moros-y-cristianos paragraph[13]',
    text: `Moros y Cristianos is as central to Cuban cooking as rice and peas is to Jamaican cooking. The two dishes are distant cousins. Both are built on the Caribbean pairing of beans and rice but shaped by different food traditions. The Cuban version is secular, everyday food eaten with ropa vieja, picadillo, or fried pork. The name dates from Spanish colonial rule. It refers to the colour contrast between the black beans and the white rice, though the two are cooked together until that contrast blurs.` },
  { label: 'moussaka paragraph[16]',
    text: `Moussaka in its current form with béchamel is a twentieth-century shape, though it draws on a much older tradition of layered aubergine and meat dishes across the eastern Mediterranean. The Greek chef Nikolaos Tselementes is credited with adding the béchamel top in the 1930s. He set a looser tradition into a fixed recipe that then became the standard. The dish is now so tied to Greek cooking that it appears on every Greek restaurant menu in the UK. In Greece itself it is first and foremost a home dish, made on Sundays, portioned big, and eaten the next day just as often as fresh.` },
  { label: 'mrouzia paragraph[11]',
    text: `Mrouzia is the Eid al-Adha dish of Morocco. After the sheep is slaughtered and portioned, the shoulder goes into this tagine and the whole neighbourhood fills with its scent as it cooks through the morning. The dish was made in large amounts and kept under its rich sauce for several days. The honey and spices acted as a natural preservative. It is the peak of Moroccan sweet-savoury cooking. The flavour pair has its roots in the medieval Arab kitchen tradition that shaped Moroccan food from the 8th century onward.` },
  { label: 'mughlai-chicken paragraph[0]',
    text: `Mughlai chicken belongs to the northern Indian court cooking that peaked under the Mughal emperors of the sixteenth and seventeenth centuries. The hallmark of Mughlai cooking is richness: cream, clarified butter, dried fruit, nuts, and saffron used with a careful hand. The dish is mild in heat but complex in flavour. The base is a slow-cooked onion paste thickened with ground almonds, not flour or lentils.` },
  { label: 'mughlai-chicken paragraph[11]',
    text: `Mughlai cooking took shape in the imperial kitchens of Delhi and Agra from the sixteenth century. Persian and Central Asian food traditions merged with the spice palette of the Indian subcontinent. The result was rich, fragrant, and often cream- and nut-enriched. It became the template for restaurant Indian cooking across South Asia and, in time, in Britain. Dishes like chicken tikka masala and korma are distant cousins. Mughlai chicken as a named dish appears in Anglo-Indian cookery books of the twentieth century as a shorthand for the style: mild, fragrant, and made for guests.` },
  { label: 'muhammara paragraph[11]',
    text: `Muhammara comes from Aleppo, Syria's second city and long one of the great food centres of the Arab world. It is usually made with Aleppo pepper (also called pul biber), a mild, fruity dried chilli with a faint oiliness, found in specialty and Middle Eastern shops. Standard chilli flakes are a fair stand-in. Muhammara sits on the mezze table with hummus and mutabal as a dip, and doubles as a sauce for grilled meats and fish. Pomegranate molasses with walnuts shows up in several Syrian and Levantine dishes. It speaks to the region's skill in building layered flavours from a few good things.` },
  { label: 'overflowing-reservoir paragraph[0]',
    text: `A five-minute visualisation for building a felt sense of refill. The image holds the idea that money leaving does not shrink the supply. The reservoir refills as it empties. The level stays steady and, over time, rises.` },
  { label: 'pause-between-breaths paragraph[9]',
    text: `This piece is original to homemade.education. Creative imagery as a self-help tool has a long history in the public domain.` },
  { label: 'pause-between-breaths paragraph[9] v2',
    text: `This reading is original to homemade.education. The image practice draws on a long history of self-help imagery in the public domain.` },
  { label: 'pre-sleep-bedtime paragraph[17]',
    text: `A steady pre-sleep routine is a standard sleep-hygiene practice. It shows up in sleep medicine research, including CBT for Insomnia (CBT-I) protocols and the British Sleep Society's guidelines. The five-action form used here is adapted from Day 1 of SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025).` },
  { label: 'reservoir-refills paragraph[18]',
    text: `Reservoir and water-as-money imagery has deep roots in folk-prosperity traditions and sits in the public domain. The idea of money as a flow rather than a fixed stock has been around for centuries. The five-minute single-image form used here is adapted from Day 2 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The book pairs the reservoir image with a tapping practice on the same theme.` },
  { label: 'room-already-standing paragraph[9]',
    text: `This reading is original to homemade.education. The image practice of looking around in gratitude shows up in many therapy and coaching forms. No single source is claimed here.` },
  { label: 'same-fight-on-repeat paragraph[2]',
    text: `Researchers studying long-term couples have found that roughly 69 percent of fights between partners are perpetual. They do not resolve. They recur because they are rooted in personality differences or core needs that are not going to disappear. The goal with perpetual fights is not to resolve them but to manage the conversation, knowing each other's position more fully, even when nothing changes.` },
  { label: 'same-fight-on-repeat paragraph[10]',
    text: `Draws on the Gottman Institute's work on couples talk, ongoing conflict, and bids for connection. The framing here is original to homemade.education.` },
  { label: 'savings-number paragraph[8]',
    text: `This reading is original to homemade.education. The image practice draws on a long history of self-help imagery in the public domain.` },
  { label: 'science-slow-breathing paragraph[3]',
    text: `Sleep requires the parasympathetic branch to dominate. The problem is that many people are still running on sympathetic dominance well into the night. Shallow breathing, raised cortisol, a body that hasn't had a clear signal that the threat is over and it is safe to rest.` },
  { label: 'science-slow-breathing paragraph[7]',
    text: `Higher HRV is linked to better recovery, lower anxiety, better sleep, and more capacity to regulate the stress response. Slow breathing consistently raises HRV. Not by working harder, but by giving the heart's natural rhythm more room to move.` },
  { label: 'science-slow-breathing paragraph[10]',
    text: `This is why extended-exhale breathing patterns, like the 4-7-8 technique, work so well for sleep. When the exhale runs longer than the inhale, more time is spent in the parasympathetic phase. The net effect on the nervous system is calming rather than neutral.` },
  { label: 'science-slow-breathing paragraph[11]',
    text: `Box breathing, with equal sides, works differently. The symmetry and the holds both interrupt automatic breathing. They require focus and intention. That mental engagement is itself useful for breaking an anxiety loop. The regulated rhythm still drops the overall breath rate compared to normal breathing.` },
  { label: 'science-slow-breathing paragraph[17]',
    text: `Most adults breathe shallowly and high in the chest for much of the day. Stress amplifies this. Shallow breathing is part of the sympathetic pattern, and the two feed each other. Diaphragmatic breathing, also called belly breathing, drops the diaphragm on the inhale so the belly expands outward rather than the chest lifting. It is more efficient and linked to lower cortisol and better mood.` },
  { label: 'science-slow-breathing paragraph[20]',
    text: `Original to homemade.education. Written as a companion reading to Day 9 of SLEEP: A 30-Day Tapping Intensive to Fall Asleep Faster and Wake Energised (Rebecca J Page, 2025). Draws on research into breath physiology, heart rate variability, and slow breathing for sleep and anxiety. Sources include Zaccaro and colleagues, 2018, in their review for Frontiers in Human Neuroscience.` },
  { label: 'seven-figure paragraph[8]',
    text: `This reading is original to homemade.education. Imagery that lets you step into a future scene shows up in many therapy and coaching forms. No single source is claimed here.` },
]

for (const t of tests) {
  const grade = fleschKincaidGrade(t.text)
  const words = t.text.split(/\s+/).length
  const flag = grade !== null && grade > 12 ? '  XX' : ''
  console.log(`${grade?.toFixed(2).padStart(6) ?? '   n/a'}  ${String(words).padStart(4)}w  ${t.label}${flag}`)
}
